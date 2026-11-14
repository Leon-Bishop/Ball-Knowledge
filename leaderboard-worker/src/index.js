// Cloudflare Worker + D1. No GPS, street address, email or password is collected.
// Scores are a public beta: client-submitted scores are plausibility checked but not cheat-proof.
const json=(value,status=200,extra={})=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...extra}});
function cors(request,env){const origin=request.headers.get('Origin')||'';const allowed=String(env.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim());return allowed.includes(origin)?{'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Headers':'Authorization, Content-Type','Access-Control-Allow-Methods':'GET, POST, OPTIONS'}:null}
const normal=s=>String(s||'').normalize('NFC').trim();
function validName(name){return [...name].length>=3&&[...name].length<=20&&/^[\p{L}\p{N}_]+$/u.test(name)}
const countryOf=req=>/^[A-Z]{2}$/.test(req.cf?.country||'')?req.cf.country:'ZZ';
const regionOf=req=>String(req.cf?.regionCode||'').replace(/[^A-Za-z0-9-]/g,'').slice(0,16);
async function hash(token){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));return Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,'0')).join('')}
function authToken(req){const header=req.headers.get('Authorization')||'';const match=/^Bearer ([a-f0-9]{64})$/.exec(header);return match?.[1]||''}
async function readBody(req){if(Number(req.headers.get('content-length')||0)>2048)throw new Error('Payload too large');const raw=await req.text();if(raw.length>2048)throw new Error('Payload too large');return JSON.parse(raw)}
function publicUser(u){return {username:u.username,country:u.country,region:u.region||'',joinedAt:u.created_at}}
const ipLimiter=async(db,key,seconds)=>{const now=Math.floor(Date.now()/1000),boundary=now-seconds;await db.prepare('DELETE FROM rate_limits WHERE created_at < ?').bind(now-86400).run();const row=await db.prepare('SELECT created_at FROM rate_limits WHERE key = ?').bind(key).first();if(row&&row.created_at>boundary)return false;await db.prepare('INSERT INTO rate_limits(key,created_at) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET created_at=excluded.created_at').bind(key,now).run();return true};
async function currentUser(req,env){const token=authToken(req);if(!token)return null;return env.DB.prepare('SELECT id,username,country,region,created_at FROM users WHERE token_hash = ?').bind(await hash(token)).first()}
async function handle(req,env){const url=new URL(req.url),method=req.method,route=url.pathname,origin=req.headers.get('Origin');
 const c=cors(req,env);if(!c)return json({error:'Origin not allowed'},403);
 if(method==='OPTIONS')return new Response(null,{status:204,headers:c});
 const reply=(data,status=200)=>json(data,status,c);
 if(route==='/api/health'&&method==='GET')return reply({ready:true});
 if(route==='/api/profile'&&method==='GET'){const user=await currentUser(req,env);return user?reply({profile:publicUser(user)}):reply({error:'Profile not found'},401)}
 if(route==='/api/register'&&method==='POST'){
  let body;try{body=await readBody(req)}catch{return reply({error:'Invalid request'},400)}
  const username=normal(body.username),token=authToken(req);
  if(!validName(username)||!token)return reply({error:'Username must be 3–20 letters, numbers or underscores'},400);
  const existing=await currentUser(req,env);if(existing)return reply({error:'This browser already has a username',profile:publicUser(existing)},409);
  const country=countryOf(req),region=regionOf(req),key=username.toLowerCase();
  const ip=req.headers.get('CF-Connecting-IP')||'unknown';
  const allowed=await ipLimiter(env.DB,'registration:'+await hash(ip),60);
  if(!allowed)return reply({error:'Too many registration attempts. Try later.'},429);
  try{
   const userId=crypto.randomUUID(),tokenHash=await hash(token),now=Math.floor(Date.now()/1000);
   await env.DB.prepare('INSERT INTO users(id,username,name_key,token_hash,country,region,created_at) VALUES(?,?,?,?,?,?,?)').bind(userId,username,key,tokenHash,country,region,now).run();
   return reply({profile:{username,country,region,joinedAt:now}},201);
  }catch(e){if(String(e).includes('UNIQUE'))return reply({error:'Username already taken'},409);throw e}
 }
 if(route==='/api/leaderboard'&&method==='GET'){
  const scope=url.searchParams.get('scope')||'global',mode=url.searchParams.get('mode')||'short';
  if(!['global','country','region'].includes(scope)||!['short','medium','long'].includes(mode))return reply({error:'Invalid filter'},400);
  const user=await currentUser(req,env);
  if(scope!=='global'&&!user)return reply({error:'Choose a username to view your country or region'},401);
  const where=scope==='country'?' AND u.country = ?':scope==='region'?' AND u.country = ? AND u.region = ?':'';
  let binds=[mode];if(scope!=='global')binds.push(user.country);if(scope==='region')binds.push(user.region);
  const rows=await env.DB.prepare(`SELECT u.username,u.country,u.region,s.best_score AS score,s.best_total AS rounds,s.best_correct AS correct,s.updated_at FROM scores s JOIN users u ON u.id=s.user_id WHERE s.mode = ?${where} ORDER BY s.best_score * 1.0 / (s.best_total * 5) DESC, s.best_correct DESC, s.best_score DESC, s.updated_at ASC LIMIT 100`).bind(...binds).all();
  return reply({scope,mode,country:scope==='global'?null:user.country,region:scope==='region'?user.region:null,players:(rows.results||[]).map(({region,...x},i)=>({...x,rank:i+1,accuracy:Math.round(100*x.score/(x.rounds*5))}))});
 }
 if(route==='/api/scores'&&method==='POST'){
  const user=await currentUser(req,env);if(!user)return reply({error:'Choose a username first'},401);
  let body;try{body=await readBody(req)}catch{return reply({error:'Invalid request'},400)}
  const {mode,sessionId,score,total,correct}=body;
  if(!['short','medium','long'].includes(mode)||!/^[-a-f0-9]{36}$/.test(sessionId||'')||![score,total,correct].every(Number.isInteger)||
    total<1||total>214||correct<0||correct>total||score<0||score>correct*5||
    (mode==='short'&&total!==5)||(mode==='medium'&&total!==10)||(mode==='long'&&total<1))return reply({error:'Invalid quiz result'},400);
  const throttle=await ipLimiter(env.DB,'score:'+user.id,10);if(!throttle)return reply({error:'Please allow a moment between submissions'},429);
  try{
   const now=Math.floor(Date.now()/1000);
   await env.DB.prepare('INSERT INTO submissions(session_id,user_id,mode,score,total,correct,created_at) VALUES(?,?,?,?,?,?,?)').bind(sessionId,user.id,mode,score,total,correct,now).run();
   await env.DB.prepare(`INSERT INTO scores(user_id,mode,best_score,best_total,best_correct,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(user_id,mode) DO UPDATE SET best_score=excluded.best_score,best_total=excluded.best_total,best_correct=excluded.best_correct,updated_at=excluded.updated_at WHERE (excluded.best_score*1.0/excluded.best_total > scores.best_score*1.0/scores.best_total) OR (excluded.best_score*1.0/excluded.best_total = scores.best_score*1.0/scores.best_total AND excluded.best_correct>scores.best_correct)`).bind(user.id,mode,score,total,correct,now).run();
   return reply({saved:true});
  }catch(e){if(String(e).includes('UNIQUE'))return reply({error:'This session was already submitted'},409);throw e}
 }
 return reply({error:'Not found'},404);
}
export default {async fetch(req,env){try{return await handle(req,env)}catch(e){console.error(e);return json({error:'Service temporarily unavailable'},500,cors(req,env)||{})}}};
