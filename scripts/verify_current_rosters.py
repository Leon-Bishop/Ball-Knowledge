#!/usr/bin/env python3
"""Independent, fail-closed current-club verification for quiz headshot photos.

A Wikipedia squad entry alone is not infallible: it can contain loans or
outdated transfers. Reparse only the current first-team section, reject
cross-club duplicates and new conflicting Wikidata P54 transfers, and use
official club squad pages and confirmed loans wherever available. Wikipedia-
only entries remain explicitly labelled as such, not independently verified.
"""
from __future__ import annotations
import argparse
from collections import Counter, defaultdict
from datetime import date, datetime, timezone, timedelta
import json
from pathlib import Path
import re
import unicodedata
import urllib.parse

import build_current_headshots as photos

ROOT = Path(__file__).resolve().parents[1]
DATABASE = ROOT / "assets/player-headshot-db.json"
REPORT = ROOT / "assets/player-headshot-membership-audit.json"
EVIDENCE = ROOT / "photo-db/official-roster-evidence.json"
MAPPING = ROOT / "photo-db/club-wikidata-map.json"


def utcnow():
    return datetime.now(timezone.utc)


def clean_name(value):
    text = unicodedata.normalize("NFKD", str(value).casefold().replace("ı", "i"))
    return re.sub(r"[^a-z0-9]+", " ", "".join(
        ch for ch in text if not unicodedata.combining(ch))).strip()


def qualifier_date(statement, prop):
    for value in statement.get("qualifiers", {}).get(prop, []):
        time_value = (value.get("datavalue") or {}).get("value", {})
        if not isinstance(time_value, dict):
            continue
        match = re.match(r"^\+?(\d{4})-(\d{2})-(\d{2})T", time_value.get("time", ""))
        if match:
            year, month, day = (int(part) for part in match.groups())
            try:
                return date(year, max(1, month), max(1, day))
            except ValueError:
                pass
    return None


def current_club_from_wikidata(entity, today):
    """Return current club QID or None with a reason.

    For multiple 'open' club claims, prefer the most recently started club
    ONLY if that start date is unambiguous. This avoids loan parent clubs
    being mistaken for the playing team.
    """
    clubs = []
    for statement in entity.get("claims", {}).get("P54", []):
        if statement.get("rank") == "deprecated":
            continue
        value = (statement.get("mainsnak", {}).get("datavalue") or {}).get("value")
        if not isinstance(value, dict) or not value.get("id"):
            continue
        start, end = qualifier_date(statement, "P580"), qualifier_date(statement, "P582")
        if start and start > today:
            continue
        if end and end < today:
            continue
        clubs.append((value["id"], start))
    if not clubs:
        return None, "no_active_p54"
    qids = set(q for q, _ in clubs)
    if len(qids) == 1:
        return clubs[0][0], "single_active_p54"
    newest = max((start for _, start in clubs if start is not None), default=None)
    if newest:
        winners = set(q for q, start in clubs if start == newest)
        if len(winners) == 1:
            return next(iter(winners)), "latest_active_p54"
    return None, "ambiguous_active_p54"


def latest_active_start_for_club(entity, club_qid, today):
    dates = []
    for statement in entity.get("claims", {}).get("P54", []):
        if statement.get("rank") == "deprecated":
            continue
        value = (statement.get("mainsnak", {}).get("datavalue") or {}).get("value")
        if not isinstance(value, dict) or value.get("id") != club_qid:
            continue
        start, end = qualifier_date(statement, "P580"), qualifier_date(statement, "P582")
        if (not start or start <= today) and (not end or end >= today):
            dates.append(start)
    return max((d for d in dates if d), default=None)


def official_evidence(club_id, qid, evidence, today):
    official = evidence.get("officialClubs", {}).get(club_id, {})
    if qid in official.get("players", {}):
        checked = datetime.fromisoformat(evidence["checkedAt"].replace("Z", "+00:00")).date()
        if (today - checked).days <= 21:
            return "official_club_squad", official["source"]
    loan = evidence.get("loanAssignments", {}).get(qid)
    if loan and loan.get("clubId") == club_id:
        if date.fromisoformat(loan["until"]) >= today:
            return "confirmed_current_loan", loan["source"]
    return None, None


def recheck_wikipedia_squad_memberships(db):
    """Reparse exact CURRENT squad subsection for each photo's source page.

    This catches players in 'out on loan' subsections that the old importer
    accidentally included. A failed page lookup cannot prove membership.
    """
    sources = set(p.get("membershipSource") for club in db.get("clubs", {}).values()
                  for p in club.get("players", [])
                  if p.get("membershipSource") and p.get("membershipSection") != "wikidata current club")
    membership = {}
    for index, url in enumerate(sorted(sources), 1):
        try:
            parsed = urllib.parse.urlparse(url)
            if not parsed.hostname or not parsed.hostname.endswith(".wikipedia.org"):
                raise ValueError("Unexpected roster source host")
            language = parsed.hostname.split(".")[0]
            title = urllib.parse.unquote(parsed.path.removeprefix("/wiki/")).replace("_", " ")
            raw, _ = photos.wiki_squad(title, language)
            section, heading = photos.squad_section(raw)
            if not section or not photos.is_current_heading(heading):
                raise ValueError("No explicit current squad heading")
            names = photos.squad_titles(section)
            if len(names) < 3:
                raise ValueError("Fewer than three linked current squad players")
            qids, _ = photos.wikipedia_qids(names, language)
            if len(qids) < 3:
                raise ValueError("Unable to resolve squad identities")
            membership[url] = set(qids)
        except Exception as exc:
            membership[url] = None
            print("  Roster source unavailable:", url, str(exc)[:100], flush=True)
        if index % 25 == 0:
            print(f"  Rechecked {index}/{len(sources)} current squad pages", flush=True)
    return membership


def verify(db, entities, evidence, mapping, today, roster_qids=None):
    entries = []
    occurrences = defaultdict(set)
    for club_id, club in db.get("clubs", {}).items():
        for p in club.get("players", []):
            occurrences[p["wikidataQid"]].add(club_id)
    verified = defaultdict(list)
    for club_id, club in db.get("clubs", {}).items():
        for p in club.get("players", []):
            qid = p["wikidataQid"]
            expected = mapping.get(club_id)
            official, official_source = official_evidence(club_id, qid, evidence, today)
            actual, p54_reason = current_club_from_wikidata(entities.get(qid, {}), today)
            duplicate = len(occurrences[qid]) > 1
            if official:
                status, evidence_url = official, official_source
            elif (p.get("membershipSection") == "wikidata current club" and
                  p.get("membershipSource") != "https://www.wikidata.org/wiki/" + qid):
                status, evidence_url = "invalid_wikidata_provenance", None
            elif roster_qids is not None and p.get("membershipSection") != "wikidata current club" and (
                p.get("membershipSource") not in roster_qids or
                roster_qids[p.get("membershipSource")] is None
            ):
                status, evidence_url = "roster_source_unavailable", None
            elif (roster_qids is not None and
                  p.get("membershipSection") != "wikidata current club" and
                  qid not in roster_qids[p["membershipSource"]]):
                status, evidence_url = "not_on_current_squad", None
            elif not expected:
                status, evidence_url = "unconfirmed", None
            elif actual == expected:
                status, evidence_url = "wikidata_current_club", "https://www.wikidata.org/wiki/" + qid
            elif actual:
                # Wikidata club memberships often remain unclosed after
                # transfers. Only a *new* conflicting 2026/27 membership
                # is strong enough to overrule an explicit current roster.
                recent = latest_active_start_for_club(
                    entities.get(qid, {}), actual, today)
                if recent and recent >= date(2026, 7, 1):
                    status, evidence_url = "recent_conflicting_club", "https://www.wikidata.org/wiki/" + qid
                else:
                    status, evidence_url = "wikipedia_squad_stale_p54", p.get("membershipSource")
            else:
                status, evidence_url = "wikipedia_squad_no_p54", p.get("membershipSource")
            entry = {
                "clubId": club_id, "playerName": p["playerName"],
                "wikidataQid": qid, "clubWikidataQid": expected,
                "p54CurrentClub": actual, "p54Reason": p54_reason,
                "p54ActiveClubStart": str(latest_active_start_for_club(entities.get(qid, {}), actual, today)) if actual else None,
                "verification": status, "evidenceUrl": evidence_url,
                "duplicateInClubs": sorted(occurrences[qid]) if duplicate else []
            }
            entries.append(entry)
            if status in ("official_club_squad", "confirmed_current_loan", "wikidata_current_club"):
                verified[club_id].append(entry)
    # A player cannot represent two first teams in the same 2026-27 quiz.
    # If one entry is backed by a primary source, keep only that club;
    # if neither is independently proven, remove both.
    for qid, club_ids in occurrences.items():
        if len(club_ids) < 2:
            continue
        rows = [r for r in entries if r["wikidataQid"] == qid]
        preferred = [r for r in rows if r["verification"] in ("official_club_squad", "confirmed_current_loan")]
        if len(preferred) == 1:
            winner = preferred[0]["clubId"]
        else:
            independently = [r for r in rows if r["verification"] == "wikidata_current_club"]
            winner = independently[0]["clubId"] if len(independently) == 1 and not preferred else None
        for row in rows:
            if row["clubId"] != winner:
                row["verification"] = "wrong_or_ambiguous_duplicate"
                row["evidenceUrl"] = None
    verified = defaultdict(list)
    for row in entries:
        if row["verification"] in ("official_club_squad", "confirmed_current_loan", "wikidata_current_club"):
            verified[row["clubId"]].append(row)
    return entries, verified


def main(apply, recheck_wikipedia=False):
    db = json.loads(DATABASE.read_text(encoding="utf8"))
    evidence = json.loads(EVIDENCE.read_text(encoding="utf8"))
    mapping = json.loads(MAPPING.read_text(encoding="utf8"))["clubs"]
    qids = list(dict.fromkeys(p["wikidataQid"]
        for c in db.get("clubs", {}).values() for p in c.get("players", [])))
    print(f"Checking {len(qids)} distinct players against independent current-club evidence", flush=True)
    entities = photos.wikidata_entities(qids)
    today = utcnow().date()
    roster_qids = recheck_wikipedia_squad_memberships(db) if recheck_wikipedia else None
    entries, verified = verify(db, entities, evidence, mapping, today, roster_qids)
    total = len(db["clubs"])
    ready = sum(len(verified.get(id, [])) >= 3 for id in db["clubs"])
    count_by_status = Counter(row["verification"] for row in entries)
    report = {
        "version": 1, "checkedAt": utcnow().isoformat(),
        "rule": "Official current squad/loan evidence or matching active Wikidata club; Wikipedia-only records are not independently corroborated; cross-club duplicates excluded",
        "totalClubs": total, "totalPlayers": len(entries),
        "wikipediaPagesRechecked": len(roster_qids) if roster_qids is not None else 0,
        "wikipediaPagesUnavailable": sum(v is None for v in roster_qids.values()) if roster_qids is not None else 0,
        "uniquePlayers": len(qids), "verifiedClubsWithThree": ready,
        "verifiedPlayers": sum(len(v) for v in verified.values()),
        "independentlyCorroboratedPlayers": sum(
            count_by_status.get(status, 0) for status in
            ("official_club_squad", "confirmed_current_loan", "wikidata_current_club")
        ),
        "wikipediaOnlyPlayers": sum(
            count_by_status.get(status, 0) for status in
            ("wikipedia_squad_stale_p54", "wikipedia_squad_no_p54")
        ),
        "statuses": dict(count_by_status),
        "conflictingPlayers": [r for r in entries if r["duplicateInClubs"]],
        "unconfirmed": [r for r in entries if r["verification"] not in (
             "official_club_squad", "confirmed_current_loan", "wikidata_current_club"
         )],
        "perClub": {id: {
            "total": len(club.get("players", [])),
            "verified": len(verified.get(id, [])),
            "verifiedNames": [p["playerName"] for p in verified.get(id, [])]
        } for id, club in db["clubs"].items()}
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
    print(json.dumps({k:report[k] for k in (
        "totalClubs", "totalPlayers", "verifiedPlayers", "verifiedClubsWithThree", "statuses"
    )}, ensure_ascii=False), flush=True)
    if apply:
        by_key = {(r["clubId"], r["wikidataQid"]):r for r in entries}
        for club_id, club in db["clubs"].items():
            for p in club.get("players", []):
                row = by_key[(club_id, p["wikidataQid"])]
                p["rosterVerification"] = row["verification"]
                p["verifiedCurrent"] = row["verification"] in (
                    "official_club_squad", "confirmed_current_loan", "wikidata_current_club"
                )
                if row["evidenceUrl"]:
                    p["secondaryRosterSource"] = row["evidenceUrl"]
                else:
                    p.pop("secondaryRosterSource", None)
                p["verifiedAt"] = report["checkedAt"]
        db["rosterAuditAt"] = report["checkedAt"]
        DATABASE.write_text(json.dumps(db, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
        print("Applied fail-closed independent current-squad validation", flush=True)


def self_test():
    now = date(2026, 11, 17)
    def stmt(qid, start=None, end=None):
        v = {"mainsnak":{"datavalue":{"value":{"id":qid}}}}
        if start:
            v.setdefault("qualifiers", {})["P580"]=[{"datavalue":{"value":{"time":"+"+start+"T00:00:00Z"}}}]
        if end:
            v.setdefault("qualifiers", {})["P582"]=[{"datavalue":{"value":{"time":"+"+end+"T00:00:00Z"}}}]
        return v
    e={"claims":{"P54":[stmt("Q1","2020-01-01"),stmt("Q2","2026-07-01")]}}
    assert current_club_from_wikidata(e,now)==("Q2","latest_active_p54")
    e={"claims":{"P54":[stmt("Q1","2020-01-01","2026-06-30"),stmt("Q2","2026-07-01")]}}
    assert current_club_from_wikidata(e,now)==("Q2","single_active_p54")
    e={"claims":{"P54":[stmt("Q1"),stmt("Q2")]}}
    assert current_club_from_wikidata(e,now)==(None,"ambiguous_active_p54")
    e={"claims":{"P54":[stmt("Q1","2027-01-01")]}}
    assert current_club_from_wikidata(e,now)==(None,"no_active_p54")
    direct = {"clubId":"team:1","playerName":"Current Player",
              "wikidataQid":"Q333","membershipSource":"https://www.wikidata.org/wiki/Q333",
              "membershipSection":"wikidata current club"}
    matching_entities = {"Q333":{"claims":{"P54":[stmt("Q1","2026-07-01")]}}}
    direct_db = {"clubs":{"team:1":{"players":[direct]}}}
    direct_rows, _ = verify(direct_db,matching_entities,{},{"team:1":"Q1"},now,{})
    assert direct_rows[0]["verification"]=="wikidata_current_club"
    wrong_source = {**direct, "membershipSource":"https://example.org/bad"}
    wrong_db = {"clubs":{"team:1":{"players":[wrong_source]}}}
    wrong_rows, _ = verify(wrong_db,matching_entities,{},{"team:1":"Q1"},now,{})
    assert wrong_rows[0]["verification"]=="invalid_wikidata_provenance"
    assert clean_name("GÖKDENİZ BAYRAKDAR")==clean_name("Gökdeniz Bayrakdar")
    evidence=json.loads(EVIDENCE.read_text(encoding="utf8"))
    assert official_evidence("turkey-super-lig:10","Q98829644",evidence,now)[0]=="official_club_squad"
    assert official_evidence("turkey-super-lig:10","Q822762",evidence,now)[0] is None
    assert official_evidence("belgian-pro-league:12","Q115902876",evidence,now)[0] is None
    assert official_evidence("belgian-pro-league:17","Q115902876",evidence,now)[0]=="confirmed_current_loan"
    assert latest_active_start_for_club({"claims":{"P54":[stmt("Q1","2026-08-01")]}}, "Q1", now)==date(2026,8,1)
    print("✓ Current-club checks, 2026/27 conflict detection, loans and official club evidence",flush=True)


if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--apply",action="store_true")
    parser.add_argument("--self-test",action="store_true")
    parser.add_argument("--recheck-wikipedia",action="store_true")
    args=parser.parse_args()
    if args.self_test:self_test()
    else:main(args.apply,args.recheck_wikipedia)
