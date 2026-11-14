from pathlib import Path
import json
A=[]
def add(id,key,url,t):
 assert len(t)==6
 A.append({'id':id,'key':key,'sources':[url], 'score':9,'tr':t[0], 'translations':dict(zip(('en','es','fr','it','pt'),t[1:]))})
add('france-ligue-1:1','auxerre-1997-10-1-intertoto','https://www.uefa.com/uefachampionsleague/news/0254-0d7cc63cfc65-cdd107c16032-1000--club-facts-auxerre/',[
'Auxerre, 1997 Intertoto Kupası’nda Nea Salamis’i deplasmanda tam 10-1 mağlup etti; bir Fransız ekibinin Avrupa sahnesindeki en tuhaf skorlarından biriydi.',
'Auxerre won an astonishing 10–1 away at Nea Salamis in the 1997 Intertoto Cup, one of their most unusual European scorelines.',
'El Auxerre goleó 10-1 al Nea Salamis a domicilio en la Intertoto de 1997, uno de sus resultados europeos más insólitos.',
'Auxerre a écrasé Nea Salamis 10-1 à l’extérieur en Coupe Intertoto 1997, un de ses résultats européens les plus insolites.',
'L’Auxerre travolse il Nea Salamis 10-1 in trasferta nell’Intertoto 1997, uno dei suoi risultati europei più incredibili.',
'O Auxerre goleou o Nea Salamis por 10 a 1 fora de casa na Intertoto de 1997, um dos seus placares europeus mais surpreendentes.'])
add('france-ligue-1:1','auxerre-1996-ajax-away-upset','https://www.uefa.com/uefachampionsleague/news/0254-0d7cc63cfc65-cdd107c16032-1000--club-facts-auxerre/',[
'Auxerre, Şampiyonlar Ligi’ndeki ilk sezonunda 1996’da son iki yılın finalisti Ajax’ı Amsterdam’da 2-1 yendi.',
'On their Champions League debut campaign in 1996, Auxerre beat Ajax 2–1 in Amsterdam—against finalists in each of the previous two seasons.',
'En su debut en la Champions de 1996, el Auxerre venció 2-1 en Ámsterdam al Ajax, finalista de las dos ediciones anteriores.',
'Pour sa première campagne de Ligue des champions en 1996, Auxerre a gagné 2-1 à Amsterdam face à l’Ajax, finaliste des deux éditions précédentes.',
'Nella stagione d’esordio in Champions del 1996, l’Auxerre vinse 2-1 ad Amsterdam contro l’Ajax, finalista delle due edizioni precedenti.',
'Na estreia na Champions em 1996, o Auxerre venceu o Ajax por 2 a 1 em Amsterdã, equipe finalista das duas edições anteriores.'])
add('france-ligue-1:2','angers-2017-final-own-goal-91','https://www.skysports.com/football/angers-vs-paris-saint-germain/report/371697',[
'Angers, 2017 Fransa Kupası finalinde PSG’ye karşı 90 dakika direnmişti; kupayı 90+1’de Issa Cissokho’nun kendi kalesine attığı golle kaybetti.',
'Angers held PSG until stoppage time in the 2017 French Cup final, then lost 1–0 to Issa Cissokho’s 91st-minute own goal.',
'El Angers resistió al PSG hasta el descuento de la final de Copa de Francia 2017, pero perdió 1-0 por un autogol de Issa Cissokho en el 91.',
'Angers a résisté au PSG jusqu’aux arrêts de jeu en finale de Coupe de France 2017, avant de perdre 1-0 sur un but contre son camp d’Issa Cissokho à la 91e.',
'L’Angers resistette al PSG fino al recupero nella finale di Coppa di Francia 2017, perdendo 1-0 per l’autogol di Issa Cissokho al 91º.',
'O Angers segurou o PSG até os acréscimos na final da Copa da França de 2017, mas perdeu por 1 a 0 com gol contra de Issa Cissokho aos 91 minutos.'])
add('france-ligue-1:3','monaco-2003-eight-three-prso-birthday','https://www.uefa.com/uefachampionsleague/news/01e8-0e7502c4327a-79bb1ce8999b-1000--2003-04-as-monaco-fc-8-3-rc-deportivo-la-coruna-report/',[
'Monaco, 2003’te Deportivo’yu Şampiyonlar Ligi’nde 8-3 yenerken Dado Pršo 29. yaş gününde tam dört gol attı.',
'Monaco crushed Deportivo 8–3 in the 2003 Champions League; Dado Pršo scored four goals on his 29th birthday.',
'El Mónaco goleó 8-3 al Deportivo en la Champions de 2003; Dado Pršo marcó cuatro goles justo el día de su 29.º cumpleaños.',
'Monaco a écrasé La Corogne 8-3 en Ligue des champions 2003 ; Dado Pršo a inscrit quatre buts le jour de ses 29 ans.',
'Il Monaco travolse il Deportivo 8-3 in Champions nel 2003; Dado Pršo segnò quattro reti nel giorno del suo 29º compleanno.',
'O Monaco goleou o Deportivo por 8 a 3 na Champions de 2003; Dado Pršo marcou quatro gols no dia do seu 29º aniversário.'])
add('france-ligue-1:4','brest-2024-four-nil-salzburg-second-ucl','https://www.uefa.com/uefachampionsleague/news/0291-1bc660354c9d-f67a7d51b97d-1000--champions-league-league-phase-results-by-team/',[
'Brest, tarihindeki ilk Avrupa kupası sezonunda ikinci Şampiyonlar Ligi maçında Salzburg’u deplasmanda 4-0 yendi.',
'In the club’s very first European season, Brest won their second-ever Champions League game 4–0 away at Salzburg.',
'En su primera temporada europea, el Brest ganó su segundo partido de Champions por 4-0 a domicilio ante el Salzburgo.',
'Pour sa toute première saison européenne, Brest a remporté son deuxième match de Ligue des champions 4-0 à Salzbourg.',
'Nella primissima stagione europea, il Brest vinse la seconda gara di Champions per 4-0 in trasferta a Salisburgo.',
'Na primeira temporada europeia, o Brest venceu seu segundo jogo de Champions por 4 a 0 fora de casa contra o Salzburg.'])
add('france-ligue-1:5','le-havre-cup-1959-second-tier-first','https://www.lequipe.fr/Football/Article/L-annee-ou-la-coupe-de-france-a-change-d-etage-avec-le-succes-du-havre-en-1959/765242',[
'Le Havre, 1959’da ikinci ligde oynarken Fransa Kupası’nı kazanan ilk takım oldu; finalin tekrar maçında Sochaux’yu 3-0 yendi.',
'Le Havre became the first second-division side to win the French Cup in 1959, beating Sochaux 3–0 in a replayed final.',
'El Le Havre se convirtió en 1959 en el primer club de segunda división que ganó la Copa de Francia, derrotando 3-0 al Sochaux en la repetición de la final.',
'Le Havre est devenu en 1959 le premier club de deuxième division à remporter la Coupe de France, en battant Sochaux 3-0 lors de la finale rejouée.',
'Il Le Havre divenne nel 1959 la prima squadra di seconda divisione a vincere la Coppa di Francia, battendo il Sochaux 3-0 nella ripetizione della finale.',
'O Le Havre tornou-se, em 1959, o primeiro clube da segunda divisão a vencer a Copa da França, batendo o Sochaux por 3 a 0 na final repetida.'])
add('france-ligue-1:6','lille-2024-two-madrid-teams-in-a-row','https://ligue1.com/en/articles/l1_article_1095-ucl-recap-jonathan-david-s-brace-fuels-lille-win',[
'Lille, 2024 Şampiyonlar Ligi’nde önce Real Madrid’i 1-0 yendi, ardından bir sonraki maçta deplasmanda Atlético Madrid’i 3-1 mağlup etti.',
'Lille beat Real Madrid 1–0 in the 2024 Champions League, then immediately followed it up by winning 3–1 away at Atlético Madrid.',
'El Lille venció 1-0 al Real Madrid en la Champions de 2024 y, acto seguido, goleó 3-1 al Atlético en Madrid.',
'Lille a battu le Real Madrid 1-0 en Ligue des champions 2024, puis est allé gagner 3-1 chez l’Atlético de Madrid au match suivant.',
'Il Lille batté 1-0 il Real Madrid nella Champions 2024, poi vinse 3-1 in casa dell’Atlético nella partita successiva.',
'O Lille venceu o Real Madrid por 1 a 0 na Champions de 2024 e, logo depois, ganhou por 3 a 1 fora de casa contra o Atlético.'])
add('france-ligue-1:8','marseille-ucl-2013-zero-points','https://www.uefa.com/uefachampionsleague/history/clubs/52748--marseille/',[
'Marseille, 1993’te Şampiyonlar Ligi’ni kazanan ilk takım oldu; fakat 2013-14’teki grup aşamasında altı maçın altısını kaybetti.',
'Marseille won the first Champions League in 1993, yet lost all six group games in their 2013/14 Champions League campaign.',
'El Marsella ganó la primera Champions en 1993, pero en la edición 2013/14 perdió los seis partidos de su grupo.',
'Marseille a remporté la première Ligue des champions en 1993, mais a perdu ses six matches de groupe en 2013/14.',
'Il Marsiglia vinse la prima Champions nel 1993, ma nella fase a gironi del 2013/14 perse tutte e sei le partite.',
'O Marseille venceu a primeira Champions em 1993, mas perdeu os seis jogos da fase de grupos em 2013/14.'])
add('france-ligue-1:9','le-mans-2013-bankruptcy-sixth-to-l1','https://ligue1.com/en/articles/l1_article_5131-',[
'Le Mans, 2013’te iflas edip Fransa’nın altıncı lig seviyesine kadar düştü; daha sonra yeniden Ligue 1’e dönecek kadar yükseldi.',
'After going bankrupt in 2013, Le Mans fell all the way to France’s sixth tier, then climbed back to Ligue 1.',
'Tras quebrar en 2013, el Le Mans cayó hasta la sexta categoría de Francia y posteriormente logró regresar a Ligue 1.',
'Après sa faillite en 2013, Le Mans est tombé en sixième division avant de remonter jusqu’en Ligue 1.',
'Dopo il fallimento del 2013, il Le Mans precipitò fino alla sesta serie francese prima di risalire in Ligue 1.',
'Depois de falir em 2013, o Le Mans caiu até a sexta divisão francesa, mas conseguiu voltar à Ligue 1.'])
add('france-ligue-1:10','nice-2017-knockout-europa-finalist-ajax','https://www.uefa.com/uefachampionsleague/news/023c-0e976131db0a-a2475ae57d60-1000--nice-eliminate-ajax-young-boys-upset-dynamo-kyiv/',[
'Nice, 2017 Şampiyonlar Ligi elemesinde bir önceki Avrupa Ligi finalisti Ajax’ı Amsterdam’da 2-2 berabere kalarak deplasman golüyle eledi.',
'Nice eliminated Ajax, the previous season’s Europa League finalists, from Champions League qualifying in 2017 after a 2–2 draw in Amsterdam.',
'El Niza eliminó al Ajax, finalista de la Europa League anterior, de la fase previa de Champions en 2017 tras un 2-2 en Ámsterdam.',
'Nice a éliminé l’Ajax, finaliste de la Ligue Europa précédente, des qualifications de Champions en 2017 après un 2-2 à Amsterdam.',
'Il Nizza eliminò l’Ajax, finalista dell’Europa League precedente, dalle qualificazioni Champions 2017 dopo un 2-2 ad Amsterdam.',
'O Nice eliminou o Ajax, finalista da Liga Europa anterior, das eliminatórias da Champions de 2017 após empate por 2 a 2 em Amsterdã.'])
add('france-ligue-1:13','rennes-2019-two-down-psg-cup-final','https://ligue1.com/en/articles/l1_article_5708-',[
'Rennes, 2019 Fransa Kupası finalinde PSG’ye karşı 2-0 geriye düştü, 2-2’yi yakaladı ve penaltıları 6-5 kazanarak kupayı aldı.',
'Rennes came back from 2–0 down against PSG in the 2019 French Cup final and won 6–5 on penalties after a 2–2 draw.',
'El Rennes remontó un 0-2 ante el PSG en la final de Copa de Francia 2019 y ganó 6-5 en los penaltis tras el 2-2.',
'Rennes a remonté un déficit de 0-2 contre le PSG en finale de Coupe de France 2019, avant de gagner 6-5 aux tirs au but (2-2).',
'Il Rennes rimontò uno 0-2 contro il PSG nella finale di Coppa di Francia 2019 e vinse 6-5 ai rigori dopo il 2-2.',
'O Rennes virou uma desvantagem de 2 a 0 contra o PSG na final da Copa da França de 2019 e venceu por 6 a 5 nos pênaltis após 2 a 2.'])
add('france-ligue-1:14','paris-fc-promoted-2025-46-years','https://ligue1.com/en/articles/l1_article_2477-',[
'Paris FC, 46 yıl aradan sonra 2025’te Ligue 1’e döndü; yeni stadı PSG’nin Parc des Princes stadının hemen karşı sokağındaydı.',
'Paris FC returned to Ligue 1 after 46 years in 2025, moving into a ground just across the street from PSG’s Parc des Princes.',
'El Paris FC regresó a Ligue 1 tras 46 años en 2025 y se instaló en un estadio al otro lado de la calle del Parc des Princes del PSG.',
'Le Paris FC est revenu en Ligue 1 après 46 ans en 2025, avec un stade situé juste de l’autre côté de la rue du Parc des Princes du PSG.',
'Il Paris FC è tornato in Ligue 1 dopo 46 anni nel 2025, in uno stadio proprio di fronte al Parc des Princes del PSG.',
'O Paris FC voltou à Ligue 1 após 46 anos em 2025, com estádio do outro lado da rua do Parc des Princes, do PSG.'])
add('france-ligue-1:15','strasbourg-2019-final-penalties-zero-zero','https://www.rsssf.org/tablesf/franleagcuphist.html',[
'Strasbourg, 2019 Fransa Lig Kupası finalinde Guingamp’la 120 dakika 0-0 oynadıktan sonra penaltılarla 4-1 kazanarak kupayı kaldırdı.',
'Strasbourg won the 2019 French League Cup final 4–1 on penalties against Guingamp after 120 goalless minutes.',
'El Estrasburgo ganó la Copa de la Liga francesa de 2019 por 4-1 en los penaltis ante el Guingamp tras 120 minutos sin goles.',
'Strasbourg a remporté la Coupe de la Ligue 2019 4-1 aux tirs au but contre Guingamp après 120 minutes sans but.',
'Lo Strasburgo vinse la Coppa di Lega francese del 2019 per 4-1 ai rigori contro il Guingamp dopo 120 minuti senza gol.',
'O Strasbourg venceu a Copa da Liga Francesa de 2019 por 4 a 1 nos pênaltis contra o Guingamp após 120 minutos sem gols.'])
add('france-ligue-1:16','toulouse-2023-cup-final-double-double','https://media.fff.fr/uploads/documents/ra22-23_competitions-nationales.pdf',[
'Toulouse, 2023 Fransa Kupası finalinde Nantes’ı 5-1 yenerken Logan Costa ilk 10 dakikada, Thijs Dallinga da ilk 31 dakikada ikişer gol attı.',
'Toulouse beat Nantes 5–1 in the 2023 French Cup final; Logan Costa scored twice inside ten minutes and Thijs Dallinga had two by minute 31.',
'El Toulouse ganó 5-1 al Nantes en la final de Copa de Francia 2023; Logan Costa marcó dos goles en diez minutos y Dallinga otros dos antes del 31.',
'Toulouse a battu Nantes 5-1 en finale de Coupe de France 2023 ; Logan Costa a marqué deux fois en dix minutes et Dallinga deux fois avant la 31e.',
'Il Tolosa batté il Nantes 5-1 nella finale di Coppa di Francia 2023; Logan Costa segnò due volte in dieci minuti, Dallinga due volte entro il 31º.',
'O Toulouse venceu o Nantes por 5 a 1 na final da Copa da França de 2023; Logan Costa fez dois gols em dez minutos e Dallinga marcou dois até os 31.'])
add('france-ligue-1:17','lens-1998-beat-arsenal-wembley','https://www.uefa.com/uefachampionsleague/news/0285-191452dddaca-969a272c9336-1000--lens-vs-arsenal-match-facts/',[
'Lens, 1998 Şampiyonlar Ligi’nde Arsenal’ı Londra’daki Wembley’de 1-0 mağlup etti; Mickaël Debève galibiyet golünü attı.',
'Lens beat Arsenal 1–0 at Wembley in the 1998 Champions League, with Mickaël Debève scoring the winner in London.',
'El Lens derrotó 1-0 al Arsenal en Wembley en la Champions de 1998 con un gol decisivo de Mickaël Debève.',
'Lens a battu Arsenal 1-0 à Wembley en Ligue des champions 1998 grâce à un but décisif de Mickaël Debève.',
'Il Lens batté l’Arsenal 1-0 a Wembley nella Champions del 1998, grazie al gol decisivo di Mickaël Debève.',
'O Lens venceu o Arsenal por 1 a 0 em Wembley na Champions de 1998, com o gol da vitória de Mickaël Debève.'])
add('france-ligue-1:18','troyes-2001-intertoto-newcastle-four-four-away','https://www.rsssf.org/tablesu/uic01.html',[
'Troyes, 2001 Intertoto Kupası finalinde Newcastle ile evinde 0-0 berabere kaldıktan sonra İngiltere’de 4-4 yaptı ve deplasman golleriyle kazandı.',
'Troyes won the 2001 Intertoto Cup against Newcastle: after a 0–0 home draw, a wild 4–4 away result sent them through on away goals.',
'El Troyes ganó la Intertoto 2001 al Newcastle: tras 0-0 en casa, el 4-4 en Inglaterra le dio el título por los goles fuera.',
'Troyes a remporté l’Intertoto 2001 contre Newcastle : après 0-0 à domicile, un incroyable 4-4 en Angleterre les a qualifiés aux buts à l’extérieur.',
'Il Troyes vinse l’Intertoto 2001 contro il Newcastle: dopo lo 0-0 interno, un incredibile 4-4 in Inghilterra valse il successo per i gol in trasferta.',
'O Troyes venceu a Intertoto de 2001 contra o Newcastle: após 0 a 0 em casa, um louco 4 a 4 na Inglaterra garantiu a conquista pelos gols fora.'])
add('france-ligue-1:12','psg-2025-first-ucl-final-five-nil','https://ligue1.com/en/articles/l1_article_2648-',[
'PSG, 2025 Şampiyonlar Ligi finalinde Inter’i 5-0 yenerek kulübün ilk Şampiyonlar Ligi kupasını aldı; bu skor finalin rekor farkıydı.',
'PSG won their first Champions League in 2025 by beating Inter 5–0 in the final, the biggest winning margin in a European Cup final.',
'El PSG ganó su primera Champions en 2025 con un 5-0 al Inter en la final, la mayor goleada de una final de la Copa de Europa.',
'Le PSG a remporté sa première Ligue des champions en 2025 en écrasant l’Inter 5-0 en finale, un écart record pour une finale de Coupe d’Europe.',
'Il PSG vinse la sua prima Champions nel 2025 travolgendo l’Inter 5-0 in finale, un margine record per una finale di Coppa dei Campioni.',
'O PSG conquistou sua primeira Champions em 2025 goleando a Inter por 5 a 0 na final, a maior diferença numa final de Copa dos Campeões.'])
Path(__file__).with_suffix('.json').write_text(json.dumps(A,ensure_ascii=False,indent=2)+'\n');print('Generated',len(A))
