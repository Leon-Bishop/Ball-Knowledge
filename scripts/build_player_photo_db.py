#!/usr/bin/env python3
"""Incrementally collect verified footballer photos from Wikidata and Commons.

No dependencies beyond Python stdlib. Uses only P54 membership and P18 image;
never guesses a player-team association, photo author or image rights.
"""
import argparse
from datetime import datetime, timezone
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
TEAMS = ROOT / "teams.enriched.json"
CLUB_IDS = ROOT / "photo-db/club-wikidata-map.json"
OUTPUT = ROOT / "assets/player-photo-db.json"
AUDIT = ROOT / "assets/player-photo-audit.json"
AGENT = "BallKnowledgePlayerPhotos/1.0 (noncommercial Wikimedia metadata research; game project contact: dev.leonb@gmail.com)"
ALLOWED = {"cc0", "public domain", "cc by", "cc by-sa"}
REQUEST_DELAY = 1.8


def fetch_json(base, params, attempts=3):
    url = base + "?" + urllib.parse.urlencode(params)
    for i in range(attempts):
        req = urllib.request.Request(url, headers={
            "User-Agent": AGENT, "Accept": "application/json"
        })
        try:
            with urllib.request.urlopen(req, timeout=40) as response:
                return json.loads(response.read().decode("utf-8"))
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
            if i + 1 == attempts:
                raise
            time.sleep(4 * (i + 1))
    raise RuntimeError("unreachable")


def normalize(value):
    value = str(value).casefold()
    value = value.replace("ı", "i").replace("ß", "ss")
    import unicodedata
    value = unicodedata.normalize("NFKD", value)
    value = "".join(c for c in value if not unicodedata.combining(c))
    # Standard club-name affixes do not determine the team's identity.
    # Leave city/district names intact; uniqueness is still required.
    words = re.findall(r"[a-z0-9]+", value)
    ignore = {"fc", "cf", "afc", "sc", "ac", "fk", "sk", "rsc", "cd", "ud", "sv", "ssc"}
    return "".join(w for w in words if w not in ignore)


def read_json(path, fallback):
    return json.loads(path.read_text("utf8")) if path.exists() else fallback


def search_club_qid(name, aliases=()):
    """Only accept an unambiguous official/supplied alias for a football club.

    Search results without strong name equality are never silently accepted.
    """
    for query in dict.fromkeys([name, *aliases]):
        if not query:
            continue
        result = fetch_json("https://www.wikidata.org/w/api.php", {
            "action": "wbsearchentities", "search": query,
            "language": "en", "type": "item", "limit": 15, "format": "json",
        })
        matches = set()
        for entry in result.get("search", []):
            label = entry.get("label", "")
            desc = entry.get("description", "").lower()
            if (normalize(query) == normalize(label) and
                    ("football club" in desc or "soccer club" in desc or
                     "association football" in desc or "football team" in desc)):
                matches.add(entry["id"])
        if len(matches) == 1:
            return next(iter(matches))
        time.sleep(REQUEST_DELAY)
    return None


def memberships(qid):
    """Query exact sports-team affiliation P54 + existing Wikimedia photo P18."""
    sparql = """
    SELECT DISTINCT ?player ?playerLabel ?image WHERE {
      ?player wdt:P54 wd:%s ;
              wdt:P18 ?image .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en,tr". }
    } LIMIT 170
    """ % qid
    data = fetch_json("https://query.wikidata.org/sparql", {
        "query": sparql, "format": "json",
    })
    rows = []
    for item in data.get("results", {}).get("bindings", []):
        url = item["player"]["value"]
        m = re.search(r"/(Q\d+)$", url)
        if not m:
            continue
        rows.append({
            "wikidataQid": m.group(1),
            "playerName": item["playerLabel"]["value"],
            "image": item["image"]["value"],
        })
    return rows


class StripHTML(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_data(self, text):
        self.parts.append(text)

    def get(self):
        return " ".join(" ".join(self.parts).split())


def clean_html(value):
    parser = StripHTML()
    parser.feed(html.unescape(value or ""))
    return parser.get()[:450]


def commons_file_name(url):
    # Wikidata P18 is a Commons file URL such as Special:FilePath/Name.jpg
    name = urllib.parse.unquote(url.split("/")[-1]).replace("_", " ")
    if not re.search(r"\.(png|jpe?g|webp)$", name, re.I):
        return None
    return name


def license_is_usable(raw):
    normalized = re.sub(r"[^a-z0-9]+", " ", raw.lower()).strip()
    return any(normalized == s or normalized.startswith(s + " ") for s in ALLOWED)


def commons_info(images):
    """Batch query actual Commons image metadata, thumbnails, authors and license."""
    result = {}
    names = list(dict.fromkeys(filter(None, (commons_file_name(u) for u in images))))
    for offset in range(0, len(names), 35):
        batch = names[offset:offset + 35]
        data = fetch_json("https://commons.wikimedia.org/w/api.php", {
            "action": "query", "format": "json", "prop": "imageinfo",
            "iiprop": "url|extmetadata", "iiurlwidth": "320",
            "titles": "|".join("File:" + n for n in batch)
        })
        for page in data.get("query", {}).get("pages", {}).values():
            info = (page.get("imageinfo") or [{}])[0]
            meta = info.get("extmetadata") or {}
            def val(key):
                return (meta.get(key) or {}).get("value", "")
            name = page.get("title", "").removeprefix("File:")
            lic = clean_html(val("LicenseShortName"))
            author = clean_html(val("Artist") or val("Attribution") or val("Credit"))
            url = info.get("thumburl") or info.get("url")
            source = info.get("descriptionurl")
            lic_url = clean_html(val("LicenseUrl"))
            if all([url, source, lic, author]) and license_is_usable(lic):
                result[name.casefold()] = {
                    "photoUrl": url,
                    "sourceUrl": source,
                    "license": lic,
                    "licenseUrl": lic_url,
                    "author": author,
                    "modified": False,
                }
        time.sleep(REQUEST_DELAY)
    return result


def process_club(team, qid):
    people = memberships(qid)
    if not people:
        return []
    photo_map = commons_info([r["image"] for r in people])
    results = []
    seen = set()
    for player in people:
        key = commons_file_name(player["image"])
        license_data = photo_map.get(key.casefold()) if key else None
        if not license_data or player["wikidataQid"] in seen:
            continue
        seen.add(player["wikidataQid"])
        results.append({
            "clubId": team["id"],
            "playerName": player["playerName"],
            "wikidataQid": player["wikidataQid"],
            "clubWikidataQid": qid,
            "membershipSource": "https://www.wikidata.org/wiki/" + player["wikidataQid"],
            "associationType": "past_or_present",  # P54 does not imply 2026 squad
            **license_data,
        })
    return sorted(results, key=lambda r: r["playerName"].casefold())[:30]


def run(max_clubs):
    clubs = json.loads(TEAMS.read_text("utf8"))
    avatar_catalog = read_json(ROOT / "assets/club-avatar-catalog.json", {"clubs": []})
    image_names = {}
    for record in avatar_catalog.get("clubs", []):
        path = urllib.parse.urlparse(record.get("logo", "")).path
        if path:
            image_names[record["id"]] = urllib.parse.unquote(path.rsplit("/", 1)[-1]).rsplit(".", 1)[0].replace("_", " ")
    mapping = read_json(CLUB_IDS, {"version": 1, "clubs": {}})
    result = read_json(OUTPUT, {"version": 1, "minimumPlayersPerClub": 10, "clubs": {}})
    records = result.setdefault("clubs", {})
    audit = read_json(AUDIT, {"version": 1, "clubs": {}})
    status = audit.setdefault("clubs", {})
    checked = 0
    now = datetime.now(timezone.utc).isoformat()
    # Revisit incomplete clubs in turn; do not repeatedly hammer the first few.
    club_list = sorted(clubs, key=lambda t: (
        status.get(t["id"], {}).get("lastAttempt", ""), t["id"]))
    for club in club_list:
        if checked >= max_clubs:
            break
        club_id, name = club["id"], club["name"]
        if len(records.get(club_id, {}).get("players", [])) >= 10:
            continue
        checked += 1
        qid = mapping["clubs"].get(club_id)
        try:
            if not qid:
                qid = search_club_qid(name, [image_names.get(club_id, "")])
                if qid:
                    mapping["clubs"][club_id] = qid
            if not qid:
                status[club_id] = {
                    "status": "unmatched_club", "count": 0,
                    "lastAttempt": now,
                    "message": "No uniquely identified Wikidata football club"
                }
                continue
            players = process_club(club, qid)
            records[club_id] = {
                "clubName": name, "clubWikidataQid": qid, "players": players,
                "source": "Wikidata team membership + Wikimedia Commons metadata"
            }
            status[club_id] = {
                "status": "ready" if len(players) >= 10 else "needs_more_licensed_photos",
                "count": len(players), "lastAttempt": now
            }
        except Exception as exc:
            status[club_id] = {
                "status": "fetch_error", "count": len(records.get(club_id, {}).get("players", [])),
                "lastAttempt": now, "message": str(exc)[:180]
            }
        time.sleep(REQUEST_DELAY)
    covered = sum(len(v.get("players", [])) >= 10 for v in records.values())
    photo_count = sum(len(v.get("players", [])) for v in records.values())
    result.update({"version": 1, "minimumPlayersPerClub": 10, "lastUpdated": now})
    audit.update({
        "version": 1, "lastUpdated": now, "totalClubs": len(clubs),
        "completeClubs": covered, "playersWithLicensedPhotos": photo_count,
    })
    for path, data in [(CLUB_IDS, mapping), (OUTPUT, result), (AUDIT, audit)]:
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", "utf8")
    print(json.dumps({"attempted": checked, "readyClubs": covered, "licensedPhotos": photo_count}))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-clubs", type=int, default=12)
    args = parser.parse_args()
    run(max(1, min(args.max_clubs, 214)))
