#!/usr/bin/env python3
"""Club-specific oddities/records from official club sites, league reports and reputable journalism."""
import json
from pathlib import Path
r=Path(__file__).parent
D=[
  dict(id='portugal-liga-portugal:5',key='casapia-field-expropriated-1940',sources=['https://casapiaac.pt/palmares'],score=9,
    tr='Casa Pia’nın Lizbon’daki sahası 1940 yılında büyük bir dünya sergisi için kamulaştırıldı. Kulübün kendi sahasına kavuşması yıllar sürdü.',
    en='Casa Pia lost its Lisbon football ground to compulsory purchase for a major world exhibition in 1940; the club went years without its own pitch.',
    es='En 1940, Casa Pia perdió su campo de Lisboa por una expropiación para una gran exposición mundial; pasó años sin campo propio.',
    fr='En 1940, Casa Pia a perdu son terrain de Lisbonne, exproprié pour une grande exposition mondiale, et est resté des années sans terrain.',
    it='Nel 1940 il campo di Casa Pia a Lisbona fu espropriato per una grande esposizione mondiale; il club rimase anni senza un terreno proprio.',
    pt='Em 1940, o campo do Casa Pia em Lisboa foi expropriado para uma grande exposição mundial, deixando o clube anos sem campo próprio.'),
  dict(id='portugal-liga-portugal:18',key='alverca-2025-36-new-signings',sources=['https://portugoal.net/club-news/5213-talk-of-the-town-f-c-alverca'],score=9,
    tr='Alverca, 2025’te Portekiz’in en üst ligine döndüğünde kadrosunu neredeyse sıfırdan kurdu: Yazın 36 futbolcu transfer etti; önceki sezonun kadrosundan yalnızca bir oyuncu kaldı.',
    en='When Alverca returned to Portugal’s top division in 2025, it signed 36 new players in one summer, keeping just one player from the previous season.',
    es='Al volver a la primera división portuguesa en 2025, Alverca fichó a 36 jugadores en un solo verano y conservó solo uno de la plantilla anterior.',
    fr='De retour dans l’élite portugaise en 2025, Alverca a recruté 36 joueurs pendant l’été et n’en a conservé qu’un seul de la saison précédente.',
    it='Tornato nella massima serie portoghese nel 2025, l’Alverca ingaggiò 36 giocatori in un’estate, trattenendone solo uno della stagione precedente.',
    pt='Ao voltar à primeira divisão portuguesa em 2025, o Alverca contratou 36 jogadores num verão e manteve apenas um atleta da época anterior.'),
  dict(id='portugal-liga-portugal:18',key='alverca-2025-vinicius-investor',sources=['https://www.theguardian.com/football/2026/aug/04/alverca-fc-portuguese-club-smart-scouting-vinicius-junior-eduardo-camavinga-travis-scott','https://portugoal.net/club-news/5213-talk-of-the-town-f-c-alverca'],score=9,
    tr='Real Madrid yıldızı Vinícius Júnior, Portekiz’in küçük kulübü Alverca’nın yatırımcılarından biri oldu. Kulüp, Brezilyalı yıldızın da dahil olduğu ortaklıkla yeniden en üst lige çıktı.',
    en='Real Madrid star Vinícius Júnior became an investor in the small Portuguese club Alverca, which returned to the top flight under a new ownership group.',
    es='Vinícius Júnior, estrella del Real Madrid, se convirtió en inversor del modesto club portugués Alverca, que regresó a primera división con nuevos propietarios.',
    fr='La star du Real Madrid Vinícius Júnior est devenue investisseur du petit club portugais d’Alverca, revenu ensuite dans l’élite.',
    it='La stella del Real Madrid Vinícius Júnior è diventata investitore del piccolo club portoghese Alverca, poi tornato in massima serie.',
    pt='Vinícius Júnior, estrela do Real Madrid, tornou-se investidor do modesto Alverca, clube português que voltou à Primeira Liga.'),
  dict(id='portugal-liga-portugal:16',key='santaclara-2025-promoted-points-record',sources=['https://www.cm-pontadelgada.pt/cmpontadelgada/uploads/document/file/6324/ata_da_reuniao_de_camara_no_10_de_21_05_2025___alterada_signed_signed.pdf'],score=7,
    tr='Santa Clara, 2024–25 sezonunda yükseldiği Portekiz 1. Ligi’ni 57 puanla beşinci bitirdi. Ponta Delgada belediyesine göre bu, o tarihe kadar lige yeni yükselen bir takımın en yüksek puanıydı.',
    en='Freshly promoted Santa Clara finished fifth in Portugal’s 2024–25 top flight with 57 points—a record points total for a newly promoted side according to Ponta Delgada’s municipal council.',
    es='El recién ascendido Santa Clara acabó quinto en la liga portuguesa 2024-25 con 57 puntos, récord para un debutante tras el ascenso según el ayuntamiento de Ponta Delgada.',
    fr='Tout juste promu, Santa Clara a fini cinquième du championnat portugais 2024-2025 avec 57 points, un record pour un promu selon la mairie de Ponta Delgada.',
    it='Appena promosso, il Santa Clara chiuse quinto nel campionato portoghese 2024-25 con 57 punti, un record per una neopromossa secondo il comune di Ponta Delgada.',
    pt='Recém-promovido, o Santa Clara terminou em quinto na Liga 2024/25 com 57 pontos, recorde para uma equipa promovida segundo a Câmara de Ponta Delgada.'),
  dict(id='greece-super-league:4',key='atromitos-2012-asteras-awaygoals-tenmen',sources=['https://www.ekathimerini.com/sports/140610/olympiakos-to-clash-with-atromitos-in-final/'],score=8,
    tr='Atromitos, 2012 Yunanistan Kupası yarı finalinde 6. dakikadan itibaren 10 kişi oynayan Asteras Tripolis karşısında 2-1 geriye düştü; maçı 2-2’ye getirip deplasman golüyle finale çıktı.',
    en='In the 2012 Greek Cup semi-final, Atromitos fell 2–1 behind to Asteras Tripolis despite Asteras playing with ten men from the sixth minute; a 2–2 draw sent Atromitos to the final on away goals.',
    es='En la semifinal de Copa de Grecia de 2012, Atromitos iba perdiendo 2-1 ante un Asteras con diez jugadores desde el minuto 6; el 2-2 le dio el pase por goles fuera de casa.',
    fr='En demi-finale de la Coupe de Grèce 2012, Atromitos était mené 2-1 face à Asteras, réduit à dix dès la 6e minute ; le 2-2 l’a qualifié aux buts à l’extérieur.',
    it='Nella semifinale di Coppa di Grecia 2012, l’Atromitos era sotto 2-1 contro l’Asteras in dieci dal 6° minuto; il 2-2 lo portò in finale grazie ai gol in trasferta.',
    pt='Na semifinal da Copa da Grécia de 2012, o Atromitos perdia por 2–1 para o Asteras, com dez jogadores desde os 6 minutos; o empate em 2–2 valeu a vaga pelos gols fora.'),
  dict(id='portugal-liga-portugal:18',key='alverca-2005-rebirth-2006',sources=['https://www.zerozero.pt/noticias/sabe-ha-quanto-tempo-o-alverca-nao-disputa-a-primeira-liga-de-forma-consecutiva/1103838'],score=8,
    tr='Alverca, 2005’teki ağır mali krizden sonra futbol faaliyetlerini durdurdu; bir yıl sonra Lizbon’un en alt yerel liglerinden yeniden başlayıp 2025’te en üst lige dönmeyi başardı.',
    en='A financial crisis stopped Alverca’s football operation in 2005. The club restarted from Lisbon’s lowest regional divisions a year later and climbed back to the top flight in 2025.',
    es='Una crisis económica paralizó al Alverca en 2005. Un año después volvió desde las categorías regionales más bajas de Lisboa y regresó a primera división en 2025.',
    fr='Une crise financière a arrêté Alverca en 2005. Le club est reparti des divisions régionales les plus basses de Lisbonne en 2006 avant de retrouver l’élite en 2025.',
    it='Una crisi finanziaria fermò l’Alverca nel 2005. Ripartì dalle divisioni regionali più basse di Lisbona nel 2006 e tornò in massima serie nel 2025.',
    pt='Uma crise financeira interrompeu o futebol do Alverca em 2005. O clube recomeçou nas divisões distritais mais baixas de Lisboa em 2006 e voltou à elite em 2025.'),
]
events=[{'id':x['id'],'key':x['key'],'sources':x['sources'],'score':x['score'],'tr':x['tr'],'translations':{l:x[l] for l in ['en','es','fr','it','pt']}} for x in D]
(r/'batch_16.json').write_text(json.dumps(events,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(len(events))
