/* Forgiving club-name guesses. Pure browser/Node matcher; never exposes suggestions. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.BallKnowledgeGuessMatcher=api;
})(globalThis,function(){
 'use strict';
 const normalize=value=>String(value||'').toLocaleLowerCase('en')
  .replace(/ı/g,'i').replace(/ß/g,'ss').replace(/æ/g,'ae')
  .replace(/ø/g,'o').replace(/ł/g,'l').replace(/đ/g,'d')
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9]+/g,' ').trim();
 const PREFIXES=new Set(['fc','ac','as','sc','sv','ca','cd','cf','kv','kvc','kaa','raal','aj','rb','vfb','tsg','ado','club','royal','racing','deportivo','real','athletic','atletico','eintracht','bayer','borussia','oud']);
 const SUFFIXES=new Set(['fc','fk','cf','sc','sk','sfc','sfk','ac','sv','ksv','cp','bb','nfc','afc','club','town','city','united','04','07']);
 const GENERIC=new Set([...PREFIXES,...SUFFIXES,'st','saint','the','of','de','da','do','la','le','red','bull','sporting','union','standard','sint','caykur','go','ahead']);
 const EXTRA_ALIASES={
  'manchester city':['man city','man city fc','mancity'],
  'manchester united':['man utd','man united','man u','manchester utd','manunited'],
  'newcastle':['newcastle united','newcastle utd'],
  'tottenham':['tottenham hotspur','spurs'],
  'nottm forest':['nottingham forest','notts forest','forest'],
  'brighton':['brighton hove albion','brighton and hove albion'],
  'leeds united':['leeds utd'],
  'sunderland':['sunderland afc'],
  'hull city':['hull'],
  'coventry city':['coventry'],
  'internazionale':['inter milan','inter'],
  'internacional':['inter porto alegre','inter'],
  'ac milan':['milan'],
  'as roma':['roma'],
  'juventus':['juve'],
  'napoli':['ssc napoli'],
  'bayern munich':['bayern','bayern munchen','bayern münchen'],
  'borussia monchengladbach':['gladbach','borussia m gladbach'],
  'fc cologne':['koln','köln'],
  'paris saint germain':['paris sg','paris saint germain'],
  'olympiacos':['olympiakos'],
  'athletic club':['athletic bilbao','bilbao'],
  'atletico madrid':['atleti','atletico de madrid'],
  'fc barcelona':['barca','barça'],
  'deportivo la coruna':['depor','deportivo coruna'],
  'sporting cp':['sporting','sporting lisbon'],
  'vitoria guimaraes':['vitoria sc','guimaraes'],
  'atletico mg':['atletico mineiro'],
  'athletico paranaense':['athletico pr'],
  'red bull bragantino':['bragantino'],
  'union st gilloise':['union saint gilloise','union sg'],
  'sint truidense':['sint truiden','st truiden'],
  'heart of midlothian':['hearts'],
  'hibernian':['hibs'],
  'kilmarnock':['killie'],
  'dundee united':['dundee utd'],
  'caykur rizespor':['rize','rizespor','caykur rize'],
  'gaziantep fk':['gaziantep'],
  'erzurum bb':['erzurumspor','erzurum'],
  'basaksehir':['istanbul basaksehir','istanbul bb'],
  'galatasaray':['gala'],
  'fenerbahce':['fener'],
  'besiktas':['besiktas jk'],
  'alanyaspor':['alanya'],
  'konyaspor':['konya'],
  'samsunspor':['samsun'],
  'trabzonspor':['trabzon'],
  'kocaelispor':['kocaeli'],
  'eyupspor':['eyup'],
  'celtic':['celtic fc']
 };
 function explicitNames(team){
  const extras=EXTRA_ALIASES[normalize(team.name)]||[];
  return new Set([...(team.aliases||[]),team.team_abbreviation,...extras].map(normalize).filter(Boolean));
 }
 function shortNames(team){
  const name=normalize(team.name),tokens=name.split(' ');
  const variants=new Set();
  if(tokens.length>1){
   if(PREFIXES.has(tokens[0]))variants.add(tokens.slice(1).join(' '));
   if(SUFFIXES.has(tokens[tokens.length-1]))variants.add(tokens.slice(0,-1).join(' '));
   if(PREFIXES.has(tokens[0])&&SUFFIXES.has(tokens[tokens.length-1])&&tokens.length>2)variants.add(tokens.slice(1,-1).join(' '));
   for(const token of tokens)if(token.length>=4&&!GENERIC.has(token))variants.add(token);
  }
  // Turkish clubs often combine their home city with the word "spor".
  for(const token of [name,...variants]){
   if(!token.includes(' ')&&token.endsWith('spor')&&token.length>=7)variants.add(token.slice(0,-4));
  }
  variants.delete(name);
  return variants;
 }
 function distance(a,b){
  const m=a.length,n=b.length;
  const matrix=Array.from({length:m+1},()=>Array(n+1).fill(0));
  for(let i=0;i<=m;i++)matrix[i][0]=i;
  for(let j=0;j<=n;j++)matrix[0][j]=j;
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){
   matrix[i][j]=Math.min(matrix[i-1][j]+1,matrix[i][j-1]+1,matrix[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
   if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])
    matrix[i][j]=Math.min(matrix[i][j],matrix[i-2][j-2]+1);
  }
  return matrix[m][n];
 }
 const none=()=>({club:null,ambiguous:false});
 function choose(matches){
  if(matches.length===1)return {club:matches[0],ambiguous:false};
  return {club:null,ambiguous:matches.length>1};
 }
 function resolve(input,clubs){
  const q=normalize(input);
  if(!q||!Array.isArray(clubs)||!clubs.length)return none();
  // Exact full names take priority over nicknames and shortened forms.
  let hits=clubs.filter(team=>normalize(team.name)===q);
  if(hits.length)return choose(hits);
  hits=clubs.filter(team=>explicitNames(team).has(q));
  if(hits.length)return choose(hits);
  hits=clubs.filter(team=>shortNames(team).has(q));
  if(hits.length)return choose(hits);
  // Never guess what a short abbreviation or initialism was meant to say.
  if(q.length<5)return none();
  const maxDistance=q.length>=9?2:1;
  const scored=[];
  for(const team of clubs){
   const forms=new Set([normalize(team.name),...explicitNames(team),...shortNames(team)]);
   let best=Infinity;
   for(const form of forms){
    if(form.length<4||Math.abs(form.length-q.length)>maxDistance)continue;
    best=Math.min(best,distance(q,form));
    if(best===0)break;
   }
   if(best<=maxDistance)scored.push({team,d:best});
  }
  if(!scored.length)return none();
  scored.sort((a,b)=>a.d-b.d);
  // Close competitors must never cost a guess: ask for a more specific name.
  if(scored.length>1&&scored[1].d<=scored[0].d+1)return {club:null,ambiguous:true};
  return {club:scored[0].team,ambiguous:false};
 }
 return Object.freeze({normalize,resolve,shortNames});
});
