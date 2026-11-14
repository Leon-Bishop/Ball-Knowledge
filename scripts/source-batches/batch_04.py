import json
from pathlib import Path
A=[]
def f(i,key,url,tr,en,es,fr,it,pt,score=8):
 A.append({'id':f'turkey-super-lig:{i}','key':key,'sources':[url],'tr':tr,'translations':{'en':en,'es':es,'fr':fr,'it':it,'pt':pt},'score':score})
f(2,'amed-2016-undefeated-cup-group','https://www.tff.org/Default.aspx?pageID=1383',
'Amedspor, 2015-16 Türkiye Kupası grubunda Başakşehir’in arkasından ikinci çıktı; altı grup maçını da kaybetmedi (3 galibiyet, 3 beraberlik).',
'Amedspor finished second behind Başakşehir in its 2015/16 Turkish Cup group without losing a game: three wins and three draws.',
'El Amedspor terminó segundo tras el Başakşehir en su grupo de Copa turca 2015/16 sin perder: tres victorias y tres empates.',
'Amedspor a terminé deuxième derrière Başakşehir de son groupe de Coupe de Turquie 2015/16 sans perdre : trois victoires et trois nuls.',
'L’Amedspor arrivò secondo dietro al Başakşehir nel girone di Coppa di Turchia 2015/16 senza sconfitte: tre vittorie e tre pareggi.',
'O Amedspor foi vice-líder do grupo da Copa da Turquia de 2015/16 atrás do Başakşehir sem perder: três vitórias e três empates.',7)
f(8,'gaziantep-2019-second-chance-promotion','https://www.tff.org/default.aspx?ftxtID=31430&pageID=287',
'Gaziantep FK, 2018’de Süper Lig’e çıkma finalini penaltılarda kaybetti; 2019’da Hatayspor’la 1-1 biten finali bu kez penaltılarda kazanıp lige çıktı.',
'Gaziantep lost the 2018 promotion final on penalties; in 2019 it returned, drew 1–1 with Hatayspor and won the shoot-out to reach the Süper Lig.',
'Gaziantep perdió por penaltis la final de ascenso de 2018; en 2019 volvió, empató 1-1 con Hatayspor y ganó la tanda para subir.',
'Gaziantep a perdu la finale de montée 2018 aux tirs au but ; revenu en 2019, il a fait 1-1 contre Hatayspor puis gagné la séance décisive.',
'Il Gaziantep perse ai rigori la finale promozione 2018; tornò nel 2019, pareggiò 1-1 con l’Hatayspor e vinse la lotteria dei rigori.',
'O Gaziantep perdeu nos pênaltis a final de acesso de 2018; voltou em 2019, empatou por 1 a 1 com o Hatayspor e venceu a disputa.',7)
f(12,'kasimpasa-2007-penalty-120th','https://www.tff.org/default.aspx?ftxtID=1465&pageID=285',
'Kasımpaşa’nın 2007 Süper Lig’e çıkma finali Altay karşısında 120. dakikada gelen golle 3-3 bitti; 13 penaltılık gollü serinin ardından yükseldiler.',
'Kasımpaşa’s 2007 promotion final against Altay finished 3–3 after a 120th-minute equaliser; it won an extraordinary shoot-out to reach the Süper Lig.',
'La final de ascenso del Kasımpaşa de 2007 ante Altay terminó 3-3 tras un gol en el minuto 120; ganó una extraordinaria tanda de penaltis.',
'La finale de montée 2007 de Kasımpaşa contre Altay s’est achevée sur un 3-3 après une égalisation à la 120e minute ; il a gagné aux tirs au but.',
'La finale promozione 2007 del Kasımpaşa contro l’Altay finì 3-3 dopo il pareggio al 120º minuto; vinse poi ai rigori.',
'A final do acesso do Kasımpaşa em 2007 contra o Altay terminou 3 a 3 com empate aos 120 minutos; o time venceu nos pênaltis.',8)
f(18,'corum-2024-bodrum-shootout','https://www.tff.org/Default.aspx?hafta=23&pageID=1649',
'Çorum FK, 2024 yükselme play-off’unda Bodrum’la iki maçta da berabere kaldı (1-1 ve 0-0); Süper Lig biletini penaltılarda 5-4 kaçırdı.',
'Çorum drew both legs of its 2024 promotion play-off tie with Bodrum (1–1 and 0–0), then missed out on the final after losing 5–4 on penalties.',
'El Çorum empató ambos partidos del play-off de ascenso 2024 ante Bodrum (1-1 y 0-0) y quedó eliminado en los penaltis por 5-4.',
'Çorum a fait deux nuls face à Bodrum en barrages de montée 2024 (1-1 et 0-0), avant d’être éliminé 5-4 aux tirs au but.',
'Il Çorum pareggiò entrambe le gare del play-off promozione 2024 contro il Bodrum (1-1 e 0-0), poi uscì 5-4 ai rigori.',
'O Çorum empatou os dois jogos do mata-mata de acesso de 2024 contra o Bodrum (1 a 1 e 0 a 0), mas caiu nos pênaltis por 5 a 4.',7)
f(18,'corum-2024-knockout-kocaelispor','https://www.tff.org/Default.aspx?hafta=23&pageID=1649',
'Çorum FK, 2024’te yükselme play-off’unun ilk turunda Kocaelispor’u 2-1 eledi; bir sonraki turda finali penaltılarla kaçırdı.',
'Çorum knocked out Kocaelispor 2–1 in the opening round of the 2024 promotion play-offs, only to lose its next tie in a shoot-out.',
'El Çorum eliminó 2-1 al Kocaelispor en el primer play-off de ascenso de 2024, pero cayó por penaltis en la siguiente ronda.',
'Çorum a éliminé Kocaelispor 2-1 au premier tour des barrages de montée 2024, avant de tomber aux tirs au but au tour suivant.',
'Il Çorum eliminò il Kocaelispor 2-1 al primo turno dei play-off promozione 2024, prima di uscire ai rigori nel turno seguente.',
'O Çorum eliminou o Kocaelispor por 2 a 1 na primeira fase do acesso de 2024, mas caiu nos pênaltis na rodada seguinte.',7)
f(18,'corum-2023-first-division','https://www.tff.org/default.aspx?ftxtID=41273&pageID=338',
'Çorum FK, 2023’te sezonun bitimine bir hafta kala TFF 2. Lig şampiyonluğunu garantileyip kulüp tarihinde ilk kez bir üst profesyonel lige yükseldi.',
'Çorum clinched the 2023 third-tier title with a match to spare, reaching Türkiye’s second-tier professional league for the first time in club history.',
'El Çorum conquistó el título de tercera categoría en 2023 a falta de una jornada y ascendió por primera vez a la segunda división profesional.',
'Çorum a remporté le titre de troisième division turque en 2023 avec une journée d’avance, accédant pour la première fois au deuxième échelon.',
'Il Çorum vinse il campionato di terza serie nel 2023 con una giornata d’anticipo, raggiungendo per la prima volta la seconda divisione.',
'O Çorum garantiu o título da terceira divisão turca em 2023 com uma rodada de antecedência e subiu à segunda divisão pela primeira vez.',7)
f(15,'rizespor-2016-cup-semi','https://www.tff.org/default.aspx?ftxtID=24648&pageID=267',
'Çaykur Rizespor, 2016 Türkiye Kupası’nda yarı finale yükselerek Galatasaray’la eşleşti; İstanbul’da rakibiyle 0-0 berabere kaldı.',
'Çaykur Rizespor reached the Turkish Cup semi-finals in 2016 and held Galatasaray to a 0–0 draw in Istanbul in the return leg.',
'El Çaykur Rizespor alcanzó las semifinales de la Copa turca en 2016 y empató 0-0 ante Galatasaray en Estambul en la vuelta.',
'Çaykur Rizespor a atteint les demi-finales de Coupe de Turquie en 2016 et a tenu Galatasaray en échec 0-0 à Istanbul au retour.',
'Il Çaykur Rizespor raggiunse le semifinali di Coppa di Turchia nel 2016 e pareggiò 0-0 contro il Galatasaray a Istanbul al ritorno.',
'O Çaykur Rizespor chegou à semifinal da Copa da Turquia em 2016 e empatou por 0 a 0 com o Galatasaray em Istambul na volta.',6)
f(5,'eyup-2024-title-final-round','https://www.tff.org/Default.aspx?ftxtId=44205&pageId=200',
'Eyüpspor, tarihinde ilk Süper Lig biletini aldıktan sonra 2024’ün son haftasında Erzurumspor’u yenip ilk kez 1. Lig şampiyonluğunu da kazandı.',
'After securing its first-ever Süper Lig promotion, Eyüpspor beat Erzurumspor on the final day in 2024 to win its first second-tier league title too.',
'Tras asegurar su primer ascenso a la Süper Lig, el Eyüpspor venció al Erzurumspor en la última jornada de 2024 y ganó además su primer título de Segunda.',
'Après sa première montée en Süper Lig, Eyüpspor a battu Erzurumspor lors de la dernière journée 2024 pour décrocher aussi son premier titre de deuxième division.',
'Dopo la prima promozione in Süper Lig, l’Eyüpspor batté l’Erzurumspor all’ultima giornata del 2024 e vinse anche il suo primo campionato di seconda serie.',
'Após garantir o primeiro acesso à Süper Lig, o Eyüpspor venceu o Erzurumspor na última rodada de 2024 e conquistou também o primeiro título da segunda divisão.',7)
p=Path(__file__).with_suffix('.json');p.write_text(json.dumps(A,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print(len(A),'events')
