from pathlib import Path
import json
A=[]
def add(i,k,url,stories,score=9):
 tr,en,es,fr,it,pt=stories
 A.append({'id':i,'key':k,'sources':[url],'tr':tr,'translations':dict(zip(['en','es','fr','it','pt'],[en,es,fr,it,pt])),'score':score})
add('portugal-liga-portugal:1','arouca-heracles-2016-away-goals','https://www.uefa.com/uefaeuropaleague/news/0230-0e94a4daaecf-b96a34f6bfe6-1000--larnaca-topple-spartak-moskva-gabala-stun-losc/',[
'Arouca, 2016’da Heracles’i iki maçta da yenemedi: deplasmanda 1-1, evinde 0-0 berabere kaldı ama o zamanki deplasman golü kuralıyla Avrupa’da tur atladı.',
'Arouca did not win either match against Heracles in 2016: a 1–1 away draw and 0–0 at home were enough to progress on the now-abolished away-goals rule.',
'En 2016 Arouca no ganó ninguno de sus partidos ante Heracles: empató 1-1 fuera y 0-0 en casa, pero avanzó gracias a la antigua regla de los goles de visitante.',
'En 2016, Arouca n’a gagné aucun match contre Heracles : 1-1 à l’extérieur, 0-0 à domicile, mais qualification grâce à l’ancienne règle des buts à l’extérieur.',
'Nel 2016 l’Arouca non vinse nessuna delle due partite contro l’Heracles: 1-1 fuori e 0-0 in casa, ma passò il turno grazie alla vecchia regola dei gol in trasferta.',
'Em 2016, o Arouca não venceu nenhum jogo contra o Heracles: 1 a 1 fora e 0 a 0 em casa, mas avançou pela antiga regra dos gols fora.' ])
add('portugal-liga-portugal:4','braga-nearest-european-final-2011','https://www.uefa.com/uefaeuropaleague/news/0253-0d7d151ba59d-6502cf6794ae-1000--braga-and-porto-the-closest-of-final-rivals/',[
'Braga’nın 2011 Avrupa Ligi finalindeki rakibi Porto sadece 47,4 kilometre uzaktaydı; o güne kadar bir büyük Avrupa finalinin iki kulübü birbirine hiç bu kadar yakın olmamıştı.',
'Braga faced Porto in the 2011 Europa League final, just 47.4 km away: at the time, no two clubs in a major European final had been based closer together.',
'El Braga se enfrentó al Oporto en la final europea de 2011: sus ciudades estaban a solo 47,4 km, la distancia más corta jamás registrada entonces entre finalistas europeos.',
'En finale de Ligue Europa 2011, Braga affrontait Porto, à seulement 47,4 km : un record de proximité entre finalistes d’une grande compétition européenne.',
'Nella finale di Europa League 2011, il Braga affrontò il Porto, distante appena 47,4 km: all’epoca un primato di vicinanza tra finaliste europee.',
'Na final da Liga Europa de 2011, o Braga enfrentou o Porto, a apenas 47,4 km: até então, nunca dois finalistas europeus importantes tinham ficado tão perto.' ])
add('portugal-liga-portugal:4','braga-benfica-away-goals-2011','https://www.uefa.com/uefaeuropaleague/news/0250-0c50f6cb1632-2ae2abb78d43-1000--porto-and-braga-take-local-rivalry-to-grand-stage/',[
'Braga, 2011 Avrupa Ligi yarı finalinde Benfica’ya deplasmanda 2-1 yenildi; evindeki 1-0 galibiyet, deplasman golü sayesinde kulüp tarihinin ilk Avrupa finaline yetti.',
'Braga lost 2–1 away to Benfica in the 2011 Europa League semi-finals, but a 1–0 home victory sent them to their first European final on away goals.',
'El Braga perdió 2-1 fuera ante el Benfica en las semifinales de 2011, pero el 1-0 en casa le llevó a su primera final europea por los goles de visitante.',
'En 2011, Braga a perdu 2-1 à Benfica, puis gagné 1-0 à domicile : la règle des buts à l’extérieur lui a offert sa première finale européenne.',
'Nel 2011 il Braga perse 2-1 in casa del Benfica, ma vinse 1-0 al ritorno e raggiunse la sua prima finale europea per i gol in trasferta.',
'Em 2011, o Braga perdeu por 2 a 1 para o Benfica fora de casa, mas venceu por 1 a 0 no retorno e chegou à sua primeira final europeia graças aos gols fora.' ])
add('portugal-liga-portugal:6','estoril-two-day-psv-2014','https://www.uefa.com/uefaeuropaleague/news/021b-0e8e749624c9-4b22b7aef1f0-1000--psv-ensure-progress-after-estoril-epic/',[
'Estoril, 2014’te PSV karşısında devreyi 3-2 önde kapattı; sağanak yağmur yüzünden maç ertesi gün tamamlandı ve 3-3 bitti. PSV’nin son golü Avrupa Ligi tarihinin 3.000’inci golüydü.',
'Estoril led PSV 3–2 at half-time in 2014, but torrential rain postponed the second half until the next day. It finished 3–3, with PSV scoring the Europa League’s 3,000th goal.',
'En 2014, el Estoril ganaba 3-2 al PSV al descanso, pero la lluvia aplazó la segunda parte al día siguiente. Terminó 3-3 con el gol número 3.000 de la Europa League.',
'En 2014, Estoril menait 3-2 contre le PSV à la pause, mais la pluie a repoussé la seconde période au lendemain. Score final 3-3, avec le 3 000e but de l’Europa League.',
'Nel 2014 l’Estoril conduceva 3-2 sul PSV all’intervallo, ma il diluvio rinviò la ripresa al giorno dopo. Finì 3-3, con il 3.000º gol dell’Europa League.',
'Em 2014, o Estoril vencia o PSV por 3 a 2 no intervalo, mas a chuva adiou o segundo tempo para o dia seguinte. Terminou 3 a 3, com o 3.000º gol da Liga Europa.' ])
add('portugal-liga-portugal:10','maritimo-newcastle-twice-draw-2012','https://www.uefa.com/uefaeuropaleague/news/0203-0ea5160241c2-def0c11e3fd8-1000--newcastle-progress-despite-draw-with-maritimo/',[
'Madeira temsilcisi Marítimo, 2012 Avrupa Ligi’nde Newcastle United’ı iki maçta da durdurdu: adada 0-0, İngiltere’de 79. dakika golüyle 1-1 berabere kaldı.',
'Marítimo of Madeira held Newcastle United to two draws in the 2012 Europa League: 0–0 on the island and 1–1 in England after a 79th-minute equaliser.',
'El Marítimo de Madeira empató los dos partidos ante Newcastle en la Europa League de 2012: 0-0 en la isla y 1-1 en Inglaterra gracias a un gol en el minuto 79.',
'En Ligue Europa 2012, le Marítimo de Madère a tenu Newcastle en échec deux fois : 0-0 sur l’île, puis 1-1 en Angleterre grâce à une égalisation à la 79e.',
'Il Marítimo di Madeira fermò due volte il Newcastle nell’Europa League 2012: 0-0 sull’isola e 1-1 in Inghilterra con il pareggio al 79º minuto.',
'O Marítimo da Madeira empatou duas vezes com o Newcastle na Liga Europa de 2012: 0 a 0 na ilha e 1 a 1 na Inglaterra, com empate aos 79 minutos.' ])
add('portugal-liga-portugal:12','vitoria-guimaraes-two-minute-cup-comeback-2013','https://www.uefa.com/news-media/news/0209-0e84fa6e7e8e-6c6a24015bcf-1000--guimaraes-beat-benfica-to-win-portuguese-cup/',[
'Vitória Guimarães, 2013 Portekiz Kupası finalinde Benfica’ya 1-0 yenilirken 79 ve 81. dakikalarda iki gol atıp 2-1 kazandı; tarihindeki ilk kupasını böyle aldı.',
'In the 2013 Portuguese Cup final, Vitória Guimarães trailed Benfica 1–0 before scoring in the 79th and 81st minutes to win 2–1 and claim their first-ever Portuguese Cup.',
'En la final copera de 2013, el Vitória Guimarães perdía 1-0 ante el Benfica, pero marcó en los minutos 79 y 81 para ganar 2-1 y conquistar su primera Copa de Portugal.',
'En finale de Coupe du Portugal 2013, Vitória Guimarães était mené 1-0 par Benfica avant de marquer aux 79e et 81e minutes pour gagner 2-1 et décrocher sa première coupe.',
'Nella finale di Coppa del Portogallo 2013, il Vitória Guimarães era sotto 1-0 col Benfica, poi segnò al 79º e all’81º vincendo 2-1 e conquistando la prima coppa.',
'Na final da Taça de Portugal de 2013, o Vitória Guimarães perdia por 1 a 0 para o Benfica, mas marcou aos 79 e 81 minutos e virou para 2 a 1, ganhando a primeira taça.' ])
add('portugal-liga-portugal:12','vitoria-guimaraes-overhead-v-arsenal-2019','https://www.uefa.com/uefaeuropaleague/news/0257-0e9a0a9e3d6a-4198587e114a-1000--vitoria-sc-v-standard-liege-facts/',[
'Vitória Guimarães, 2019’da Arsenal’den ilk Avrupa Ligi grup puanını 91. dakikada Bruno Duarte’nin röveşata golüyle aldı: 1-1.',
'Vitória Guimarães earned their first Europa League group point of 2019 against Arsenal through Bruno Duarte’s 91st-minute overhead kick: 1–1.',
'En 2019, el Vitória Guimarães sumó su primer punto de la fase de grupos ante el Arsenal con una chilena de Bruno Duarte en el minuto 91: 1-1.',
'En 2019, Vitória Guimarães a obtenu son premier point en poules contre Arsenal grâce à un retourné acrobatique de Bruno Duarte à la 91e : 1-1.',
'Nel 2019 il Vitória Guimarães conquistò il primo punto del girone contro l’Arsenal con una rovesciata di Bruno Duarte al 91º: 1-1.',
'Em 2019, o Vitória Guimarães ganhou o primeiro ponto da fase de grupos contra o Arsenal com uma bicicleta de Bruno Duarte aos 91 minutos: 1 a 1.' ])
add('portugal-liga-portugal:13','moreirense-beat-benfica-and-braga-2017','https://pt.uefa.com/news-media/news/0235-0f8e49eeb172-fe317c491ee8-1000--moreirense-conquista-taca-da-liga/',[
'Moreirense, 2017 Portekiz Lig Kupası’nda önce Benfica’yı yarı finalde 3-1, sonra Braga’yı finalde 1-0 yenip tarihinin ilk büyük kupasını kazandı.',
'Moreirense beat Benfica 3–1 in the 2017 Portuguese League Cup semi-final and Braga 1–0 in the final to win their first major trophy.',
'El Moreirense venció 3-1 al Benfica en semifinales de la Copa de la Liga de 2017 y 1-0 al Braga en la final para conquistar su primer gran título.',
'Moreirense a battu Benfica 3-1 en demi-finale de la Coupe de la Ligue 2017, puis Braga 1-0 en finale pour remporter son premier grand trophée.',
'Il Moreirense batté 3-1 il Benfica nella semifinale della Coppa di Lega portoghese 2017 e 1-0 il Braga in finale, conquistando il primo grande trofeo.',
'O Moreirense venceu o Benfica por 3 a 1 na semifinal da Taça da Liga de 2017 e o Braga por 1 a 0 na final, conquistando o primeiro grande título.' ])
add('portugal-liga-portugal:15','rio-ave-24-penalties-2020','https://www.acmilan.com/en/news/articles/stats/2020-10-01/rio-ave-v-ac-milan-in-numbers',[
'Rio Ave’nin 2020’de Milan’la oynadığı Avrupa Ligi ön elemesi 2-2 bitti; Milan 120. dakikada beraberliği yakaladı, tam 24 penaltı kullanıldı ve seri 9-8 sonuçlandı.',
'Rio Ave drew 2–2 with AC Milan in a 2020 Europa League qualifier after Milan equalised in the 120th minute. The ensuing shoot-out featured 24 penalties, with Milan winning 9–8.',
'El Rio Ave empató 2-2 con el Milan en 2020 tras un gol italiano en el minuto 120. Después se lanzaron 24 penaltis y el Milan ganó la tanda 9-8.',
'Rio Ave a fait 2-2 contre l’AC Milan en 2020 après une égalisation italienne à la 120e. La séance de tirs au but a compté 24 tentatives et Milan l’a emporté 9-8.',
'Il Rio Ave pareggiò 2-2 col Milan nel 2020 dopo il gol del pari milanista al 120º. Poi vennero battuti 24 rigori e il Milan vinse 9-8.',
'O Rio Ave empatou em 2 a 2 com o Milan em 2020, após o empate italiano aos 120 minutos. Foram cobrados 24 pênaltis e o Milan venceu por 9 a 8.' ])
add('italy-serie-a:1','ac-milan-24-penalties-rio-ave-2020','https://www.acmilan.com/en/news/articles/stats/2020-10-01/rio-ave-v-ac-milan-in-numbers',[
'Milan, 2020’de Rio Ave karşısında 120. dakikada penaltıyla 2-2’yi buldu; ardından 24 penaltının kullanıldığı seri sonunda 9-8 kazanıp Avrupa Ligi’ne kaldı.',
'Against Rio Ave in 2020, Milan equalised 2–2 from a 120th-minute penalty, then survived a shoot-out of 24 kicks, winning it 9–8 to reach the Europa League.',
'Ante el Rio Ave en 2020, el Milan igualó 2-2 con un penalti en el minuto 120 y luego ganó una tanda de 24 lanzamientos por 9-8 para llegar a la Europa League.',
'Face à Rio Ave en 2020, Milan a égalisé 2-2 sur penalty à la 120e, puis remporté 9-8 une séance de tirs au but de 24 tentatives pour rejoindre la Ligue Europa.',
'Contro il Rio Ave nel 2020, il Milan trovò il 2-2 su rigore al 120º, poi vinse 9-8 una serie di 24 tiri dal dischetto e si qualificò per l’Europa League.',
'Contra o Rio Ave em 2020, o Milan empatou em 2 a 2 com um pênalti aos 120 minutos, depois venceu por 9 a 8 uma disputa de 24 cobranças para chegar à Liga Europa.' ])
add('portugal-liga-portugal:17','sporting-lask-1-4-home-elimination-2020','https://www.uefa.com/uefachampionsleague/news/02aa-21da1e6e3b5b-4b561263dfe5-1000--champions-league-matchday-3-sporting-cp-vs-lask-facts/',[
'Sporting CP, 2020 Avrupa Ligi’nde tek maçlık eleme turunda kendi evinde Avusturya temsilcisi LASK’a 4-1 yenilip elendi.',
'Sporting CP were knocked out of the 2020 Europa League qualifiers by Austrian side LASK, losing the single-leg play-off 4–1 at home.',
'El Sporting CP cayó eliminado de la Europa League de 2020 tras perder en casa 1-4 contra el LASK austríaco en una eliminatoria a partido único.',
'Le Sporting CP a été éliminé des qualifications de la Ligue Europa 2020 en s’inclinant 4-1 à domicile contre le club autrichien LASK, en match unique.',
'Lo Sporting CP uscì dai preliminari di Europa League 2020 perdendo 4-1 in casa contro gli austriaci del LASK in gara secca.',
'O Sporting CP caiu nas eliminatórias da Liga Europa de 2020 ao perder por 4 a 1 em casa para o LASK da Áustria, em partida única.' ])
add('portugal-liga-portugal:17','sporting-cup-porto-penalties-2019','https://www.uefa.com/uefaeuropaleague/news/0258-0e9a1630c8bb-d67f5687e6aa-1000--lask-v-sporting-cp-facts/',[
'Sporting CP, 2019 Portekiz Kupası finalinde Porto’yu normal süre ve uzatmalardan sonra penaltılarla geçip kupayı kazandı.',
'Sporting CP won the 2019 Portuguese Cup after a penalty shoot-out victory over Porto in the final.',
'El Sporting CP ganó la Copa de Portugal de 2019 al vencer al Oporto en los penaltis de la final.',
'Le Sporting CP a remporté la Coupe du Portugal 2019 en battant Porto aux tirs au but en finale.',
'Lo Sporting CP conquistò la Coppa del Portogallo 2019 battendo il Porto ai rigori in finale.',
'O Sporting CP ganhou a Taça de Portugal de 2019 ao bater o Porto nos pênaltis da final.' ],8)
p=Path(__file__).with_suffix('.json');p.write_text(json.dumps(A,ensure_ascii=False,indent=2)+'\n');print('Wrote',len(A))
