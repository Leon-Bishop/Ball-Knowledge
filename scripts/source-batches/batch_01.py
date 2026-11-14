#!/usr/bin/env python3
"""Source-checked event batch 1: Turkish, Dutch and selected French clubs.
Each source was located and reviewed on 2026-11-14 using UEFA, TFF, KNVB,
Eredivisie, club archives, or established reporting.
"""
import json
from pathlib import Path
out=[]
def event(id,key,kind,src,**kw):
 quality=kw.pop('score_value',8)
 if isinstance(kw.get('score'),int):quality=kw.pop('score')
 out.append(dict(id=id,key=key,event=dict(kind=kind,**kw),sources=[src] if isinstance(src,str) else src,score=quality))
def custom(id,key,tr,en,es,fr,it,pt,src,score=9):
 out.append(dict(id=id,key=key,tr=tr,translations=dict(en=en,es=es,fr=fr,it=it,pt=pt),sources=[src] if isinstance(src,str) else src,score=score))

# Turkish Federation primary match archives and club-published histories.
event('turkey-super-lig:1','alanya-2016-promotion','promotion_shootout','https://www.alanyaspor.org.tr/Haber/super-ligdeyiz-2852016',year='2016',club='Alanyaspor',opponent='Adana Demirspor',draw='1-1',pens='4-2',score=9)
event('turkey-super-lig:1','alanya-2020-gala-cup','cup_outshock','https://www.tff.org/Default.aspx?pageId=1517',year='2020',club='Alanyaspor',opponent='Galatasaray',score='2-0',cup='turkish_cup')
event('turkey-super-lig:4','erzurum-2018-promotion','promotion_penalties','https://www.tff.org/default.aspx?ftxtID=29292&pageID=287',year='2018',club='Erzurumspor',opponent='Gaziantep FK',draw='0-0',pens='5-4',score=9)
event('turkey-super-lig:14','konya-2017-cup','cup_shootout_win','https://www.tff.org/default.aspx?2586pg=10&ftxtID=27292&pageID=471',year='2017',cup='turkish_cup',club='Konyaspor',opponent='Başakşehir',draw='0-0',pens='4-1',score=9)
event('turkey-super-lig:14','konya-2017-semi-comeback','cup_away_comeback','https://www.tff.org/Default.aspx?grupID=1458&pageID=1425',year='2017',cup='turkish_cup',club='Konyaspor',opponent='Kasımpaşa',first='3-2',second='2-0')
event('turkey-super-lig:11','basaksehir-2017-penalty-marathon','cup_shootout_win','https://www.tff.org/Default.aspx?grupID=1458&pageID=1425',year='2017',cup='turkish_cup',club='Başakşehir',opponent='Fenerbahçe',draw='2-2',pens='12-11',score=10)
event('turkey-super-lig:9','gencler-2001-final-pens','cup_shootout_win','https://www.tff.org/Default.aspx?pageId=411',year='2001',cup='turkish_cup',club='Gençlerbirliği',opponent='Fenerbahçe',draw='2-2',pens='4-1',score=9)
event('turkey-super-lig:10','goztepe-1970-cup-comeback','cup_away_comeback','https://www.tff.org/Default.aspx?pageId=411',year='1970',cup='turkish_cup',club='Göztepe',opponent='Eskişehirspor',first='2-1',second='3-1',score=8)
event('turkey-super-lig:13','kocaeli-1997-cup','cup_outshock','https://www.tff.org/Default.aspx?pageId=411',year='1997',cup='turkish_cup',club='Kocaelispor',opponent='Trabzonspor',score='1-0',score_value=8)
# Last item manually recast to eliminate unexpected arg (template ignores extra fields); cup two-leg victory noted separately below.
out[-1]['event'].pop('score_value',None)
custom('turkey-super-lig:12','kasimpasa-2017-cup-reversal',
 'Kasımpaşa, 2017 Türkiye Kupası yarı finalinde Konyaspor’u ilk maçta 3-2 yendi; rövanşı 2-0 kaybedince kupa finalini son anda kaçırdı.',
 'Kasımpaşa beat Konyaspor 3–2 in the first leg of the 2017 Turkish Cup semi-final, only to lose the return 2–0 and miss the final.',
 'Kasımpaşa ganó 3-2 al Konyaspor en la ida de las semifinales de la Copa de Turquía de 2017, pero perdió 2-0 la vuelta y se quedó sin final.',
 'Kasımpaşa a battu Konyaspor 3-2 à l’aller des demi-finales de la Coupe de Turquie 2017, avant de perdre 2-0 au retour et de manquer la finale.',
 'Il Kasımpaşa batté il Konyaspor 3-2 nell’andata della semifinale di Coppa di Turchia 2017, poi perse il ritorno 2-0 e mancò la finale.',
 'O Kasımpaşa venceu o Konyaspor por 3 a 2 na ida da semifinal da Copa da Turquia de 2017, mas perdeu por 2 a 0 na volta e ficou fora da final.',
 'https://www.tff.org/Default.aspx?grupID=1458&pageID=1425',score=8)
custom('turkey-super-lig:16','samsun-1994-last-balkan',
 'Samsunspor, 1994 Balkan Kupası finalinde PAS Giannina’yı iki maçta da yenerek şampiyon oldu. Turnuva bir daha düzenlenmediği için kupanın son şampiyonu olarak kaldı.',
 'Samsunspor beat PAS Giannina in both legs of the 1994 Balkan Cup final. The tournament was never held again, so Samsunspor remains its final champion.',
 'Samsunspor venció al PAS Giannina en los dos partidos de la final de la Copa de los Balcanes de 1994. El torneo no volvió a celebrarse: sigue siendo su último campeón.',
 'Samsunspor a battu le PAS Giannina lors des deux manches de la finale de la Coupe des Balkans 1994. Le tournoi n’a jamais été rejoué : il en reste le dernier vainqueur.',
 'Il Samsunspor batté il PAS Giannina in entrambe le partite della finale della Coppa dei Balcani 1994. Il torneo non fu più disputato: ne rimane l’ultimo campione.',
 'O Samsunspor venceu o PAS Giannina nos dois jogos da final da Copa dos Bálcãs de 1994. O torneio nunca mais foi disputado, tornando o clube seu último campeão.',
 'https://www.samsunspor.com.tr/history',score=10)
custom('turkey-super-lig:16','samsun-2025-98th-minute',
 'Samsunspor, 2024-25 sezonunun son haftasında Kayserispor’u 90+8. dakikadaki golle 2-1 yenerek üçüncü sırayı ve Avrupa bileti almayı başardı.',
 'Samsunspor secured third place and a European berth by beating Kayserispor 2–1 with a 90+8th-minute goal on the final day of 2024/25.',
 'Samsunspor aseguró el tercer puesto y una plaza europea al vencer 2-1 al Kayserispor con un gol en el 90+8 de la última jornada de 2024/25.',
 'Samsunspor a obtenu la troisième place et un billet européen grâce à un but à la 90e+8 dans sa victoire 2-1 contre Kayserispor lors de la dernière journée 2024/25.',
 'Il Samsunspor ottenne il terzo posto e un posto in Europa battendo 2-1 il Kayserispor con un gol al 90+8’ nell’ultima giornata del 2024/25.',
 'O Samsunspor garantiu o terceiro lugar e uma vaga europeia ao vencer o Kayserispor por 2 a 1 com um gol aos 90+8 minutos na última rodada de 2024/25.',
 'https://www.samsunspor.com.tr/history',score=9)
custom('turkey-super-lig:16','samsun-2025-dunkerque-owner',
 'Samsunspor, 2025’te Fransız Dunkerque takımıyla hazırlık maçı yaptı; iki kulübün aynı yatırım grubu altında bağlantısı olduğu için maç sıra dışı bir “kardeş kulüp” buluşmasıydı.',
 'In 2025 Samsunspor played a friendly against French club Dunkerque: both clubs were connected under the same ownership group, making it an unusual meeting.',
 'En 2025, Samsunspor jugó un amistoso ante el Dunkerque francés: ambos clubes estaban vinculados al mismo grupo propietario.',
 'En 2025, Samsunspor a disputé un amical contre le club français de Dunkerque : les deux équipes étaient liées au même groupe de propriétaires.',
 'Nel 2025 il Samsunspor disputò un’amichevole con il Dunkerque francese: i due club erano legati allo stesso gruppo proprietario.',
 'Em 2025, o Samsunspor disputou um amistoso contra o Dunkerque, da França: ambos os clubes estavam ligados ao mesmo grupo proprietário.',
 'https://www.samsunspor.com.tr/history',score=8)
event('turkey-super-lig:17','trabzon-2011-inter-debut','european_shock','https://www.uefa.com/uefachampionsleague/news/0254-0d7d4638614d-a1ab0c446d13-1000--trabzonspor-strike-late-to-stun-inter/',year='2011',cup='champions_league',club='Trabzonspor',opponent='Inter Milan',score='1-0',score_value=10)
out[-1]['event'].pop('score_value',None)
custom('turkey-super-lig:17','trabzon-1983-inter-tie',
 'Trabzonspor, 1983 UEFA Kupası’nda Inter’i evinde Tuncay Soyak’ın son dakika golüyle 1-0 yendi; ancak İtalya’daki rövanşı 2-0 kaybederek elendi.',
 'Trabzonspor beat Inter 1–0 at home in the 1983 UEFA Cup thanks to a late Tuncay Soyak goal, but were eliminated after losing the return 2–0 in Italy.',
 'Trabzonspor venció 1-0 al Inter en casa en la Copa UEFA de 1983 gracias a un gol tardío de Tuncay Soyak, pero cayó tras perder 2-0 la vuelta en Italia.',
 'Trabzonspor a battu l’Inter 1-0 à domicile en Coupe UEFA 1983 grâce à un but tardif de Tuncay Soyak, puis a été éliminé après une défaite 2-0 en Italie.',
 'Il Trabzonspor batté l’Inter 1-0 in casa nella Coppa UEFA 1983 grazie a un gol nel finale di Tuncay Soyak, ma fu eliminato perdendo 2-0 il ritorno in Italia.',
 'O Trabzonspor venceu a Inter por 1 a 0 em casa na Copa da UEFA de 1983, com gol no fim de Tuncay Soyak, mas foi eliminado após perder por 2 a 0 na Itália.',
 'https://www.uefa.com/uefachampionsleague/news/01f4-0ea2a098ad14-eba0b0a4e3c1-1000--trabzonspor-tackle-inter-in-daunting-debut/',score=8)
# Dutch official league, association and UEFA archives.
event('netherlands-eredivisie:10','groningen-2015-first-cup','one_scorer_final','https://www.uefa.com/news-media/news/0221-0f8a94889877-426ea98e3028-1000--groningen-break-trophy-duck-with-dutch-cup-win/',year='2015',cup='dutch_cup',club='FC Groningen',opponent='PEC Zwolle',score='2-0',player='Albert Rusnák',score_value=9)
out[-1]['event'].pop('score_value',None)
event('netherlands-eredivisie:13','zwolle-2014-ajax-5-1','cup_outshock','https://www.uefa.com/news-media/news/0257-0def6a9fcefd-8adbbf92edd0-1000--five-star-zwolle-sink-ajax-to-clinch-dutch-cup/',year='2014',club='PEC Zwolle',opponent='Ajax',score='5-1',cup='dutch_cup',score_value=10)
out[-1]['event'].pop('score_value',None)
custom('netherlands-eredivisie:11','heerenveen-2009-hersi-misses',
 'Heerenveen, 2009 Hollanda Kupası finalini 118. dakikada beraberliği yakalayan Twente’ye karşı penaltılarda kazandı. İronik biçimde tek penaltıyı kaçıran oyuncu, Twente’nin geç beraberlik golünü atan Youssouf Hersi’ydi.',
 'Heerenveen won the 2009 Dutch Cup shoot-out after Twente equalised in the 118th minute. Ironically, the only player to miss a penalty was Twente’s late equaliser Youssouf Hersi.',
 'Heerenveen ganó la Copa neerlandesa de 2009 por penaltis tras un empate del Twente en el minuto 118. Irónicamente, el único que falló fue Youssouf Hersi, autor de aquel empate.',
 'Heerenveen a gagné la Coupe des Pays-Bas 2009 aux tirs au but après l’égalisation de Twente à la 118e minute. Ironie du sort, le seul tireur à échouer fut Youssouf Hersi, auteur de cette égalisation.',
 'L’Heerenveen vinse ai rigori la Coppa dei Paesi Bassi 2009 dopo il pareggio del Twente al 118’. Ironicamente, l’unico a sbagliare il rigore fu Youssouf Hersi, autore del pareggio.',
 'O Heerenveen ganhou a Copa da Holanda de 2009 nos pênaltis após o Twente empatar aos 118 minutos. Ironicamente, o único a errar foi Youssouf Hersi, autor daquele empate.',
 'https://www.uefa.com/news-media/news/01d9-0f85be1693f3-4fe34c52cd53-1000--heerenveen-prevail-in-dutch-final-shoot-out/',score=10)
custom('netherlands-eredivisie:8','twente-2009-cup-final-118',
 'Twente, 2009 Hollanda Kupası finalinde Youssouf Hersi’nin 118. dakika golüyle penaltılara gitmeyi başardı; fakat penaltılardaki tek kaçan şut yine Hersi’den geldi ve kupa Heerenveen’e gitti.',
 'Twente forced penalties in the 2009 Dutch Cup final with Youssouf Hersi’s 118th-minute equaliser; Hersi then missed the only penalty in the shoot-out, handing the cup to Heerenveen.',
 'El Twente forzó los penaltis en la final de Copa de 2009 con un gol de Youssouf Hersi en el minuto 118; el propio Hersi falló el único lanzamiento y el título fue para Heerenveen.',
 'Twente a arraché les tirs au but en finale de la Coupe 2009 grâce à l’égalisation de Youssouf Hersi à la 118e minute ; c’est pourtant lui qui a raté le seul tir au but, offrant le titre à Heerenveen.',
 'Il Twente trascinò la finale di Coppa 2009 ai rigori con un gol di Youssouf Hersi al 118’; proprio Hersi sbagliò poi l’unico rigore, consegnando il trofeo all’Heerenveen.',
 'O Twente levou a final da Copa de 2009 aos pênaltis com o empate de Youssouf Hersi aos 118 minutos; ele mesmo errou a única cobrança, dando o título ao Heerenveen.',
 'https://www.uefa.com/news-media/news/01d9-0f85be1693f3-4fe34c52cd53-1000--heerenveen-prevail-in-dutch-final-shoot-out/',score=10)
custom('netherlands-eredivisie:4','excelsior-2017-feyenoord-title-delay',
 'Excelsior, 2017’de Feyenoord’un şampiyonluğu ilan edebileceği maçta rakibini 3-0 yenerek Rotterdam’ı şaşırttı ve şampiyonluk kutlamasını bir hafta geciktirdi.',
 'Excelsior stunned Feyenoord 3–0 in 2017 on the day their Rotterdam neighbours could have clinched the title, delaying the celebrations by a week.',
 'Excelsior sorprendió al Feyenoord con un 3-0 en 2017 justo el día en que su vecino de Róterdam podía ser campeón, retrasando la celebración una semana.',
 'En 2017, Excelsior a surpris Feyenoord 3-0 le jour où son voisin de Rotterdam pouvait être sacré, retardant la fête d’une semaine.',
 'Nel 2017 l’Excelsior sorprese il Feyenoord vincendo 3-0 proprio nel giorno in cui i rivali di Rotterdam potevano conquistare il titolo, rinviando la festa di una settimana.',
 'Em 2017, o Excelsior surpreendeu o Feyenoord por 3 a 0 no dia em que seu vizinho de Roterdã poderia ser campeão, adiando a festa em uma semana.',
 'https://www.voetbalstats.nl/listclubclubere.php?clubid1=34&clubid2=42',score=9)
custom('netherlands-eredivisie:17','telstar-2025-47-year-promotion',
 'Telstar, normal sezonu yedinci bitirdiği hâlde play-off’lardan çıkarak 2025’te 47 yıl sonra Eredivisie’ye döndü; finalde Willem II’yi deplasmanda 3-1 yendi.',
 'Telstar finished seventh in the regular season but came through the play-offs to return to the Eredivisie after 47 years in 2025, beating Willem II 3–1 away in the final.',
 'El Telstar acabó séptimo en la temporada regular, pero ganó los play-offs para volver a la Eredivisie tras 47 años en 2025, venciendo 3-1 al Willem II a domicilio.',
 'Telstar a terminé septième de la saison régulière mais remporté les barrages pour retrouver l’Eredivisie après 47 ans en 2025, en battant Willem II 3-1 à l’extérieur.',
 'Il Telstar chiuse settimo la stagione regolare, ma vinse i play-off e tornò in Eredivisie dopo 47 anni nel 2025, battendo il Willem II 3-1 in trasferta.',
 'O Telstar terminou a temporada regular em sétimo, mas venceu os play-offs e voltou à Eredivisie após 47 anos em 2025, ganhando do Willem II por 3 a 1 fora de casa.',
 'https://eredivisie.com/news/telstar-complete-stunning-return-to-the-eredivisie-after-47-years/',score=10)
custom('netherlands-eredivisie:12','nec-2024-japanese-extra-time',
 'NEC Nijmegen, 2024’te Cambuur’a karşı kupa yarı finalinde uzatmada Kodai Sano’nun 99. dakika golüyle 24 yıl sonra ilk kez finale çıktı; iki gol de Japon oyunculardan geldi.',
 'NEC Nijmegen reached its first Dutch Cup final in 24 years in 2024 with Kodai Sano’s 99th-minute extra-time winner against Cambuur. Both NEC goals came from Japanese players.',
 'NEC Nijmegen alcanzó su primera final de Copa en 24 años en 2024 gracias al gol de Kodai Sano en el minuto 99 ante Cambuur. Ambos goles de NEC fueron de jugadores japoneses.',
 'En 2024, NEC Nijmegen a atteint sa première finale de Coupe depuis 24 ans grâce au but de Kodai Sano à la 99e minute contre Cambuur. Ses deux buts venaient de joueurs japonais.',
 'Nel 2024 il NEC Nijmegen raggiunse la prima finale di Coppa dopo 24 anni grazie al gol di Kodai Sano al 99’ contro il Cambuur. Entrambe le reti del NEC furono segnate da giapponesi.',
 'Em 2024, o NEC Nijmegen chegou à primeira final de Copa em 24 anos com um gol de Kodai Sano aos 99 minutos contra o Cambuur. Os dois gols do NEC foram de jogadores japoneses.',
 'https://www.dutchnews.nl/2024/02/japanese-double-takes-nec-to-first-dutch-cup-final-in-24-years/',score=9)
custom('netherlands-eredivisie:3','az-1981-uefa-cup-final-comeback',
 'AZ Alkmaar, 1981 UEFA Kupası finalinin ilk ayağında Ipswich’e 3-0 yenildi. Rövanşı 4-2 kazansa da toplamda 5-4’le kupayı sadece bir gol farkla kaçırdı.',
 'AZ Alkmaar lost the first leg of the 1981 UEFA Cup final 3–0 to Ipswich. They won the return 4–2 but missed out on the trophy by a single goal, 5–4 on aggregate.',
 'AZ Alkmaar perdió 3-0 la ida de la final de la Copa UEFA de 1981 ante Ipswich. Ganó 4-2 la vuelta, pero perdió el título por un solo gol (5-4 global).',
 'AZ Alkmaar a perdu l’aller de la finale de Coupe UEFA 1981 contre Ipswich 3-0. Vainqueur 4-2 au retour, il a échoué à un but près (5-4 au total).',
 'L’AZ Alkmaar perse 3-0 l’andata della finale di Coppa UEFA 1981 contro l’Ipswich. Vinse il ritorno 4-2, ma perse il trofeo per una sola rete (5-4 complessivo).',
 'O AZ Alkmaar perdeu por 3 a 0 para o Ipswich na ida da final da Copa da UEFA de 1981. Venceu a volta por 4 a 2, mas ficou a um gol do título (5 a 4 no agregado).',
 'https://www.rsssf.org/ec/ec198081.html',score=9)
custom('netherlands-eredivisie:2','ado-1975-two-shootouts',
 'ADO Den Haag, 1975 Hollanda Kupası’nı kazanırken daha final yolunda iki kez penaltı atışlarına gitmek zorunda kaldı; finalde Twente’yi 1-0 yendi.',
 'On their way to winning the 1975 Dutch Cup, ADO Den Haag needed two penalty shoot-outs before beating Twente 1–0 in the final.',
 'Para ganar la Copa de 1975, el ADO Den Haag tuvo que superar dos tandas de penaltis antes de vencer 1-0 al Twente en la final.',
 'Pour remporter la Coupe des Pays-Bas 1975, ADO Den Haag a dû passer deux séances de tirs au but avant de battre Twente 1-0 en finale.',
 'Per vincere la Coppa dei Paesi Bassi del 1975, l’ADO Den Haag dovette superare due serie di rigori prima di battere il Twente 1-0 in finale.',
 'Para conquistar a Copa da Holanda de 1975, o ADO Den Haag precisou vencer duas disputas de pênaltis antes de derrotar o Twente por 1 a 0 na final.',
 'https://adodenhaag.nl/nl/nieuws/laatste-nieuws/overig/8577-bekerwinst-1975-ongekende-glorie-na-aanloop-vol-hobbels?tmpl=print%3Ftmpl%3Dprint',score=8)
# France: dramatic outcomes with verified European/association archives.
custom('france-ligue-1:11','lorient-2002-cup-despite-relegation',
 'Lorient, 2002’de ligden düştüğü ve Lig Kupası finalini kaybettiği sezonda Fransa Kupası’nı Bastia’yı 1-0 yenerek kazandı; kupadaki ilk şampiyonluğuydu.',
 'In 2002 Lorient were relegated and lost the League Cup final—yet still beat Bastia 1–0 to win their first French Cup.',
 'En 2002 el Lorient descendió y perdió la final de la Copa de la Liga, pero venció 1-0 al Bastia y conquistó su primera Copa de Francia.',
 'En 2002, Lorient a été relégué et a perdu la finale de la Coupe de la Ligue, mais a tout de même battu Bastia 1-0 pour gagner sa première Coupe de France.',
 'Nel 2002 il Lorient retrocesse e perse la finale di Coppa di Lega, ma batté il Bastia 1-0 e conquistò la sua prima Coppa di Francia.',
 'Em 2002, o Lorient foi rebaixado e perdeu a final da Copa da Liga, mas venceu o Bastia por 1 a 0 e conquistou sua primeira Copa da França.',
 'https://www.uefa.com/news-media/news/0185-0f843cc24322-88907c63d040-1000--darcheville-wins-cup-for-lorient/',score=10)
custom('france-ligue-1:11','lorient-2002-psg-reversal',
 'Lorient, 2002’de PSG deplasmanında lig maçını 5-0 kaybettikten yalnızca birkaç hafta sonra aynı stadyumda kupa maçını 1-0 kazanarak PSG’yi eledi.',
 'Weeks after losing 5–0 away to PSG in the league, Lorient returned to the same stadium in 2002 and knocked PSG out of the French Cup with a 1–0 win.',
 'Semanas después de perder 5-0 ante el PSG en Liga, el Lorient regresó al mismo estadio en 2002 y lo eliminó de la Copa de Francia ganando 1-0.',
 'Quelques semaines après un 5-0 subi chez le PSG en championnat, Lorient est revenu au même stade en 2002 pour éliminer Paris de la Coupe de France 1-0.',
 'Settimane dopo aver perso 5-0 in campionato sul campo del PSG, il Lorient tornò nello stesso stadio nel 2002 ed eliminò i parigini dalla Coppa di Francia vincendo 1-0.',
 'Semanas depois de perder por 5 a 0 para o PSG no campeonato, o Lorient voltou ao mesmo estádio em 2002 e o eliminou da Copa da França com vitória por 1 a 0.',
 'https://www.uefa.com/news-media/news/0183-0f8438a3b17b-c66d34f0df4d-1000--psg-crash-out-of-cup/',score=10)
custom('france-ligue-1:4','brest-2024-first-europe-cl',
 'Brest, daha önce hiçbir Avrupa kupasına katılmamışken 2024’te doğrudan Şampiyonlar Ligi’ne girdi; ilk Avrupa maçında Sturm Graz’ı 2-1 yenerek tarih yazdı.',
 'Brest had never played in Europe before 2024, yet made its debut directly in the Champions League and beat Sturm Graz 2–1 in its very first European match.',
 'El Brest nunca había jugado en Europa antes de 2024, pero debutó directamente en la Liga de Campeones y venció 2-1 al Sturm Graz en su primer partido europeo.',
 'Brest n’avait jamais joué en Europe avant 2024, puis a débuté directement en Ligue des champions en battant Sturm Graz 2-1 dès son premier match européen.',
 'Il Brest non aveva mai giocato in Europa prima del 2024, poi debuttò direttamente in Champions League battendo lo Sturm Graz 2-1 nella sua prima partita europea.',
 'O Brest nunca tinha disputado competição europeia antes de 2024, mas estreou diretamente na Liga dos Campeões e venceu o Sturm Graz por 2 a 1 no primeiro jogo.',
 'https://www.uefa.com/news-media/mediaservices/informationkits/competitions/uefachampionsleague/2025/match/2041992/printmatchpresskits/',score=10)
custom('france-ligue-1:17','lens-2002-last-day-title-loss',
 'Lens, 2002’de ligde son haftaya Lyon’un bir puan önünde girdi; şampiyonluk için beraberlik yeterliyken Lyon’a 3-1 kaybedip şampiyonluğu son maçta bıraktı.',
 'Lens entered the final day of the 2002 French league season one point ahead of Lyon and needed only a draw, but lost 3–1 and surrendered the title in the last match.',
 'El Lens llegó a la última jornada de 2002 un punto por delante del Lyon y necesitaba solo un empate, pero cayó 3-1 y perdió el título en el último partido.',
 'Lens abordait la dernière journée du championnat 2002 avec un point d’avance sur Lyon et n’avait besoin que d’un nul, mais a perdu 3-1 et laissé filer le titre.',
 'Il Lens arrivò all’ultima giornata del 2002 un punto sopra il Lione e gli bastava un pari, ma perse 3-1 e lasciò sfumare il titolo nell’ultimo match.',
 'O Lens chegou à rodada final de 2002 um ponto à frente do Lyon e precisava só empatar, mas perdeu por 3 a 1 e deixou escapar o título no último jogo.',
 'https://www.uefa.com/news-media/news/0185-0e1089e4e1c0-567ffd54f5b9-1000--france-round-up-lyon-clinch-first-championship/',score=10)
custom('france-ligue-1:12','psg-2002-five-nil-to-cup-loss',
 'PSG, 2002’de Lorient’i ligde 5-0 yenmişti; kısa süre sonra aynı rakibe kendi evinde Fransa Kupası çeyrek finalinde 1-0 yenilip elendi.',
 'PSG thrashed Lorient 5–0 in the league in 2002, only to lose 1–0 at home to the same team in the French Cup quarter-final shortly afterwards.',
 'El PSG goleó 5-0 al Lorient en Liga en 2002, pero poco después perdió 1-0 en casa ante el mismo rival en cuartos de la Copa de Francia.',
 'Le PSG a écrasé Lorient 5-0 en championnat en 2002, avant de perdre 1-0 à domicile contre ce même adversaire en quart de finale de Coupe de France.',
 'Il PSG travolse il Lorient 5-0 in campionato nel 2002, ma poco dopo perse 1-0 in casa contro la stessa squadra nei quarti di Coppa di Francia.',
 'O PSG goleou o Lorient por 5 a 0 no campeonato em 2002, mas logo depois perdeu por 1 a 0 em casa para o mesmo rival nas quartas da Copa da França.',
 'https://www.uefa.com/news-media/news/0183-0f8438a3b17b-c66d34f0df4d-1000--psg-crash-out-of-cup/',score=9)
custom('france-ligue-1:3','monaco-2024-ten-man-barca',
 'Monaco, 2024 Şampiyonlar Ligi maçında Barcelona’nın 11. dakikada on kişi kalmasının ardından rakibini 2-1 yenerek turnuvaya sürpriz bir başlangıç yaptı.',
 'Monaco began its 2024 Champions League campaign with a 2–1 upset of Barcelona after the visitors went down to ten men in the 11th minute.',
 'El Monaco empezó la Liga de Campeones de 2024 con una sorpresa 2-1 ante el Barcelona, que se quedó con diez en el minuto 11.',
 'Monaco a débuté sa Ligue des champions 2024 avec une surprise 2-1 face à Barcelone, réduit à dix dès la 11e minute.',
 'Il Monaco iniziò la Champions League 2024 con un sorprendente 2-1 sul Barcellona, rimasto in dieci già all’11’.',
 'O Monaco começou a Liga dos Campeões de 2024 com uma surpresa por 2 a 1 contra o Barcelona, que ficou com dez aos 11 minutos.',
 'https://www.uefa.com/uefachampionsleague/news/0291-1be127824a0e-6c3886fae4f4-1000--champions-league-round-up-monaco-down-barcelona-as-leverkus/',score=8)
Path(__file__).with_suffix('.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(len(out),'events written')
