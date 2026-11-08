# AGENTS.md – AI Agent & Developer Context Guide

Diese Datei dient als zentrales Gedächtnis und Regelwerk für KI-Agenten (Antigravity, Cursor, GitHub Copilot, Claude Code etc.) sowie für alle Teammitglieder, die an diesem Repository arbeiten. **Lies diese Datei vollständig durch, bevor du Code schreibst, Benchmarks ausführst oder Texte für das Paper entwirfst.**

---

## 1. Projekt-Kontext & Akademischer Rahmen

* **Hochschule:** Hochschule Campus Wien (University of Applied Sciences)
* **Lehrveranstaltung:** Research Methods (2026)
* **Vortragende / Prüfer:** Prof. Slaviša Aleksić & Prof. Aleksandar Pavlović
* **Autoren (Team B – Gruppe 4):** Fabio Gschweidl, Desirée Iris Hackl, Marco Miklautz, Lorenz Schneider, Danijel Trailovic
* **Thema (#14):** *Evaluate the impact of web application architecture on performance. Provide technical advice for scalable design of a specific web application architecture.*
* **Research Gap:** Bestehende Studien vergleichen meist nur klassisches Client-Side Rendering (CSR) und Server-Side Rendering (SSR) in Einzelanwendungen, untersuchen jedoch kaum **Jamstack-Architekturen (Next.js / Astro)** im direkten Vergleich zu **SPA mit AJAX** – insbesondere nicht unter variabler Daten- und Traffic-Last (Datenmengen-Skalierung, Traffic Spikes, Concurrent Users).
* **Research Question (RQ):**
  > *"How do Single-Page Application (SPA) architectures using AJAX and Jamstack architectures using frameworks such as Next.js and Astro compare in terms of load time, rendering speed, and stability under variable traffic conditions (including sudden traffic spikes and high concurrent-user loads)?"*

---

## 2. Erwartungen der Professoren (aus Vorlesung 03-Methodology & 04-Documentation)

Beim Entwerfen des Versuchsaufbaus, der Benchmarks, der Grafiken und der Dokumentation **müssen** folgende Vorgaben aus den Vorlesungsfolien eingehalten werden:

### 2.1 Methodische Einordnung (DOT-Framework – Vorlesung 3, Folie 23–24)
* Unsere Forschungsmethodik nutzt **Development Oriented Triangulation (DOT)**:
  * **Library:** *Literature study* (PRISMA-Review mit 38 eingeschlossenen Papers ist bereits abgeschlossen) + *Available product / Competitive analysis*.
  * **Lab / Workshop:** *Prototyping* (Entwicklung der Vergleichs-Web-Apps) + *Non-functional test / System test / A/B testing*.
  * **Showroom:** *Benchmark test* (standardisierte Messung über Google Lighthouse CLI & Vergleich mit Referenzstudien).

### 2.2 Strikt getrennte Struktur: *Scenario* vs. *Methodology* (Vorlesung 4, Folie 4, 8–10, 32–48)
1. **Scenario (Boundary Conditions – Folie 8):**
   * Definiert die Rahmenbedingungen, das Anwendungsszenario und die technische Testumgebung (CPU, RAM, OS, Node.js-Version, Chrome-Version, Netzwerk-Throttling, Datengrößen).
   * *Regel:* Nur Fakten nennen, die für das Verständnis und die Reproduzierbarkeit der Ergebnisse im weiteren Verlauf benötigt werden (*"Provide only facts that will be used in the following"*).
2. **Methodology ("How did we slay the dragon?" – Folie 9, 32–48):**
   * Gliedert sich in: **Research Gap Identification $\rightarrow$ Development $\rightarrow$ Evaluation**.
   * Muss die 4 Qualitätskriterien erfüllen: **Clarity and Focus**, **Reliability** (Reproduzierbarkeit), **Validity** (Eignung der Methode für die RQ) und **Transparency**.

### 2.3 Die 4 Pflichtfragen im Benchmarking-Setup (Vorlesung 4, Folie 42–48)
Jedes Benchmark-Setup muss explizit diese vier Fragen beantworten:
1. **Baselines (Folie 42):** *Which baselines do you compare your approach against and why?*
   * Eigene Baseline: Klassische **SPA mit AJAX** (React CSR) als Industriestandard.
   * Literatur-Baseline: Empirische Messreihe von **Fahrudin et al. (2025) [Ref 17]** (Laravel Blade SSR vs. React/Vue CSR) sowie **Lonka (2023) [Ref 30]**.
2. **Datasets / Workloads (Folie 43):** *Which datasets do you use for evaluation and why?*
   * Gestaffelte Datenmengen $N \in \{10, 50, 100, 500, 1.000, 5.000, 10.000\}$ Datensätze (exakt angelehnt an Fahrudin et al., 2025), um den Schwellenwert (*Performance Threshold*) zwischen kleinen Ansichten und datenintensiven Views zu bestimmen.
3. **Metrics (Folie 44):** *Which metrics did you use and why are they suitable?*
   * **First Contentful Paint (FCP):** Wahrgenommene initiale Ladegeschwindigkeit (erster visueller Inhalt).
   * **Largest Contentful Paint (LCP):** Ladezeit des Hauptinhalts (*Load Time*, Google Core Web Vital, Ziel $< 2.5\text{ s}$).
   * **Speed Index (SI):** Maß für die visuelle *Rendering Speed* über den gesamten Ladeverlauf.
   * **Total Blocking Time (TBT):** Maß für Main-Thread-Blockierung durch JavaScript/Hydration und post-load Interaktivität (Ziel $< 200\text{ ms}$).
   * **Gesamt-Ladezeit-Toleranz:** Maximal $10\text{ s}$ nach Jakob Nielsen (*Usability Engineering*).
   * **Server-Metriken unter Last (optional/ergänzend für Traffic Spikes):** **Time to First Byte (TTFB)**, **Requests per Second (RPS)** und **p99 Latency** unter gleichzeitigen Verbindungen.
4. **Comparability & Statistical Rigor (Folie 45 & 48):** *How do you ensure that the results are (a) comparable and (b) not simply due to chance?*
   * **(a) Comparability (*Ceteris Paribus*):** Alle Apps rendern exakt dieselben JSON-Daten, nutzen exakt dasselbe HTML/CSS-Layout, laufen lokal auf derselben Hardware ohne externe Netzwerk-Schwankungen und werden im isolierten Headless-Chrome (Incognito, geleerter Cache, keine Extensions) getestet.
   * **(b) Not due to chance:** Jeder Testpunkt (Architektur $\times$ Datenmenge $N$) wird mindestens **$n = 5$ bis $n = 10$ Mal** automatisiert über die Lighthouse CLI ausgeführt. Es werden **Mittelwert ($\mu$), Median und Standardabweichung ($\sigma$) bzw. Konfidenzintervalle** berichtet (Folie 11: *"Gives quantified proofs: statistical tests, confidence intervals"*).

### 2.4 Schreibstil & Visualisierungs-Regeln (Vorlesung 3 & 4)
* **Abstract (Vorlesung 3, Folie 9–12):** *Past (perfect) tense* und **Passive voice (!)**; muss konkrete Ergebniszahlen (*summary numbers*) enthalten; **keine** Zitate `[1]`, **keine** URLs und **keine** unerklärten Abkürzungen im Abstract!
* **Scenario & Methodology (Vorlesung 3, Folie 22 & Vorlesung 4, Folie 8):** *Past tense* und **Active voice (!)** (z. B. *"We implemented three prototypes..."*, *"We decided to cap the dataset at 10,000 entries because..."*).
* **Results (Vorlesung 4, Folie 11, 51–60):**
  * **Klare Trennung:** Eigene Messwerte und Messwerte aus Fahrudin et al. [17] / Lonka [30] müssen klar getrennt bzw. gekennzeichnet werden (*"Make clear separation between yours and others work"*).
  * **Visual Cues (Folie 51):** In Ergebnistabellen wird der jeweils beste Wert pro Zeile/Spalte **fett** hervorgehoben.
  * **Diagramm-Regeln (Folie 55–60, "Hall of Shame"):** Keine Kreisdiagramme (Pie Charts)! Liniendiagramme für Skalierung über $N$ verwenden; Y-Achsen müssen bei $0$ beginnen und konsistent skaliert sein; Ausreißer (Outliers) niemals verstecken, sondern offen erklären!

---

## 3. Referenzdaten aus der Primärstudie: Fahrudin et al. (2025) [Ref 17]

Damit KI-Agenten bei der Auswertung und beim Erstellen von Vergleichstabellen sofort auf die exakten Referenzwerte von **Fahrudin, Kusumasari & Alam (2025)** (*"A Performance Comparison of Frontend Rendering Strategies in Laravel Applications"*, IEEE ICEEIE 2025) zugreifen können, sind hier die Originaldaten aus **Table III (S. 4)** hinterlegt:

### Testumgebung von Fahrudin et al. (2025)
* **Hardware/OS:** Windows 11 Pro 64-bit, 11th Gen Intel Core i5-1135G7 (2.40 GHz, 8 CPUs), 16 GB RAM
* **Browser/Tool:** Google Chrome v136.x (64-bit) Incognito Mode ohne Extensions, lokales Hosting, Google Lighthouse (DevTools)
* **Untersuchte Systeme:** Laravel 12 Backend mit (1) **Blade (SSR)**, (2) **React (CSR via Inertia.js)**, (3) **Vue (CSR via Inertia.js)**
* **Testobjekt:** Academic Assessment Management System – Haupt-Datenlistenseite mit $N \in \{10, 50, 100, 500, 1.000, 5.000, 10.000\}$ Einträgen (Abbruchkriterium / Komfortgrenze nach Jakob Nielsen: $10\text{ s}$).

### Exakte Messwerte von Fahrudin et al. (2025) – Table III

| Data Load ($N$) | Framework (Rendering) | FCP (s) | LCP (s) | TBT (ms) | Speed Index (s) |
| ---: | :--- | ---: | ---: | ---: | ---: |
| **10** | Blade (SSR) | **0.9** | **1.1** | **30** | **1.0** |
| **10** | React (CSR / SPA) | 2.5 | 4.0 | 80 | 2.7 |
| **10** | Vue (CSR / SPA) | 2.2 | 3.6 | **30** | 2.4 |
| **50** | Blade (SSR) | **0.9** | **1.2** | 110 | **1.1** |
| **50** | React (CSR / SPA) | 2.5 | 4.1 | **90** | 2.7 |
| **50** | Vue (CSR / SPA) | 2.0 | 3.3 | **90** | 2.0 |
| **100** | Blade (SSR) | **1.0** | **1.1** | 210 | **1.4** |
| **100** | React (CSR / SPA) | 2.6 | 4.1 | 150 | 2.8 |
| **100** | Vue (CSR / SPA) | 2.3 | 3.6 | **40** | 2.3 |
| **500** | Blade (SSR) | **1.3** | **1.6** | 760 | **1.7** |
| **500** | React (CSR / SPA) | 2.9 | 4.5 | 160 | 2.9 |
| **500** | Vue (CSR / SPA) | 2.6 | 3.9 | **50** | 2.6 |
| **1,000** | Blade (SSR) | **1.7** | **1.9** | *0 (Anomalie)* | **1.7** |
| **1,000** | React (CSR / SPA) | 3.8 | 5.3 | 80 | 3.8 |
| **1,000** | Vue (CSR / SPA) | 3.4 | 4.7 | 110 | 3.4 |
| **5,000** | Blade (SSR) | **5.6** | **5.6** | 900 | **5.6** |
| **5,000** | React (CSR / SPA) | 8.8 | 10.3 | **50** | 8.8 |
| **5,000** | Vue (CSR / SPA) | 8.3 | 9.6 | 220 | 8.3 |
| **10,000** | Blade (SSR) | **10.2** | **10.3** | 2,790 | **10.2** |
| **10,000** | React (CSR / SPA) | 15.5 | 17.0 | **70** | 15.5 |
| **10,000** | Vue (CSR / SPA) | 15.0 | 16.4 | 460 | 15.0 |

### Zentrale Erkenntnisse & Diskussionspunkte aus Fahrudin et al. (2025)
1. **SSR vs. CSR Trade-off:** Klassisches SSR (Blade) gewinnt bei FCP, LCP und Speed Index über alle Datengrößen hinweg, leidet aber ab $N = 5.000$ massiv unter einer steigenden **Total Blocking Time (TBT = 900 ms bei 5.000; 2.790 ms bei 10.000)**, da der Browser ein riesiges servergeneriertes HTML-Dokument auf einmal parsen und verarbeiten muss.
2. **10-Sekunden-Schwelle (Jakob Nielsen):** Ab $N = 10.000$ überschreiten sowohl Blade SSR ($10.2\text{ s}$) als auch React/Vue CSR ($15.5\text{ s}$ / $15.0\text{ s}$) die 10-Sekunden-Toleranzgrenze beim initialen Laden.
3. **Motivation für unser Jamstack-Experiment:** Fahrudin et al. schlagen auf S. 5 vor, hybride / moderne Architekturen (wie Next.js) quantitativ zu testen, um herauszufinden, ob sich der schnelle Initial Load von vorgerendertem HTML (SSG/SSR) mit einer niedrigen Total Blocking Time (z. B. durch **Astro Islands / Partial Hydration** vs. **Next.js Full Hydration**) verbinden lässt.

---

## 4. Weitere wichtige Referenzwerte aus unserem PRISMA-Pool

1. **Touko Lonka (2023) [Ref 30] – Web-Shop Benchmark (10 vs. 100 Items, Lighthouse Mobile, $n = 5$ Runs):**
   * **Page Weight (JS Reduction vs. React SPA Baseline):** Next.js (React) reduziert Client-JS um **$54\%$**, Astro (React Islands) um **$17\%$**, Astro (Preact Islands) um **$82\%$**, Astro (Solid Islands) um **$84\%$**.
   * **Lighthouse Performance (vs. React SPA Baseline auf Homepage):** Next.js verbessert FCP/TTI um **ca. $58–60\%$** und LCP um **$20–32\%$**; Astro verbessert FCP/TTI um **$40–46\%$** und LCP um **$25–39\%$**.
   * **Wichtige Beobachtung bei 10 vs. 100 Produkten:** Bei Astro steigt die Gesamt-HTML-Größe von 10 auf 100 Produkten stärker an als bei Next.js (React Server Components).
2. **Yavuz & Miladinovic (2023) [Ref 2] – FH Campus Wien Masterarbeit (CSR vs. SSR mit Rehydration in Angular):**
   * **CSR (SPA):** Performance Score **48**, FCP **4,5 s**, Speed Index **4,5 s**, LCP **5,0 s**, TTI **5,0 s**.
   * **SSR mit Rehydration:** Performance Score **87**, FCP **1,4 s**, Speed Index **1,4 s**, LCP **1,7 s**, TTI **1,7 s**.
3. **Nikita Shitov (2025) [Ref 6] – React (Vite CSR) vs. Next.js (SSR):**
   * **React CSR:** Lighthouse Performance **55**, SEO **79**, FCP **180 ms**, LCP **270 ms**, TTI **310 ms**, TBT **320 ms**, CLS **0.11**.
   * **Next.js SSR:** Lighthouse Performance **89**, SEO **100**, FCP **120 ms**, LCP **160 ms**, TTI **200 ms**, TBT **160 ms**, CLS **0.05**.
4. **Zoran Đurić (2025) [Ref 20] – Server Performance Under Load (`oha`, 20 Concurrent Connections, 5 Sekunden):**
   * Zeigt methodisch, wie man Client-Metriken (Core Web Vitals) mit einem kompakten HTTP-Lasttest kombiniert (Messung von **Requests/sec**, **Average Response Time**, **p90/p99 Latency**).

---

## 5. Technische Leitlinien für die Implementierung in diesem Repo

Sobald das Team die Entscheidungen in [`naechstes-vorgehen.md`](./naechstes-vorgehen.md) getroffen hat, gelten für die Implementierung durch den Agenten folgende Regeln:

1. **Strikte Ceteris-Paribus-Gleichheit:**
   * Alle verglichenen Apps müssen **exakt dieselbe DOM-Struktur** (gleiche HTML-Tags, gleiche CSS-Klassen, gleiches Styling) rendern.
   * Alle Apps müssen **exakt denselben deterministischen Datensatz** (aus `/data/items.json` mit festem Random-Seed) für die Stufen $N \in \{10, 50, 100, 500, 1.000, 5.000, 10.000\}$ verwenden.
2. **Production Builds messen (Niemals Dev-Server!):**
   * Lighthouse-Tests dürfen **niemals** gegen `vite dev`, `next dev` oder `astro dev` laufen, da Dev-Server unminifizierte Bundles und Hot-Module-Replacement-Overhead ausliefern.
   * Alle Benchmarks müssen gegen die **gebauten Production-Versionen** (`vite build && vite preview`, `next build && next start` bzw. statischer Export, `astro build && astro preview`) ausgeführt werden.
3. **Automatisierte & Reproduzierbare Lighthouse-Pipeline:**
   * Das Benchmark-Skript in `/benchmarks/` führt für jede Architektur und jede Datenstufe $N$ automatisiert $n \ge 5$ Runs über `lighthouse` (CLI) im Headless-Chrome mit `--chrome-flags="--headless --incognito --no-sandbox"` durch.
   * Alle Rohdaten werden als JSON/CSV gespeichert, und ein Auswertungsskript berechnet automatisch **Mittelwert ($\mu$)**, **Standardabweichung ($\sigma$)**, **Median** sowie die **prozentuale Abweichung ($\Delta \%$)** zur SPA-Baseline.
