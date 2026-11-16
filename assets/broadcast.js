/* Presentation-only enhancements; quiz logic remains in app.js. */
(function(){
const translations={"en":{"footballTrivia":"THE FOOTBALL TRIVIA GAME","heroStrap":"GUESS THE CLUB. KNOW THE STORY.","chooseLeagues":"Choose your leagues and start playing.","fiveClues":"5 clues · 5 guesses · football stories","rankedCompetition":"RANKED COMPETITION","rankedCup":"TÜRKİYE KUPASI","rankedAnnouncement":"Competitions will be announced soon.","rankedSoon":"RANKED SOON","leaderboard":"LEADERBOARD","seeAll":"SEE FULL ↗","casualStandings":"Casual quiz · Short mode","loadingRankings":"Loading rankings…","play":"PLAY","rankedTab":"RANKED SOON","rankings":"LEADERBOARD","stats":"STATS"},"tr":{"footballTrivia":"FUTBOL BİLGİ YARIŞMASI","heroStrap":"KULÜBÜ TAHMİN ET. HİKÂYESİNİ ÖĞREN.","chooseLeagues":"Liglerini seç ve oyuna başla.","fiveClues":"5 ipucu · 5 tahmin · futbol hikâyeleri","rankedCompetition":"SIRALAMALI YARIŞMA","rankedCup":"TÜRKİYE KUPASI","rankedAnnouncement":"Yarışmalar yakında duyurulacak.","rankedSoon":"RANKED SOON","leaderboard":"PUAN TABLOSU","seeAll":"TÜMÜ ↗","casualStandings":"Normal oyun · Kısa mod","loadingRankings":"Sıralama yükleniyor…","play":"OYNA","rankedTab":"RANKED SOON","rankings":"SIRALAMA","stats":"İSTATİSTİK"},"es":{"footballTrivia":"TRIVIA DE FÚTBOL","heroStrap":"ADIVINA EL CLUB. CONOCE SU HISTORIA.","chooseLeagues":"Elige tus ligas y empieza a jugar.","fiveClues":"5 pistas · 5 intentos · historias","rankedCompetition":"COMPETICIÓN CLASIFICADA","rankedCup":"COPA DE TURQUÍA","rankedAnnouncement":"Próximamente anunciaremos las competiciones.","rankedSoon":"RANKED SOON","leaderboard":"CLASIFICACIÓN","seeAll":"VER TODO ↗","casualStandings":"Modo casual · Corto","loadingRankings":"Cargando clasificación…","play":"JUGAR","rankedTab":"RANKED SOON","rankings":"CLASIFICACIÓN","stats":"ESTADÍSTICAS"},"fr":{"footballTrivia":"QUIZ DE FOOTBALL","heroStrap":"DEVINEZ LE CLUB. DÉCOUVREZ SON HISTOIRE.","chooseLeagues":"Choisissez vos ligues et commencez à jouer.","fiveClues":"5 indices · 5 essais · histoires","rankedCompetition":"COMPÉTITION CLASSÉE","rankedCup":"COUPE DE TURQUIE","rankedAnnouncement":"Les compétitions seront bientôt annoncées.","rankedSoon":"RANKED SOON","leaderboard":"CLASSEMENT","seeAll":"VOIR TOUT ↗","casualStandings":"Mode libre · Court","loadingRankings":"Chargement du classement…","play":"JOUER","rankedTab":"RANKED SOON","rankings":"CLASSEMENT","stats":"STATS"},"it":{"footballTrivia":"QUIZ CALCISTICO","heroStrap":"INDOVINA IL CLUB. SCOPRI LA SUA STORIA.","chooseLeagues":"Scegli i campionati e inizia a giocare.","fiveClues":"5 indizi · 5 tentativi · storie","rankedCompetition":"COMPETIZIONE CLASSIFICATA","rankedCup":"COPPA DI TURCHIA","rankedAnnouncement":"Le competizioni saranno annunciate presto.","rankedSoon":"RANKED SOON","leaderboard":"CLASSIFICA","seeAll":"VEDI TUTTO ↗","casualStandings":"Modalità libera · Breve","loadingRankings":"Caricamento classifica…","play":"GIOCA","rankedTab":"RANKED SOON","rankings":"CLASSIFICA","stats":"STATISTICHE"},"pt":{"footballTrivia":"QUIZ DE FUTEBOL","heroStrap":"ADIVINHE O CLUBE. CONHEÇA A HISTÓRIA.","chooseLeagues":"Escolha as ligas e comece a jogar.","fiveClues":"5 pistas · 5 tentativas · histórias","rankedCompetition":"COMPETIÇÃO RANQUEADA","rankedCup":"COPA DA TURQUIA","rankedAnnouncement":"As competições serão anunciadas em breve.","rankedSoon":"RANKED SOON","leaderboard":"CLASSIFICAÇÃO","seeAll":"VER TUDO ↗","casualStandings":"Modo casual · Curto","loadingRankings":"Carregando classificação…","play":"JOGAR","rankedTab":"RANKED SOON","rankings":"CLASSIFICAÇÃO","stats":"ESTATÍSTICAS"}};
function localize(){
 const lang=document.documentElement.lang;
 const dict=translations[lang]||translations.en;
 document.querySelectorAll('[data-bk-copy]').forEach(node=>{
  const key=node.dataset.bkCopy;
  if(Object.hasOwn(dict,key))node.textContent=dict[key];
 });
 refreshPlayerCard();
}
const recentText={
 tr:{label:'OYUNCU KARTI',lastScore:'SON OYUN',bkPoints:'BK PUANI',empty:'Henüz tamamlanmış oyun yok.',guest:'Misafir'},
 en:{label:'PLAYER CARD',lastScore:'LAST GAME',bkPoints:'BK POINTS',empty:'No completed quiz yet.',guest:'Guest'},
 es:{label:'PERFIL',lastScore:'ÚLTIMA PARTIDA',bkPoints:'PUNTOS BK',empty:'Aún no hay partidas completas.',guest:'Invitado'},
 fr:{label:'PROFIL',lastScore:'DERNIÈRE PARTIE',bkPoints:'POINTS BK',empty:'Aucune partie terminée.',guest:'Invité'},
 it:{label:'PROFILO',lastScore:'ULTIMA PARTITA',bkPoints:'PUNTI BK',empty:'Nessuna partita completata.',guest:'Ospite'},
 pt:{label:'PERFIL',lastScore:'ÚLTIMO JOGO',bkPoints:'PONTOS BK',empty:'Nenhuma partida concluída.',guest:'Visitante'}
};
let currentUsername='';
function refreshPlayerCard(){
 const lang=document.documentElement.lang;
 const dict=recentText[lang]||recentText.en;
 document.querySelectorAll('[data-bk-recent]').forEach(el=>{el.textContent=dict[el.dataset.bkRecent]||''});
 const name=document.getElementById('recentPlayerName');
 const score=document.getElementById('recentPlayerScore');
 const points=document.getElementById('recentPlayerPoints');
 const note=document.getElementById('recentPlayerNote');
 if(!name||!score||!points||!note)return;
 name.textContent=currentUsername||dict.guest;
 window.BKAvatars?.apply(document.getElementById('recentPlayerAvatar'),currentUsername);
 window.BKAvatars?.apply(document.getElementById('navPlayerAvatar'),currentUsername);
 let result;
 try{result=JSON.parse(localStorage.getItem('bk-recent-completed-score')||'null')}catch{result=null}
 const valid=result&&Number.isFinite(result.score)&&Number.isFinite(result.maxScore)&&result.maxScore>0;
 score.textContent=valid?result.score+' / '+result.maxScore:'—';
 points.textContent=valid&&Number.isFinite(result.bkPoints)?Number(result.bkPoints).toLocaleString(lang):'—';
 note.textContent=valid?new Date(result.completedAt||Date.now()).toLocaleDateString(lang):dict.empty;
}
window.BKPlayerCard={setProfile(username){currentUsername=String(username||'');refreshPlayerCard()},refresh:refreshPlayerCard};
window.BKMatchday={localize};
document.addEventListener('DOMContentLoaded',()=>{
 localize();
 for(const id of ['recentPlayerAvatar','homePlayerAvatar']){
  const badge=document.getElementById(id);
  if(!badge)continue;
  badge.addEventListener('click',()=>window.BKAvatars?.openPicker());
 }
});
})();