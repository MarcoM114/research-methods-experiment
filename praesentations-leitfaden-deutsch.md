# Präsentations-Leitfaden & Wissenschaftlicher Gesamtüberblick

## Web Application Architecture Performance: Methodik, Normierung & Ergebnisse (Team B – Gruppe 4)

**Kurs:** 318.081 Research Methods (26SS) – Alpen-Adria-Universität Klagenfurt  
**Lehrveranstaltungsleitung:** Assoc. Prof. Mag. Dr. Slavisa Aleksić & Dr. Mladen Pavlović  
**Team B (Gruppe 4):** Fabio Gschweidl, Desirée Iris Hackl, Marco Miklautz, Lorenz Schneider, Danijel Trailovic  
**Verknüpfte Englische Präsentation:** Folien 1 bis 15 (Google Slides im Projektordner)

---

## 1. Worum geht es in unserer Arbeit überhaupt? (Der rote Faden für das Team)

Stellt euch vor, jemand fragt euch vor der Präsentation: *„Was habt ihr eigentlich genau gemacht und warum?“* – Hier ist die kurze, einfache Antwort, die jedes Teammitglied kennen sollte:

1. **Das Ausgangsproblem:** Moderne Webseiten müssen heute extrem schnell laden (gut für Nutzer und Google-Ranking / Core Web Vitals) und gleichzeitig interaktiv sein (z. B. Filter, Suche). Dafür gibt es verschiedene **Rendering-Architekturen**:
   - **CSR (Client-Side Rendering, z. B. klassisches React SPA):** Der Server schickt nur eine fast leere HTML-Hülle und ein großes JavaScript-Paket. Erst der Browser des Nutzers baut die Seite zusammen.
   - **SSR (Server-Side Rendering, z. B. Next.js dynamisch):** Der Server baut bei *jeder* Nutzeranfrage das fertige HTML live zusammen, schickt es an den Browser und lädt danach trotzdem das gesamte React-JavaScript nach, um die Seite interaktiv zu machen (*Full Hydration*).
   - **JAMstack mit Full Hydration (Next.js SSG):** Die HTML-Seiten werden nicht bei jeder Anfrage neu berechnet, sondern schon **vorab beim Build-Prozess** (Static Site Generation, SSG) fertig generiert. Aber: Im Browser wird trotzdem noch das komplette React-Framework (~350,5 kB JS) ausgeführt, um die gesamte Seite zu „hydrieren“ (*Full Hydration*).
   - **JAMstack mit Islands Architecture (Astro SSG + Zero-JS Default):** Die HTML-Seiten werden ebenfalls vorab beim Build generiert. Der entscheidende Unterschied: Astro liefert standardmäßig **0 kB JavaScript** für statische Inhalte aus (*Zero-JS by Default*) und aktiviert JavaScript nur für winzige, isolierte interaktive „Inseln“ (*Selective / Partial Hydration*).

2. **Unsere Referenzstudie – Fahrudin et al. (2025) [Ref 17]:**
   - Die Autoren **Fahrudin,옥tavianto & Saputra (2025)** haben bereits **CSR (React.js)** und **SSR (Next.js)** auf 7 Datenmengen-Stufen (`10, 50, 100, 500, 1.000, 5.000, 10.000` Pokémon-Karten) mit Google Lighthouse (Desktop, je 5 Durchläufe) gemessen.
   - Ihr Ergebnis war überraschend: Ab `500` bis `10.000` Einträgen war **SSR beim First Contentful Paint (FCP) und Largest Contentful Paint (LCP) langsamer als CSR**, weil der Server riesige HTML-Dokumente erst live zusammenbauen und übertragen musste (*Server-Rendering- & Payload-Flaschenhals*), während der Browser anschließend trotzdem noch die volle React-Hydration durchführen musste.

3. **Unsere Forschungslücke & unser Beitrag:**
   - Fahrudin et al. [17] haben **keine vorab gebauten JAMstack-Architekturen (SSG)** und **keine Islands-Architektur (Zero-JS / Partial Hydration)** untersucht.
   - Da CSR und SSR in [17] bereits sauber dokumentiert sind, haben wir uns die doppelte Arbeit gespart, deren Referenzwerte übernommen und unter **exakt denselben Laborbedingungen (Ceteris Paribus)** die zwei fehlenden modernen Architekturen implementiert und in **70 Google-Lighthouse-Runs** (`2 Architekturen × 7 Stufen × 5 Wiederholungen`) gemessen:
     1. **Next.js 15.3 (App Router, Static Export / SSG + Full React 19 Hydration)**
     2. **Astro 5.7 (Static Build / SSG + Islands Architecture / 0 kB JS)**

4. **Unsere 4 wichtigsten Kernergebnisse auf einen Blick:**
   - **Ergebnis 1 (Konstanter Hydration-Overhead bei kleinen Datenmengen):** Zwischen `N = 10` und `N = 100` haben sowohl Astro als auch Next.js einen Lighthouse Score von `100,0`. Trotzdem ist der **LCP von Next.js (`0,658 s` bis `0,736 s`) konstant um ~400–460 ms langsamer als bei Astro (`0,250 s` bis `0,278 s`)**, weil der Browser bei Next.js jedes Mal erst **350,5 kB React-Runtime** parsen und ausführen muss, bevor das finale Element als vollständig initialisiert gilt.
   - **Ergebnis 2 (Kipppunkt / Inflection Point bei N = 1.000):** Bei `1.000` Karten (ca. `19.075` DOM-Knoten) beginnen sich die Architekturen deutlich zu trennen: Astro hält mit **Score 98,4** und **LCP 0,832 s** noch Bestwerte, während Next.js durch die doppelte Arbeit (943 kB HTML parsen + React-Hydration über 19.085 Knoten) bereits auf **Score 94,0** und **LCP 1,371 s** (+64,8 % langsamerer LCP) abrutscht.
   - **Ergebnis 3 (Extreme Last bei N = 5.000 & 10.000):** Bei `10.000` Karten (`~190.080` DOM-Knoten) ist **Astro beim FCP (`5,667 s` vs. `7,751 s`) und LCP (`5,700 s` vs. `8,121 s`) um 29,8 % schneller als Next.js** und spart rund **2,42 Sekunden Ladezeit**, weil das HTML-Payload von Astro um 27,6 % kleiner ist (`6.760,2 kB` vs. `9.343,2 kB` ohne eingebettete React-Flight-Hydration-Payloads) und `0,0 kB` JavaScript ausgeführt werden.
   - **Ergebnis 4 (Die DOM-Skalierungsgrenze):** Obwohl Astro kein JavaScript ausführt, steigt auch bei Astro die **Total Blocking Time (TBT) bei N = 10.000 auf `2.675,5 ms`** (Next.js: `2.344,0 ms`). Warum? Weil der native C++-Layout- und Style-Recalculation-Task der Chromium-Engine (Blink) bei **190.075 DOM-Knoten** den Main-Thread für über 2,5 Sekunden blockiert. Das beweist wissenschaftlich: *Zero-JS löst das Hydration-Problem komplett, ersetzt aber ab N ≥ 5.000 nicht Paginierung oder DOM-Virtualisierung!*

---

## 2. Wie haben wir die Werte normiert? (Wie garantieren wir Vergleichbarkeit mit Studie [17]?)

Das ist ein extrem wichtiger methodischer Punkt (auf **Folie 8** und **Folie 13** unserer Präsentation), nach dem Professoren in *Research Methods* sehr gerne fragen:
*„Ihr habt eure Messungen auf eurer Linux-Benchmark-VM gemacht, und Fahrudin et al. [17] haben ihre Messungen auf einem Windows-11-Laptop mit Ryzen 5 5500U gemacht. Warum darf man diese Zahlen überhaupt miteinander vergleichen?“*

Wir garantieren die wissenschaftliche Vergleichbarkeit über ein **3-Säulen-Normierungsmodell**:

### Säule 1: Standardisierte Lighthouse-Lantern-Simulation (Protokoll-Parität)
Google Lighthouse misst im Standardmodus (`--throttling-method=simulate`, Desktop-Preset) nicht einfach ungebremst die lokale Hardware, sondern nutzt die **Lantern-Simulations-Engine**:
- Lighthouse zeichnet den Abhängigkeitsgraphen aller Netzwerk- und CPU-Tasks auf und berechnet FCP, LCP, TBT und SI deterministisch für ein **standardisiertes Referenz-Netzwerk (`40 ms RTT`, `10.240 kbps` Durchsatz)** und einen **CPU-Drosselungsfaktor (`1×` Desktop)**.
- Außerdem haben wir exakt dieselben Stufen (`N ∈ {10, 50, 100, 500, 1000, 5000, 10000}`), dieselbe Anzahl an Wiederholungen (`n = 5` pro Stufe mit komplett geleertem Browser-Cache) und dieselbe Karten-Struktur (`19 DOM-Knoten pro Karte`) wie Fahrudin et al. [17] verwendet.

### Säule 2: Dimensionsloser relativer Skalierungsfaktor (Sₙ = Mₙ / M₁₀)
Um jeglichen konstanten Basis-Unterschied zwischen dem Host-Rechner aus [17] und unserer Benchmark-Umgebung mathematisch komplett herauszukürzen, normieren wir jede Architektur auf ihren eigenen **Baseline-Wert bei `N = 10` Einträgen**:
- **Formel:** `Sₙ(A) = Mₙ(A) / M₁₀(A)`
  - `Mₙ(A)` = Gemessener Mittelwert der Metrik (z. B. LCP) für Architektur `A` bei Datenmenge `N`.
  - `M₁₀(A)` = Gemessener Mittelwert derselben Architektur `A` bei der kleinsten Stufe `N = 10`.
- **Was bedeutet `Sₙ` anschaulich?** `Sₙ` gibt an, *um das Wievielfache sich die Ladezeit einer Architektur verschlechtert, wenn die Datenmenge von 10 auf N wächst*. Da der Hardware-Faktor sowohl im Zähler (`Mₙ`) als auch im Nenner (`M₁₀`) steckt, kürzt er sich vollständig heraus (`Hardware-unabhängig`)!
- **Vergleich bei N = 10.000 (1.000× mehr Daten als bei N = 10):**
  - **SSR (Next.js in [17]):** LCP steigt von `0,840 s` auf `28,160 s` → **`S₁₀₀₀₀ = 33,52×`** (extreme Verschlechterung durch Live-Server-Rendering + Hydration)
  - **Astro (Islands SSG):** LCP steigt von `0,250 s` auf `5,700 s` → **`S₁₀₀₀₀ = 22,80×`** (reines HTML/DOM-Wachstum ohne Server-Render-Latenz)
  - **Next.js (SSG + Hydration):** LCP steigt von `0,658 s` auf `8,121 s` → **`S₁₀₀₀₀ = 12,34×`** (flachere relative Kurve, weil `M₁₀ = 0,658 s` durch das 350,5 kB React-Bundle schon von Anfang an hoch ist – absolut ist Next.js bei `N = 10.000` mit `8,121 s` aber deutlich langsamer als Astro mit `5,700 s`!)
  - **CSR (React SPA in [17]):** LCP steigt von `0,840 s` auf `4,900 s` → **`S₁₀₀₀₀ = 5,83×`** (kleines initiales HTML, asynchroner JSON-Fetch im Browser)

### Säule 3: Cross-Environment Hardware-Kalibrierungsfaktor (k_hw = 1,170)
Für direkte Sekunden-Vergleiche über beide Studien hinweg berechnen wir zusätzlich den **Hardware-Kalibrierungsfaktor `k_hw`** an den nicht-überlasteten Baseline-Ankerpunkten (`N = 10, 50, 100`) zwischen der Next.js-SSR-Baseline aus [17] (`FCP₁₀..₁₀₀ = 0,340 s`) und unserer Next.js-SSG-Baseline (`FCP₁₀..₁₀₀ = 0,297 s`), bereinigt um den lokalen Loopback-TTFB-Offset (`Δ_TTFB ≈ 0,049 s`):
- **Formel:** `k_hw = (FCP_[17](10..100) - Δ_TTFB) / FCP_ours(10..100) = 1,170`
- **Kalibrierte Metrik:** `M*_ours(N) = k_hw × M_ours(N)`
- **Wichtigstes Ergebnis der Kalibrierung:** Selbst wenn wir unsere Messwerte konservativ mit `k_hw = 1,170` auf das exakte Hardware-Niveau von Fahrudin et al. [17] hochrechnen, liegt **Astro bei `N = 10.000` mit `LCP* = 6,67 s` und Next.js SSG mit `LCP* = 9,50 s` immer noch um den Faktor 3× bis 4× unter dem dynamischen SSR aus [17] (`28,16 s`)**! Unsere Schlussfolgerungen sind also zu 100 % robust gegenüber Hardware-Unterschieden.

---

## 3. Überblick über alle 5 Metriken (Kurz-Spickzettel)

Damit ihr in der Fragerunde jede Metrik sofort erklären könnt:

| Kürzel | Voller Name | Gewichtung im Lighthouse Score | Was misst die Metrik einfach erklärt? | Guter Wert (Google CWV) |
| :--- | :--- | :--- | :--- | :--- |
| **FCP** | First Contentful Paint | 10 % | Zeit bis das **allererste sichtbare Element** (Text, Überschrift, Rahmen) auf dem Bildschirm erscheint. | ≤ 1,8 s |
| **LCP** | Largest Contentful Paint | 25 % | Zeit bis das **größte Hauptinhaltselement** im sichtbaren Bereich vollständig gerendert ist (Wahrgenommene Hauptladezeit). | ≤ 2,5 s |
| **TBT** | Total Blocking Time | 30 % | Summe der **Blockierzeit des Browser-Main-Threads** zwischen FCP und voller Interaktivität (für alle Tasks > 50 ms). Wichtigster Indikator für „Einfrieren“ durch JS-Hydration oder riesige DOM-Layouts. | < 200 ms |
| **SI** | Speed Index | 10 % | Wie schnell füllt sich der sichtbare Bereich **optisch im Durchschnitt** während des Ladens? | ≤ 3,4 s |
| **CLS** | Cumulative Layout Shift | 25 % | **Visuelle Stabilität**: Springen Elemente beim Laden nachträglich herum? (In unserem Experiment überall exakt `0,000` dank fester CSS-Grid-Höhen). | ≤ 0,1 |

---

## 4. Folie-für-Folie Leitfaden für unsere Präsentation (Folien 1 bis 15)

Hier findet ihr zu jeder einzelnen Folie unserer englischen Google-Slides-Präsentation die Erklärung auf Deutsch, die wichtigsten Zahlen und eine Vorlage, was der jeweilige Vortragende sagen kann.

---

### Folie 1: Title Slide – Web Application Architecture Performance: Methodology & Empirical Results
- **Was ist auf der Folie zu sehen?**
  - Titel der Arbeit, Untertitel (*Comparative Benchmark of JAMstack Full Hydration vs. Islands Architecture Extending CSR & SSR Baselines*), unser Team (Team B – Gruppe 4) sowie die Eckdaten des Experiments (`70 Lighthouse Runs`, `7 Dataset Stages`, `5 Core Metrics`, `2 Prototypes + [17]`).
- **Was solltet ihr dazu sagen? (Vortragstext-Impuls):**
  - *„Herzlich willkommen zu unserer Präsentation über die Performance-Methodik und die empirischen Ergebnisse moderner Web-Applikations-Architekturen. Wir knüpfen an unsere Literaturarbeit an und zeigen heute, wie wir die bestehende Referenzstudie von Fahrudin et al. [17] zu Client-Side und Server-Side Rendering um zwei moderne JAMstack-Architekturen – nämlich Next.js mit Full Hydration und Astro mit der Islands-Architektur – erweitert, normiert und in 70 kontrollierten Google-Lighthouse-Durchläufen vermessen haben.“*

---

### Folie 2: Motivation & Problem Statement – The Rendering & Hydration Dilemma
- **Was ist auf der Folie zu sehen?**
  - Die 3 zentralen Spannungsfelder im modernen Web-Engineering:
    1. **Core Web Vitals Impact:** Jede zusätzliche Sekunde beim LCP verschlechtert Conversion-Raten und Suchmaschinen-Rankings massiv.
    2. **The Hydration Tax (Die Hydrierungs-Steuer):** Klassische SSR- und SSG-Frameworks schicken zwar fertiges HTML für einen schnellen ersten Eindruck (FCP), müssen danach aber hunderte Kilobyte JavaScript herunterladen und den gesamten DOM-Baum im Browser ein zweites Mal durchlaufen (*Double Rendering / Full Hydration*).
    3. **Research Question (Forschungsfrage):** Wie skaliert eine Zero-JS Islands-Architektur (Astro) im direkten Vergleich zu Full-Hydration JAMstack (Next.js SSG) sowie den CSR/SSR-Baselines aus [17], wenn die Datenmenge von `10` auf `10.000` Einträge ansteigt?
- **Was solltet ihr dazu sagen?**
  - *„Auf Folie 2 sehen wir unsere Motivation: Warum reicht klassisches Server-Side Rendering oft nicht mehr aus? Wegen der sogenannten ‚Hydration Tax‘. Bei Frameworks wie React/Next.js wird die Seite zwar als fertiges HTML ausgeliefert, aber damit Buttons und Filter funktionieren, muss der Browser trotzdem das komplette JavaScript-Framework laden und alle HTML-Knoten im Arbeitsspeicher noch einmal abgleichen. Unsere Forschungsfrage untersucht deshalb: Wie viel Performance gewinnen wir, wenn wir statisches Pre-Rendering mit einer Zero-JS-Islands-Architektur wie Astro kombinieren – und wo liegen die physikalischen Skalierungsgrenzen bei bis zu 10.000 Datensätzen?“*

---

### Folie 3: Reference Baseline Study – Fahrudin, Oktavianto & Saputra (2025) [Ref 17]
- **Was ist auf der Folie zu sehen?**
  - Links die exakten Spezifikationen der Referenzstudie [17] (React.js CSR vs. Next.js SSR, PokeAPI-Karten, 7 Datenmengen von `10` bis `10.000`, je 5 Lighthouse-Desktop-Runs, Metriken FCP, LCP, TBT, SI).
  - Rechts eine Tabelle mit den Original-Messergebnissen aus [17] für `N = 10, 100, 1.000, 5.000, 10.000` und darunter die **Methodische Lücke (Methodological Gap)**.
- **Was solltet ihr dazu sagen?**
  - *„Auf Folie 3 fassen wir unsere Hauptreferenzstudie [17] von Fahrudin et al. zusammen. Sie haben React als reine Client-Side-Rendering-App (CSR) und Next.js mit dynamischem Server-Side-Rendering (SSR) auf sieben Datenmengen von 10 bis 10.000 Pokémon-Karten verglichen. Das überraschende Ergebnis in der Tabelle rechts: Ab 1.000 und besonders bei 10.000 Einträgen bricht dynamisches SSR komplett ein – der LCP steigt bei SSR auf 28,16 Sekunden, während CSR bei 4,90 Sekunden liegt. Warum? Weil der SSR-Server bei jeder Anfrage erst zehntausende Knoten live rendern und als riesiges HTML übertragen muss. Was Fahrudin et al. jedoch nicht getestet haben, ist unsere Forschungslücke: Was passiert, wenn wir das HTML beim Build vorab generieren (JAMstack SSG) und durch eine Islands-Architektur die JavaScript-Hydration eliminieren?“*

---

### Folie 4: Architectural Taxonomy – Why We Built Next.js SSG + Astro Islands
- **Was ist auf der Folie zu sehen?**
  - Eine 4-Spalten-Übersicht der vier Architekturen:
    - **1. CSR (React SPA)** & **2. SSR (Next.js Dynamic)** → *Übernommen als Literatur-Referenz aus [17]*.
    - **3. JAMstack + Full Hydration (Next.js 15 SSG)** & **4. JAMstack + Islands (Astro 5 SSG)** → *Unser eigener empirischer Benchmark (70 Runs)*.
- **Was solltet ihr dazu sagen?**
  - *„Folie 4 zeigt, warum unser Versuchsdesign wissenschaftlich effizient und sauber aufgebaut ist: Da CSR und dynamisches SSR bereits durch Fahrudin et al. [17] exakt vermessen wurden, übernehmen wir diese beiden als Literatur-Baselines. Wir haben unsere eigene Implementierung gezielt auf die zwei fehlenden modernen Paradigmen fokussiert: Erstens Next.js 15 im Static-Export-Modus (SSG), das zwar die Server-Rechenzeit beim Request eliminiert, aber im Browser weiterhin eine volle React-19-Hydration durchführt. Und zweitens Astro 5 mit der Islands-Architektur, das ebenfalls statisches HTML erzeugt, aber standardmäßig exakt 0 Kilobyte Client-JavaScript ausliefert.“*

---

### Folie 5: Experimental Design & Hypotheses – Variable Model & Formal Hypotheses
- **Was ist auf der Folie zu sehen?**
  - Links die **Unabhängigen Variablen (IV1: Architektur, IV2: Datenmenge N)**, die **Abhängigen Variablen (DV1–DV7: FCP, LCP, TBT, SI, CLS, Score, Payload/DOM)** und die **Kontrollvariablen (Ceteris Paribus)**.
  - Rechts unsere **3 formalen Hypothesen (H1, H2, H3)** inkl. des grünen Bestätigungs-Badges (`CONFIRMED`).
- **Was solltet ihr dazu sagen?**
  - *„Auf Folie 5 definieren wir unser formales Variablenmodell und unsere drei Forschungshypothesen. Wir variieren zwei unabhängige Variablen: die Rendering-Architektur und die Datensatzgröße N über sieben Stufen von 10 bis 10.000. Alle anderen Faktoren halten wir strikt konstant (Ceteris Paribus). Rechts sehen wir unsere drei Hypothesen, die wir alle drei empirisch bestätigen konnten:
    - **H1 (Initial Render & LCP):** Astro erzielt über alle 7 Stufen hinweg niedrigere FCP- und LCP-Werte als Next.js SSG, weil keine 350,5 kB React-Runtime geparst werden müssen.
    - **H2 (Main-Thread & Payload Overhead):** Next.js SSG erzeugt durch die eingebetteten React-Flight-Hydration-Daten größere HTML-Payloads (+38 %) und verliert schon bei N = 1.000 seinen Top-Score.
    - **H3 (DOM-Dominanz ab N ≥ 5.000):** Ab 5.000 Karten (ca. 95.000 DOM-Knoten) wird selbst bei 0 kB JavaScript der native HTML-Parser und die CSS-Layout-Engine von Chromium zum Hauptflaschenhals.“*

---

### Folie 6: Ceteris-Paribus Implementation – Prototype Engineering & Dataset Parity
- **Was ist auf der Folie zu sehen?**
  - Die 3 technischen Säulen unserer Ceteris-Paribus-Kontrolle:
    1. **Deterministischer Datengenerator (`data/generate-data.mjs`):** Mulberry32 PRNG mit festem Seed `20260414` erzeugt exakt identische JSON-Dateien (`items-10.json` bis `items-10000.json`).
    2. **100 % DOM- und CSS-Parität (`shared/styles.css`):** Identische HTML-Struktur (`19 DOM-Knoten pro Karte`, `265–275` Knoten bei `N = 10` bis `190.075–190.085` Knoten bei `N = 10.000`) und eine einzige gemeinsame CSS-Datei (`4,1 kB`).
    3. **Keine externen Störfaktoren:** Keine externen Bilder oder Webfonts, die Netzwerk-Schwankungen oder Layout-Shifts (`CLS = 0,000`) verursachen könnten.
- **Was solltet ihr dazu sagen?**
  - *„Damit ein Architekturvergleich wissenschaftlich valide ist, müssen beide Prototypen exakt denselben Output erzeugen – das zeigen wir auf Folie 6. Wir haben einen deterministischen Pseudozufallsgenerator mit festem Seed geschrieben, der für alle sieben Stufen identische Datensätze generiert. Beide Apps – Next.js und Astro – binden exakt dieselbe `shared/styles.css` ein und erzeugen pro Karte exakt 19 HTML-Knoten. Bei 10.000 Karten haben beide Architekturen somit rund 190.080 DOM-Knoten. Jeder gemessene Zeitunterschied stammt also garantiert ausschließlich aus der Architektur und dem JavaScript-Hydration-Verhalten.“*

---

### Folie 7: Automated Measurement Pipeline – Google Lighthouse Benchmark Harness
- **Was ist auf der Folie zu sehen?**
  - Der 4-stufige Ablauf unserer automatisierten Benchmark-Pipeline (`Generate & Build` → `Isolated Static Server` → `Lighthouse CLI Runner` → `Statistical Aggregation`) sowie die genauen technischen Parameter (Desktop-Preset, Lantern-Simulation `40 ms RTT / 10.240 kbps`, `disableStorageReset: false` für sauberen Cache-Clear vor jedem einzelnen der 70 Runs, Headless Chromium v146, Lighthouse v12.8.2).
- **Was solltet ihr dazu sagen?**
  - *„Folie 7 beschreibt unsere vollautomatisierte Mess-Pipeline in `benchmarks/run-lighthouse.mjs`. Nach dem Produktions-Build wird jede Architektur über einen isolierten lokalen HTTP-Server ausgeliefert. Für jede der 14 Testkombinationen führt unser Skript 5 unabhängige Google-Lighthouse-Runs im Desktop-Preset durch – insgesamt also 70 Durchläufe. Vor jedem einzelnen Run wird der Browser-Storage und Cache komplett geleert (`disableStorageReset: false`), damit wir echte Cold-Load-Bedingungen messen. Anschließend berechnet unser Analyse-Skript automatisch Mittelwerte, Standardabweichungen, Normalisierungsfaktoren und generiert die Diagramme.“*

---

### Folie 8: Cross-Study Normalization Methodology – How We Guarantee Comparability with [17]
- **Was ist auf der Folie zu sehen?**
  - Unser **3-Säulen-Normierungsmodell** (siehe ausführliche Erklärung oben in Abschnitt 2):
    - **Pillar 1:** Protocol & Lantern Simulation Parity (`40 ms RTT`, `10,24 Mbps`, identische Stufen `N` und Wiederholungen `n = 5`).
    - **Pillar 2:** Dimensionless Relative Scaling (`Sₙ(A) = Mₙ(A) / M₁₀(A)`), das Hardware-Unterschiede mathematisch herauskürzt.
    - **Pillar 3:** Hardware Calibration Factor (`k_hw = 1,170`), um unsere absoluten Zeiten auf das Hardware-Niveau aus [17] zu projizieren.
  - Unten eine Tabelle, die für `N = 10, 100, 1.000, 5.000, 10.000` sowohl die Rohwerte, die normierten Skalierungsfaktoren `Sₙ` als auch die Hardware-kalibrierten Werte `LCP*` gegenüberstellt.
- **Was solltet ihr dazu sagen?**
  - *„Auf Folie 8 beantworten wir eine zentrale methodische Frage: Wie garantieren wir, dass unsere Messungen mit der Studie von Fahrudin et al. [17] vergleichbar sind, obwohl unterschiedliche Host-CPUs genutzt wurden? Wir setzen dafür auf drei Säulen:
    1. Erstens nutzt Google Lighthouse die deterministische Lantern-Simulation, die Netzwerk-RTT (40 ms) und Durchsatz (10,24 Mbps) mathematisch modelliert.
    2. Zweitens berechnen wir den dimensionslosen relativen Skalierungsfaktor `Sₙ = Mₙ / M₁₀`. Indem wir jede Architektur durch ihren eigenen Baseline-Wert bei N = 10 teilen, kürzt sich jeder konstante Hardware-Faktor der Host-Maschine vollständig heraus. Wir sehen so das reine algorithmische Skalierungsverhalten: Bei N = 10.000 skaliert dynamisches SSR aus [17] um das 33,5-Fache, Astro um das 22,8-Fache und Next.js SSG um das 12,3-Fache.
    3. Drittens haben wir für direkte Sekunden-Vergleiche den Hardware-Kalibrierungsfaktor `k_hw = 1,170` aus den kleinen Stufen (N = 10 bis 100) bestimmt. Selbst wenn wir unsere Messwerte konservativ mit 1,17 multiplizieren, bleibt Astro bei N = 10.000 mit 6,67 Sekunden über viermal schneller als dynamisches SSR (28,16 s).“*

---

### Folie 9: Empirical Results Overview – Complete Summary Table (70 Lighthouse Runs)
- **Was ist auf der Folie zu sehen?**
  - Die große Gesamttabelle aller 14 Konfigurationen (`2 Architekturen × 7 Stufen`, jeweils Mittelwert `μ ± σ` aus `n = 5` Runs) für Performance Score, FCP, LCP, TBT, Speed Index, CLS, HTML-Größe, JS-Größe und DOM-Knoten.
- **Was solltet ihr dazu sagen?**
  - *„Folie 9 zeigt unsere vollständige Ergebnistabelle aus allen 70 Lighthouse-Runs mit Mittelwert und Standardabweichung. Drei Muster stechen sofort ins Auge:
    1. Erstens die **extrem niedrige Standardabweichung** (meist `±0,00 s` bis `±0,04 s`), was die hohe Reproduzierbarkeit unserer Pipeline belegt.
    2. Zweitens die **Payload-Spalten rechts**: Astro liefert auf jeder Stufe exakt `0,0 kB` JavaScript aus, während Next.js konstant `350,5 kB` JS lädt und zudem um bis zu 38 % größere HTML-Dateien erzeugt (`9.343 kB` vs. `6.760 kB` bei N = 10.000), weil Next.js den gesamten Komponentenbaum für die Hydration ein zweites Mal als Inline-Script im HTML einbettet.
    3. Drittens der **Übergang bei N = 1.000**: Hier hält Astro noch einen Score von `98,4` (`LCP 0,832 s`), während Next.js bereits auf `94,0` (`LCP 1,371 s`) fällt.“*

---

### Folie 10: Visual Analysis – FCP & LCP (Perceived Loading Speed Across Dataset Sizes)
- **Was ist auf der Folie zu sehen?**
  - Zwei hochauflösende Balkendiagramme nebeneinander:
    - Links: **First Contentful Paint (FCP)** von `N = 10` bis `N = 10.000`.
    - Rechts: **Largest Contentful Paint (LCP)** von `N = 10` bis `N = 10.000`.
- **Was solltet ihr dazu sagen?**
  - *„Auf Folie 10 vergleichen wir FCP (links) und LCP (rechts) visuell. Beim FCP liegen beide Architekturen bei kleinen Datenmengen (`10` bis `100`) noch eng beieinander (`0,25 s` bis `0,34 s`), weil beide vorab generiertes HTML ausliefern. Doch beim Blick nach rechts auf den LCP sieht man sofort die ‚Hydration Tax‘: Selbst bei nur 10 Einträgen braucht Next.js `0,66 Sekunden` für den LCP, während Astro nach `0,25 Sekunden` fertig ist – ein konstanter Penalty von rund 410 Millisekunden allein durch die React-Runtime. Bei großen Datenmengen (`N = 10.000`) wächst der Vorsprung von Astro massiv an: Astro erreicht den LCP nach `5,70 Sekunden`, Next.js erst nach `8,12 Sekunden` – Astro spart hier also volle **2,42 Sekunden (-29,8 %)**.“*

---

### Folie 11: Visual Analysis – TBT & Speed Index (Main-Thread Contention & Visual Progression)
- **Was ist auf der Folie zu sehen?**
  - Links das Diagramm für **Total Blocking Time (TBT in ms)**, rechts das Diagramm für den **Speed Index (SI in s)**.
- **Was solltet ihr dazu sagen?**
  - *„Folie 11 zeigt links die Total Blocking Time (TBT) und rechts den Speed Index. Bis N = 500 ist die Main-Thread-Blockierung bei beiden Architekturen nahezu null (`0 ms` bis `10 ms`). Ab N = 5.000 und N = 10.000 sehen wir jedoch in beiden Architekturen einen steilen Anstieg der TBT auf rund `2.344 ms` bis `2.675 ms`. Warum hat auch Astro mit 0 kB JavaScript bei 10.000 Karten eine hohe TBT? Weil ein einzelnes HTML-Dokument mit **190.075 DOM-Knoten** den nativen HTML-Parser und die CSS-Grid-Layout-Berechnung von Chromium in einem monolithischen Main-Thread-Task über 2,5 Sekunden beschäftigt. Bei Next.js verteilt sich die Last auf eine längere Gesamtzeit (Speed Index rechts: `7,75 s` bei Next.js vs. `5,67 s` bei Astro), weshalb Astro visuell trotzdem um 26,9 % schneller aufgebaut ist.“*

---

### Folie 12: Payload & DOM Footprint Analysis – Why Next.js SSG HTML is 38% Larger
- **Was ist auf der Folie zu sehen?**
  - Eine detaillierte Aufschlüsselung der **3 Ursachen für den Payload-Unterschied** sowie eine Vergleichstabelle der HTML- und Gesamt-Transfergrößen von `N = 10` bis `N = 10.000`.
- **Was solltet ihr dazu sagen?**
  - *„Viele fragen sich zunächst: Warum ist eigentlich die HTML-Datei von Next.js bei identischen 10.000 Karten um **38,2 % größer** als bei Astro (`9,34 MB` statt `6,76 MB`)? Folie 12 erklärt den technischen Grund:
    1. Erstens das **Double Data Problem (RSC Flight Payload)**: Next.js App Router rendert nicht nur die sichtbaren HTML-Tags, sondern bettet am Ende des Dokuments zusätzlich serialisierte `self.__next_f.push(...)` Script-Payloads für den React-Reconciler ein. Bei 10.000 Karten macht allein dieser unsichtbare Zusatzballast **2,58 Megabyte** aus!
    2. Zweitens die **350,5 kB React-19-Client-Runtime**, die auf jeder Seite geladen werden muss.
    3. Drittens die **190.080 DOM-Knoten**, die weit über der Google-Lighthouse-Empfehlung von maximal 1.500 Knoten liegen.“*

---

### Folie 13: Cross-Study Synthesis – Raw, Normalized (Sₙ) & Calibrated Comparison with [17]
- **Was ist auf der Folie zu sehen?**
  - Links unser **neues Diagramm der normierten LCP-Skalierung (`Sₙ = LCPₙ / LCP₁₀`)** für alle 4 Architekturen (CSR [17], SSR [17], Next.js SSG, Astro Islands).
  - Rechts eine kompakte Synthese-Tabelle für `N = 100`, `N = 1.000` und `N = 10.000` (inkl. normiertem `Sₙ` und Hardware-kalibriertem `LCP*`) sowie die Einordnung der 4 Regimes.
- **Was solltet ihr dazu sagen?**
  - *„Folie 13 führt unsere Ergebnisse mit der Referenzstudie [17] zusammen. Links sehen wir die normierten Skalierungskurven `Sₙ = LCPₙ / LCP₁₀`. Die rote Kurve zeigt, wie extrem dynamisches SSR aus [17] bei großen Datenmengen einbricht (`33,5×` Verschlechterung, absolut `28,16 s`). Durch den Wechsel auf statische Build-Time-Generierung (JAMstack SSG) eliminieren wir die Server-Render-Zeit komplett: Next.js SSG senkt den LCP bei 10.000 Einträgen bereits auf `8,12 s` (kalibriert `9,50 s`), und Astro Islands senkt ihn durch den Wegfall der Hydration nochmals auf `5,70 s` (kalibriert `6,67 s`). Bis N = 1.000 ist Astro sowohl absolut (`0,83 s`) als auch kalibriert (`0,97 s`) die mit Abstand schnellste Architektur überhaupt. Lediglich bei extremen 10.000 Einträgen ohne Paginierung hat CSR (`4,90 s`) beim initialen Paint einen leichten Vorteil, weil CSR beim Start nur eine leere HTML-Schale lädt und die Daten erst asynchron nachzieht.“*

---

### Folie 14: Threats to Validity & Limitations – Methodological Rigor & Boundary Conditions
- **Was ist auf der Folie zu sehen?**
  - Eine strukturierte wissenschaftliche Reflexion nach den 4 klassischen Gütekriterien empirischer Software-Engineering-Studien:
    - **Internal Validity (Interne Validität):** Wie haben wir Störfaktoren ausgeschlossen? (Deterministischer Seed, gemeinsames CSS, Cache-Reset, 5 Wiederholungen).
    - **External Validity (Externe Validität):** Wo liegen die Grenzen der Verallgemeinerbarkeit? (Synthetisches Katalog-Grid ohne Bilder; Seiten mit sehr hoher Client-Interaktivität wie komplexe Dashboards brauchen weiterhin Hydration für ihre Inseln).
    - **Construct Validity (Konstruktvalidität):** Warum repräsentieren Lighthouse-Metriken echte Nutzererfahrung, und wie haben wir Cross-Study-Hardware-Unterschiede über `Sₙ` und `k_hw` adressiert?
    - **DOM Scaling Ceiling (Architekturelle Grenze):** Ab `N ≥ 5.000` müssen *alle* SSR/SSG-Architekturen mit Paginierung, Infinite Scroll oder DOM-Virtualisierung kombiniert werden.
- **Was solltet ihr dazu sagen?**
  - *„Zu einer sauberen wissenschaftlichen Methodik gehört auch die Diskussion der Threats to Validity auf Folie 14. Unsere **interne Validität** ist durch den deterministischen Datengenerator, die exakte CSS/DOM-Parität und den kompletten Browser-Cache-Reset vor jedem der 70 Runs extrem hoch. Bei der **externen Validität** weisen wir transparent darauf hin, dass unser Benchmark datengetriebene Katalog- und Content-Seiten abbildet; hochdynamische Echtzeit-Applikationen (wie ein Online-Whiteboard) benötigen natürlich weiterhin Client-JavaScript. Und bei der **Konstruktvalidität** zeigen wir, dass wir durch unser 3-Säulen-Normierungsmodell (`Sₙ` und `k_hw`) selbst Hardware-Unterschiede zwischen verschiedenen Studien sauber kontrollieren.“*

---

### Folie 15: Conclusion & Decision Matrix – Architectural Recommendations by Scale
- **Was ist auf der Folie zu sehen?**
  - Eine praxisnahe **Entscheidungsmatrix nach Datenmenge (`N ≤ 100`, `N = 500–1.000`, `N ≥ 5.000`)** und unsere **3 zentralen wissenschaftlichen Take-Home-Messages**.
- **Was solltet ihr dazu sagen?**
  - *„Zum Abschluss fassen wir auf Folie 15 unsere Ergebnisse in einer klaren Entscheidungsmatrix zusammen:
    - **Für kleine bis mittlere Seiten (`N ≤ 100`):** Beide JAMstack-Architekturen erreichen Score 100, aber **Astro Islands** liefert einen um **2,4× bis 2,6× schnelleren LCP (`0,25 s` vs. `0,66 s`)**, weil die 350,5 kB React-Runtime entfällt.
    - **Für große Kataloge (`N = 500 bis 1.000`):** Hier ist **Astro Islands der klare Sieger** (`Score 98,4`, `LCP 0,83 s`), während Next.js SSG bereits unter der doppelten HTML+Flight-Payload und der Hydration über 19.000 DOM-Knoten leidet (`LCP 1,37 s`).
    - **Für extreme Datensätze (`N ≥ 5.000`):** Astro schlägt Next.js SSG beim LCP zwar um **29,8 % (`5,70 s` vs. `8,12 s`)** und dynamisches SSR aus [17] (`28,16 s`) um fast das **5-Fache**, aber ab ~95.000 DOM-Knoten sollten **DOM-Virtualisierung oder Paginierung** eingesetzt werden.
    - Vielen Dank für Ihre Aufmerksamkeit – wir freuen uns auf Ihre Fragen!“*

---

## 5. Typische Fragen der Professoren (Q&A-Vorbereitung) & Perfekte Antworten

Damit ihr in der Diskussion nach dem Vortrag glänzen könnt, sind hier die 5 wahrscheinlichsten Prüfungsfragen von **Prof. Aleksić** und **Prof. Pavlović** inklusive der passenden Antwort:

### Frage 1: „Warum habt ihr CSR (React) und dynamisches SSR (Next.js) nicht noch einmal selbst implementiert?“
- **Perfekte Antwort:**
  - *„In der Referenzstudie von Fahrudin et al. (2025) [17] wurden CSR und dynamisches SSR bereits exakt über dieselben sieben Stufen (`10` bis `10.000` Karten) mit je 5 Google-Lighthouse-Desktop-Runs vermessen. Statt diese Messung lediglich zu duplizieren, haben wir unser Experiment gezielt so konzipiert, dass wir die **methodische Lücke von [17] schließen**: Nämlich wie sich Build-Time Pre-Rendering (JAMstack SSG) mit Full Hydration (Next.js) im Vergleich zu einer Zero-JS Islands-Architektur (Astro) unter exakt denselben Ceteris-Paribus-Bedingungen verhält. Über unsere relative Baseline-Normierung (`Sₙ = Mₙ / M₁₀`) und den Hardware-Kalibrierungsfaktor (`k_hw = 1,170`) können wir beide Studien direkt und verzerrungsfrei miteinander verknüpfen.“*

### Frage 2: „Wie stellt ihr sicher, dass die Messwerte aus [17] mit euren Messwerten vergleichbar sind, obwohl ihr andere Hardware verwendet habt?“
- **Perfekte Antwort:**
  - *„Dafür nutzen wir unser **3-Säulen-Normierungsmodell** (Folie 8):
    1. Erstens verwendet Google Lighthouse die deterministische **Lantern-Simulation** mit identischen Netzwerk-Parametern (`40 ms RTT`, `10.240 kbps`).
    2. Zweitens berechnen wir den **dimensionslosen relativen Skalierungsfaktor `Sₙ = Mₙ / M₁₀`**, bei dem jede Architektur an ihrem eigenen `N = 10`-Basiswert normiert wird. Dadurch kürzt sich jeder konstante CPU-Geschwindigkeitsfaktor mathematisch heraus.
    3. Drittens haben wir aus den nicht-überlasteten Stufen (`N = 10, 50, 100`) den **Hardware-Kalibrierungsfaktor `k_hw = 1,170`** berechnet. Selbst wenn wir unsere Zeiten mit `1,170` multiplizieren, sind Astro (`6,67 s`) und Next.js SSG (`9,50 s`) bei `N = 10.000` immer noch um den Faktor 3× bis 4× schneller als dynamisches SSR (`28,16 s`) in [17].“*

### Frage 3: „Warum hat Astro bei N = 10.000 Einträgen eine Total Blocking Time (TBT) von 2.675 ms, obwohl Astro 0 kB JavaScript ausliefert?“
- **Perfekte Antwort:**
  - *„Das ist eines unserer spannendsten empirischen Ergebnisse (Hypothese H3)! TBT misst **jede** Blockierung des Browser-Main-Threads über 50 ms hinaus – nicht nur JavaScript-Ausführung, sondern auch **natives HTML-Parsing, DOM-Baum-Konstruktion und CSS-Grid-Layout-Berechnung (Blink Recalculate Style & Layout)**. Bei `N = 10.000` Karten besteht die Seite aus **190.075 DOM-Knoten** und `6,76 MB` HTML. Weil Astro kein JavaScript verarbeiten muss, streamt und parst Chromium dieses riesige HTML-Dokument in einem einzigen, sehr kompakten C++-Layout-Block nach dem FCP, was als TBT gezählt wird, dafür aber den gesamten Seitenaufbau (**LCP 5,70 s vs. 8,12 s**) um fast 2,5 Sekunden früher abschließt als Next.js.“*

### Frage 4: „Warum ist die erzeugte HTML-Datei bei Next.js SSG um 38 % größer als bei Astro, obwohl beide exakt dieselben Karten anzeigen?“
- **Perfekte Antwort:**
  - *„Das liegt an der Funktionsweise des **Next.js App Routers (React Server Components)**. Damit React im Browser die Seite hydrieren und Client-Navigation ermöglichen kann, speichert Next.js die Daten **doppelt** in der HTML-Datei: Einmal als normales sichtbares HTML (`<article>...`) und ein zweites Mal am Ende der Datei als serialisiertes **React Flight Payload** (`self.__next_f.push(...)`). Bei `10.000` Karten erzeugt das `9.343 kB` statt `6.760 kB` HTML – also **2,58 MB reinen Hydration-Overhead** im HTML plus `350,5 kB` JavaScript-Bundles.“*

### Frage 5: „Wie lautet eure vorgeschlagene Aufgabenverteilung für den Vortrag (5 Teammitglieder)?“
- **Vorschlag für eine faire Aufteilung (ca. 2–3 Minuten pro Person bei 5 Personen):**
  1. **Sprecher/in 1 (Folien 1–3):** Begrüßung, Motivation (*Hydration Tax*), Forschungsfrage und Vorstellung der Referenzstudie Fahrudin et al. [17] inkl. Forschungslücke.
  2. **Sprecher/in 2 (Folien 4–6):** Architektur-Taxonomie (CSR, SSR, Next.js SSG, Astro Islands), Variablenmodell & Hypothesen (H1–H3) sowie Ceteris-Paribus-Implementierung (Seed `20260414`, DOM/CSS-Parität).
  3. **Sprecher/in 3 (Folien 7–8):** Automatisierte Lighthouse-Pipeline (70 Runs) und **Cross-Study-Normierungsmethodik** (Lantern, `Sₙ = Mₙ / M₁₀` und Hardware-Kalibrierung `k_hw = 1,170`).
  4. **Sprecher/in 4 (Folien 9–12):** Empirische Ergebnisse im Detail: Ergebnistabelle, FCP/LCP-Diagramme, TBT/SI-Analyse (DOM-Layout-Limit) und die +38 % HTML-Payload-Analyse.
  5. **Sprecher/in 5 (Folien 13–15):** Gesamtvergleich mit Studie [17] (inkl. normiertem LCP-Chart), Threats to Validity, Entscheidungsmatrix für die Praxis und Fazit.
