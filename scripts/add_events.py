#!/usr/bin/env python3
"""Append independently researched and cited stories in six languages.
No external requests: editorial events must be verified before inclusion.
Only known event shapes are translated through human-written sentence templates.
"""
from pathlib import Path
import json, collections, argparse, difflib
ROOT = Path(__file__).resolve().parent.parent
P=ROOT/'tum-kulupler-ilginc-hikayeler-guncel.json'
COMPETITIONS={
 'turkish_cup':{'tr':'Türkiye Kupası','en':'Turkish Cup','es':'Copa de Turquía','fr':'Coupe de Turquie','it':'Coppa di Turchia','pt':'Copa da Turquia'},
 'dutch_cup':{'tr':'Hollanda Kupası','en':'Dutch Cup','es':'Copa de los Países Bajos','fr':'Coupe des Pays-Bas','it':'Coppa dei Paesi Bassi','pt':'Copa da Holanda'},
 'french_cup':{'tr':'Fransa Kupası','en':'French Cup','es':'Copa de Francia','fr':'Coupe de France','it':'Coppa di Francia','pt':'Copa da França'},
 'champions_league':{'tr':'Şampiyonlar Ligi','en':'Champions League','es':'Liga de Campeones','fr':'Ligue des champions','it':'Champions League','pt':'Liga dos Campeões'},
 'europa_league':{'tr':'Avrupa Ligi','en':'Europa League','es':'Liga Europa','fr':'Ligue Europa','it':'Europa League','pt':'Liga Europa'},
}
TEMPLATES={
 'cup_shootout_win':{
 'tr':'{year} {cup} finalinde {club}, {opponent} ile {draw} berabere kaldıktan sonra penaltılarda {pens} kazanarak kupayı aldı.',
 'en':'In the {year} {cup} final, {club} drew {draw} with {opponent} before winning the cup {pens} on penalties.',
 'es':'En la final de la {cup} de {year}, {club} empató {draw} con {opponent} y ganó el título en los penaltis por {pens}.',
 'fr':'En finale de la {cup} {year}, {club} a fait {draw} contre {opponent}, avant de remporter la coupe aux tirs au but ({pens}).',
 'it':'Nella finale della {cup} {year}, {club} pareggiò {draw} contro {opponent} e conquistò il trofeo ai rigori per {pens}.',
 'pt':'Na final da {cup} de {year}, {club} empatou {draw} com {opponent} e conquistou o troféu nos pênaltis por {pens}.',
 },
 'cup_away_comeback':{
 'tr':'{club}, {year} {cup} yarı finalinde {opponent} karşısında ilk maçı {first} kaybetmesine rağmen rövanşı {second} kazanıp finale çıktı.',
 'en':'In the {year} {cup} semi-final, {club} lost the first leg {first} to {opponent}, then won the return {second} to reach the final.',
 'es':'En las semifinales de la {cup} de {year}, {club} perdió la ida {first} ante {opponent}, pero ganó la vuelta {second} y llegó a la final.',
 'fr':'En demi-finale de la {cup} {year}, {club} a perdu l’aller {first} contre {opponent}, puis gagné le retour {second} pour atteindre la finale.',
 'it':'Nella semifinale della {cup} {year}, {club} perse l’andata {first} contro {opponent}, poi vinse il ritorno {second} e raggiunse la finale.',
 'pt':'Na semifinal da {cup} de {year}, {club} perdeu o primeiro jogo por {first} para {opponent}, mas venceu a volta por {second} e chegou à final.',
 },
 'cup_outshock':{
 'tr':'{club}, {year} {cup} maçında {opponent} karşısında {score} kazanarak rakibine büyük bir sürpriz yaşattı.',
 'en':'In {year}, {club} stunned {opponent} with a {score} victory in the {cup}.',
 'es':'En {year}, {club} sorprendió a {opponent} con una victoria por {score} en la {cup}.',
 'fr':'En {year}, {club} a créé la surprise en battant {opponent} {score} en {cup}.',
 'it':'Nel {year}, {club} sorprese {opponent} vincendo {score} in {cup}.',
 'pt':'Em {year}, {club} surpreendeu {opponent} com uma vitória por {score} na {cup}.',
 },
 'one_scorer_final':{
 'tr':'{year} {cup} finalinde {club}, {opponent} karşısında {score} kazandı; maçın iki golünü de {player} attı.',
 'en':'In the {year} {cup} final, {club} beat {opponent} {score}, with both goals scored by {player}.',
 'es':'En la final de la {cup} de {year}, {club} venció a {opponent} por {score}; {player} marcó los dos goles.',
 'fr':'En finale de la {cup} {year}, {club} a battu {opponent} {score} grâce à un doublé de {player}.',
 'it':'Nella finale della {cup} {year}, {club} sconfisse {opponent} {score}; entrambe le reti furono di {player}.',
 'pt':'Na final da {cup} de {year}, {club} venceu {opponent} por {score}; {player} marcou os dois gols.',
 },
 'promotion_shootout':{
 'tr':'{club}, {year} yükselme play-off finalinde {opponent} ile {draw} berabere kaldı; {pens} penaltı galibiyetiyle ilk kez Süper Lig’e çıktı.',
 'en':'In {year}, {club} drew {draw} with {opponent} in the promotion play-off final, then won the shoot-out {pens} to reach the Süper Lig for the first time.',
 'es':'En {year}, {club} empató {draw} con {opponent} en la final de ascenso y ganó los penaltis por {pens} para llegar por primera vez a la Süper Lig.',
 'fr':'En {year}, {club} a fait {draw} contre {opponent} en finale des barrages de montée, puis remporté les tirs au but ({pens}) pour accéder pour la première fois à la Süper Lig.',
 'it':'Nel {year}, {club} pareggiò {draw} contro {opponent} nella finale dei play-off promozione e vinse ai rigori {pens}, raggiungendo per la prima volta la Süper Lig.',
 'pt':'Em {year}, {club} empatou {draw} com {opponent} na final do acesso e venceu nos pênaltis por {pens}, chegando pela primeira vez à Süper Lig.',
 },
 'promotion_penalties':{
 'tr':'{club}, {year} yükselme play-off finalinde {opponent} ile {draw} berabere kaldı; penaltıları {pens} kazanıp Süper Lig’e çıktı.',
 'en':'In {year}, {club} drew {draw} with {opponent} in the promotion play-off final, then won {pens} on penalties to reach the Süper Lig.',
 'es':'En {year}, {club} empató {draw} con {opponent} en la final de ascenso y ganó en los penaltis por {pens} para subir a la Süper Lig.',
 'fr':'En finale des barrages de montée {year}, {club} a fait {draw} contre {opponent} puis gagné aux tirs au but ({pens}) pour monter en Süper Lig.',
 'it':'Nel {year}, {club} pareggiò {draw} contro {opponent} nella finale per la promozione e vinse ai rigori {pens} per salire in Süper Lig.',
 'pt':'Em {year}, {club} empatou {draw} com {opponent} na final do acesso e venceu nos pênaltis por {pens}, subindo à Süper Lig.',
 },
 'european_shock':{
 'tr':'{club}, {year} {cup} maçında {opponent}’ı {score} yenerek büyük sürprize imza attı.',
 'en':'In the {year} {cup}, {club} sprang a major surprise by beating {opponent} {score}.',
 'es':'En la {cup} de {year}, {club} dio una gran sorpresa al vencer a {opponent} por {score}.',
 'fr':'En {cup} {year}, {club} a créé une énorme surprise en battant {opponent} {score}.',
 'it':'Nella {cup} {year}, {club} firmò una grande sorpresa battendo {opponent} {score}.',
 'pt':'Na {cup} de {year}, {club} surpreendeu ao vencer {opponent} por {score}.',
 },
 'final_losing_penalties':{
 'tr':'{club}, {year} {cup} finalinde {opponent} ile {draw} berabere kaldıktan sonra kupayı {pens} penaltı sonucu kaçırdı.',
 'en':'{club} drew {draw} with {opponent} in the {year} {cup} final, but missed out on the trophy after losing the shoot-out {pens}.',
 'es':'{club} empató {draw} ante {opponent} en la final de la {cup} de {year}, pero perdió el título en los penaltis por {pens}.',
 'fr':'{club} a fait {draw} contre {opponent} en finale de la {cup} {year}, mais a perdu le trophée aux tirs au but ({pens}).',
 'it':'{club} pareggiò {draw} con {opponent} nella finale della {cup} {year}, ma perse il trofeo ai rigori per {pens}.',
 'pt':'{club} empatou {draw} com {opponent} na final da {cup} de {year}, mas perdeu o título nos pênaltis por {pens}.',
 },
}

def render(e):
 if 'translations' in e:
  texts={'tr':e['tr'],**e['translations']}
  assert all(texts.get(l) for l in ('tr','en','es','fr','it','pt'))
 else:
  spec=e['event'];kind=spec['kind']; params={k:v for k,v in spec.items() if k!='kind'}
  texts={}
  for l,tpl in TEMPLATES[kind].items():
   p=params.copy()
   if 'cup' in p:
    p['cup']=COMPETITIONS[p['cup']][l]
   texts[l]=tpl.format(**p)
 return {'text':texts['tr'],'translations':{k:texts[k] for k in ('en','es','fr','it','pt')},'sources':e['sources'],'status':'source_supported','surprise_score':e.get('score',8), 'event_key':e['key']}

def clean(row):
 original=[]
 for f in row['facts']:
  if isinstance(f.get('text'),str) and f['text'].strip():original.append(f)
 seen=set();facts=[]
 for f in original:
  if row['team_name']=='Başakşehir' and ('Sporting' in f['text'] and '119.' in f['text']):
   # Treat both Sporting descriptions as a single underlying match; keep the more detailed one.
   if 'basaksehir-sporting-2020' in seen:continue
   seen.add('basaksehir-sporting-2020')
  facts.append(f)
 return facts

def add_events(events):
 rows=json.loads(P.read_text(encoding='utf-8'))
 byid={row['id']:row for row in rows}
 added=0; replaced=0; duplicates=0
 for ev in events:
  row=byid[ev['id']]; fact=render(ev); existing=clean(row)
  if any(f.get('event_key')==ev['key'] or f.get('text')==fact['text'] for f in existing):duplicates+=1;continue
  if row['team_name']=='Başakşehir' and ev['key']=='basaksehir-sporting-2020': continue
  cap=5 if row['league_id']=='turkey-super-lig' else 3
  good=[f for f in existing if f.get('status') in ('sourced','source_supported') and f.get('sources')]
  weak=[f for f in existing if f not in good]
  if len(good)>=cap:continue
  available=cap-len(good)
  # Prefer verified newly-added content over weaker older candidates, without silent deletion from original checkpoint.
  weak=weak[:max(0,available-1)]
  newfacts=good+weak+[fact]
  replaced+=max(0,len(existing)-len(good)-len(weak))
  assert len(newfacts)<=cap
  while len(newfacts)<cap:newfacts.append({'text':None,'translations':{},'sources':[],'status':'research_needed','surprise_score':None})
  row['facts']=newfacts;added+=1
  row['complete']=all(f.get('status')=='source_supported' and bool(f.get('sources')) and all((f.get('translations') or {}).get(l) for l in ('en','es','fr','it','pt')) for f in newfacts)
 P.write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 return added,replaced,duplicates

if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('file');args=ap.parse_args()
 events=json.loads(Path(args.file).read_text(encoding='utf-8'))
 print(add_events(events))
