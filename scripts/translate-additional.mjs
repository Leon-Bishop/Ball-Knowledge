import fs from 'node:fs';
const path='tum-kulupler-ilginc-hikayeler-guncel.json';const rows=JSON.parse(fs.readFileSync(path,'utf8'));
const extra={
 'turkey-super-lig:11':{
 en:'Against Sporting Lisbon, Başakşehir forced extra time with a 90+2 goal, then scored the decisive goal in the 119th minute.',
 es:'Ante el Sporting de Lisboa, Başakşehir forzó la prórroga con un gol en el 90+2 y decidió la eliminatoria en el 119.',
 fr:'Face au Sporting Lisbonne, Başakşehir a arraché la prolongation à 90+2 avant de se qualifier à la 119e minute.',
 it:'Contro lo Sporting Lisbona, il Başakşehir forzò i supplementari al 90+2 e segnò il gol decisivo al 119°.',
 pt:'Frente ao Sporting, o Başakşehir forçou o prolongamento aos 90+2 e garantiu a passagem aos 119 minutos.'},
 'spain-la-liga:16':{
 en:'In 2022, Real Madrid trailed Manchester City 5–3 on aggregate in the 90th minute, before two late Rodrygo goals forced extra time.',
 es:'En 2022, el Real Madrid perdía 5-3 en el global ante el Manchester City en el minuto 90; dos goles tardíos de Rodrygo forzaron la prórroga.',
 fr:'En 2022, le Real Madrid était mené 5-3 sur l’ensemble des deux matchs à la 90e contre Manchester City, puis Rodrygo a marqué deux fois.',
 it:'Nel 2022 il Real Madrid era sotto 5-3 nel totale contro il Manchester City al 90°, ma due gol di Rodrygo portarono ai supplementari.',
 pt:'Em 2022, o Real Madrid perdia 5-3 no agregado para o Manchester City aos 90 minutos, mas dois golos de Rodrygo levaram ao prolongamento.'},
 'england-premier-league:12':{
 en:'Liverpool overturned a 3–0 first-leg defeat to Barcelona by winning 4–0 at Anfield in the 2019 Champions League semifinals.',
 es:'Liverpool remontó el 3-0 de la ida ante el Barcelona con un 4-0 en Anfield en semifinales de Champions de 2019.',
 fr:'Liverpool a remonté son déficit de 3-0 contre Barcelone en gagnant 4-0 à Anfield en demi-finale de 2019.',
 it:'Il Liverpool ribaltò lo 0-3 dell’andata contro il Barcellona vincendo 4-0 ad Anfield nella semifinale del 2019.',
 pt:'O Liverpool recuperou de uma derrota por 3-0 frente ao Barcelona com uma vitória por 4-0 em Anfield, na meia-final de 2019.'},
 'turkey-super-lig:7':{
 en:'Galatasaray beat Real Madrid in the 2000 UEFA Super Cup thanks to a golden goal by new signing Mário Jardel.',
 es:'Galatasaray derrotó al Real Madrid en la Supercopa de la UEFA de 2000 gracias a un gol de oro del recién fichado Mário Jardel.',
 fr:'Galatasaray a battu le Real Madrid lors de la Supercoupe de l’UEFA 2000 grâce au but en or de Mário Jardel, nouvelle recrue.',
 it:'Il Galatasaray batté il Real Madrid nella Supercoppa UEFA 2000 grazie al golden gol del neoacquisto Mário Jardel.',
 pt:'O Galatasaray venceu o Real Madrid na Supertaça UEFA de 2000 graças ao golo de ouro do recém-contratado Mário Jardel.'},
 'spain-la-liga:4':{
 en:'Atlético Madrid was seconds from the 1974 European Cup when Bayern equalized; two days later Atlético lost the replay 4–0.',
 es:'El Atlético rozó la Copa de Europa de 1974, pero el Bayern empató en el último instante; dos días después perdió la repetición 4-0.',
 fr:'L’Atlético touchait la Coupe d’Europe en 1974 quand le Bayern a égalisé au dernier instant; il a perdu le match rejoué 4-0.',
 it:'L’Atlético sfiorò la Coppa dei Campioni nel 1974, ma il Bayern pareggiò allo scadere; perse 4-0 la ripetizione due giorni dopo.',
 pt:'O Atlético esteve a segundos da Taça dos Campeões de 1974, mas o Bayern empatou; dois dias depois perdeu a repetição por 4-0.'},
 'england-premier-league:11':{
 en:'Leicester City began the 2015–16 Premier League season as 5,000-to-1 outsiders to win the title.',
 es:'El Leicester empezó la Premier League 2015-16 con probabilidades de 5.000 a 1 de ser campeón.',
 fr:'Leicester a commencé la Premier League 2015-16 avec une cote de 5 000 contre 1 pour le titre.',
 it:'Il Leicester iniziò la Premier League 2015-16 con una quota di 5000 a 1 per vincere il titolo.',
 pt:'O Leicester começou a Premier League 2015-16 com probabilidades de 5000 para 1 para ganhar o título.'}
};
for(const row of rows){
 if(!(row.id in extra))continue;
 for(const f of row.facts){
  if(f.status!=='source_supported'||Object.keys(f.translations||{}).length>0)continue;
  f.translations=extra[row.id];
  break;
 }
}
// Second Liverpool verified entry, the 2005 comeback
const liv=rows.find(r=>r.id==='england-premier-league:12');
const second=liv.facts.find(f=>f.status==='source_supported'&&!Object.keys(f.translations||{}).length);
if(second)second.translations={en:'Liverpool trailed AC Milan 3–0 at halftime in the 2005 Champions League final, but won on penalties.',es:'Liverpool perdía 3-0 al descanso de la final de Champions de 2005 ante el Milan, pero ganó en los penaltis.',fr:'Mené 3-0 à la mi-temps par Milan en finale de Ligue des champions 2005, Liverpool l’a emporté aux tirs au but.',it:'Sotto 3-0 contro il Milan all’intervallo della finale di Champions 2005, il Liverpool vinse ai rigori.',pt:'O Liverpool perdia 3-0 ao intervalo da final da Champions de 2005 contra o Milan, mas venceu nos penáltis.'};
fs.writeFileSync(path,JSON.stringify(rows,null,2)+'\n');
