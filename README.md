# Research Methods Experiment: SPA (AJAX) vs. Jamstack Performance Benchmark

**Hochschule Campus Wien – University of Applied Sciences**  
**Lehrveranstaltung:** Research Methods (2026) – *Prof. Slaviša Aleksić & Prof. Aleksandar Pavlović*  
**Team B – Gruppe 4:** Fabio Gschweidl, Desirée Iris Hackl, Marco Miklautz, Lorenz Schneider, Danijel Trailovic

---

## 1. Projektziel & Research Question

Dieses Repository enthält den experimentellen Prototyp sowie die automatisierte Benchmarking-Suite für unsere wissenschaftliche Arbeit zum Thema **#14: Evaluate the impact of web application architecture on performance (Provide technical advice for scalable design of a specific web application architecture)**.

### Research Gap
Bestehende wissenschaftliche Arbeiten vergleichen überwiegend klassisches Client-Side Rendering (CSR) und Server-Side Rendering (SSR) innerhalb einzelner Applikationen, untersuchen jedoch kaum **moderne Jamstack-Architekturen (z. B. mit Next.js oder Astro)** im direkten Vergleich zu **Single-Page Applications (SPA) mit AJAX** – insbesondere im Hinblick auf das Skalierungsverhalten unter variabler Daten- und Traffic-Last.

### Research Question (RQ)
> *"How do Single-Page Application (SPA) architectures using AJAX and Jamstack architectures using frameworks such as Next.js and Astro compare in terms of load time, rendering speed, and stability under variable traffic conditions (including sudden traffic spikes and high concurrent-user loads)?"*

---

## 2. Methodik & Referenzstudie (Conceptual Replication & Extension)

### Einordnung nach dem DOT-Framework
Gemäß dem **DOT-Framework (Development Oriented Triangulation)** kombiniert unsere Arbeit drei Forschungsstrategien:
1. **Library (*Literature Study*):** Systematisches Literaturreview nach **PRISMA 2020** ($n = 103$ identifizierte Quellen, $38$ eingeschlossene Quellen).
2. **Workshop / Lab (*Prototyping & Non-functional System Testing*):** Entwicklung identischer Web-App-Prototypen in kontrastierenden Frontend-Architekturen unter kontrollierten Laborbedingungen (*Ceteris Paribus*).
3. **Showroom (*Benchmark Test*):** Quantitative Evaluierung mittels **Google Lighthouse** (und optionalem HTTP-Load-Testing) unter direkter Bezugnahme auf ein etabliertes Benchmark-Design aus der Literatur.

### Primäre Referenzstudie (Basis unseres Versuchsdesigns)
Unser Experiment knüpft methodisch direkt an folgende Studie aus unserem PRISMA-Literaturkorpus (Referenz **[17]**) an und erweitert diese um **Jamstack-Architekturen (Next.js / Astro)**:

* **Fahrudin, M., Kusumasari, T. F., & Alam, E. N. (2025):**  
  *A Performance Comparison of Frontend Rendering Strategies in Laravel Applications.*  
  In: *2025 9th International Conference On Electrical, Electronics And Information Engineering (ICEEIE)*, Mataram, Indonesia, pp. 1–6.  
  DOI: [10.1109/ICEEIE66203.2025.11252452](https://doi.org/10.1109/ICEEIE66203.2025.11252452)

#### Warum knüpfen wir an Fahrudin et al. (2025) [17] an?
1. **Identisches Messinstrument:** Fahrudin et al. (2025) nutzen **Google Lighthouse** im inkognito Chrome-Browser zur Messung von **First Contentful Paint (FCP)**, **Largest Contentful Paint (LCP)**, **Total Blocking Time (TBT)** und **Speed Index (SI)**.
2. **Klares Skalierungs-Szenario (Variable Data Load):** Die Studie evaluiert eine datenintensive Listen-/Tabellenansicht über 7 definierte Datenlast-Stufen hinweg:
   $$N \in \{10,\; 50,\; 100,\; 500,\; 1.000,\; 5.000,\; 10.000\} \text{ Einträge}$$
   Als theoretischer Schwellenwert dient das **10-Sekunden-Limit für Response Times nach Jakob Nielsen** (*Usability Engineering*).
3. **Explizites *Future Work* der Autoren:** Fahrudin et al. (2025) zeigen, dass klassisches SSR bei kleinen Datenmengen ($\le 500$ Einträge) schnelle FCP/LCP-Werte liefert, aber ab $N = 5.000$ Einträgen durch eine explodierende **Total Blocking Time (TBT = 2.790 ms)** bei der Interaktivität einbricht, während CSR (React/Vue) langsam lädt, aber eine niedrige TBT behält. Im Fazit fordern Fahrudin et al. explizit:
   > *"Future research should quantitatively validate the benefits of hybrid rendering approaches [such as Next.js / Jamstack] discussed in this paper."* (Fahrudin et al., 2025, S. 5)

### Ergänzende Referenzstudien aus unserem PRISMA-Review
Zur Einordnung von **Astro (Islands Architecture)**, **Next.js** und **Server-Lasttests** ziehen wir ergänzend folgende Arbeiten aus unserem Review heran:
* **[30] Lonka, T. (2023):** *Improving the initial rendering performance of react applications through contemporary rendering approaches* (Master's Thesis, Aalto University) – Vergleicht React SPA (CSR), Next.js und Astro mittels Google Lighthouse bei $10$ und $100$ Elementen.
* **[2] Yavuz, S., & Miladinovic, I. (2023):** *Analyse von Rendering-Techniken in Webapplikationen und deren Anwendungsfälle* (Masterarbeit, Hochschule Campus Wien) – Vergleicht CSR (SPA) und SSR mit Rehydration über Google Lighthouse.
* **[6] Shitov, N. (2025):** *Comparative Analysis of Server-side versus Client-side Rendering* (Bachelor Thesis, CZU Prague) – Vergleicht React (Vite CSR) und Next.js (SSR) mittels Lighthouse & Core Web Vitals.
* **[20] Đurić, Z. (2025):** *Comparative Analysis of Server-Side Rendering: React vs. Next.js* (Bachelor's Thesis, Metropolia UAS) – Ergänzt Client-Metriken (LCP, CLS, INP) um Server-Lasttests unter gleichzeitigen Verbindungen mittels `oha` (Requests/sec, TTFB, Latenz-Perzentile).

---

## 3. Versuchsaufbau (Experimental Setup)

Um sicherzustellen, dass Messunterschiede ausschließlich auf die gewählte Web-Architektur zurückzuführen sind (*Ceteris Paribus*), implementieren wir dieselbe Web-Applikation mit identischem UI/CSS und identischen JSON-Datensätzen in mehreren Architektur-Varianten:

| Variante | Architektur-Typ | Technologie / Framework | Rendering- & Datenstrategie |
| :--- | :--- | :--- | :--- |
| **1. SPA (Baseline)** | Single-Page Application | React + Vite (CSR) | Leere HTML-Shell (`<div id="root">`), asynchrones Nachladen der $N$ Datensätze via AJAX (`fetch`) und Client-Side DOM-Rendering |
| **2. Jamstack (Next.js)** | Jamstack / Hybrid SSG | Next.js (Static Site Generation) | Vorab generiertes HTML zur Build-Zeit (SSG) + React Hydration im Client |
| **3. Jamstack (Astro)** | Jamstack / Islands | Astro (Static Build + Islands) | Zero-JS Default für die statische Datentabelle + isolierte interaktive Insel (*Partial/Island Hydration*) |

### Gemessene Metriken
1. **Client-Side Performance (Google Lighthouse CLI, $n \ge 5$ Runs pro Datenstufe $N$):**
   * **First Contentful Paint (FCP)** in `s` / `ms`
   * **Largest Contentful Paint (LCP)** in `s` / `ms`
   * **Total Blocking Time (TBT)** in `ms`
   * **Speed Index (SI)** in `s` / `ms`
   * **Cumulative Layout Shift (CLS)** & **Lighthouse Performance Score** (`0–100`)
   * **Page Weight / Transfer Size** (HTML- vs. JS-Bundle-Größe in `kB`)
2. **Optional – Verhalten unter Traffic Spikes / Concurrent Load (HTTP Load Test):**
   * **Time to First Byte (TTFB)** & **Average / p99 Response Latency** in `ms`
   * **Throughput (Requests per Second – RPS)** unter variabler Anzahl gleichzeitiger Nutzer (z. B. $10, 50, 200$ Concurrent Users)

---

## 4. Geplante Repository-Struktur

```text
research-methods-experiment/
├── README.md                  # Projektübersicht, Research Question & Referenzstudien
├── AGENTS.md                  # Kontext, Methodik-Vorgaben & Referenzdaten für AI-Agents & Team
├── naechstes-vorgehen.md      # Entscheidungs-Checkliste für das Team (Ausfüll-Template)
├── data/                      # Deterministischer Datengenerator (10 bis 10.000 Einträge)
├── apps/
│   ├── spa-react/             # Variante 1: Single-Page Application (React + Vite + AJAX)
│   ├── jamstack-nextjs/       # Variante 2: Jamstack mit Next.js (SSG)
│   └── jamstack-astro/        # Variante 3: Jamstack mit Astro (Islands Architecture)
└── benchmarks/                # Automatisierte Google Lighthouse & Load-Testing Skripte + CSV/JSON-Ergebnisse
```

---

## 5. Nächste Schritte für das Team

Bitte öffnet die Datei [`naechstes-vorgehen.md`](./naechstes-vorgehen.md), füllt die kurzen Auswahlpunkte im Team aus und gebt Bescheid – danach kann der komplette Code für die Web-Apps und die automatisierte Lighthouse-Testpipeline direkt generiert werden.
