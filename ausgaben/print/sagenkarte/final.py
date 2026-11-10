import csv,json,urllib.request
rows={r['id']:r for r in csv.DictReader(open('buch.tsv'),delimiter='\t')}
X='exakt';A='ähnlich';O='nur Ort'
# (E,N,status,swisstopo-Objekt / Bemerkung)
P={
'1':(2763269,1175182,O,'Dorf Lantsch/Lenz'),
'2':(2815409,1184603,O,'Dorf Tarasp'),
'3':(2727924,1181840,O,'Dorf Waltensburg/Vuorz'),
'4':(2787504,1165182,O,'Dorf Zuoz'),
'5':(2749504,1183384,O,'Dorf Rhäzüns'),
'6':(2759253,1193963,O,'Dorf Haldenstein'),
'7':(2778690,1194620,X,'Tanzried, Conters i. P.'),
'8':(2700212,1172438,X,'Platta dil Barlot (Schreibvariante)'),
'9':(2793841,1191696,O,'Dorf Klosters'),
'10':(2729846,1139665,O,'Dorf Rossa'),
'11':(2779943,1187374,X,'Strelapass'),
'12':(2805985,1167044,X,'Val dal Diavel'),
'13':(2770482,1160403,X,'Igl Colm digl Diavel'),
'14':(2772430,1185764,O,'Dorf Arosa'),
'15':(2749467,1157328,O,'Dorf Sufers'),
'16':(2778006,1200839,A,'Tüfelstein – swisstopo: Gemeinde Luzein, Buch: Klosters'),
'17':(2733918,1166675,X,'Tüfelsteina'),
'18':(2770207,1160342,X,'Igl Crap digl Diavel'),
'19':(2702138,1170860,O,'Dorf Sedrun'),
'20':(2766582,1193300,X,'Tüfelsch Chopf'),
'21':(2794389,1143048,X,'Diavolezza (Pass)'),
'22':(2724633,1176042,O,'Gemeinde Obersaxen Mundaun'),
'23':(2744788,1178394,X,'Höll, Safiental'),
'24':(2711469,1163107,X,'Piz Uffiern (Medel); zweiter Piz Uffiern in Tujetsch'),
'25':(2768399,1139136,A,"Boca d'Infern (Val d'Infern nicht gefunden)"),
'26':(2815409,1184603,O,'Dorf Tarasp (swisstopo-«Fora da las Dialas» bei Scuol ist ein anderes Objekt?)'),
'27':(2830387,1166897,X,'Fora da las Dialas, Val Müstair'),
'28':(2733942,1183012,O,'Dorf Ruschein'),
'29':(2714374,1175099,O,'Dorf Sumvitg'),
'30':(2782316,1197902,X,'Fänggastein (Schreibvariante)'),
'31':(2785498,1200514,A,'Massiv Madrisa (Madrisahorn nicht einzeln gefunden)'),
'32':(2805650,1179088,X,'Lai dal Dragun'),
'33':(2737300,1195300,O,'Ungefähr: Grat hinter Plaun Segnas (Lageangabe gemäss Buch, ungeprüft)'),
'34':(2791221,1163737,A,'Crap Samson'),
'35':(2735926,1195816,X,'Martinsloch'),
'36':(2702138,1170860,O,'Dorf Sedrun'),
'37':(2802138,1178307,X,'Güstizia'),
'38':(2761200,1201352,O,'Dorf Zizers'),
'39':(2758800,1210838,A,'St. Luziensteig'),
'40':(2762668,1168784,O,'Dorf Mon'),
'41':(2753707,1188634,X,'Tuma Falveng'),
'42':(2775616,1149018,X,'Julierpass'),
'43':(2754474,1173421,X,'Crap Carschenna'),
'44':(2815409,1184603,O,'Dorf Tarasp'),
'45':(2755777,1172106,X,'Unghir Tobel, Thusis (ehem. Mutten)'),
'46':(2743481,1171672,O,'Safien Platz (swisstopo-«Unghürboden» liegt in Klosters)'),
'47':(2796107,1187767,X,'Unghürhörner'),
'48':(2781679,1141246,X,'Lej Sgrischus'),
'49':(2763474,1164238,O,'Dorf Parsonz (Korrektur: nicht Parpan, ungeprüft)'),
'50':(2749467,1157328,O,'Dorf Sufers'),
'51':(2796866,1135011,A,'Val Tempesta (Tal, kein See gefunden)'),
'52':(2765679,1180331,X,'Totseeli'),
'53':(2772125,1163453,X,'Lai Mort'),
'54':(2749836,1175001,X,'Val da la Malanotg'),
'55':(2814972,1196314,X,'Davo Dieu'),
'56':(2781303,1190560,A,'Totalp (Punkt der Sesselbahn)'),
'57':(2766313,1182615,X,'Geisterstein'),
'58':(2744112,1160027,X,'Teurihorn'),
'59':(2816315,1186069,O,'Dorf Scuol (swisstopo-«Sunteri Tschanüff» liegt in Valsot)'),
'60':(2713798,1168188,A,'Piz Santeri – swisstopo: Gemeinde Sumvitg, Buch: Medel'),
'61':(2762767,1164682,A,'Val da Morts (Schreibvariante)'),
}
out=[]
rows.pop('2')  # Nr. 2 = Nr. 44 (gleicher Fels, gemäss Buch, ungeprüft)
rows['44'].update(name='Crap Sgnè / Platta da las Strias',bedeutung='Felsplatte mit prähistorischen Schalen und Zeichen; volkstümlich «Platte der Hexen»',ort_buch='Tarasp')
rows['49']['ort_buch']='Parsonz'
for i,r in rows.items():
    E,N,s,b=P[i]
    h=None
    if s!=O:
        h=round(float(json.load(urllib.request.urlopen(f"https://api3.geo.admin.ch/rest/services/height?easting={E}&northing={N}&sr=2056"))['height']))
    out.append(dict(id=int(i),name=r['name'],kategorie=r['kat'],gemeinde_buch=r['ort_buch'],bedeutung=r['bedeutung'],E_LV95=E,N_LV95=N,hoehe_m=h if h is not None else '',verortung=s,swisstopo_objekt_bemerkung=b))
f='/home/user/claude_code_git_workspace/ausgaben/print/sagenkarte/sagenorte_schorta.csv'
w=csv.DictWriter(open(f,'w',newline=''),fieldnames=list(out[0]));w.writeheader();w.writerows(out)
json.dump(out,open('final.json','w'),ensure_ascii=False)
from collections import Counter;print(Counter(o['verortung'] for o in out),Counter(o['kategorie'] for o in out))
