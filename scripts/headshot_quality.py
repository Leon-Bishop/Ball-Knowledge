#!/usr/bin/env python3
"""Reject player clue JPEGs with no full, centered human face.

This is a deliberately conservative quality gate: when uncertain, show the
original emoji rather than a torso, club badge, off-frame head or wrong face.
Only the already-licensed, locally stored headshot crops are inspected.
"""
import argparse
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATABASE = ROOT / "assets/player-headshot-db.json"
REPORT = ROOT / "assets/player-headshot-face-audit.json"
HEADSHOTS = ROOT / "assets/player-headshots"


def usable_face_crop(image_bytes):
    """Return False unless a visible face occupies the center of the final JPEG."""
    import cv2
    import numpy as np

    picture = cv2.imdecode(np.frombuffer(image_bytes, dtype=np.uint8), cv2.IMREAD_COLOR)
    if picture is None:
        return False
    h, w = picture.shape[:2]
    if min(w, h) < 96:
        return False
    gray = cv2.cvtColor(picture, cv2.COLOR_BGR2GRAY)
    detectors = (
        ("haarcascade_frontalface_default.xml", False),
        ("haarcascade_frontalface_alt2.xml", False),
        ("haarcascade_profileface.xml", False),
        ("haarcascade_profileface.xml", True),
    )
    for model, mirrored in detectors:
        cascade = cv2.CascadeClassifier(cv2.data.haarcascades + model)
        if cascade.empty():
            continue
        img = cv2.flip(gray, 1) if mirrored else gray
        faces = cascade.detectMultiScale(
            img, scaleFactor=1.07, minNeighbors=4, minSize=(30, 30)
        )
        for x, y, fw, fh in faces:
            if mirrored:
                x = w - int(x) - int(fw)
            cx = (x + fw / 2) / w
            cy = (y + fh / 2) / h
            # Reject tiny background faces, clipped heads, and off-frame faces.
            if (fw / w >= 0.19 and fh / h >= 0.19
                    and 0.24 <= cx <= 0.76
                    and 0.19 <= cy <= 0.78
                    and x >= 0.015 * w and y >= 0.015 * h
                    and x + fw <= 0.985 * w and y + fh <= 0.96 * h):
                return True
    return False


def audit(apply=False):
    db = json.loads(DATABASE.read_text(encoding="utf8"))
    results = Counter()
    rejected = []
    for club_id, club in db["clubs"].items():
        for player in club.get("players", []):
            url = player.get("photoUrl", "")
            # Only read files within the checked-in, licensed headshot directory.
            name = Path(url).name
            expected = club_id.replace(":", "-") + "--" + player["wikidataQid"] + ".jpg"
            path = HEADSHOTS / name
            valid = (name == expected and path.is_file()
                     and player.get("faceCrop") is not False
                     and usable_face_crop(path.read_bytes()))
            if valid:
                results["usable"] += 1
            else:
                results["rejected"] += 1
                rejected.append({"clubId": club_id, "wikidataQid": player["wikidataQid"]})
                if apply:
                    player["faceCrop"] = False
                    player["photoQuality"] = "rejected: full centered face not verified"
    output = {
        "rule": "Conservative face detection on the FINAL 192-pixel cropped JPEG",
        "usable": results["usable"],
        "rejectedCount": results["rejected"],
        "rejected": rejected,
    }
    if apply:
        DATABASE.write_text(json.dumps(db, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
        REPORT.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
    print(json.dumps({"usable": results["usable"], "rejected": results["rejected"]}))
    return output


def self_test():
    import cv2
    import numpy as np
    blank = np.full((192, 192, 3), 150, dtype=np.uint8)
    valid, encoded = cv2.imencode(".jpg", blank)
    assert valid and not usable_face_crop(encoded.tobytes())
    assert not usable_face_crop(b"not a jpeg")
    print("✓ Blank images and invalid JPEGs are not accepted as player faces")


if __name__ == "__main__":
    cli = argparse.ArgumentParser()
    cli.add_argument("--apply", action="store_true")
    cli.add_argument("--self-test", action="store_true")
    args = cli.parse_args()
    if args.self_test:
        self_test()
    else:
        audit(args.apply)
