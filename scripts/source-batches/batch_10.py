from pathlib import Path
import json
A=[]
def add(id,key,url,t):
 assert len(t)==6
 A.append(dict(id=id,key=key,sources=[url],score=9,tr=t[0],translations=dict(zip(('en','es','fr','it','pt'),t[1:]))))
add('germany-bundesliga:2','leverkusen-cup-loss-elversberg-2022','https://www.bayer04.de/en-us/news/dfb-pokal/werkself-exit-dfb-cup-in-4-3-defeat',[
'Bayer Leverkusen, 2022 Almanya Kupası’nda üçüncü ligdeki Elversberg’e karşı deplasmanda 4-3 kaybederek ilk turda elendi.',
'Bayer Leverkusen crashed out of the 2022 German Cup in the first round, losing 4–3 away to third-tier Elversberg.',
'El Bayer Leverkusen cayó eliminado de la Copa alemana de 2022 al perder 4-3 en primera ronda ante el Elversberg, de tercera división.',
'Le Bayer Leverkusen a été éliminé de la Coupe d’Allemagne 2022 dès le premier tour en perdant 4-3 chez le modeste Elversberg de troisième division.',
'Il Bayer Leverkusen uscì dalla Coppa di Germania 2022 al primo turno, perdendo 4-3 sul campo dell’Elversberg di terza serie.',
'O Bayer Leverkusen caiu na primeira rodada da Copa da Alemanha de 2022 ao perder por 4 a 3 para o Elversberg, da terceira divisão.'])
add('germany-bundesliga:3','bayern-2024-nine-two-three-penalties','https://www.uefa.com/uefachampionsleague/news/0291-1be127824a0e-6c3886fae4f4-1000--champions-league-round-up-kane-scores-four-in-record-bre/',[
'Bayern Münih, 2024’te Dinamo Zagreb’i Şampiyonlar Ligi’nde 9-2 yendi; Harry Kane dört golünün üçünü penaltıdan atarak sıra dışı bir rekora imza attı.',
'Bayern beat Dinamo Zagreb 9–2 in the 2024 Champions League; Harry Kane scored four times, including an extraordinary three penalties.',
'El Bayern goleó 9-2 al Dinamo Zagreb en la Champions de 2024; Harry Kane marcó cuatro goles, tres de ellos de penalti.',
'Le Bayern a écrasé le Dinamo Zagreb 9-2 en Champions 2024 ; Harry Kane a marqué quatre buts, dont trois sur penalty.',
'Il Bayern travolse la Dinamo Zagabria 9-2 nella Champions 2024; Harry Kane segnò quattro volte, tre su rigore.',
'O Bayern goleou o Dinamo Zagreb por 9 a 2 na Champions de 2024; Harry Kane fez quatro gols, três de pênalti.'])
add('germany-bundesliga:3','bayern-1999-lost-final-last-two-minutes','https://www.uefa.com/uefachampionsleague/news/0161-0e6a261d85bb-05dbbb7741b5-1000--united-super-subs-floor-bayern-at-the-death/',[
'Bayern Münih, 1999 Şampiyonlar Ligi finalinde 90. dakikaya kadar Manchester United’ı 1-0 yeniyordu; uzatmalarda 2 gol yiyerek kupayı kaybetti.',
'Bayern led the 1999 Champions League final 1–0 until stoppage time; Manchester United scored twice in the dying moments to steal the trophy.',
'El Bayern ganaba 1-0 la final de Champions de 1999 hasta el descuento, pero el Manchester United marcó dos veces y se llevó la copa.',
'Le Bayern menait 1-0 en finale de Champions 1999 jusqu’aux arrêts de jeu ; Manchester United a marqué deux fois et remporté le trophée.',
'Il Bayern conduceva 1-0 la finale di Champions 1999 fino al recupero, quando il Manchester United segnò due gol e conquistò la coppa.',
'O Bayern vencia a final da Champions de 1999 por 1 a 0 até os acréscimos, quando o Manchester United fez dois gols e levou a taça.'])
add('germany-bundesliga:4','dortmund-2013-two-stoppage-goals-malaga','https://www.uefa.com/uefachampionsleague/news/0208-0e84375f0965-020e001ded44-1000--last-gasp-dortmund-comeback-stuns-malaga/',[
'Dortmund, 2013 Şampiyonlar Ligi çeyrek finalinde Málaga’ya karşı 90. dakikada eleniyordu; 90+1 ve 90+3’teki gollerle 3-2 kazanıp tur atladı.',
'Dortmund were going out against Málaga in the 2013 Champions League quarter-final, until goals in the 91st and 93rd minutes turned it into a 3–2 win.',
'El Dortmund estaba eliminado ante el Málaga en cuartos de Champions 2013, pero marcó en los minutos 91 y 93 y ganó 3-2.',
'Dortmund était éliminé face à Málaga en quarts de Champions 2013, avant deux buts aux 91e et 93e minutes pour gagner 3-2.',
'Il Dortmund era eliminato contro il Málaga nei quarti di Champions 2013, poi segnò al 91º e 93º e vinse 3-2.',
'O Dortmund estava sendo eliminado pelo Málaga nas quartas da Champions de 2013, até marcar aos 91 e 93 minutos e vencer por 3 a 2.'])
add('germany-bundesliga:4','dortmund-2013-lewandowski-four-real','https://www.uefa.com/uefachampionsleague/news/0208-0e9f60a306c2-d00309689516-1000/',[
'Borussia Dortmund, 2013 Şampiyonlar Ligi yarı finalinde Real Madrid’i 4-1 yendi; dört golün tamamını Robert Lewandowski attı.',
'Borussia Dortmund beat Real Madrid 4–1 in a 2013 Champions League semi-final, with Robert Lewandowski scoring all four goals.',
'El Dortmund venció 4-1 al Real Madrid en semifinales de Champions 2013, con los cuatro goles de Robert Lewandowski.',
'Dortmund a battu le Real Madrid 4-1 en demi-finale de Champions 2013 ; Robert Lewandowski a marqué les quatre buts.',
'Il Dortmund batté il Real Madrid 4-1 nella semifinale di Champions 2013, con tutte e quattro le reti di Lewandowski.',
'O Dortmund venceu o Real Madrid por 4 a 1 na semifinal da Champions de 2013, com os quatro gols de Lewandowski.'])
add('germany-bundesliga:6','frankfurt-2022-30000-fans-camp-nou','https://editorial.uefa.com/resources/027a-16626f7d94ba-a569714b0cf7-1000/uefadirect198e_-q2_2022.pdf',[
'Eintracht Frankfurt’un 2022’de Barcelona’yı 3-2 yendiği Camp Nou deplasmanına 30 bin ile 50 bin arasında Alman taraftarın geldiği tahmin ediliyor.',
'When Frankfurt beat Barcelona 3–2 at Camp Nou in 2022, estimates put their travelling supporters at 30,000–50,000—turning an away ground into a near-home crowd.',
'Cuando el Frankfurt ganó 3-2 al Barcelona en el Camp Nou en 2022, se estimó que viajaron entre 30.000 y 50.000 aficionados alemanes.',
'Lors du succès 3-2 de Francfort au Camp Nou en 2022, on estimait à 30 000–50 000 le nombre de supporters allemands présents.',
'Quando il Francoforte vinse 3-2 al Camp Nou nel 2022, si stimarono fra 30.000 e 50.000 tifosi tedeschi allo stadio.',
'Na vitória do Frankfurt por 3 a 2 no Camp Nou em 2022, estimou-se a presença de 30 mil a 50 mil torcedores alemães.'])
add('germany-bundesliga:6','frankfurt-2019-inter-san-siro-away-win','https://www.uefa.com/uefaeuropaleague/news/024f-0e998868e823-9bb85d0bd2c5-1000--arsenal-rally-slavia-and-frankfurt-in-raptures/',[
'Frankfurt, 2019 Avrupa Ligi’nde Inter’i San Siro’da 1-0 yenerek eleme turunda İtalyan devini saf dışı bıraktı.',
'Frankfurt knocked Inter out of the 2019 Europa League by winning 1–0 at San Siro after a goalless first leg.',
'El Frankfurt eliminó al Inter de la Europa League 2019 al ganar 1-0 en San Siro tras un 0-0 en la ida.',
'Francfort a éliminé l’Inter de Ligue Europa 2019 en gagnant 1-0 à San Siro après un 0-0 à l’aller.',
'Il Francoforte eliminò l’Inter dall’Europa League 2019 vincendo 1-0 a San Siro dopo lo 0-0 dell’andata.',
'O Frankfurt eliminou a Inter da Liga Europa de 2019 ao vencer por 1 a 0 no San Siro, depois de empatar em 0 a 0 na ida.'])
add('germany-bundesliga:7','elversberg-2022-cup-beat-bayer','https://www.dfb.de/news/von-beckum-bis-vestenbergsgreuth-zehn-sensationen-der-ersten-pokalrunde',[
'Elversberg, 2022’de henüz üçüncü lig sezonuna başlamamışken Almanya Kupası’nda Bundesliga ekibi Leverkusen’i 4-3 yenerek eledi.',
'Elversberg beat Bundesliga side Leverkusen 4–3 in the 2022 German Cup while still preparing for their first third-division season.',
'El Elversberg eliminó al Leverkusen de primera división por 4-3 en la Copa alemana de 2022 cuando aún se preparaba para debutar en tercera.',
'Elversberg a battu le Leverkusen de Bundesliga 4-3 en Coupe d’Allemagne 2022 alors que le club préparait sa première saison en troisième division.',
'L’Elversberg eliminò il Leverkusen di Bundesliga per 4-3 nella Coppa di Germania 2022, mentre si preparava al debutto in terza serie.',
'O Elversberg eliminou o Leverkusen da Bundesliga por 4 a 3 na Copa da Alemanha de 2022 quando se preparava para estrear na terceira divisão.'])
add('germany-bundesliga:7','elversberg-2025-promotion-95th-heartbreak','https://www.bundesliga.com/en/bundesliga/news/elversberg-heidenheim-match-report-highlights-matchday-2-relegation-play-off-32410/',[
'Elversberg, 2025 Bundesliga yükselme play-off’unda Heidenheim’la toplam skorda 3-3 durumdayken 90+5’te gol yiyip Bundesliga hayalini kaçırdı.',
'Elversberg were level 3–3 on aggregate in the 2025 Bundesliga promotion play-off until a 95th-minute Heidenheim goal shattered their promotion dream.',
'El Elversberg estaba 3-3 en el global de la promoción a Bundesliga de 2025, hasta que el Heidenheim marcó en el minuto 95 y frustró el ascenso.',
'Elversberg était à 3-3 au total dans les barrages de Bundesliga 2025 lorsque Heidenheim a marqué à la 95e, brisant son rêve de montée.',
'L’Elversberg era sul 3-3 complessivo negli spareggi Bundesliga 2025 quando l’Heidenheim segnò al 95º, spezzando il sogno promozione.',
'O Elversberg estava em 3 a 3 no agregado dos playoffs da Bundesliga de 2025 até sofrer um gol aos 95 minutos e perder a chance de subir.'])
add('germany-bundesliga:9','mainz-europe-through-fair-play-draw-2005','https://www.uefa.com/uefaeuropaleague/news/01aa-0ea7de058e01-0213526488bf-1000--mainz-set-for-european-debut/',[
'Mainz, 2005’te ligi 11. bitirmesine rağmen UEFA’nın Fair Play sıralaması ve kurası sayesinde ilk Avrupa kupasına katılma hakkı kazandı.',
'Mainz reached Europe for the first time in 2005 despite finishing 11th in the Bundesliga—thanks to UEFA’s Fair Play rankings and draw.',
'El Mainz debutó en Europa en 2005 pese a acabar 11.º en Bundesliga, gracias a la clasificación y sorteo del Juego Limpio de la UEFA.',
'Mayence a disputé l’Europe pour la première fois en 2005 malgré une 11e place en Bundesliga, grâce au classement et tirage au sort du fair-play de l’UEFA.',
'Il Mainz arrivò in Europa per la prima volta nel 2005 pur essendo undicesimo in Bundesliga, grazie alla classifica e al sorteggio Fair Play UEFA.',
'O Mainz chegou pela primeira vez à Europa em 2005 mesmo terminando em 11º na Bundesliga, graças ao ranking e sorteio Fair Play da UEFA.'])
add('germany-bundesliga:10','hamburg-back-bundesliga-after-seven-years-2025','https://www.bundesliga.com/en/bundesliga/news/hamburg-long-road-to-promotion-from-second-tier-31949',[
'Hamburg, Bundesliga’da aralıksız 55 yıl kaldıktan sonra 2018’de düşünce tam yedi sezon ikinci ligde kaldı; ancak 2025’te geri dönebildi.',
'After a 55-year uninterrupted Bundesliga stay ended in 2018, Hamburg spent seven seasons in the second tier before returning in 2025.',
'Tras 55 años seguidos en Bundesliga hasta 2018, el Hamburgo pasó siete temporadas en segunda antes de regresar en 2025.',
'Après 55 années sans interruption en Bundesliga jusqu’en 2018, Hambourg a passé sept saisons en D2 avant de revenir en 2025.',
'Dopo 55 anni consecutivi in Bundesliga fino al 2018, l’Amburgo trascorse sette stagioni in seconda divisione prima di tornare nel 2025.',
'Depois de 55 anos seguidos na Bundesliga até 2018, o Hamburgo passou sete temporadas na segunda divisão antes de voltar em 2025.'])
add('germany-bundesliga:11','rb-leipzig-2020-adams-first-goal-atletico-quarter','https://www.uefa.com/uefachampionsleague/news/0260-101fb313a33d-349eb78c4d93-1000--leipzig-2-1-atletico-tyler-adams-scores-late-winner/',[
'RB Leipzig, 2020 Şampiyonlar Ligi’nde Atlético Madrid’i 88. dakikadaki Tyler Adams golüyle 2-1 yenerek ilk kez yarı finale yükseldi; bu gol Adams’ın kulüpteki ilk golüydü.',
'Leipzig reached their first Champions League semi-final in 2020 thanks to an 88th-minute Tyler Adams winner against Atlético—his very first goal for the club.',
'El Leipzig llegó a su primera semifinal de Champions en 2020 gracias a un gol de Tyler Adams al 88 contra el Atlético: ¡era su primer gol con el club!',
'Leipzig a atteint sa première demi-finale de Champions en 2020 grâce à un but de Tyler Adams à la 88e contre l’Atlético : son tout premier but pour le club.',
'Il Lipsia raggiunse la sua prima semifinale Champions nel 2020 grazie a un gol di Tyler Adams all’88º contro l’Atlético: il suo primo per il club.',
'O Leipzig chegou à primeira semifinal de Champions em 2020 com gol de Tyler Adams aos 88 contra o Atlético: seu primeiro pelo clube.'])
add('germany-bundesliga:11','rb-leipzig-2024-juve-ten-men-lose','https://www.bundesliga.com/en/bundesliga/news/2024-25-champions-league-europa-draw-fixtures-results-bayern-dortmund-leverkusen-28553',[
'RB Leipzig, 2024’te Juventus karşısında Şampiyonlar Ligi maçında iki kez öne geçti; rakibi 58. dakikada 10 kişi kalmasına rağmen Leipzig maçı 3-2 kaybetti.',
'Leipzig twice led Juventus in the 2024 Champions League, yet lost 3–2 even though the Italians had played with ten men since minute 58.',
'El Leipzig se adelantó dos veces al Juventus en la Champions 2024, pero perdió 3-2 ¡pese a que los italianos jugaban con diez desde el minuto 58!',
'Leipzig a mené deux fois face à la Juventus en Champions 2024, mais a perdu 3-2 malgré l’expulsion d’un Italien à la 58e.',
'Il Lipsia andò due volte in vantaggio sulla Juve nella Champions 2024, ma perse 3-2 nonostante gli italiani fossero in dieci dal 58º.',
'O Leipzig ficou na frente duas vezes contra a Juventus na Champions de 2024, mas perdeu por 3 a 2 mesmo com os italianos jogando com dez desde os 58.'])
add('germany-bundesliga:12','freiburg-2022-four-nil-nantes','https://www.scfreiburg.com/en/latest/news/first-team/match-reports/20222023/report-fcnscf-uel-2223',[
'Freiburg, 2022 Avrupa Ligi’nde Nantes’ı Fransa’da 4-0 yendi; maçın son 20 dakikasında üç gol birden attı.',
'Freiburg won 4–0 away at Nantes in the 2022 Europa League, scoring three of their goals in the final 20 minutes.',
'El Friburgo ganó 4-0 al Nantes en Francia en la Europa League 2022, con tres goles en los últimos 20 minutos.',
'Fribourg a gagné 4-0 chez Nantes en Ligue Europa 2022, avec trois buts dans les 20 dernières minutes.',
'Il Friburgo vinse 4-0 a Nantes in Europa League 2022 segnando tre reti negli ultimi 20 minuti.',
'O Freiburg venceu o Nantes por 4 a 0 fora de casa na Liga Europa de 2022, com três gols nos últimos 20 minutos.'])
add('germany-bundesliga:13','paderborn-2014-82-metre-goal-record','https://www.bundesliga.com/en/bundesliga/news/paderborn-club-by-club-historical-guide-furthest-goal-stoppelkamp-24305',[
'Paderborn oyuncusu Moritz Stoppelkamp, 2014’te Hannover’a karşı 82,3 metreden gol attı; stadın önündeki caddeye bile bu mesafenin adı verildi.',
'Paderborn’s Moritz Stoppelkamp scored from 82.3 metres against Hannover in 2014; a walkway outside the stadium was named for the exact distance.',
'Moritz Stoppelkamp marcó para el Paderborn desde 82,3 metros ante el Hannover en 2014; hasta una calle junto al estadio lleva esa distancia.',
'Moritz Stoppelkamp a marqué pour Paderborn de 82,3 mètres contre Hanovre en 2014 ; une allée près du stade porte désormais le nom de cette distance.',
'Moritz Stoppelkamp segnò per il Paderborn da 82,3 metri contro l’Hannover nel 2014; persino un viale vicino allo stadio ricorda quella distanza.',
'Moritz Stoppelkamp marcou pelo Paderborn de 82,3 metros contra o Hannover em 2014; até uma rua junto ao estádio recebeu o nome dessa distância.'])
add('germany-bundesliga:13','paderborn-third-relegation-rescued-1860-license','https://www.bundesliga.com/en/bundesliga/news/paderborn-club-by-club-historical-guide-furthest-goal-stoppelkamp-24305',[
'Paderborn, 2017’de üst üste üçüncü kez küme düşecekti; 1860 Münih’in lisans sorunu nedeniyle ligde tutuldu ve iki yıl sonra Bundesliga’ya çıktı.',
'Paderborn were headed for a third straight relegation in 2017 but escaped when 1860 Munich failed licensing rules; two years later they were back in the Bundesliga.',
'El Paderborn iba a encadenar tres descensos en 2017, pero se salvó por los problemas de licencia del 1860 Múnich y volvió a Bundesliga dos años después.',
'Paderborn allait subir une troisième relégation consécutive en 2017, mais a été sauvé par les problèmes de licence de 1860 Munich, puis est revenu en Bundesliga deux ans plus tard.',
'Il Paderborn rischiava la terza retrocessione consecutiva nel 2017, ma si salvò grazie ai problemi di licenza del 1860 Monaco; due anni dopo era in Bundesliga.',
'O Paderborn teria a terceira queda seguida em 2017, mas foi salvo por um problema de licença do 1860 Munique e voltou à Bundesliga dois anos depois.'])
add('germany-bundesliga:14','hoffenheim-2015-nine-second-fast-goal','https://www.bundesliga.com/en/bundesliga/news/bundesliga-records-goals-titles-attendances-for-players-and-clubs-24220',[
'Hoffenheim’den Kevin Volland, 2015’te Bayern Münih’e karşı maçın daha 9. saniyesinde gol atarak Bundesliga’nın en hızlı gol rekoruna ortak oldu.',
'Hoffenheim’s Kevin Volland scored after just nine seconds against Bayern in 2015, equalling the Bundesliga record for the fastest goal.',
'Kevin Volland marcó para el Hoffenheim a los nueve segundos contra el Bayern en 2015, igualando el gol más rápido de Bundesliga.',
'Kevin Volland a marqué pour Hoffenheim après seulement neuf secondes contre le Bayern en 2015, égalant le record du but le plus rapide de Bundesliga.',
'Kevin Volland segnò per l’Hoffenheim dopo nove secondi contro il Bayern nel 2015, eguagliando il record del gol più veloce della Bundesliga.',
'Kevin Volland marcou pelo Hoffenheim com apenas nove segundos contra o Bayern em 2015, igualando o gol mais rápido da Bundesliga.'])
add('germany-bundesliga:15','stuttgart-2024-juventus-missed-penalty-92-winner','https://www.vfb.de/en/vfb/latest/news/professionals/2425/3-juventus-turin----vfb-stuttgart-/',[
'Stuttgart, 2024 Şampiyonlar Ligi’nde Juventus deplasmanında 85’te penaltı kaçırdı; ama 90+2’de El Bilal Touré’nin golüyle 1-0 kazandı.',
'Stuttgart missed an 85th-minute penalty away to Juventus in the 2024 Champions League, yet won 1–0 thanks to El Bilal Touré’s stoppage-time goal.',
'El Stuttgart falló un penalti en el minuto 85 ante la Juventus en la Champions de 2024, pero ganó 1-0 gracias a Touré en el descuento.',
'Stuttgart a manqué un penalty à la 85e chez la Juventus en Champions 2024, mais a gagné 1-0 grâce à Touré dans les arrêts de jeu.',
'Lo Stoccarda sbagliò un rigore all’85º contro la Juventus in Champions 2024, ma vinse 1-0 con un gol di Touré nel recupero.',
'O Stuttgart perdeu um pênalti aos 85 contra a Juventus na Champions de 2024, mas venceu por 1 a 0 com gol de Touré nos acréscimos.'])
add('germany-bundesliga:15','stuttgart-2003-beat-manchester-united','https://www.uefa.com/uefachampionsleague/news/025a-0eaad4ffab6a-9bd39737468f-1000--stuttgart-strength-denies-united/',[
'Stuttgart, 2003’te Şampiyonlar Ligi’nde Manchester United’ı 2-1 yendi; iki golünü yalnızca iki dakika arayla attı, bir de penaltı kaçırdı.',
'Stuttgart beat Manchester United 2–1 in the 2003 Champions League, scoring twice within two minutes and even missing a penalty.',
'El Stuttgart venció 2-1 al Manchester United en la Champions de 2003: marcó dos goles en dos minutos y hasta falló un penalti.',
'Stuttgart a battu Manchester United 2-1 en Champions 2003 : deux buts en deux minutes et même un penalty manqué.',
'Lo Stoccarda batté il Manchester United 2-1 in Champions 2003: due gol in due minuti e persino un rigore fallito.',
'O Stuttgart venceu o Manchester United por 2 a 1 na Champions de 2003: dois gols em dois minutos e ainda perdeu um pênalti.'])
add('germany-bundesliga:18','werder-2009-udinese-3-1-first-half-to-3-3','https://www.uefa.com/uefaeuropaleague/news/01d8-0e720bba8c99-27944b71087f-1000/',[
'Werder Bremen, 2009 UEFA Kupası çeyrek finalinde Udinese karşısında ilk maçı 3-1 kazanmıştı; rövanşın ilk yarısında toplam skor eşitlense de 3-3’ü bulup tur atladı.',
'Werder Bremen won the first leg 3–1 against Udinese in 2009, saw that advantage vanish by half-time in Italy, then fought back to draw 3–3 and advance.',
'El Werder ganó 3-1 la ida ante el Udinese en 2009, vio desaparecer la ventaja al descanso en Italia, pero empató 3-3 y avanzó.',
'Le Werder avait gagné 3-1 l’aller face à l’Udinese en 2009, mais cet avantage avait fondu à la pause du retour ; il a finalement fait 3-3 et s’est qualifié.',
'Il Werder vinse 3-1 l’andata con l’Udinese nel 2009, vide svanire il vantaggio all’intervallo del ritorno, ma pareggiò 3-3 e passò il turno.',
'O Werder venceu a ida por 3 a 1 contra a Udinese em 2009, viu a vantagem desaparecer no intervalo da volta, mas empatou por 3 a 3 e avançou.'])
Path(__file__).with_suffix('.json').write_text(json.dumps(A,ensure_ascii=False,indent=2)+'\n');print('Generated',len(A))
