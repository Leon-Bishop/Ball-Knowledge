#!/usr/bin/env python3
"""Build face-only, attributed Wikimedia crops for CURRENT Wikipedia squad lists.

The older player-photo-db.json is historical and is never a fallback. A club
needs >=3 distinct Wikipedia-current-squad footballers with detectable faces.
The script records exactly which Wikipedia squad page established membership.
Copyright/licensing: only Wikimedia Commons images with CC0, public-domain,
CC BY, or CC BY-SA terms; cropped versions preserve attribution and license.
"""
from __future__ import annotations
import argparse
from datetime import datetime, timezone, timedelta
from html.parser import HTMLParser
from io import BytesIO
import json
from pathlib import Path
import re
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets/player-headshot-db.json"
AUDIT = ROOT / "assets/player-headshot-audit.json"
HEADSHOTS = ROOT / "assets/player-headshots"
CLUBS = ROOT / "photo-db/club-wikidata-map.json"
TEAMS = ROOT / "teams.enriched.json"
OLD_DB = ROOT / "assets/player-photo-db.json"
AGENT = "BallKnowledgeHeadshots/2.0 (Wikimedia Commons attributed cropped image project; contact dev.leonb@gmail.com)"
MINIMUM = 3
TARGET = 4
MAX_PHOTO_TRIES = 28
MAX_ROSTER_CANDIDATES = 65
SLEEP_SECONDS = 0.35


def read_json(path, default):
    try:
        return json.loads(path.read_text(encoding="utf8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def fetch(url, attempts=3, timeout=28):
    for attempt in range(attempts):
        try:
            request = urllib.request.Request(url, headers={
                "User-Agent": AGENT, "Accept": "application/json, image/*;q=0.8"
            })
            with urllib.request.urlopen(request, timeout=timeout) as response:
                data = response.read(7_000_000)
                if len(data) >= 7_000_000:
                    raise ValueError("Response too large")
                return data
        except (urllib.error.URLError, TimeoutError, ValueError, OSError) as exc:
            if attempt + 1 == attempts:
                raise
            time.sleep(min(15, 3 * (attempt + 1)))
    raise RuntimeError("Unreachable")


def api(host, params):
    time.sleep(SLEEP_SECONDS)
    url = "https://" + host + "/w/api.php?" + urllib.parse.urlencode(params)
    return json.loads(fetch(url).decode("utf8"))


def chunks(values, size=35):
    for i in range(0, len(values), size):
        yield values[i:i + size]


def wikidata_entities(qids, props="claims|labels"):
    results = {}
    for group in chunks(list(dict.fromkeys(qids)), 35):
        if not group:
            continue
        data = api("www.wikidata.org", {
            "action": "wbgetentities", "format": "json",
            "ids": "|".join(group), "props": props, "languages": "en"
        })
        results.update(data.get("entities", {}))
    return results


def club_wikipedia_pages(club_qids):
    pages = {}
    for qid, entity in wikidata_entities(club_qids, "sitelinks").items():
        page = entity.get("sitelinks", {}).get("enwiki", {}).get("title")
        if page:
            pages[qid] = page
    return pages


class PlainText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
    def handle_data(self, data):
        self.parts.append(data)
    def text(self):
        return " ".join(" ".join(self.parts).split())


def strip_html(value):
    p = PlainText()
    p.feed(value or "")
    return p.text()[:500]


def license_allowed(raw):
    lic = re.sub(r"[^a-z0-9]+", " ", (raw or "").lower()).strip()
    if any(part in lic.split() for part in ("nc", "nd", "noncommercial", "noderivatives")):
        return False
    return bool(
        lic in ("cc0", "public domain", "pd", "cc public domain mark 1 0")
        or re.fullmatch(r"cc by(?: sa)? [1-4](?: 0)?", lic)
    )


def wiki_title_url(title):
    return "https://en.wikipedia.org/wiki/" + urllib.parse.quote(title.replace(" ", "_"), safe="_()")


def wiki_squad(title):
    data = api("en.wikipedia.org", {
        "action": "parse", "format": "json", "page": title,
        "prop": "wikitext", "redirects": 1
    })
    parsed = data.get("parse", {})
    return parsed.get("wikitext", {}).get("*", ""), wiki_title_url(parsed.get("title", title))


def squad_section(wikitext):
    """Choose the most specific 'Current squad' heading, not former players."""
    headings = []
    for match in re.finditer(r"(?m)^\s*(={2,5})\s*([^\n=]+?)\s*\1\s*$", wikitext):
        heading = re.sub(r"\{\{.*?\}\}|\[\[|\]\]", "", match.group(2)).strip().lower()
        score = (5 if "current squad" in heading else
                 4 if "first-team squad" in heading or "first team squad" in heading else
                 3 if heading in ("squad", "senior squad", "first team", "first-team") else
                 1 if heading == "players" else 0)
        if score:
            headings.append((score, match.start(), match.end(), len(match.group(1)), heading))
    if not headings:
        return "", ""
    headings.sort(key=lambda item: (-item[0], item[1]))
    _, start, end, level, heading = headings[0]
    # Stop at the next section of equal or higher hierarchy.
    next_heading = re.search(r"(?m)^\s*(={2,5})\s*[^\n]+?\s*\1\s*$", wikitext[end:])
    while next_heading and len(next_heading.group(1)) > level:
        end += next_heading.end()
        next_heading = re.search(r"(?m)^\s*(={2,5})\s*[^\n]+?\s*\1\s*$", wikitext[end:])
    section_end = end + next_heading.start() if next_heading else len(wikitext)
    return wikitext[headings[0][2]:section_end], heading


def squad_titles(section):
    # Primary source: actual football-squad player templates, not former players.
    names = []
    for match in re.finditer(r"\{\{\s*(?:fs player|football squad player|football squad2 player)\b", section, re.I):
        start = match.start()
        # Nested templates may occur inside player templates. Balance braces.
        depth, end = 0, start
        while end < min(len(section), start + 1800):
            if section.startswith("{{", end):
                depth += 1
                end += 2
            elif section.startswith("}}", end):
                depth -= 1
                end += 2
                if depth == 0:
                    break
            else:
                end += 1
        block = section[start:end]
        name = re.search(r"\|\s*name\s*=\s*(.*?)(?=\|\s*[\w-]+\s*=|\}\})", block, re.I | re.S)
        if name:
            links = re.findall(r"\[\[([^\]|#]+)(?:\|[^\]]+)?\]\]", name.group(1))
            if links:
                names.append(links[0].strip())
    if not names:
        # A few current-squad pages use ordinary tables. Later Wikidata
        # P31=human and P106=footballer checks prevent coach/club entries.
        names = re.findall(r"\[\[([^\]|#]+)(?:\|[^\]]+)?\]\]", section)
    return list(dict.fromkeys(n for n in names
        if n and ":" not in n and len(n) <= 100))[:MAX_ROSTER_CANDIDATES]


def wikipedia_qids(titles):
    result = []
    for group in chunks(titles, 35):
        data = api("en.wikipedia.org", {
            "action": "query", "format": "json", "redirects": 1,
            "prop": "pageprops", "ppprop": "wikibase_item",
            "titles": "|".join(group)
        })
        for page in data.get("query", {}).get("pages", {}).values():
            qid = page.get("pageprops", {}).get("wikibase_item")
            if qid and re.fullmatch(r"Q\d+", qid):
                result.append(qid)
    return list(dict.fromkeys(result))


def claim_value(entity, prop):
    for statement in entity.get("claims", {}).get(prop, []):
        value = statement.get("mainsnak", {}).get("datavalue", {}).get("value")
        if value is not None:
            yield value


def is_footballer(entity):
    human = any(isinstance(v, dict) and v.get("id") == "Q5" for v in claim_value(entity, "P31"))
    if not human:
        return False
    occupations = {v.get("id") for v in claim_value(entity, "P106") if isinstance(v, dict)}
    return bool(occupations.intersection({
        "Q937857",  # association football player
        "Q15980158",  # footballer
        "Q1853634",  # association football goalkeeper
    })) or bool(list(claim_value(entity, "P54")))


def photo_filename(entity):
    for value in claim_value(entity, "P18"):
        if isinstance(value, str) and re.search(r"\.(?:png|jpe?g|webp)$", value, re.I):
            return value.replace("_", " ")
    return ""


def commons_metadata(names):
    result = {}
    for group in chunks(list(dict.fromkeys(names)), 25):
        data = api("commons.wikimedia.org", {
            "action": "query", "format": "json", "prop": "imageinfo",
            "iiprop": "url|extmetadata", "iiurlwidth": 640,
            "titles": "|".join("File:" + n for n in group)
        })
        for page in data.get("query", {}).get("pages", {}).values():
            info = (page.get("imageinfo") or [{}])[0]
            meta = info.get("extmetadata") or {}
            def val(k):
                return (meta.get(k) or {}).get("value", "")
            license_name = strip_html(val("LicenseShortName"))
            author = strip_html(val("Artist") or val("Attribution") or val("Credit"))
            source = info.get("descriptionurl", "")
            url = info.get("thumburl") or info.get("url")
            if license_allowed(license_name) and author and url and source and source.startswith("https://commons.wikimedia.org/"):
                result[page.get("title", "").removeprefix("File:").casefold()] = {
                    "photoUrl": url, "sourceUrl": source,
                    "author": author, "license": license_name,
                    "licenseUrl": strip_html(val("LicenseUrl"))
                }
    return result


def crop_face(image_bytes):
    """Detect a single dominant human face; export a tight face-only JPEG."""
    import cv2
    import numpy as np
    from PIL import Image, ImageOps, UnidentifiedImageError
    try:
        image = ImageOps.exif_transpose(Image.open(BytesIO(image_bytes))).convert("RGB")
    except (OSError, UnidentifiedImageError, ValueError):
        return None
    if image.width < 100 or image.height < 100:
        return None
    image.thumbnail((960, 960))
    pixels = np.array(image)
    gray = cv2.cvtColor(pixels, cv2.COLOR_RGB2GRAY)
    faces = []
    for model in ("haarcascade_frontalface_default.xml", "haarcascade_frontalface_alt2.xml"):
        cascade = cv2.CascadeClassifier(cv2.data.haarcascades + model)
        found = cascade.detectMultiScale(gray, scaleFactor=1.08, minNeighbors=4,
                                         minSize=(35, 35))
        if len(found):
            faces = sorted(found, key=lambda f: f[2] * f[3], reverse=True)
            break
    if not len(faces):
        return None
    x, y, w, h = [int(v) for v in faces[0]]
    if min(w, h) < 35:
        return None
    if len(faces) > 1 and faces[1][2] * faces[1][3] > w * h * 0.5:
        return None  # Group photo: cannot verify which detected face is player.
    side = int(max(w, h) * 1.75)
    cx, cy = x + w / 2, y + h * 0.52
    left, top = round(cx - side / 2), round(cy - side * 0.49)
    # Reject crops that would require large fake borders outside the source.
    if left < -side * 0.12 or top < -side * 0.12 or left + side > image.width + side * 0.12 or top + side > image.height + side * 0.12:
        return None
    left = max(0, min(image.width - side, left))
    top = max(0, min(image.height - side, top))
    if side > min(image.width, image.height):
        return None
    result = image.crop((left, top, left + side, top + side)).resize((192, 192), Image.Resampling.LANCZOS)
    out = BytesIO()
    result.save(out, "JPEG", quality=85, optimize=True)
    return out.getvalue()


def process_club(team, qid, title, old_db):
    club_id = team["id"]
    raw, roster_url = wiki_squad(title)
    section, heading = squad_section(raw)
    if not section:
        raise ValueError("No current squad section on English Wikipedia")
    titles = squad_titles(section)
    if len(titles) < 3:
        raise ValueError("Current squad has fewer than 3 linked player names")
    qids = wikipedia_qids(titles)
    entities = wikidata_entities(qids)
    candidates = []
    for player_qid in qids:
        entity = entities.get(player_qid, {})
        if not is_footballer(entity):
            continue
        filename = photo_filename(entity)
        if not filename:
            continue
        name = entity.get("labels", {}).get("en", {}).get("value", "")
        if not name:
            continue
        candidates.append((player_qid, name, filename))
    if not candidates:
        raise ValueError("No roster footballers with Wikimedia photos")
    # Shuffle deterministically so we don't always pick alphabetical old faces.
    import hashlib
    candidates.sort(key=lambda c: hashlib.sha256((club_id + c[0]).encode()).hexdigest())
    candidates = candidates[:MAX_PHOTO_TRIES]
    metadata = commons_metadata([p[2] for p in candidates])
    prior = {p["wikidataQid"]: p for p in old_db.get("clubs", {}).get(club_id, {}).get("players", [])}
    photos = []
    for player_qid, name, filename in candidates:
        if len(photos) >= TARGET:
            break
        info = metadata.get(filename.casefold())
        if not info:
            # Previously verified Wikimedia license metadata is acceptable
            # only for an independently verified current squad member.
            existing = prior.get(player_qid)
            if existing and license_allowed(existing.get("license", "")):
                info = {k: existing.get(k, "") for k in ("photoUrl", "sourceUrl", "author", "license", "licenseUrl")}
        if not info or not info.get("photoUrl"):
            continue
        try:
            cropped = crop_face(fetch(info["photoUrl"], attempts=2))
        except Exception as exc:
            print("  Photo unavailable", name, str(exc)[:90], flush=True)
            continue
        if not cropped:
            continue
        safe = re.sub(r"[^a-z0-9-]", "-", club_id.lower().replace(":", "-"))
        relative = f"./assets/player-headshots/{safe}--{player_qid}.jpg"
        HEADSHOTS.mkdir(parents=True, exist_ok=True)
        (HEADSHOTS / f"{safe}--{player_qid}.jpg").write_bytes(cropped)
        photos.append({
            "clubId": club_id, "playerName": name, "wikidataQid": player_qid,
            "clubWikidataQid": qid, "photoUrl": relative,
            "sourceUrl": info["sourceUrl"], "license": info["license"],
            "licenseUrl": info.get("licenseUrl", ""), "author": info["author"],
            "membershipSource": roster_url, "membershipSection": heading,
            "verifiedCurrent": True, "faceCrop": True, "modified": True,
            "associationType": "current_squad_wikipedia_section"
        })
    return photos, len(titles), len(candidates)


def run(max_clubs, force=False, since=None):
    teams = read_json(TEAMS, [])
    mapping = read_json(CLUBS, {}).get("clubs", {})
    old_db = read_json(OLD_DB, {"clubs": {}})
    db = read_json(OUTPUT, {"version": 2, "clubs": {}})
    audit = read_json(AUDIT, {"version": 2, "clubs": {}})
    db["version"] = 2
    db["source"] = "Current squad sections of English Wikipedia + Wikidata P18 + licensed Commons face crops"
    db["minimumCurrentHeadshotsPerClub"] = MINIMUM
    db["targetCurrentHeadshotsPerClub"] = TARGET
    audit["version"] = 2
    audit.setdefault("clubs", {})
    club_qids = list(dict.fromkeys(qid for qid in mapping.values() if qid))
    wiki_pages = club_wikipedia_pages(club_qids)
    attempted = 0
    for team in teams:
        club_id, qid = team["id"], mapping.get(team["id"])
        previous = db.get("clubs", {}).get(club_id, {})
        fresh_since = (datetime.now(timezone.utc) - timedelta(days=6)).isoformat()
        if (not force and len(previous.get("players", [])) >= TARGET
                and previous.get("checkedAt", "") >= fresh_since):
            continue
        if since and audit["clubs"].get(club_id, {}).get("checkedAt", "") >= since:
            continue
        if attempted >= max_clubs:
            break
        attempted += 1
        status = {"clubName": team["name"], "checkedAt": datetime.now(timezone.utc).isoformat()}
        try:
            if not qid or not wiki_pages.get(qid):
                raise ValueError("No confirmed club Wikidata QID / English Wikipedia article")
            players, roster_count, candidates = process_club(team, qid, wiki_pages[qid], old_db)
            status.update({"rosterNames": roster_count, "photoCandidates": candidates})
            # A new roster snapshot supersedes historical and previously stale data.
            db.setdefault("clubs", {})[club_id] = {
                "clubName": team["name"], "clubWikidataQid": qid,
                "players": players, "rosterSource": wiki_title_url(wiki_pages[qid]),
                "checkedAt": status["checkedAt"]
            }
            status.update({"count": len(players),
                           "status": "ready" if len(players) >= MINIMUM else "insufficient_licensed_face_crops"})
        except Exception as exc:
            status.update({"status": "unverified", "count": len(previous.get("players", [])),
                           "reason": str(exc)[:250]})
            print("  Unverified:", str(exc)[:130], flush=True)
        audit["clubs"][club_id] = status
        db["lastUpdated"] = datetime.now(timezone.utc).isoformat()
        OUTPUT.write_text(json.dumps(db, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
        AUDIT.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
        print(f"{attempted}/{max_clubs} {team['name']}: {status['status']} ({status['count']})", flush=True)
    counts = {club: len(record.get("players", [])) for club, record in db.get("clubs", {}).items()}
    ready = sum(n >= MINIMUM for n in counts.values())
    four = sum(n >= TARGET for n in counts.values())
    audit.update({"totalClubs": len(teams), "clubsWithThree": ready,
                  "clubsWithFour": four, "totalCurrentHeadshots": sum(counts.values()),
                  "lastUpdated": db.get("lastUpdated")})
    AUDIT.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
    print(json.dumps({"attempted": attempted, "clubs": len(teams), "threeOrMore": ready,
                      "fourOrMore": four, "headshots": sum(counts.values())}), flush=True)


def self_test():
    sample = """== History ==
[[Old Player]]
== Players ==
=== Current squad ===
{{Fs player|no=1|nat=TUR|pos=GK|name=[[Current Player]]}}
{{Fs player|no=2|nat=ENG|pos=DF|name=[[Other Player|Other]]}}
{{Fs player|no=3|nat=FRA|pos=MF|name=[[Third Player]]}}
=== Former players ===
[[Old Player]]
== Honours ==
"""
    section, heading = squad_section(sample)
    assert heading == "current squad", heading
    assert squad_titles(section) == ["Current Player", "Other Player", "Third Player"]
    assert license_allowed("CC BY-SA 4.0")
    assert license_allowed("CC0")
    assert not license_allowed("CC BY-NC 4.0")
    print("✓ Current-squad parser and commercial-use license filter", flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-clubs", type=int, default=214)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--since", default=None)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
    else:
        run(args.max_clubs, args.force, args.since)
