from pathlib import Path
import json
A=[]
def add(id,key,url,t):
 assert len(t)==6
 A.append({'id':id,'key':key,'sources':[url],'score':9,'tr':t[0],'translations':dict(zip(('en','es','fr','it','pt'),t[1:]))})
add('italy-serie-a:1','acmilan-2005-final-three-nil-lost','https://www.uefa.com/uefachampionsleague/news/0250-0c50f2820ac1-0d73022c807f-1000--liverpool-triumph-in-turkey/',[
'Milan, 2005 Şampiyonlar Ligi finalinin devresinde Liverpool’a karşı 3-0 öndeydi; 3-3 biten maçı penaltılarda kaybederek kupayı kaçırdı.',
'Milan led Liverpool 3–0 at half-time in the 2005 Champions League final, then drew 3–3 and lost on penalties.',
'El Milan ganaba 3-0 al descanso de la final de Champions 2005 ante el Liverpool; terminó 3-3 y perdió en los penaltis.',
'Milan menait 3-0 à la pause de la finale de Champions 2005 contre Liverpool ; le match s’est terminé 3-3 et Milan a perdu aux tirs au but.',
'Il Milan era avanti 3-0 all’intervallo della finale Champions 2005 contro il Liverpool, ma finì 3-3 e perse ai rigori.',
'O Milan vencia o Liverpool por 3 a 0 no intervalo da final da Champions de 2005; terminou 3 a 3 e perdeu nos pênaltis.'])
add('italy-serie-a:3','bologna-2025-first-champions-win-dortmund','https://www.uefa.com/uefachampionsleague/news/0291-1bc660354c9d-f67a7d51b97d-1000--champions-league-league-phase-results-by-team/',[
'Bologna, kulüp tarihinin ilk Şampiyonlar Ligi galibiyetini 2025’te Borussia Dortmund’u 2-1 yenerek elde etti; önceki altı maçında kazanamamıştı.',
'Bologna’s first ever Champions League win came in January 2025, 2–1 against Borussia Dortmund, after six winless matches.',
'El Bologna logró su primera victoria en Champions en enero de 2025, 2-1 ante el Dortmund, tras seis partidos sin ganar.',
'Bologne a remporté sa première victoire en Ligue des champions en janvier 2025, 2-1 contre Dortmund, après six rencontres sans succès.',
'Il Bologna ottenne la sua prima vittoria in Champions nel gennaio 2025, 2-1 al Dortmund, dopo sei gare senza successi.',
'O Bologna conquistou sua primeira vitória na Champions em janeiro de 2025, por 2 a 1 contra o Dortmund, após seis jogos sem vencer.'])
add('italy-serie-a:4','cagliari-1970-eleven-goals-conceded','https://www.rainews.it/tgr/sardegna/articoli/2022/04/52-anni-dallo-storico-scudetto-008f727d-02a8-4810-b04b-b13cd0f03bd1.html',[
'Cagliari, 1969-70 sezonunda İtalya şampiyonu olurken 30 lig maçında sadece 11 gol yedi ve tüm sezonda yalnızca iki kez kaybetti.',
'When Cagliari won Serie A in 1970, they conceded only 11 goals in 30 matches and lost just twice all season.',
'Cuando el Cagliari ganó la Serie A en 1970, encajó solo 11 goles en 30 partidos y perdió apenas dos veces.',
'Lors de son sacre italien en 1970, Cagliari n’a encaissé que 11 buts en 30 matchs et n’a perdu que deux rencontres.',
'Quando il Cagliari vinse la Serie A nel 1970, subì soltanto 11 gol in 30 gare e perse appena due partite.',
'Quando o Cagliari venceu a Serie A em 1970, sofreu apenas 11 gols em 30 jogos e perdeu só duas vezes.'])
add('italy-serie-a:5','como-2026-beat-napoli-16-shootout','https://sscnapoli.it/en/news/coppa-italia-match-report-napoli-como-7-8-dopo-i-calci-di-rigore',[
'Como, 2026 İtalya Kupası’nda Napoli’yi 1-1’den sonra penaltılarda 7-6 eledi; seri ancak 16. atışla sona erdi.',
'Como knocked Napoli out of the 2026 Italian Cup, winning 7–6 in a shoot-out after a 1–1 draw; it took 16 penalty kicks to decide it.',
'El Como eliminó al Nápoles de la Copa de Italia 2026: tras 1-1 ganó 7-6 en una tanda que necesitó 16 lanzamientos.',
'Como a éliminé Naples de la Coupe d’Italie 2026, 7-6 aux tirs au but après 1-1 ; il a fallu 16 tirs pour départager les équipes.',
'Il Como eliminò il Napoli dalla Coppa Italia 2026, 7-6 ai rigori dopo l’1-1; servirono 16 tiri per decidere la sfida.',
'O Como eliminou o Napoli da Copa da Itália de 2026, vencendo por 7 a 6 nos pênaltis após 1 a 1; foram necessárias 16 cobranças.'])
add('italy-serie-a:6','fiorentina-2023-barak-120-plus-ten','https://www.uefa.com/uefaconferenceleague/news/0281-180b8162e878-4534725688f1-1000--basel-1-3-fiorentina-aet-agg-3-4-barak-takes-viola-to-europ/',[
'Fiorentina, 2023 Konferans Ligi yarı finalinde Basel’e karşı ancak uzatmanın 120+10. dakikasında Antonín Barák’ın golüyle finale çıkabildi.',
'Fiorentina reached the 2023 Conference League final thanks to Antonín Barák scoring against Basel in the 130th minute—120+10!',
'La Fiorentina llegó a la final de Conference de 2023 gracias a un gol de Antonín Barák ante el Basilea en el minuto 120+10.',
'La Fiorentina a atteint la finale de Conference 2023 grâce à un but d’Antonín Barák contre Bâle à la 120e+10.',
'La Fiorentina raggiunse la finale di Conference 2023 grazie a un gol di Antonín Barák contro il Basilea al 120’+10.',
'A Fiorentina chegou à final da Conference de 2023 graças a um gol de Antonín Barák contra o Basel aos 120+10 minutos.'])
add('italy-serie-a:7','frosinone-2023-4-0-at-napoli-cup','https://sscnapoli.it/en/news/coppa-italia-napoli-frosinone-0-4-laziali-ai-quarti-di-finale',[
'Frosinone, 2023’te son İtalya şampiyonu Napoli’yi kendi stadında İtalya Kupası’nda 4-0 yendi; dört golün tamamı son 25 dakikada geldi.',
'Frosinone stunned reigning Italian champions Napoli 4–0 away in the 2023 Italian Cup, scoring all four in the final 25 minutes.',
'El Frosinone goleó 4-0 a domicilio al vigente campeón italiano Nápoles en la Copa de 2023, con los cuatro goles en los últimos 25 minutos.',
'Frosinone a humilié Naples, champion d’Italie en titre, 4-0 à l’extérieur en Coupe 2023, avec quatre buts dans les 25 dernières minutes.',
'Il Frosinone travolse il Napoli campione d’Italia 4-0 in trasferta nella Coppa 2023, con tutte e quattro le reti negli ultimi 25 minuti.',
'O Frosinone goleou o Napoli, então campeão italiano, por 4 a 0 fora de casa na Copa de 2023, com quatro gols nos últimos 25 minutos.'])
add('italy-serie-a:8','genoa-first-club-fly-away-1927','https://www.fondazionegenoa.com/en/genoa-cfc-2/',[
'Genoa, İtalya’da bir deplasman maçına uçakla giden ilk futbol kulübüydü: 1927’de Roma’ya uçtu.',
'Genoa were the first Italian football team to fly to an away match, travelling to Rome by plane in 1927.',
'El Genoa fue el primer club italiano que viajó en avión a un partido fuera de casa, volando a Roma en 1927.',
'Genoa fut le premier club italien à prendre l’avion pour un match à l’extérieur, direction Rome en 1927.',
'Il Genoa fu la prima squadra italiana a volare in aereo per una trasferta: Roma, nel 1927.',
'O Genoa foi o primeiro clube italiano a viajar de avião para um jogo fora de casa, rumo a Roma em 1927.'])
add('italy-serie-a:8','genoa-1992-first-italian-win-anfield','https://www.fondazionegenoa.com/en/genoa-cfc-2/',[
'Genoa, 1992’de Liverpool’u Anfield’da 2-1 yenerek resmî bir Avrupa maçında bu stadyumda galip gelen ilk İtalyan takımı oldu.',
'Genoa beat Liverpool 2–1 at Anfield in 1992, becoming the first Italian side to win an official European match there.',
'El Genoa venció 2-1 al Liverpool en Anfield en 1992 y se convirtió en el primer club italiano que ganó allí un partido europeo oficial.',
'Genoa a battu Liverpool 2-1 à Anfield en 1992, devenant la première équipe italienne victorieuse là-bas en coupe d’Europe.',
'Il Genoa batté il Liverpool 2-1 ad Anfield nel 1992, prima squadra italiana a vincere lì in una competizione europea ufficiale.',
'O Genoa venceu o Liverpool por 2 a 1 em Anfield em 1992, tornando-se o primeiro clube italiano a ganhar uma partida europeia oficial ali.'])
add('italy-serie-a:12','lecce-monza-2023-101st-minute-safety','https://www.acmonza.com/it/news/monza-lecce-report/',[
'Lecce, 2023’te Monza maçının 83. dakikasında penaltı kurtardı; 101. dakikada penaltıdan gol atıp 1-0 kazanarak Serie A’da kalmayı garantiledi.',
'Lecce saved a penalty against Monza in 2023, then scored a 101st-minute penalty to win 1–0 and secure Serie A survival.',
'El Lecce paró un penalti ante el Monza en 2023 y marcó otro en el minuto 101 para ganar 1-0 y salvarse del descenso.',
'Lecce a arrêté un penalty contre Monza en 2023, puis marqué sur penalty à la 101e pour gagner 1-0 et assurer son maintien.',
'Il Lecce parò un rigore contro il Monza nel 2023, poi ne segnò uno al 101º per vincere 1-0 e salvarsi.',
'O Lecce defendeu um pênalti contra o Monza em 2023 e marcou outro aos 101 minutos para vencer por 1 a 0 e garantir a permanência.'])
add('italy-serie-a:13','monza-both-juventus-debut-seriea','https://www.juventus.com/en/news/articles/stats-from-the-game-juventus-monza-serie-a',[
'Monza, Serie A’daki ilk sezonunda 2022-23’te Juventus’u hem evinde 1-0 hem deplasmanda 2-0 yenerek bunu başaran nadir yeni takımlardan oldu.',
'In their debut Serie A season in 2022/23, Monza beat Juventus both home and away: 1–0 and 2–0.',
'En su primera temporada en Serie A (2022/23), el Monza venció a la Juventus tanto en casa (1-0) como fuera (2-0).',
'Dès sa première saison en Serie A, en 2022/23, Monza a battu la Juventus à domicile (1-0) et à Turin (2-0).',
'Nel debutto in Serie A 2022/23, il Monza batté la Juventus sia in casa (1-0) sia a Torino (2-0).',
'Na primeira temporada de Serie A, em 2022/23, o Monza venceu a Juventus em casa (1 a 0) e fora (2 a 0).'])
add('italy-serie-a:14','napoli-1989-juventus-2-0-3-0-extra','https://www.uefa.com/uefaeuropaleague/news/00ea-0e6a0cc871e7-6a9bd3c50681-1000--1988-89-maradona-leads-the-way-for-napoli/',[
'Napoli, 1989 UEFA Kupası’nda Juventus’a ilk maçta 2-0 yenildikten sonra rövanşı 3-0 kazandı; turu getiren gol uzatmanın son dakikasında geldi.',
'Napoli lost 2–0 away to Juventus in the 1989 UEFA Cup, then won the return 3–0 with the decisive goal in the final minute of extra time.',
'El Nápoles perdió 2-0 ante la Juventus en la Copa UEFA 1989 y luego ganó 3-0 la vuelta con un gol decisivo en el último minuto de la prórroga.',
'Naples avait perdu 2-0 chez la Juventus en Coupe UEFA 1989, puis gagné 3-0 au retour grâce à un but dans la dernière minute de prolongation.',
'Il Napoli perse 2-0 con la Juventus nella Coppa UEFA 1989, poi vinse 3-0 al ritorno con il gol decisivo all’ultimo minuto dei supplementari.',
'O Napoli perdeu por 2 a 0 para a Juventus na Copa UEFA de 1989, mas venceu a volta por 3 a 0 com gol decisivo no último minuto da prorrogação.'])
add('italy-serie-a:15','parma-2015-bankruptcy-three-promotions','https://www.parmacalcio1913.com/en/history-of-the-club/',[
'Parma, 2015’te iflas edip dördüncü lige düştü; üç yıl üst üste yükselerek 2018’de yeniden Serie A’ya döndü.',
'Parma went bankrupt and restarted in Italy’s fourth tier in 2015, then won three straight promotions to return to Serie A by 2018.',
'El Parma quebró y reinició en la cuarta división italiana en 2015, pero consiguió tres ascensos seguidos para volver a Serie A en 2018.',
'Parme a fait faillite et redémarré en quatrième division italienne en 2015, puis obtenu trois montées d’affilée pour retrouver la Serie A en 2018.',
'Il Parma fallì e ripartì dalla Serie D nel 2015, poi ottenne tre promozioni di fila tornando in Serie A nel 2018.',
'O Parma faliu e recomeçou na quarta divisão italiana em 2015, conquistando três acessos seguidos para voltar à Serie A em 2018.'])
add('italy-serie-a:15','parma-1999-final-mechanic-scores','https://www.uefa.com/uefaeuropaleague/news/0162-0e6a26246bfc-f7b6f7a9f9ec-1000/',[
'Parma’nın 1999 UEFA Kupası finalinde Marsilya’ya attığı üç golden birini, futbolculuktan önce oto tamirciliği yapan Paolo Vanoli kaydetti.',
'One of Parma’s goals in their 3–0 win over Marseille in the 1999 UEFA Cup final came from Paolo Vanoli, a former car mechanic.',
'Uno de los goles del Parma en el 3-0 al Marsella de la final UEFA 1999 lo marcó Paolo Vanoli, antiguo mecánico de coches.',
'Parmi les buteurs de Parme lors du 3-0 face à Marseille en finale UEFA 1999 figurait Paolo Vanoli, ancien mécanicien automobile.',
'Uno dei gol del Parma nel 3-0 al Marsiglia nella finale UEFA 1999 fu di Paolo Vanoli, ex meccanico d’auto.',
'Um dos gols do Parma na vitória por 3 a 0 sobre o Marseille na final da UEFA de 1999 foi de Paolo Vanoli, ex-mecânico de carros.'])
add('italy-serie-a:16','roma-2018-barca-4-1-to-3-0','https://www.uefa.com/uefachampionsleague/news/0244-0e9cca96247f-6f619a17c764-1000--roma-stun-barcelona-to-reach-semi-finals/',[
'Roma, 2018 Şampiyonlar Ligi’nde Barcelona’ya ilk maçta 4-1 yenildi; rövanşı 3-0 kazanıp deplasman golüyle yarı finale çıktı.',
'Roma lost 4–1 at Barcelona in 2018, then won the Champions League return 3–0 to reach the semi-finals on away goals.',
'La Roma perdió 4-1 ante el Barcelona en 2018, pero ganó la vuelta de Champions 3-0 y pasó a semifinales por goles fuera.',
'La Roma a perdu 4-1 à Barcelone en 2018, puis gagné le retour 3-0 pour atteindre les demi-finales de Champions aux buts à l’extérieur.',
'La Roma perse 4-1 a Barcellona nel 2018, poi vinse 3-0 al ritorno arrivando in semifinale di Champions per i gol in trasferta.',
'A Roma perdeu por 4 a 1 em Barcelona em 2018, mas venceu a volta por 3 a 0 e avançou à semifinal da Champions pelos gols fora.'])
add('italy-serie-a:19','udinese-2005-werder-three-goals-six-min','https://www.uefa.com/uefachampionsleague/news/01d8-0e720191165f-b187c87312d5-1000--udinese-out-to-overhaul-bremen-advantage/',[
'Udinese, 2005’te Werder Bremen deplasmanında Şampiyonlar Ligi maçında 3-0 gerideyken ikinci yarıda altı dakikada üç gol buldu; yine de 4-3 kaybetti.',
'Udinese came back from 3–0 down at Werder Bremen in a 2005 Champions League match by scoring three goals in six second-half minutes, but still lost 4–3.',
'El Udinese pasó del 0-3 al 3-3 en seis minutos ante el Werder en Champions 2005, pero acabó perdiendo 4-3.',
'Udinese est revenu de 0-3 à 3-3 en six minutes face au Werder en Champions 2005, mais a finalement perdu 4-3.',
'L’Udinese rimontò da 0-3 a 3-3 in sei minuti contro il Werder in Champions 2005, ma perse comunque 4-3.',
'A Udinese saiu de 0 a 3 para 3 a 3 em seis minutos contra o Werder na Champions de 2005, mas ainda perdeu por 4 a 3.'])
add('italy-serie-a:20','venezia-three-bankruptcies-ten-years','https://en.veneziafc.it/club/history',[
'Venezia, 2005–2015 arasındaki yalnızca on yılda üç kez iflas etti; 2015’te yeniden kurulmasının ardından Serie A’ya kadar geri döndü.',
'Venezia went bankrupt three times in just ten years, between 2005 and 2015, but rebuilt and fought their way back to Serie A.',
'El Venezia quebró tres veces en solo diez años, de 2005 a 2015, pero se reconstruyó y logró regresar a Serie A.',
'Venezia a fait faillite trois fois en dix ans, entre 2005 et 2015, avant de se reconstruire et de revenir en Serie A.',
'Il Venezia fallì tre volte in soli dieci anni, fra il 2005 e il 2015, ma ripartì e tornò in Serie A.',
'O Venezia faliu três vezes em apenas dez anos, entre 2005 e 2015, mas se reergueu e voltou à Serie A.'])
add('italy-serie-a:20','venezia-inzaghi-coach-promotion-cup-double','https://en.veneziafc.it/club/history',[
'Venezia, 2015 iflasından sonra teknik direktör Filippo Inzaghi ile üçüncü lig şampiyonluğunu ve Serie C Kupası’nı aynı sezon kazandı.',
'After their 2015 bankruptcy, Venezia hired Filippo Inzaghi and won both promotion to Serie B and the Serie C Cup in his first season.',
'Tras la quiebra de 2015, el Venezia contrató a Filippo Inzaghi y ganó el ascenso a Serie B y la Copa Serie C en su primera temporada.',
'Après sa faillite de 2015, Venezia a engagé Filippo Inzaghi et remporté la montée en Serie B et la Coupe de Serie C dès sa première saison.',
'Dopo il fallimento del 2015, il Venezia assunse Filippo Inzaghi e conquistò sia la promozione in Serie B sia la Coppa Italia Serie C nella sua prima stagione.',
'Após a falência de 2015, o Venezia contratou Filippo Inzaghi e venceu o acesso à Serie B e a Copa Serie C já na primeira temporada.'])
Path(__file__).with_suffix('.json').write_text(json.dumps(A,ensure_ascii=False,indent=2)+'\n');print('Generated',len(A))
