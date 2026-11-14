from pathlib import Path
import json
A=[]
def add(id,key,url,tr,en,es,fr,it,pt):A.append(dict(id=id,key=key,sources=[url],score=9,tr=tr,translations=dict(en=en,es=es,fr=fr,it=it,pt=pt)))
add('netherlands-eredivisie:3','az-2005-semifinal-120th','https://www.uefa.com/uefaeuropaleague/news/01a9-0e6cc5746999-c87fd91f83db-1000--last-gasp-sporting-take-final-chance/',
'AZ Alkmaar, 2005 UEFA Kupası yarı finalinde Sporting’i 3-2 yenerken uzatmada finale çıkmaya çok yaklaştı; fakat 120. dakikadaki golle deplasman golü kuralından elendi.',
'AZ Alkmaar was on course for the 2005 UEFA Cup final after leading Sporting 3–2 in extra time; a goal at the very end sent Sporting through on away goals.',
'AZ Alkmaar rozaba la final de la UEFA de 2005 tras ponerse 3-2 ante Sporting en la prórroga, pero un gol en el último instante dio el pase a los portugueses por goles fuera.',
'AZ Alkmaar tenait sa qualification pour la finale UEFA 2005 avec un 3-2 contre le Sporting en prolongation, mais un but au dernier instant l’a éliminé aux buts à l’extérieur.',
'L’AZ Alkmaar era quasi in finale UEFA 2005 sul 3-2 contro lo Sporting ai supplementari, ma un gol all’ultimo istante lo eliminò per la regola dei gol in trasferta.',
'O AZ Alkmaar estava quase na final da UEFA de 2005 após fazer 3 a 2 no Sporting na prorrogação, mas sofreu um gol no último instante e caiu pelos gols fora.')
add('netherlands-eredivisie:3','az-unbeaten-euro-home-30years','https://www.uefa.com/uefachampionsleague/news/01dd-0e72c59acf19-8379477d4134-1000--az-making-most-of-renaissance-period/',
'AZ Alkmaar 1977’de Avrupa’daki ilk iç saha maçını 11-1 kazandı ve ardından 32 Avrupa iç saha maçı boyunca hiç yenilmedi; seri tam 30 yıl sonra Everton karşısında bitti.',
'AZ Alkmaar won its first European home match 11–1 in 1977, then went 32 home European games unbeaten across 30 years until Everton broke the run.',
'AZ Alkmaar ganó 11-1 su primer partido europeo en casa en 1977 y permaneció 32 encuentros europeos de local sin perder durante 30 años, hasta caer ante el Everton.',
'AZ Alkmaar a gagné son premier match européen à domicile 11-1 en 1977, puis est resté invaincu chez lui pendant 32 matchs européens sur 30 ans, avant Everton.',
'L’AZ Alkmaar vinse 11-1 la sua prima gara europea in casa nel 1977, poi rimase imbattuto per 32 gare europee interne in 30 anni, prima dell’Everton.',
'O AZ Alkmaar venceu seu primeiro jogo europeu em casa por 11 a 1 em 1977 e ficou 32 partidas europeias sem perder em casa por 30 anos, até o Everton.')
add('netherlands-eredivisie:5','feyenoord-home-uefa-final-2002','https://www.uefa.com/uefaeuropaleague/news/025a-0eab03e95fa6-ade15fdef681-1000--final-joy-for-feyenoord/',
'Feyenoord, 2002 UEFA Kupası finalini kendi stadyumunda oynadı; Borussia Dortmund’u 3-2 yendiği beş gollü maçta rakibi ilk yarıda kırmızı kart gördü.',
'Feyenoord played the 2002 UEFA Cup final in its own stadium, beating Dortmund 3–2 in a five-goal thriller in which Dortmund had a player sent off in the first half.',
'Feyenoord disputó la final UEFA de 2002 en su propio estadio y venció 3-2 al Dortmund en un partido de cinco goles con una expulsión alemana en el primer tiempo.',
'Feyenoord a joué la finale UEFA 2002 dans son propre stade, battant Dortmund 3-2 dans un match à cinq buts avec une expulsion allemande avant la pause.',
'Il Feyenoord giocò la finale UEFA 2002 nel proprio stadio, battendo il Dortmund 3-2 in una gara da cinque gol con un’espulsione tedesca nel primo tempo.',
'O Feyenoord disputou a final da UEFA de 2002 no próprio estádio e venceu o Dortmund por 3 a 2 num jogo de cinco gols com expulsão alemã no primeiro tempo.')
add('netherlands-eredivisie:5','feyenoord-celtic-1970-117','https://www.uefa.com/uefachampionsleague/news/0005-0e6a05cb6956-d2f407b8aa83-1000--1969-70-feyenoord-establish-new-order/',
'Feyenoord 1970 Avrupa Kupası finalinde Celtic’i Ove Kindvall’in 117. dakika golüyle 2-1 yendi; bu, bir Hollanda kulübünün kazandığı ilk Avrupa Şampiyon Kulüpler Kupası’ydı.',
'Feyenoord beat Celtic 2–1 in the 1970 European Cup final with Ove Kindvall’s 117th-minute goal, becoming the first Dutch club to lift the trophy.',
'Feyenoord venció 2-1 al Celtic en la final europea de 1970 con un gol de Ove Kindvall en el minuto 117 y fue el primer club neerlandés campeón.',
'Feyenoord a battu le Celtic 2-1 en finale européenne 1970 grâce à Ove Kindvall à la 117e minute, devenant le premier club néerlandais sacré.',
'Il Feyenoord batté il Celtic 2-1 nella finale europea del 1970 grazie a un gol di Ove Kindvall al 117’, diventando il primo club olandese campione.',
'O Feyenoord venceu o Celtic por 2 a 1 na final europeia de 1970, com gol de Ove Kindvall aos 117 minutos, e foi o primeiro clube holandês campeão.')
add('netherlands-eredivisie:8','twente-rubin-comeback-2011','https://www.uefa.com/uefaeuropaleague/news/01ee-0e774cc961c2-30fce450b521-1000--twente-recover-to-knock-out-rubin/',
'Twente, 2011’de Rubin Kazan’ı Rusya’da 2-0 yenmesine rağmen evindeki rövanşta 30 dakika dolmadan 0-2 geriye düştü; iki gol bularak turu kurtardı.',
'Twente won 2–0 at Rubin Kazan in 2011, but fell 2–0 behind before the half-hour of the home return. Two comeback goals rescued their European qualification.',
'Twente ganó 2-0 en Kazán en 2011, pero perdía 0-2 antes de la media hora en la vuelta en casa. Dos goles evitaron la eliminación.',
'Twente a gagné 2-0 à Kazan en 2011, mais était mené 0-2 avant la demi-heure au retour. Deux buts ont sauvé sa qualification.',
'Il Twente vinse 2-0 a Kazan nel 2011, ma in casa era sotto 0-2 prima della mezz’ora. Due gol salvarono la qualificazione.',
'O Twente venceu por 2 a 0 em Kazan em 2011, mas perdia por 0 a 2 antes dos 30 minutos na volta. Dois gols salvaram a classificação.')
add('netherlands-eredivisie:9','utrecht-three-cup-finals-2002-04','https://www.knvb.nl/node/17940',
'FC Utrecht 2002, 2003 ve 2004’te üst üste üç Hollanda Kupası finali oynadı; ilkini kaybetti, sonraki ikisini kazandı.',
'FC Utrecht played three successive Dutch Cup finals in 2002, 2003 and 2004, losing the first and winning the next two.',
'FC Utrecht disputó tres finales de Copa neerlandesa consecutivas en 2002, 2003 y 2004: perdió la primera y ganó las dos siguientes.',
'FC Utrecht a joué trois finales consécutives de la Coupe des Pays-Bas en 2002, 2003 et 2004 : la première perdue, les deux suivantes gagnées.',
'L’Utrecht giocò tre finali di Coppa d’Olanda consecutive nel 2002, 2003 e 2004: perse la prima e vinse le due successive.',
'O Utrecht disputou três finais seguidas da Copa da Holanda em 2002, 2003 e 2004: perdeu a primeira e venceu as duas seguintes.')
add('netherlands-eredivisie:9','utrecht-2002-ajax-offside-golden-goal','https://www.nhnieuws.nl/nieuws/263077',
'FC Utrecht, 2002 Hollanda Kupası finalinde Ajax karşısında 2-1 öndeyken uzatmada bariz ofsayt golü yedi; sonra Zlatan Ibrahimović’in altın golüyle kupayı kaybetti.',
'Utrecht led Ajax 2–1 late in the 2002 Dutch Cup final, conceded a clearly offside equaliser before VAR existed, and lost to Zlatan Ibrahimović’s golden goal.',
'Utrecht ganaba 2-1 al Ajax en la final de Copa de 2002, recibió el empate en un fuera de juego claro antes del VAR y perdió por un gol de oro de Ibrahimović.',
'Utrecht menait Ajax 2-1 en finale de Coupe 2002, a encaissé une égalisation sur un hors-jeu évident avant la VAR et perdu sur un but en or d’Ibrahimović.',
'L’Utrecht conduceva 2-1 sull’Ajax nella finale di Coppa 2002, subì il pareggio in evidente fuorigioco prima del VAR e perse con il golden gol di Ibrahimović.',
'O Utrecht vencia o Ajax por 2 a 1 na final da Copa de 2002, sofreu empate em impedimento claro antes do VAR e perdeu com gol de ouro de Ibrahimović.')
add('netherlands-eredivisie:10','groningen-2015-first-trophy','https://www.uefa.com/news-media/news/0221-0f8a94889877-426ea98e3028-1000--groningen-break-trophy-duck-with-dutch-cup-win/',
'FC Groningen, 1971’de kurulmasının ardından ilk kupasını 2015’te aldı: 20 yaşındaki Albert Rusnák, kupanın son şampiyonu PEC Zwolle karşısında iki golü de attı.',
'Groningen waited until 2015 for its first trophy since being founded in 1971; 20-year-old Albert Rusnák scored both goals against defending cup winners PEC Zwolle.',
'Groningen esperó hasta 2015 para su primer título desde 1971; Albert Rusnák, de 20 años, marcó ambos goles ante el campeón defensor PEC Zwolle.',
'Groningue a attendu 2015 pour son premier titre depuis 1971 ; Albert Rusnák, 20 ans, a inscrit les deux buts face au tenant PEC Zwolle.',
'Il Groningen attese il 2015 per il suo primo trofeo dal 1971; il ventenne Albert Rusnák segnò entrambe le reti contro il detentore PEC Zwolle.',
'O Groningen esperou até 2015 pelo primeiro troféu desde 1971; Albert Rusnák, de 20 anos, marcou os dois gols contra o campeão PEC Zwolle.')
add('netherlands-eredivisie:11','heerenveen-2009-cup-penalty-hersi','https://www.uefa.com/news-media/news/01d9-0f85be1693f3-4fe34c52cd53-1000--heerenveen-prevail-in-dutch-final-shoot-out/',
'Heerenveen 2009 Hollanda Kupası finalinde Twente’ye karşı 118’de gol yiyip penaltılara kaldı; o golü atan Youssouf Hersi seri penaltılarda tek kaçıran kişi oldu, kupa Heerenveen’e gitti.',
'Heerenveen conceded an 118th-minute goal to Twente in the 2009 Dutch Cup final. The scorer Youssouf Hersi then missed the shoot-out’s only penalty, handing Heerenveen the trophy.',
'Heerenveen recibió el empate del Twente en el 118 de la final de 2009. Su autor, Youssouf Hersi, falló después el único penalti de la tanda, dando la Copa al Heerenveen.',
'Heerenveen a encaissé l’égalisation de Twente à la 118e en finale 2009. Son buteur Youssouf Hersi a ensuite raté le seul tir au but de la séance, offrant la coupe à Heerenveen.',
'L’Heerenveen subì il pareggio del Twente al 118’ nella finale 2009. L’autore Youssouf Hersi sbagliò poi l’unico rigore della serie, regalando la coppa all’Heerenveen.',
'O Heerenveen levou empate do Twente aos 118 na final de 2009. O autor, Youssouf Hersi, perdeu depois o único pênalti da disputa, dando a Copa ao Heerenveen.')
add('netherlands-eredivisie:12','nec-udinese-2008-three-minutes','https://www.uefa.com/uefaeuropaleague/news/01d4-0e70a32d7e2c-f53e6f89ebb3-1000--nec-ride-luck-to-secure-progress/',
'NEC Nijmegen 2008’de UEFA Kupası grubunun lideri Udinese’yi ikinci yarıda sadece üç dakika arayla attığı gollerle 2-0 yendi ve üst tura çıktı.',
'NEC Nijmegen beat group winners Udinese 2–0 in the 2008 UEFA Cup with two goals just three minutes apart, securing a place in the knockouts.',
'NEC Nijmegen venció 2-0 al líder Udinese en la UEFA de 2008 con dos goles separados por solo tres minutos y pasó de ronda.',
'NEC Nimègue a battu l’Udinese, vainqueur de son groupe, 2-0 en Coupe UEFA 2008 avec deux buts en trois minutes, se qualifiant pour la suite.',
'Il NEC Nimega batté 2-0 l’Udinese, prima del girone UEFA 2008, con due gol in appena tre minuti, qualificandosi.',
'O NEC Nijmegen venceu o líder Udinese por 2 a 0 na Copa da UEFA de 2008 com dois gols em apenas três minutos e avançou.')
add('netherlands-eredivisie:15','sparta-three-dutch-cups-before-1967','https://www.knvb.com/dutch-football/mens-football/knvb-cup',
'Sparta Rotterdam, 1958, 1962 ve 1966’da Hollanda Kupası’nı kazanarak sekiz yılda üç kez zirveye çıktı; Rotterdam’daki büyük rakibi Feyenoord’dan farklı bir kupa geleneği oluşturdu.',
'Sparta Rotterdam lifted the Dutch Cup in 1958, 1962 and 1966, winning the competition three times in eight years.',
'Sparta Rotterdam conquistó la Copa neerlandesa en 1958, 1962 y 1966: tres títulos en ocho años.',
'Le Sparta Rotterdam a remporté la Coupe des Pays-Bas en 1958, 1962 et 1966 : trois titres en huit ans.',
'Lo Sparta Rotterdam vinse la Coppa d’Olanda nel 1958, 1962 e 1966: tre titoli in otto anni.',
'O Sparta Rotterdam conquistou a Copa da Holanda em 1958, 1962 e 1966: três títulos em oito anos.')
add('netherlands-eredivisie:18','willemii-dutch-cup-1963-1944','https://www.knvb.com/dutch-football/mens-football/knvb-cup',
'Willem II, 1944 ve 1963’te Hollanda Kupası’nı kazandı; son zaferden sonra kulübün kupaya tekrar uzanması onlarca yıl mümkün olmadı.',
'Willem II won the Dutch Cup in 1944 and 1963, then went decades without another victory in the competition.',
'Willem II ganó la Copa neerlandesa en 1944 y 1963 y luego pasó décadas sin otra victoria en el torneo.',
'Willem II a remporté la Coupe des Pays-Bas en 1944 et 1963, puis a passé des décennies sans la gagner à nouveau.',
'Il Willem II vinse la Coppa d’Olanda nel 1944 e nel 1963, poi rimase per decenni senza rivincerla.',
'O Willem II venceu a Copa da Holanda em 1944 e 1963 e depois passou décadas sem voltar a conquistá-la.')
Path(__file__).with_suffix('.json').write_text(json.dumps(A,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Generated',len(A))
