# Overlord-Review: Abstimmung «Keine 10-Millionen-Schweiz!» – Methodik-Check

**Datum:** 17.06.2026
**Modelle:** GLM-4.6 (Methodik-Faktencheck), Llama 3.3 70B (Lückenanalyse), Kimi K2 (Kritiker/Gegenseite)
**Aufgabe:** Kritische Zweitmeinung zur Datenanalyse der Abstimmung vom 14.06.2026 (alle 100 Bündner Gemeinden), vor Veröffentlichung als Zeitungsartikel.

Vollständige Kernbefunde, die den drei Modellen vorgelegt wurden, siehe `data.json` (meta-Block) und die fünf Charts in diesem Ordner.

---

## 1. GLM-4.6 — Methodik-Faktencheck

Die Methodik ist fuer einen Zeitungsartikel aussergewoehnlich solide und geht weit ueber das hinaus, was ueblicherweise erwartet wird. Die Kombination aus verschiedenen Tests und Robustheitschecks ist vorbildlich.

**Prüfung der statistischen Anwendung & Interpretation:**

1. **Ausländeranteil:** Korrekt. Ein p-Wert von 0.223 ist nicht signifikant. Die Interpretation "kein Zusammenhang" ist journalistisch angemessen, auch wenn statistisch präziser "kein linearer Zusammenhang nachgewiesen" heissen würde.
2. **Region:** Korrekt. Ein eta²-Quadrat von 0.457 ist ein sehr hoher Effekt. Die Aussage "stärkster Treiber" ist durch die Daten vollkommen gedeckt. Der Robustheitscheck (Entfernung von Chur) ist exzellent und notwendig.
3. **Männeranteil:** Korrekt. Die Bestätigung durch Spearman, Trimming und Bootstrap-CI zeigt, dass der Zusammenhang nicht durch Ausreisser oder eine bestimmte Verteilung zustande kommt.
4. **Fahrzeuge pro Kopf:** Korrekt. Der entscheidende Punkt ist die multiple Regression — die Variable bleibt signifikant, obwohl sie mit anderen Variablen korreliert ist. Die Transparenz bei n=96 ist gut.
5. **Gemeindegrösse & Stimmbeteiligung:** Vorbildlich. Die saubere Trennung zwischen Abstimmungsergebnis und Stimmbeteiligung ist wichtig. Die korrekte Identifikation der Konfundierung (Ausländeranteils Effekt auf Beteiligung ist vermutlich ein Artefakt der Gemeindegrösse) ist statistisch hochstehend.
6. **Verworfene Variable (Leerwohnungsziffer):** Exzellent. Das Verwerfen eines knapp signifikanten Werts nach weiteren Robustheitschecks ist wissenschaftlich integer und stärkt die Glaubwürdigkeit der gesamten Analyse massgeblich.

**Methodische Risiken:**

- **Mehrfachvergleiche (p-Hacking):** Grösstes reales Risiko bei ~15 ungetesteten Variablen ohne formale Korrektur. Wird aber durch die Vorgehensweise sehr gut eingedämmt — ein Befund, der Spearman, Trimming, Bootstrap und multiple Regression übersteht, ist extrem unwahrscheinlich ein reiner p-Hacking-Fund.
- **Ökologischer Fehlschluss:** Grösste inhaltliche Gefahr. Die Analyse findet Zusammenhänge auf Gemeinde-Ebene — "Männer stimmen eher Ja" wäre keine zulässige Schlussfolgerung auf Personenebene. **Empfehlung: Klarstellungssatz im Artikel.**
- **Datenqualität/-aktualität:** Fahrzeugdaten ein Jahr alt — kleine bis mittlere Einschränkung, für einen Zeitungsartikel tolerabel.
- **Kausalität:** Wird korrekt vermieden ("Treiber"/"Zusammenhang" statt "Ursache").

**Fazit:** Ja, die Methodik ist mehr als solide genug — "ein Leuchtturmbeispiel für guten Datenjournalismus". Einziges kritisches Verbesserungspotenzial: ökologischer Fehlschluss explizit ansprechen.

---

## 2. Llama 3.3 70B — Lückenanalyse

Die Methodik ist solide, aber folgende Aspekte sollten kritisch betrachtet werden:

1. **Mehrfachvergleiche:** Fehlende formale Korrektur über das gesamte Variablen-Set könnte Alpha-Fehler-Inflation verursachen.
2. **Kausalitäts-Fehlschlüsse:** Korrelationen sind keine kausalen Beziehungen — alternative Erklärungen/Konfounder prüfen.
3. **Datenqualität/-aktualität:** Verschiedene Erhebungsjahre (z.B. Fahrzeugdaten 2025) könnten zu Inkonsistenzen führen.
4. **Ökologischer Fehlschluss:** Gemeinde-Ebene-Befunde nicht auf Individuen generalisieren.
5. **Weitere Variablen:** Bildungsgrad, Einkommen, politische Präferenzen wären interessant (auf Gemeinde-Ebene in diesem Datensatz allerdings nicht verfügbar).

---

## 3. Kimi K2 — Kritiker/Gegenseite

**Drei Killer-Punkte:**

**1. Das Aggregationsniveau-Problem**
Permanent auf Gemeinde-Ebene, aber Schlussfolgerungen über individuelles Verhalten — klassischer ökologischer Fehlschluss. Ein "Fahrzeuge pro Kopf"-Effekt von 0.353 könnte vollständig durch Zusammensetzung erklärt sein (z.B. arme Berggemeinden = weniger Autos + traditionellere Wähler).

**2. Die Mehrfachvergleichs-Frage**
15 Variablen gegen ein Outcome getestet, dann Robustheitschecks als Verteidigung verwendet — das beantwortet nicht, ob ein Treffer einer der ~0.75 bei α=0.05 statistisch erwarteten Zufallstreffer ist. *Killer-Frage: Welches α nach Bonferroni über alle 15 Tests, und hätten Autos/Männeranteil dann noch gehalten?*

**3. Die ASTRA-Zeitbombe**
15 Monate Differenz zwischen Fahrzeugdaten (31.03.2025) und Abstimmung (14.06.2026). Nennt eine Zahl "~7% Halterwechsel/Jahr" (BFS) — **diese Zahl wurde von Claude nicht verifiziert, mit Vorsicht behandeln.**

**Fazit Kimi:** "Diese Analyse überlebt eine öffentliche Fachkritik nicht intakt" — wahrscheinlichste Erklärung seien geographische Artefakte statt individuelle Verhaltensmuster.

---

## Claudes Synthese & Nachprüfung

**Punkt 2 (Kimis Mehrfachvergleichs-Einwand) wurde direkt nachgerechnet, nicht nur diskutiert:**

Bonferroni-Korrektur über alle 12 gegen Ja-Anteil getesteten Variablen gleichzeitig (Schwelle p<0.0042 statt 0.05):

| Variable | p-Wert | Hält strengste Korrektur? |
|---|---|---|
| Fahrzeuge pro Kopf | 0.0004 | ✅ Ja |
| Männeranteil | 0.0006 | ✅ Ja |
| Leerwohnungsziffer | 0.0270 | ❌ Nein |
| alle übrigen 9 Variablen | 0.06–0.76 | ❌ Nein |

→ Kimis Einwand ist methodisch berechtigt (Robustheitschecks lösen das Mehrfachvergleichs-Problem nicht automatisch), aber **Fahrzeuge und Männeranteil überstehen auch die strengste sinnvolle Korrektur.**

**Konsens aller drei Modelle:** Ökologischer Fehlschluss ist der wichtigste, unstrittige Punkt — sollte als Klarstellungssatz in den Artikel/die Methodik-Notiz.

**Mit Vorsicht zu behandeln:** Kimis konkrete "~7%"-Zahl zum Halterwechsel ist nicht verifiziert.

**Nicht umsetzbar:** Llamas Vorschlag, Bildung/Einkommen als Variablen zu testen — auf Gemeinde-Ebene in den verfügbaren Datensätzen nicht vorhanden.
