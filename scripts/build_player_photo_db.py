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
TARGET_MINIMUM = 10
FALLBACK_MINIMUM = 7


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
    """Find exactly one Wikidata football club whose name matches a known alias.

    Wikidata search is prefix-based and has multiple spellings, so query variants
    are necessary. Ambiguous candidates stay unresolved; never infer an
    affiliation from a similarly named club or a player search hit.
    """
    names = [n for n in dict.fromkeys([name, *aliases]) if n]
    # Common official suffixes let "Arsenal" match "Arsenal F.C." and permit
    # long names to match the football-club rather than a city/place result.
    lookups = list(names)
    for n in names:
        if not re.search(r"\b(?:fc|cf|sc|sk|afc)\b", n, re.I):
            lookups.extend([n + " FC", n + " football club"])
    expected = {normalize(n) for n in names}
    resolved = set()
    for query in dict.fromkeys(lookups):
        result = fetch_json("https://www.wikidata.org/w/api.php", {
            "action": "wbsearchentities", "search": query,
            "language": "en", "type": "item", "limit": 50, "format": "json",
        })
        for entry in result.get("search", []):
            description = entry.get("description", "").casefold()
            # Team type is confirmed again by Wikidata P54 usage when fetching
            # the players; this check rejects obvious unrelated search results.
            if not any(w in description for w in ("football", "soccer", "futebol", "fútbol")):
                continue
            labels = [entry.get("label", "")]
            if entry.get("match", {}).get("text"):
                labels.append(entry["match"]["text"])
            alias_items = entry.get("aliases", [])
            labels.extend(a if isinstance(a, str) else a.get("value", "") for a in alias_items)
            if any(normalize(label) in expected for label in labels):
                resolved.add(entry["id"])
        if len(resolved) == 1:
            return next(iter(resolved))
        if len(resolved) > 1:
            return None
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
    """Conservative commercial-use filter, excluding -NC and -ND licenses."""
    normalized = re.sub(r"[^a-z0-9]+", " ", raw.lower()).strip()
    if any(flag in normalized.split() for flag in ("nc", "nd", "noncommercial", "non", "free")):
        return False
    if normalized in ("cc0", "public domain", "pd", "cc public domain mark 1 0"):
        return True
    return bool(re.fullmatch(r"cc by(?: sa)? (?:[1-4](?: [0-9])?)(?: [a-z]{2})?", normalized))


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


def get_wikidata_entities(qids, props):
    """Read Wikidata entity claims/sitelinks in modest batches."""
    result = {}
    for offset in range(0, len(qids), 35):
        batch = list(dict.fromkeys(qids[offset:offset + 35]))
        if not batch:
            continue
        data = fetch_json("https://www.wikidata.org/w/api.php", {
            "action": "wbgetentities", "ids": "|".join(batch),
            "props": props, "languages": "en,tr", "format": "json",
        })
        result.update(data.get("entities", {}))
        time.sleep(REQUEST_DELAY)
    return result


def category_players(club_qid):
    """Collect explicitly categorized former/current club players across Wikipedias.

    The Wikidata P6112 item identifies a Wikipedia category for members of this
    exact club. Only direct category members with a human Wikidata entity and a
    P18 photograph can qualify. Save the specific category URL per player.
    Sampling multiple language editions avoids missing locally documented clubs.
    """
    club = get_wikidata_entities([club_qid], "claims").get(club_qid, {})
    category_qids = []
    for claim in club.get("claims", {}).get("P6112", []):
        value = claim.get("mainsnak", {}).get("datavalue", {}).get("value", {})
        qid = value.get("id") if isinstance(value, dict) else None
        if qid and qid not in category_qids:
            category_qids.append(qid)
    if not category_qids:
        return [], ""

    players = {}
    inspected = set()
    sampled_pages = 0
    first_source = ""
    languages = ("en", "tr", "pt", "fr", "de", "es", "it", "nl", "el")
    # Bound the fallback's request volume while allowing smaller clubs from
    # several language editions to contribute evidence.
    for category_qid in category_qids[:3]:
        category = get_wikidata_entities([category_qid], "sitelinks").get(category_qid, {})
        sites = category.get("sitelinks", {})
        for language in languages:
            title = sites.get(language + "wiki", {}).get("title")
            if not title or len(players) >= 36 or sampled_pages >= 450:
                continue
            wiki = "https://" + language + ".wikipedia.org"
            source = wiki + "/wiki/" + urllib.parse.quote(title.replace(" ", "_"), safe=":_()")
            if not first_source:
                first_source = source
            data = fetch_json(wiki + "/w/api.php", {
                "action": "query", "list": "categorymembers", "cmtitle": title,
                "cmtype": "page", "cmnamespace": 0,
                "cmlimit": min(200, 450 - sampled_pages), "format": "json",
            })
            titles = [p["title"] for p in data.get("query", {}).get("categorymembers", [])]
            sampled_pages += len(titles)
            fresh = {}
            for offset in range(0, len(titles), 35):
                pack = titles[offset:offset + 35]
                page_data = fetch_json(wiki + "/w/api.php", {
                    "action": "query", "prop": "pageprops",
                    "ppprop": "wikibase_item",
                    "titles": "|".join(pack), "format": "json",
                })
                for page in page_data.get("query", {}).get("pages", {}).values():
                    qid = page.get("pageprops", {}).get("wikibase_item")
                    if qid and re.fullmatch(r"Q\\d+", qid) and qid not in inspected:
                        fresh[qid] = (page.get("title", ""), source)
                        inspected.add(qid)
                time.sleep(REQUEST_DELAY)
            if not fresh:
                continue
            entities = get_wikidata_entities(list(fresh), "claims|labels")
            for qid, ent in entities.items():
                if not re.fullmatch(r"Q\\d+", qid):
                    continue
                human = any(
                    c.get("mainsnak", {}).get("datavalue", {}).get("value", {}).get("id") == "Q5"
                    for c in ent.get("claims", {}).get("P31", [])
                    if isinstance(c.get("mainsnak", {}).get("datavalue", {}).get("value"), dict)
                )
                if not human:
                    continue
                images = ent.get("claims", {}).get("P18", [])
                if not images:
                    continue
                value = images[0].get("mainsnak", {}).get("datavalue", {}).get("value", "")
                if not isinstance(value, str) or not commons_file_name(value):
                    continue
                label = ent.get("labels", {}).get("en", {}).get("value") or fresh[qid][0]
                if not label:
                    continue
                players[qid] = {
                    "wikidataQid": qid,
                    "playerName": label,
                    "image": value,
                    "membershipSource": fresh[qid][1],
                    "associationType": "historical_or_current_wikipedia_player_category",
                }
            if len(players) >= 36 or sampled_pages >= 450:
                break
        if len(players) >= 36 or sampled_pages >= 450:
            break
    return list(players.values()), first_source

def process_club(team, qid):
    try:
        people = memberships(qid)
    except Exception as exc:
        print("Direct P54 photo query unavailable for", team["id"], str(exc)[:100])
        people = []
    results = []
    seen = set()
    if people:
        photo_map = commons_info([r["image"] for r in people])
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
                "associationType": "past_or_present",
                **license_data,
            })

    if len(results) < TARGET_MINIMUM:
        # Try official team-player category linked from Wikidata P6112.
        # This is explicitly marked as Wikipedia-category evidence rather
        # than falsely claiming the person has a P54 statement.
        try:
            additional, source = category_players(qid)
            additional = [p for p in additional if p["wikidataQid"] not in seen]
            extras = commons_info([p["image"] for p in additional]) if additional else {}
            for person in additional:
                filename = commons_file_name(person["image"])
                photo = extras.get(filename.casefold()) if filename else None
                if not photo or person["wikidataQid"] in seen:
                    continue
                seen.add(person["wikidataQid"])
                results.append({
                    "clubId": team["id"],
                    "playerName": person["playerName"],
                    "wikidataQid": person["wikidataQid"],
                    "clubWikidataQid": qid,
                    "membershipSource": person["membershipSource"],
                    "associationType": person["associationType"],
                    **photo,
                })
        except Exception as exc:
            # Category fallback is optional. Keep all validated P54 photos.
            print("Category fallback unavailable for", team["id"], str(exc)[:120])

    return sorted(results, key=lambda r: r["playerName"].casefold())[:30]


def run(max_clubs, since=None):
    clubs = json.loads(TEAMS.read_text("utf8"))
    avatar_catalog = read_json(ROOT / "assets/club-avatar-catalog.json", {"clubs": []})
    image_names = {}
    for record in avatar_catalog.get("clubs", []):
        path = urllib.parse.urlparse(record.get("logo", "")).path
        if path:
            image_names[record["id"]] = urllib.parse.unquote(path.rsplit("/", 1)[-1]).rsplit(".", 1)[0].replace("_", " ")
    mapping = read_json(CLUB_IDS, {"version": 1, "clubs": {}})
    result = read_json(OUTPUT, {"version": 1, "preferredMinimumPlayersPerClub": TARGET_MINIMUM,
                                "fallbackMinimumPlayersPerClub": FALLBACK_MINIMUM, "clubs": {}})
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
        qid = mapping["clubs"].get(club_id)
        previous_qid = records.get(club_id, {}).get("clubWikidataQid")
        if previous_qid and qid and previous_qid != qid:
            # A mistaken identity must never leave the wrong club's players
            # displayed under a corrected club mapping.
            records.pop(club_id, None)
            status.pop(club_id, None)
        if len(records.get(club_id, {}).get("players", [])) >= TARGET_MINIMUM:
            continue
        # Each club is attempted at most once within an Action run, so short
        # checkpoint batches make forward progress instead of retrying failures.
        if since and status.get(club_id, {}).get("lastAttempt", "") >= since:
            continue
        checked += 1
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
            previous = records.get(club_id, {}).get("players", [])
            # A temporary Wikidata/Commons outage should not erase a previously
            # verified licensed roster. Refresh only with equal/better coverage.
            if len(players) >= len(previous):
                records[club_id] = {
                    "clubName": name, "clubWikidataQid": qid, "players": players,
                    "source": "Wikidata team membership + Wikimedia Commons metadata"
                }
            else:
                players = previous
            count = len(players)
            state = ("ready_10" if count >= TARGET_MINIMUM else
                     "ready_7" if count >= FALLBACK_MINIMUM else "needs_more_licensed_photos")
            status[club_id] = {
                "status": state,
                "count": count, "lastAttempt": now
            }
        except Exception as exc:
            status[club_id] = {
                "status": "fetch_error", "count": len(records.get(club_id, {}).get("players", [])),
                "lastAttempt": now, "message": str(exc)[:180]
            }
        time.sleep(REQUEST_DELAY)
    covered10 = sum(len(v.get("players", [])) >= TARGET_MINIMUM for v in records.values())
    covered7 = sum(len(v.get("players", [])) >= FALLBACK_MINIMUM for v in records.values())
    photo_count = sum(len(v.get("players", [])) for v in records.values())
    result.pop("minimumPlayersPerClub", None)
    result.update({"version": 1, "preferredMinimumPlayersPerClub": TARGET_MINIMUM,
                   "fallbackMinimumPlayersPerClub": FALLBACK_MINIMUM, "lastUpdated": now})
    audit.update({
        "version": 1, "lastUpdated": now, "totalClubs": len(clubs),
        "completeClubs10": covered10, "completeClubs7": covered7,
        "completeClubs": covered7, "playersWithLicensedPhotos": photo_count,
    })
    for path, data in [(CLUB_IDS, mapping), (OUTPUT, result), (AUDIT, audit)]:
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", "utf8")
    print(json.dumps({"attempted": checked, "readyClubs10": covered10,
                      "readyClubs7": covered7, "licensedPhotos": photo_count}))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--max-clubs", type=int, default=12)
    parser.add_argument("--since", type=str, default=None,
                        help="Only retry clubs not attempted since this UTC ISO timestamp")
    args = parser.parse_args()
    run(max(1, min(args.max_clubs, 214)), args.since)
