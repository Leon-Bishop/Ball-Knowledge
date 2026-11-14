"""Optional real Chromium smoke test; run: python3 scripts/browser-session-smoke.py"""
from playwright.sync_api import sync_playwright
from pathlib import Path
import subprocess,time,random,urllib.request,json,re
root=Path(__file__).resolve().parents[1]
port=8135
server=subprocess.Popen(['python3','-m','http.server',str(port),'--directory',str(root)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
 for _ in range(20):
  try:
   urllib.request.urlopen(f'http://localhost:{port}/index.html',timeout=.2);break
  except Exception:time.sleep(.2)
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  page=browser.new_page(viewport={'width':390,'height':844})
  errors=[];page.on('pageerror', lambda err:errors.append(str(err)))
  html=(root/'index.html').read_text(encoding='utf8')
  html=re.sub(r'<script\s+src="\./assets/(?:app|session-core)\.js"\s+defer></script>','',html)
  html=re.sub(r'<link rel="stylesheet" href="\./assets/styles\.css">','',html)
  datasets={f.name:json.loads(f.read_text(encoding='utf8')) for f in root.glob('*.json')}
  page.set_content(html,wait_until='domcontentloaded')
  page.add_style_tag(content=(root/'assets/styles.css').read_text(encoding='utf8'))
  page.evaluate('''(data)=>{const mem={'bk-leagues':JSON.stringify(['turkey-super-lig']),'efq-language':'en'};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>mem[k]||null,setItem:(k,v)=>mem[k]=String(v),removeItem:k=>delete mem[k]}});window.fetch=async key=>({ok:data[String(key)]!==undefined,status:data[String(key)]!==undefined?200:404,json:async()=>data[String(key)]});}''',datasets)
  page.add_script_tag(content=(root/'assets/session-core.js').read_text(encoding='utf8'))
  page.add_script_tag(content=(root/'assets/app.js').read_text(encoding='utf8'))
  page.locator('.league-tile').first.wait_for(timeout=10000)
  assert page.title()=='Ball Knowledge'
  assert page.locator('#pool').inner_text().startswith('18'), page.locator('#pool').inner_text()
  assert page.locator('#new').inner_text()=='Start 18-round quiz',page.locator('#new').inner_text()
  page.locator('#new').click()
  assert 'Round 1 of 18' in page.locator('#roundProgress').inner_text()
  assert page.locator('.slot').count()==5
  # First round: five distinct wrong answers -> score 0, advance.
  for i in range(5):
   wrong_name=page.evaluate('''() => session.order.find(t=>t.id!==round.id&&!wrong.some(w=>w.id===t.id)).name''')
   page.locator('#guess').fill(wrong_name)
   page.locator('#suggestions button').filter(has_text=wrong_name).first.click()
   page.locator('#submit').click()
  assert page.locator('#result').is_visible()
  assert page.locator('#sessionSummary').is_hidden()
  assert page.evaluate('session.results.length')==1
  assert page.evaluate('session.results[0].points')==0
  page.locator('#next').click()
  assert 'Round 2 of 18' in page.locator('#roundProgress').inner_text()
  # Solve remaining 17 rounds using the UI's own submit / next handlers.
  page.evaluate('''() => {for(let i=1;i<18;i++){ selected=round; submit(); if(i<17)document.getElementById('next').click();}}''')
  assert page.evaluate('session.completed')
  assert page.evaluate('session.results.length')==18
  assert page.locator('#next').is_hidden()
  assert page.locator('#sessionSummary').is_visible()
  assert page.locator('.final-score-number').inner_text()=='85 / 90'
  assert page.locator('.summary-stat-cell').nth(0).locator('strong').inner_text()=='17'
  assert page.locator('.summary-stat-cell').nth(1).locator('strong').inner_text()=='1'
  assert page.locator('.fact-text').inner_text().strip()
  assert page.locator('#sessionMeter').get_attribute('aria-valuenow')=='100'
  assert len(page.evaluate('session.results.map(r=>r.id)'))==len(set(page.evaluate('session.results.map(r=>r.id)')))
  # Check six-language translations of final score.
  for l in ['tr','es','fr','it','pt','en']:
   page.locator('#language').select_option(l)
   assert page.locator('#sessionSummary').is_visible()
   assert page.locator('.final-score-number').inner_text()=='85 / 90'
  page.locator('#language').select_option('en')
  page.screenshot(path=str(root/'docs'/'session-final-score.png'),full_page=True)
  # Replay generates fresh full deck, and resets score.
  page.locator('#sessionSummary').get_by_role('button',name='Play again').click()
  assert page.evaluate('session.results.length')==0
  assert page.evaluate('session.order.length')==18
  assert page.evaluate('score')==0
  assert 'Round 1 of 18' in page.locator('#roundProgress').inner_text()
  # Change leagues on selection screen while active and then return to play: fixed session remains stable.
  page.locator('#backToLeagues').click()
  page.locator('[data-league="turkey-super-lig"]').click()
  assert page.locator('#new').is_disabled()
  page.locator('.nav-item[data-screen="game"]').click()
  assert page.evaluate('session.order.length')==18
  assert 'Round 1 of 18' in page.locator('#roundProgress').inner_text()
  # New selection with Greece+Belgium+Turkey = 50 rounds.
  page.locator('#backToLeagues').click()
  for league in ['greece-super-league','belgian-pro-league','turkey-super-lig']:
   page.locator(f'[data-league="{league}"]').click()
  assert page.locator('#pool').inner_text().startswith('50')
  page.locator('#new').click()
  assert 'Round 1 of 50' in page.locator('#roundProgress').inner_text()
  page.evaluate('''() => {for(let i=0;i<50;i++){selected=round;submit();if(i<49)document.getElementById('next').click();}}''')
  assert page.evaluate('session.completed')
  assert page.evaluate('session.results.length')==50
  assert page.locator('.final-score-number').inner_text()=='250 / 250'
  assert not errors,errors
  browser.close()
 print('✓ Browser session smoke test: 18 rounds (17 correct, 1 missed), six languages, replay, fixed filters, 50 rounds.')
finally:
 server.terminate();server.wait(timeout=5)
