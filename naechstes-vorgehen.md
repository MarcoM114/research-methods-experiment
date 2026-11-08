# Nächstes Vorgehen – Entscheidungs-Checkliste für das Team

Hallo **Team B – Gruppe 4** (Fabio, Desirée, Marco, Lorenz, Danijel)! 👋

Damit ich (euer AI-Agent) im nächsten Schritt den **kompletten Code für eure Vergleichs-Web-Apps**, den **Datengenerator** sowie die **automatisierte Google-Lighthouse-Benchmark-Pipeline** exakt nach euren Wünschen programmieren und ausführen kann, geht bitte kurz diese 6 Punkte im Team durch.

> **Anleitung:** Setzt einfach ein `[x]` bei euren gewünschten Optionen (oder tragt eure Anmerkungen unter `Antwort / Notiz:` ein) und speichert/pusht die Datei – oder schreibt mir eure Auswahl direkt in den Chat!

---

## 1. Welche Architekturen / Frameworks wollen wir im Prototyp vergleichen?

Unsere Research Question nennt **SPA mit AJAX** auf der einen Seite und **Jamstack (Next.js / Astro)** auf der anderen Seite. Wir knüpfen dabei an **Fahrudin et al. (2025) [Ref 17]** an. Welche Kombination wollen wir konkret bauen?

- [ ] **Option 1A (Empfohlen – Deckt die gesamte RQ zu 100% ab):** **3er-Vergleich**
  1. **React + Vite (SPA mit AJAX):** Klassisches Client-Side Rendering, lädt Daten asynchron per `fetch()` (AJAX) von einer JSON-API.
  2. **Next.js (Jamstack SSG):** Vorab generiertes statisches HTML zur Build-Zeit + React Full Hydration im Browser.
  3. **Astro (Jamstack mit Islands Architecture):** Vorab generiertes statisches HTML (Zero-JS für die Datentabelle) + nur eine kleine interaktive Such-/Filter-Insel (*Partial Hydration*).
  *(Vorteil: Zeigt genial den Unterschied zwischen klassischer Hydration in Next.js und Islands-Architektur in Astro bei 5.000–10.000 Datensätzen!)*
- [ ] **Option 1B (Minimaler Aufwand):** **2er-Vergleich (React SPA mit AJAX vs. Astro Jamstack)**
- [ ] **Option 1C (Minimaler Aufwand):** **2er-Vergleich (React SPA mit AJAX vs. Next.js Jamstack)**

**Antwort / Notiz vom Team:**  
`> Hier eintragen (falls abweichend)`

---

## 2. Welches Anwendungs-Szenario (Thema der kleinen Web-App) nehmen wir?

Für Google Lighthouse zählt technisch vor allem die Anzahl der DOM-Elemente und Datenfelder. Inhaltlich haben wir zwei schöne Möglichkeiten:

- [ ] **Option 2A (Empfohlen – Direkte Anlehnung an Fahrudin et al. [17]):**  
  **Academic Assessment / Course Dashboard** (Eine Übersichtsseite mit Studierenden-/Kursbewertungen: `ID`, `Student Name`, `Course`, `Category`, `Score`, `Grade`, `Status` + Such-/Filterleiste und Statistik-Header).  
  *(Vorteil: 1:1 dieselbe Domäne wie unsere Referenzstudie Fahrudin et al. [17] – macht die Argumentation im Kapitel "Scenario & Methodology" extrem schlüssig!)*
- [ ] **Option 2B (Anlehnung an Lonka [30]):**  
  **E-Commerce / Product Catalog** (Eine Produkt-/Artikelübersicht mit `ID`, `Product Name`, `Category`, `Price`, `Stock Status`, `Rating` + Such-/Filterleiste und Merklisten-Zähler).
- [ ] **Option 2C (Eigenes Thema):**  
  `> Falls ihr ein anderes Thema wollt, hier kurz beschreiben`

**Antwort / Notiz vom Team:**  
`> `

---

## 3. Welche Datenlast-Stufen ($N$) wollen wir in Google Lighthouse testen?

Fahrudin et al. (2025) [17] haben 7 Stufen von $10$ bis $10.000$ Einträgen getestet, um den Punkt zu finden, an dem die Ladezeit die **10-Sekunden-Grenze (nach Jakob Nielsen)** überschreitet bzw. die **Total Blocking Time (TBT)** explodiert.

- [ ] **Option 3A (Empfohlen – Exakte Replikation der Stufen von Fahrudin et al. [17]):**  
  Alle 7 Stufen: **`10`, `50`, `100`, `500`, `1.000`, `5.000`, `10.000` Einträge**
- [ ] **Option 3B (Kompakte Variante – 4 Stufen):**  
  Nur **`10`, `100`, `1.000`, `5.000` Einträge**
- [ ] **Option 3C (Eigene Abstufung):**  
  `> `

**Antwort / Notiz vom Team:**  
`> `

---

## 4. Lighthouse-Konfiguration & Anzahl der Testdurchläufe ($n$)

Laut Vorlesung 4 (*04-Documentation*, Folie 11 & 45) erwarten Prof. Aleksić und Prof. Pavlović, dass wir zeigen, dass unsere Ergebnisse **nicht auf Zufall beruhen** (*"not simply due to chance"* $\rightarrow$ Mehrfachmessung mit Mittelwert & Standardabweichung).

- [ ] **Option 4A (Empfohlen):** **$n = 5$ automatisierte Lighthouse-Runs** pro Datenstufe und Architektur (wie bei Lonka [30] und Đurić [20]), Angabe von Mittelwert ($\mu$) und Standardabweichung ($\sigma$).
- [ ] **Option 4B (Besonders gründlich):** **$n = 10$ automatisierte Lighthouse-Runs** pro Datenstufe und Architektur.

**Welches Lighthouse-Profil wollen wir messen?**
- [ ] **Beides: Desktop & Mobile Throttling** *(Empfohlen: Erlaubt sowohl den Vergleich mit Fahrudin et al. [17] als auch mit Lonka [30])*
- [ ] **Nur Desktop-Profil** (wie Fahrudin et al. [17])
- [ ] **Nur Mobile-Profil** (Slow 4G + 4x CPU Throttling, wie Lonka [30])

**Antwort / Notiz vom Team:**  
`> `

---

## 5. Wollen wir den Teil *"Traffic Spikes & High Concurrent-User Loads"* aus unserer RQ mit einem kurzen Server-Lasttest abdecken?

Unsere Research Question lautet am Ende: *"...and stability under variable traffic conditions (including sudden traffic spikes and high concurrent-user loads)"*.  
Da Google Lighthouse allein nur einen einzelnen Browser-Client misst, können wir (genau wie **Đurić (2025) [Ref 20]** in seiner Arbeit mit dem Tool `oha`) ein kleines Lasttest-Skript ergänzen, das für jeweils 10 Sekunden gleichzeitige Nutzer simuliert.

- [ ] **Option 5A (Empfohlen – Beantwortet die gesamte RQ lückenlos):**  
  **Ja**, bitte zusätzlich zu Google Lighthouse ein automatisches Load-Testing-Skript (z. B. mit `autocannon` / `oha` bei **10, 50 und 200 Concurrent Users** sowie einem **Traffic Spike**) einbauen, das **Requests/sec (RPS)**, **Average Response Time (TTFB)** und **p99 Latency** misst.
- [ ] **Option 5B:**  
  **Nein**, wir beschränken uns ausschließlich auf Google Lighthouse (Variable Load = Variable Data Load von 10 bis 10.000 Einträgen) und passen ggf. die Formulierung unserer RQ minimal an.

**Antwort / Notiz vom Team:**  
`> `

---

## 6. Wo sollen die finalen Messungen ausgeführt werden?

- [ ] **Option 6A (Beides – Ideal):**  
  Der Agent richtet die komplette Benchmark-Suite so ein, dass er hier in der Linux-VM sofort einen **ersten kompletten Benchmark-Durchlauf (inkl. CSV-Tabellen & Diagrammen)** generiert **UND** wir das Skript mit einem einzigen Befehl (`npm run benchmark`) jederzeit auf unseren eigenen Laptops (Windows/Mac) laufen lassen können.
- [ ] **Option 6B:**  
  Wir wollen die Benchmarks ausschließlich lokal auf einem unserer eigenen Laptops ausführen (bitte tragt unten kurz ein, welches Betriebssystem ihr nutzt: Windows / macOS / Linux).

**Hardware / OS unseres Test-Laptops (falls schon bekannt, für das Kapitel "Scenario"):**
* **OS:** `z. B. Windows 11 / macOS`
* **CPU:** `z. B. Intel Core i7 / Apple M2`
* **RAM:** `z. B. 16 GB`

---

### Checkliste für den Start der Implementierung
Sobald ihr diese Punkte kurz markiert habt, übernehme ich folgende Aufgaben automatisch für euch:
1. Generierung des deterministischen Datensatzes (`10` bis `10.000` Einträge).
2. Implementierung der Web-Apps in `/apps/` mit identischem UI & CSS.
3. Erstellung des automatisierten Lighthouse- & Load-Test-Runners in `/benchmarks/`.
4. Automatische Aufbereitung der Ergebnistabellen (im Stil von Fahrudin et al. [17] Table III + Vergleichstabelle) und publikationsreifen Diagramme (unter Beachtung aller Vorgaben aus *04-Documentation*).
