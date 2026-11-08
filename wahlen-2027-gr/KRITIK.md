# Kritikrunden

## Runde 1 – 23:18 (Uhrzeit aus `date`)
Test: 05_test.js Desktop/iPhone 13/Pixel 7 – keine Konsolenfehler, kein horizontales Scrollen, Ladezeit lokal ~0,7 s.

Zehn grösste Schwächen:
1. Kein Einstieg mit Kernbefunden – Leser muss bis Abschnitt 2 scrollen, um eine Zahl zu sehen.
2. Abschnitt 3 nur Text; die 14 Abstimmungen «geschlossen über Fraktionsgrenzen» sind nur über den Filter unten erreichbar.
3. Englers Teilnahmequote (62 %) wirkt wie Abwesenheit, ist aber grösstenteils Ratsvorsitz – irreführend.
4. «Ratspräsident» falsch für einzelne Fälle, in denen ein Vizepräsident vorsass (Engler 1× im März 2025) – neutraler formulieren («Vorsitz»).
5. Tooltip der Matrix lässt sich auf dem Handy nicht durch Tippen daneben schliessen.
6. Abweichungsliste: fehlender Abstimmungsgegenstand ergibt «– .» (Formatfehler).
7. Methodik erwähnt nicht, warum der Nationalrat nicht aus OpenParlData stammt (Lücke ab Wintersession 2025).
8. Keine Social-/Vorschau-Metadaten (og:title, og:description).
9. Legende der Matrix: «11 %»-Start ohne Erklärung, wirkt wie Fehler.
10. Kantonsvergleich: Kantone mit 2 Sitzen (Jura, Schaffhausen) erzeugen Extremwerte ohne Hinweis.

Behebung: siehe Commit nach dieser Runde.

## Runde 2 – 23:21
Zehn grösste Schwächen:
1. Ständerat Herbst 2026: Geschäftsnummer falsch gekürzt (26.0033 statt 26.033) – behoben.
2. Abstimmungsliste: «stimmt als Ratspräsident nicht» – ersetzt durch «Vorsitz, stimmt nicht».
3. Matrix-Kopfzeile auf dem Handy: Namen überlappen – auf Nachnamen und Umbruch reduziert.
4. Keine thematische Einordnung: neuer Abschnitt «Bündner Themen» mit offengelegten Suchbegriffen und Einzelabstimmungen (keine Prozentwerte wegen kleiner Fallzahlen).
5. Themen-Spaltenköpfe (Can/Mar/…) überlappen auf dem Handy – Initialen plus Legende.
6. Kein Filter nur für den Nationalrat – Chip «Nationalrat» ergänzt.
7. Themenauswahl kann Fremdtreffer enthalten (z. B. «Shoppingtourismus») – transparent gemacht: Suchbegriffe stehen beim Thema, Auswahl als redaktionelle Eingrenzung bezeichnet.
8. Kernbefunde nennen «9 %» ohne Kontext, dass Fraktionen generell gegeneinander stimmen – Kantonsvergleich liefert den Kontext (Abschnitt 5). Offen: ggf. Satz im Lead.
9. Lange Seite ohne Navigation – offen.
10. Tooltip bleibt in der Handy-Emulation nach Hover stehen; schliesst bei Tipp daneben (Runde 1) – akzeptiert.

## Runde 3 – 23:25
Neu seit Runde 2: Vorstösse aller sieben (Urheberschaft, ws.parlament.ch) in Tabelle und Karten.
Zehn grösste Schwächen:
1. JS-Fehler nach Einbau der Vorstösse (fehlendes Feld) – Seite blieb leer; behoben, Test fängt das jetzt ab.
2. Dezimaltrennzeichen uneinheitlich (10.1 % in Karten, 97 % mit Komma aus Python) – einheitlich Komma.
3. Suche «Wolf» fand «Wölfe» nicht – Umlaute werden für die Suche normalisiert (11 → 24 Treffer).
4. Punkte im Themenabschnitt nur farbcodiert – jetzt mit aria-label/Tooltip «Name: Ja/Nein».
5. Vorstoss-Tabelle auf dem Handy abgeschnitten – scrollt seitlich, Hinweis «seitlich wischen».
6. Spaltenkopf «Person» rechtsbündig – linksbündig.
7. Ständerat hat keine Fragestunde – Hinweis zur eingeschränkten Vergleichbarkeit steht über der Tabelle.
8. «Auf der Seite der Mehrheit» berücksichtigt kein qualifiziertes Mehr – in Methodik offengelegt (akzeptiert).
9. Datei page.json ca. 1,7 MB – GitHub Pages liefert komprimiert; Ladezeit live prüfen.
10. Fraktionsposition schliesst die Person selbst ein – übliche Definition, in Methodik als «unter den teilnehmenden Fraktionsmitgliedern» beschrieben (akzeptiert).

## Runde 4 – 23:40 (Textlektorat am gerenderten Seitentext + Zusatz Rückblick)
Neu: Abschnitt «Früher geschlossener?» (Legislaturen 48–52, ws.parlament.ch; Leg. 52 per Assert identisch mit Hauptanalyse).
Zehn grösste Schwächen:
1. Balken (Kantonsvergleich, Rückblick) wurden nicht gefüllt (span ohne display:block) – auch in der bereits gepushten Fassung. Behoben.
2. «Nationalrat» bei Martullo-Blocher und Giacometti – jetzt «Nationalrätin».
3. Tausendertrennzeichen uneinheitlich (2'058 vs. 3’287) – einheitlich ’.
4. «kein exakter «Siegquote»» – grammatisch korrigiert.
5. Datenstand doppelt genannt – zusammengefasst («beide Räte bis 2.10.2026»).
6. Behauptung «Webservice bietet keine Ständerats-Einzelstimmen» war nicht direkt belegt – ersetzt durch überprüfte Aussage (4’201 Abstimmungen mit je rund 200 Stimmen = Nationalrat).
7. Seite ist öffentlich, aber nicht redaktionell geprüft – Hinweis «Entwurf» oben und Urheberangabe im Fuss.
8. Historische Fraktionscodes im Webservice teils rückwirkend vereinheitlicht (Candinas 2011–15 als «M-E») – im Rückblick deshalb keine Fraktionsangaben, nur Namen.
9. Legislatur 2003–07 im Webservice unvollständig (1’462 Abstimmungen) – nicht dargestellt, offengelegt.
10. Rückblick lädt zur Personen-Interpretation ein – Hinweis «kein Vergleich von Personen» direkt unter der Grafik.

## Nachtrag 08.11. 09:40 – Rückmeldung Julian
1. Flugpassagierdatengesetz Art. 18 doppelt? Nein: zwei getrennte Abstimmungen (ID 33787 Mehrheit vs. Minderheit I Andrey, ID 33788 Mehrheit vs. Minderheit II Andrey, 73 s auseinander). Seite zeigt jetzt bei jeder Abstimmung die Varianten (Bedeutung Ja/Nein).
2. Vorstösse Martullo-Blocher (9) und Hug (8): unabhängig mit OpenParlData (contributors, Rolle author) gegengeprüft – identisch. Mitunterzeichnungen (alle Legislaturen: 85 bzw. 32) nicht gezählt.
3. Teilnahmequote aller sieben als Tabelle ergänzt (Vorsitz aus dem Nenner herausgenommen).
