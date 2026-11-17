#!/usr/bin/env python3
"""Build a user-editable pack of correctly assigned, currently playable photos.

The strict identity list is produced by export-photo-eligibility.mjs, which
runs the SAME roster, license, headshot, and wrong-club gates as the game.
Only the complete, verified, playable subset is bundled.
"""
import argparse
import csv
from datetime import datetime, timezone
from html import escape
import hashlib
import json
from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]


def safe(value):
    value = re.sub(r'[\\/:*?"<>|\x00-\x1f]+', '-', str(value)).strip(' .')
    return value[:90] or 'Unknown'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--eligibility', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    report = json.loads(Path(args.eligibility).read_text(encoding='utf-8'))
    if (report.get('leagueCount'), report.get('teamCount'), report.get('trophyClubs')) != (8, 150, 69):
        raise SystemExit('Game coverage does not match eight retained leagues')
    destination = Path(args.output)
    destination.mkdir(parents=True, exist_ok=True)
    rows = []
    gallery = []
    seen = set()
    for player in report['players']:
        club_id, qid = player['clubId'], player['playerQid']
        assert re.fullmatch(r'Q[0-9]+', qid), qid
        assert (club_id, qid) not in seen, f'Duplicate: {club_id} {qid}'
        seen.add((club_id, qid))
        original = player['originalPath']
        expected = 'assets/player-headshots/' + club_id.replace(':', '-') + '--' + qid + '.jpg'
        assert original == expected, f'Wrong photo-to-player mapping: {original}'
        source = ROOT / original
        raw = source.read_bytes()
        assert len(raw) > 1500 and raw[:2] == bytes((0xFF, 0xD8)), original
        club_dir = safe(player['clubName']) + ' (' + safe(club_id) + ')'
        edit_path = Path('PHOTOS_BY_TEAM') / safe(player['leagueName']) / club_dir / (
            safe(player['playerName']) + ' [' + qid + '].jpg')
        dst = destination / edit_path
        assert not dst.exists(), f'Edit file collision: {edit_path}'
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_bytes(raw)
        original_copy = Path('ORIGINAL_FILE_NAMES') / original
        (destination / original_copy).parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, destination / original_copy)
        row = {
            'league': player['leagueName'], 'league_id': player['leagueId'],
            'club': player['clubName'], 'club_id': club_id,
            'player': player['playerName'], 'player_qid': qid,
            'editable_photo_path': edit_path.as_posix(),
            'original_photo_path': original,
            'original_copy_path': original_copy.as_posix(),
            'photo_source': player['photoSource'], 'photographer': player['author'],
            'license': player['license'], 'license_url': player['licenseUrl'],
            'squad_evidence': player['rosterSource'],
            'last_verified': player['verifiedAt'],
            'sha256': hashlib.sha256(raw).hexdigest()
        }
        rows.append(row)
        gallery.append(
            '<article><img loading="lazy" alt="" src="' +
            escape(edit_path.as_posix(), quote=True) + '"><p><b>' +
            escape(player['playerName']) + '</b><small>' +
            escape(player['clubName']) + ' · ' + escape(player['leagueName']) +
            '</small></p></article>')
    if len(rows) != len(report['players']):
        raise SystemExit('Missing player image in export')
    headers = list(rows[0]) if rows else []
    with (destination / 'PLAYER_TEAM_PHOTO_MATCHES.csv').open(
        'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)
    (destination / 'PLAYER_TEAM_PHOTO_MATCHES.json').write_text(
        json.dumps(rows, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    (destination / 'README_FIRST.txt').write_text(
        'BALL KNOWLEDGE — PLAYER PHOTO EDIT PACK\n\n'
        + 'Only player portraits currently eligible for display in the eight kept leagues are included.\n'
        + 'Each photo in PHOTOS_BY_TEAM is named for its verified current club and player.\n'
        + 'Please edit only the JPEG content, keeping the file names and folders as supplied.\n'
        + 'Keep the face/head centered and entirely visible. Remove shirts and club insignia where possible.\n'
        + 'Keep the photos square (192 x 192 JPEG preferred). Do not overlay player or club names.\n'
        + 'Return the edited PHOTOS_BY_TEAM folders plus PLAYER_TEAM_PHOTO_MATCHES.csv to re-import.\n'
        + 'ORIGINAL_FILE_NAMES is a lossless copy with original application filenames for backup.\n'
        + 'Do not delete the source/license information: images require attribution.\n'
        + 'All image identities/club assignments were exported from the actual gameplay eligibility checks.\n'
        + 'Preview all headshots by opening PHOTO_GALLERY.html after extracting the ZIP.\n\n'
        + f'Photos: {len(rows)} | Leagues: 8 | Clubs in game: 150 | Trophy clubs covered: 69\n',
        encoding='utf-8')
    (destination / 'PHOTO_GALLERY.html').write_text(
        '<!doctype html><meta charset="utf-8"><title>Ball Knowledge — Player Photo Review</title>'
        '<style>body{font:15px system-ui;background:#131526;color:white;margin:24px}'
        'h1{font-size:25px}p.lead{color:#bfc8e1}main{display:grid;gap:18px;'
        'grid-template-columns:repeat(auto-fill,minmax(170px,1fr))}'
        'article{padding:14px;background:#242840;border:1px solid #555b78;border-radius:15px}'
        'img{display:block;width:130px;height:130px;object-fit:contain;'
        'border-radius:12px;background:white;margin:0 auto}'
        'article p{margin:12px 0 0}small{display:block;color:#bfc8e1;margin-top:3px}</style>'
        '<h1>Ball Knowledge — Player &amp; Club Photo Matches</h1>'
        '<p class="lead">Edit the same filenames in PHOTOS_BY_TEAM, then return the folder.</p>'
        '<main>' + ''.join(gallery) + '</main>', encoding='utf-8')
    print(f'✓ Assembled {len(rows)} edited-ready, named player headshots in {destination}')


if __name__ == '__main__':
    main()
