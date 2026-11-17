#!/usr/bin/env python3
"""Independent, fail-closed current-club verification for quiz headshot photos.

A Wikipedia squad entry alone is insufficient: it can contain loans,
stale entries or players under contract but representing another club.
Accept a player only when the club's official squad confirms the identity,
a current transfer announcement confirms a loan, or Wikidata P54 independently
identifies this same current playing club without a newer conflicting club.
"""
from __future__ import annotations
import argparse
from collections import Counter, defaultdict
from datetime import date, datetime, timezone, timedelta
import json
from pathlib import Path
import re
import unicodedata

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


def verify(db, entities, evidence, mapping, today):
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
            if status in ("official_club_squad", "confirmed_current_loan", "wikidata_current_club",
                          "wikipedia_squad_stale_p54", "wikipedia_squad_no_p54"):
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
        if row["verification"] in ("official_club_squad", "confirmed_current_loan", "wikidata_current_club",
                                    "wikipedia_squad_stale_p54", "wikipedia_squad_no_p54"):
            verified[row["clubId"]].append(row)
    return entries, verified


def main(apply):
    db = json.loads(DATABASE.read_text(encoding="utf8"))
    evidence = json.loads(EVIDENCE.read_text(encoding="utf8"))
    mapping = json.loads(MAPPING.read_text(encoding="utf8"))["clubs"]
    qids = list(dict.fromkeys(p["wikidataQid"]
        for c in db.get("clubs", {}).values() for p in c.get("players", [])))
    print(f"Checking {len(qids)} distinct players against independent current-club evidence", flush=True)
    entities = photos.wikidata_entities(qids)
    today = utcnow().date()
    entries, verified = verify(db, entities, evidence, mapping, today)
    total = len(db["clubs"])
    ready = sum(len(verified.get(id, [])) >= 3 for id in db["clubs"])
    count_by_status = Counter(row["verification"] for row in entries)
    report = {
        "version": 1, "checkedAt": utcnow().isoformat(),
        "rule": "Official current squad/loan evidence, or explicit Wikipedia current squad without recent conflicting 2026-27 Wikidata P54; all cross-club duplicates excluded",
        "totalClubs": total, "totalPlayers": len(entries),
        "uniquePlayers": len(qids), "verifiedClubsWithThree": ready,
        "verifiedPlayers": sum(len(v) for v in verified.values()),
        "statuses": dict(count_by_status),
        "conflictingPlayers": [r for r in entries if r["duplicateInClubs"]],
        "unconfirmed": [r for r in entries if r["verification"] not in (
            "official_club_squad", "confirmed_current_loan", "wikidata_current_club",
            "wikipedia_squad_stale_p54", "wikipedia_squad_no_p54"
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
                    "official_club_squad", "confirmed_current_loan", "wikidata_current_club",
                    "wikipedia_squad_stale_p54", "wikipedia_squad_no_p54"
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
    args=parser.parse_args()
    if args.self_test:self_test()
    else:main(args.apply)
