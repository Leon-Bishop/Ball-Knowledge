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
    """Approve only a large, centered face with TWO visible eyes.

    A generic Haar face detection alone produces false positives on badges,
    shirt sleeves and crowds. Confirming independently detected eye pairs
    excludes torso-only crops, off-frame eyes and distant incidental faces.
    Conservative rejection is intentional: the quiz falls back to emojis.
    """
    import cv2
    import numpy as np

    picture = cv2.imdecode(np.frombuffer(image_bytes, dtype=np.uint8), cv2.IMREAD_COLOR)
    if picture is None:
        return False
    h, w = picture.shape[:2]
    if min(w, h) < 96:
        return False
    gray = cv2.cvtColor(picture, cv2.COLOR_BGR2GRAY)
    eyes = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye_tree_eyeglasses.xml")
    if eyes.empty():
        return False

    for model in ("haarcascade_frontalface_default.xml", "haarcascade_frontalface_alt2.xml"):
        face_detector = cv2.CascadeClassifier(cv2.data.haarcascades + model)
        if face_detector.empty():
            continue
        faces = face_detector.detectMultiScale(
            gray, scaleFactor=1.07, minNeighbors=5, minSize=(46, 46)
        )
        for x, y, fw, fh in faces:
            cx, cy = (x + fw / 2) / w, (y + fh / 2) / h
            # A full head and face, not somebody in the background.
            if not (fw / w >= 0.33 and fh / h >= 0.33
                    and 0.26 <= cx <= 0.74 and 0.27 <= cy <= 0.73
                    and x >= 0.05 * w and y >= 0.05 * h
                    and x + fw <= 0.95 * w and y + fh <= 0.92 * h):
                continue
            # Eye detections must be in the upper face, well-separated and at
            # similar heights. One spurious eye match is not enough.
            x0 = x + int(0.06 * fw)
            x1 = x + int(0.94 * fw)
            y0 = y + int(0.13 * fh)
            y1 = y + int(0.63 * fh)
            roi = gray[y0:y1, x0:x1]
            matches = eyes.detectMultiScale(
                roi, scaleFactor=1.08, minNeighbors=3, minSize=(9, 9)
            )
            for i, first in enumerate(matches):
                for second in matches[i + 1:]:
                    xa = first[0] + first[2] / 2
                    xb = second[0] + second[2] / 2
                    ya = first[1] + first[3] / 2
                    yb = second[1] + second[3] / 2
                    if abs(xa - xb) >= 0.22 * fw and abs(ya - yb) <= 0.23 * fh:
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
                # The game trusts ONLY a final-JPEG two-eye quality approval,
                # never an older 'faceCrop' flag from the first-stage detector.
                player["faceQualityVerified"] = bool(valid)
                if not valid:
                    player["photoQuality"] = "rejected: full centered face and eye pair not verified"
                    player["faceCrop"] = False
    output = {
        "rule": "Large, centered face and two eyes independently detected in FINAL 192-pixel JPEG",
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
    # Regression examples checked against the current site's licensed photos.
    good = HEADSHOTS / "turkey-super-lig-13--Q60182084.jpg"
    if good.is_file():
        assert usable_face_crop(good.read_bytes()), "Clear frontal player face was rejected"
    for filename in (
        "turkey-super-lig-10--Q56043335.jpg",  # banner/lettering, no head
        "turkey-super-lig-12--Q40991902.jpg",  # player shirt, no head
        "turkey-super-lig-13--Q26704485.jpg",  # arm, no head
    ):
        bad = HEADSHOTS / filename
        if bad.is_file():
            assert not usable_face_crop(bad.read_bytes()), "Non-face passed QA: " + filename
    print("✓ Full visible faces pass; blank images, jerseys and arms are rejected")


if __name__ == "__main__":
    cli = argparse.ArgumentParser()
    cli.add_argument("--apply", action="store_true")
    cli.add_argument("--self-test", action="store_true")
    args = cli.parse_args()
    if args.self_test:
        self_test()
    else:
        audit(args.apply)
