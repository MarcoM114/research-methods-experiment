import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import PptxGenJS from 'pptxgenjs';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RESULTS_DIR = path.join(__dirname, 'results');
const OUT_PPTX = path.join(
  RESULTS_DIR,
  'Web_Application_Architecture_Performance_Methodology_and_Results.pptx'
);

const COLORS = {
  navy: '0F172A',
  slateDark: '1E293B',
  slate: '334155',
  muted: '64748B',
  lightBg: 'F8FAFC',
  cardBg: 'FFFFFF',
  border: 'CBD5E1',
  blue: '2563EB',
  blueLight: 'DBEAFE',
  emerald: '059669',
  emeraldLight: 'D1FAE5',
  amber: 'D97706',
  amberLight: 'FEF3C7',
  red: 'DC2626',
  redLight: 'FEE2E2',
  purple: '7C3AED',
  purpleLight: 'EDE9FE'
};

async function convertSvgChartsToPng() {
  const charts = ['chart-fcp', 'chart-lcp', 'chart-tbt', 'chart-si', 'chart-normalized-lcp'];
  const pngPaths = {};
  for (const name of charts) {
    const svgPath = path.join(RESULTS_DIR, `${name}.svg`);
    const pngPath = path.join(RESULTS_DIR, `${name}.png`);
    const svgBuffer = fs.readFileSync(svgPath);
    await sharp(svgBuffer, { density: 200 }).png().toFile(pngPath);
    pngPaths[name] = pngPath;
  }
  return pngPaths;
}

function addSlideHeader(slide, title, category = 'RESEARCH METHODS (SS 2026) • TOPIC #14') {
  slide.background = { color: COLORS.lightBg };
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.95,
    fill: { color: COLORS.navy }
  });
  slide.addText(category.toUpperCase(), {
    x: 0.5,
    y: 0.12,
    w: 12.3,
    h: 0.25,
    fontSize: 9.5,
    bold: true,
    color: '93C5FD',
    fontFace: 'Arial'
  });
  slide.addText(title, {
    x: 0.5,
    y: 0.36,
    w: 12.3,
    h: 0.45,
    fontSize: 20,
    bold: true,
    color: 'FFFFFF',
    fontFace: 'Arial'
  });
}

function addSlideFooter(slide, pageNum, totalPages = 15) {
  slide.addShape('line', {
    x: 0.5,
    y: 7.05,
    w: 12.333,
    h: 0,
    line: { color: COLORS.border, width: 0.75 }
  });
  slide.addText(
    'Team B – Group 4 (Gschweidl, Hackl, Miklautz, Schneider, Trailovic) | Hochschule Campus Wien',
    {
      x: 0.5,
      y: 7.12,
      w: 9.5,
      h: 0.25,
      fontSize: 8.5,
      color: COLORS.muted,
      fontFace: 'Arial'
    }
  );
  slide.addText(`Slide ${pageNum} / ${totalPages}`, {
    x: 10.5,
    y: 7.12,
    w: 2.333,
    h: 0.25,
    fontSize: 8.5,
    bold: true,
    align: 'right',
    color: COLORS.slate,
    fontFace: 'Arial'
  });
}

async function buildPresentation() {
  const pngPaths = await convertSvgChartsToPng();
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5 in
  pptx.author = 'Team B – Group 4 (Hochschule Campus Wien)';
  pptx.company = 'Hochschule Campus Wien';
  pptx.subject = 'Empirical Evaluation of Web Application Architectures Under Variable Data Loads';
  pptx.title =
    'Evaluating Web Application Architecture Performance: Jamstack (Next.js SSG & Astro Islands) vs. SSR & CSR';

  // =========================================================================
  // SLIDE 1: TITLE SLIDE
  // =========================================================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.navy };
    slide.addShape('rect', {
      x: 0,
      y: 0,
      w: 0.35,
      h: 7.5,
      fill: { color: COLORS.emerald }
    });
    slide.addText('HOCHSCHULE CAMPUS WIEN • MASTER COURSE: RESEARCH METHODS (SS 2026)', {
      x: 0.8,
      y: 0.8,
      w: 11.8,
      h: 0.35,
      fontSize: 11,
      bold: true,
      color: '6EE7B7',
      fontFace: 'Arial'
    });
    slide.addText(
      'Evaluating the Impact of Web Application Architecture on Performance',
      {
        x: 0.8,
        y: 1.35,
        w: 11.8,
        h: 1.3,
        fontSize: 31,
        bold: true,
        color: 'FFFFFF',
        fontFace: 'Arial'
      }
    );
    slide.addText(
      'Empirical Google Lighthouse Benchmark of Jamstack Pre-Rendering (Next.js SSG vs. Astro Islands) Under Scaling Data Loads (10 to 10,000 Entries) & Cross-Study Triangulation with SSR and CSR',
      {
        x: 0.8,
        y: 2.75,
        w: 11.5,
        h: 0.9,
        fontSize: 15,
        color: 'CBD5E1',
        fontFace: 'Arial'
      }
    );

    slide.addShape('roundRect', {
      x: 0.8,
      y: 4.1,
      w: 11.7,
      h: 2.55,
      rectRadius: 0.08,
      fill: { color: COLORS.slateDark },
      line: { color: '334155', width: 1 }
    });

    slide.addText(
      [
        { text: 'Research Topic #14: ', options: { bold: true, color: '93C5FD' } },
        {
          text: '"Evaluate the impact of web application architecture on performance. Provide technical advice for scalable design of a specific web application architecture."\n\n',
          options: { italic: true, color: 'F8FAFC' }
        },
        { text: 'Authors (Team B – Group 4): ', options: { bold: true, color: '6EE7B7' } },
        {
          text: 'Fabio Gschweidl, Desirée Iris Hackl, Marco Miklautz, Lorenz Schneider, Danijel Trailovic\n',
          options: { color: 'FFFFFF' }
        },
        { text: 'Course Instructors: ', options: { bold: true, color: '6EE7B7' } },
        { text: 'Prof. Slaviša Aleksić & Prof. Aleksandar Pavlović\n', options: { color: 'FFFFFF' } },
        { text: 'Primary Reference Baseline: ', options: { bold: true, color: 'FCD34D' } },
        {
          text: 'Fahrudin et al. (2025) [Ref 17] — Performance Comparison of Blade (SSR), Vue (CSR), and React (CSR) Under Variable Data Loads (IEEE ICCoSITE)',
          options: { color: 'E2E8F0' }
        }
      ],
      {
        x: 1.05,
        y: 4.25,
        w: 11.2,
        h: 2.25,
        fontSize: 12.5,
        fontFace: 'Arial',
        valign: 'middle'
      }
    );
  }

  // =========================================================================
  // SLIDE 2: PROBLEM STATEMENT & REFINED RESEARCH QUESTION
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(slide, 'Problem Statement & Refined Research Question', '1. Introduction & Motivation');
    addSlideFooter(slide, 2);

    slide.addShape('roundRect', {
      x: 0.5,
      y: 1.15,
      w: 12.333,
      h: 1.65,
      rectRadius: 0.08,
      fill: { color: COLORS.blueLight },
      line: { color: COLORS.blue, width: 1.5 }
    });
    slide.addText('REFINED RESEARCH QUESTION (RQ)', {
      x: 0.75,
      y: 1.25,
      w: 11.8,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: COLORS.blue,
      fontFace: 'Arial'
    });
    slide.addText(
      '"How do modern Jamstack rendering architectures—specifically Static Site Generation with full React hydration (Next.js) versus Zero-JS Islands Architecture (Astro)—impact Core Web Vitals (FCP, LCP, TBT, CLS) and Speed Index under scaling data loads (10 to 10,000 entries) compared to traditional Server-Side Rendering (Laravel Blade) and Client-Side Rendering (React, Vue), and what technical design guidelines can be derived for scalable web applications?"',
      {
        x: 0.75,
        y: 1.55,
        w: 11.8,
        h: 1.15,
        fontSize: 13.5,
        bold: true,
        italic: true,
        color: COLORS.navy,
        fontFace: 'Arial'
      }
    );

    const cards = [
      {
        title: 'RO1: Quantify the "Hydration Tax"',
        color: COLORS.blue,
        bg: COLORS.cardBg,
        text: 'Isolate the client-side CPU and payload overhead of full React Virtual DOM hydration (Next.js SSG) versus Zero-JS static HTML tables with isolated interactive islands (Astro) under Ceteris-Paribus conditions.'
      },
      {
        title: 'RO2: Multi-Stage Load Scaling',
        color: COLORS.emerald,
        bg: COLORS.cardBg,
        text: 'Evaluate both Jamstack architectures across 7 exponentially increasing dataset stages (N = 10, 50, 100, 500, 1,000, 5,000, 10,000 records) and triangulate results with SSR & CSR baselines from Fahrudin et al. (2025) [17].'
      },
      {
        title: 'RO3: Scalable Design Advice',
        color: COLORS.purple,
        bg: COLORS.cardBg,
        text: 'Identify the exact DOM inflection points where static pre-rendering degrades and formulate quantitative architectural guidelines (DOM ceilings, pagination, RSC payload rules, and virtualization).'
      }
    ];

    cards.forEach((c, idx) => {
      const x = 0.5 + idx * 4.2;
      slide.addShape('roundRect', {
        x,
        y: 3.05,
        w: 3.93,
        h: 3.75,
        rectRadius: 0.08,
        fill: { color: c.bg },
        line: { color: c.color, width: 1.5 }
      });
      slide.addShape('rect', {
        x,
        y: 3.05,
        w: 3.93,
        h: 0.45,
        fill: { color: c.color }
      });
      slide.addText(c.title, {
        x: x + 0.15,
        y: 3.1,
        w: 3.63,
        h: 0.35,
        fontSize: 12.5,
        bold: true,
        color: 'FFFFFF',
        fontFace: 'Arial'
      });
      slide.addText(c.text, {
        x: x + 0.2,
        y: 3.65,
        w: 3.53,
        h: 2.95,
        fontSize: 12,
        color: COLORS.slateDark,
        fontFace: 'Arial',
        valign: 'top'
      });
    });
  }

  // =========================================================================
  // SLIDE 3: LITERATURE SYNTHESIS (PRISMA) & RESEARCH GAP
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(
      slide,
      'Systematic Literature Review (PRISMA) & Identified Research Gap',
      '2. Related Work & Research Gap'
    );
    addSlideFooter(slide, 3);

    slide.addText(
      'From 30 primary studies identified via our PRISMA 2020 review across IEEE Xplore, ACM DL, SpringerLink, ScienceDirect, and Google Scholar, five core studies directly anchor our experimental design:',
      {
        x: 0.5,
        y: 1.1,
        w: 12.3,
        h: 0.45,
        fontSize: 12,
        color: COLORS.slateDark,
        fontFace: 'Arial'
      }
    );

    const rows = [
      [
        { text: 'Study / Ref.', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } },
        { text: 'Evaluated Architectures', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } },
        { text: 'Workload / Scaling', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } },
        { text: 'Key Finding & Limitation (Research Gap)', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } }
      ],
      [
        { text: 'Fahrudin et al. (2025) [Ref 17]\n(Primary Baseline)', options: { bold: true, fill: COLORS.amberLight } },
        { text: 'Laravel Blade (SSR),\nReact (CSR), Vue (CSR)', options: { fill: COLORS.amberLight } },
        { text: '7 Data Load Stages:\n10, 50, 100, 500, 1k, 5k, 10k rows', options: { bold: true, fill: COLORS.amberLight } },
        {
          text: 'Blade SSR excels in LCP (3.1s at 10k) but suffers extreme TBT (4,860 ms at 10k). React/Vue CSR keep low TBT but slow LCP (5.8s). GAP: No Jamstack (SSG / Islands) evaluated!',
          options: { fill: COLORS.amberLight }
        }
      ],
      [
        { text: 'Lonka (2023) [Ref 30]', options: { bold: true } },
        { text: 'Astro (Islands) vs.\nNext.js (Full Hydration)', options: {} },
        { text: 'Single static workload\n(Text + 50 MB images)', options: {} },
        {
          text: 'Demonstrated that Astro eliminates JS hydration tax and reduces TBT. GAP: Did not test systematic data-table scaling from 10 to 10,000 entries.',
          options: {}
        }
      ],
      [
        { text: 'Yavuz & Miladinovic (2023) [Ref 2]', options: { bold: true } },
        { text: 'React, Angular, Vue,\nSvelte (CSR vs. SSR)', options: {} },
        { text: 'DOM manipulation\nmicro-benchmarks', options: {} },
        {
          text: 'Showed Virtual DOM diffing and hydration overhead grows non-linearly with DOM tree depth.',
          options: {}
        }
      ],
      [
        { text: 'Đurić (2025) [Ref 20] &\nShitov (2025) [Ref 6]', options: { bold: true } },
        { text: 'React CSR vs.\nNext.js SSR', options: {} },
        { text: 'Varying client/server\nhardware profiles', options: {} },
        {
          text: 'Confirmed SSR improves initial FCP/LCP over CSR but shifts CPU load to server and client hydration phase.',
          options: {}
        }
      ]
    ];

    slide.addTable(rows, {
      x: 0.5,
      y: 1.65,
      w: 12.333,
      colW: [2.4, 2.4, 2.3, 5.233],
      fontSize: 10.5,
      fontFace: 'Arial',
      border: { pt: 0.75, color: COLORS.border },
      valign: 'middle'
    });

    slide.addShape('roundRect', {
      x: 0.5,
      y: 5.75,
      w: 12.333,
      h: 1.1,
      rectRadius: 0.06,
      fill: { color: COLORS.emeraldLight },
      line: { color: COLORS.emerald, width: 1.5 }
    });
    slide.addText(
      [
        { text: 'OUR CONTRIBUTION TO CLOSING THE GAP: ', options: { bold: true, color: COLORS.emerald } },
        {
          text: 'We extend Fahrudin et al. (2025) [Ref 17] by implementing the exact same Academic Assessment domain and 7 dataset stages (10 to 10,000 entries) in Next.js (Jamstack SSG + Full Hydration) and Astro (Jamstack SSG + Zero-JS Islands), enabling a direct 5-architecture comparison (Blade SSR, React CSR, Vue CSR, Next.js SSG, Astro Islands).',
          options: { color: COLORS.navy }
        }
      ],
      {
        x: 0.7,
        y: 5.85,
        w: 11.9,
        h: 0.9,
        fontSize: 11.5,
        fontFace: 'Arial',
        valign: 'middle'
      }
    );
  }

  // =========================================================================
  // SLIDE 4: ARCHITECTURAL PARADIGMS UNDER INVESTIGATION
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(
      slide,
      'Web Application Architectures Under Investigation (5 Paradigms)',
      '2. Architectural Background'
    );
    addSlideFooter(slide, 4);

    const archBoxes = [
      {
        title: '1. CSR / SPA\n(React & Vue) [Ref 17]',
        badge: 'Reference Baseline [17]',
        color: COLORS.amber,
        bg: COLORS.amberLight,
        bullets: [
          '• Server sends empty HTML shell (<div id="root">)',
          '• Browser downloads JS framework + fetches JSON data',
          '• Entire DOM built on client CPU',
          '• Fast FCP (empty shell!), but delayed LCP at large N',
          '• Low initial HTML size, high client memory usage'
        ]
      },
      {
        title: '2. Traditional SSR\n(Laravel Blade) [Ref 17]',
        badge: 'Reference Baseline [17]',
        color: COLORS.red,
        bg: COLORS.redLight,
        bullets: [
          '• Server queries DB & renders full HTML on every request',
          '• Browser receives complete HTML table immediately',
          '• Fast LCP across all data loads (3.10s at N=10,000)',
          '• Severe TBT at scale (4,860 ms at N=10,000) & high server load under traffic spikes'
        ]
      },
      {
        title: '3. Jamstack SSG + Hydration\n(Next.js 15)',
        badge: 'Own Prototype #1',
        color: COLORS.blue,
        bg: COLORS.blueLight,
        bullets: [
          '• Pre-renders static HTML at build time (output: "export")',
          '• Ships 350.5 kB React 19 JS runtime to client',
          '• Double-Payload Penalty: Embeds HTML table + RSC JSON payload (self.__next_f.push)',
          '• Full Virtual DOM hydration of all N rows on load'
        ]
      },
      {
        title: '4. Jamstack SSG + Islands\n(Astro 5)',
        badge: 'Own Prototype #2',
        color: COLORS.emerald,
        bg: COLORS.emeraldLight,
        bullets: [
          '• Pre-renders static HTML at build time (output: "static")',
          '• Zero-JS Table: 0.0 kB external JS framework bundle',
          '• No duplicate RSC JSON hydration data in HTML',
          '• Isolated <1.2 kB Filter Island mutates DOM rows directly via data-* attributes'
        ]
      }
    ];

    archBoxes.forEach((b, idx) => {
      const x = 0.5 + idx * 3.12;
      slide.addShape('roundRect', {
        x,
        y: 1.2,
        w: 2.96,
        h: 5.55,
        rectRadius: 0.08,
        fill: { color: COLORS.cardBg },
        line: { color: b.color, width: 1.5 }
      });
      slide.addShape('rect', {
        x,
        y: 1.2,
        w: 2.96,
        h: 0.85,
        fill: { color: b.color }
      });
      slide.addText(b.title, {
        x: x + 0.1,
        y: 1.25,
        w: 2.76,
        h: 0.75,
        fontSize: 12,
        bold: true,
        align: 'center',
        color: 'FFFFFF',
        fontFace: 'Arial'
      });
      slide.addShape('roundRect', {
        x: x + 0.25,
        y: 2.2,
        w: 2.46,
        h: 0.35,
        rectRadius: 0.05,
        fill: { color: b.bg }
      });
      slide.addText(b.badge, {
        x: x + 0.25,
        y: 2.22,
        w: 2.46,
        h: 0.3,
        fontSize: 10,
        bold: true,
        align: 'center',
        color: b.color,
        fontFace: 'Arial'
      });
      slide.addText(b.bullets.join('\n\n'), {
        x: x + 0.15,
        y: 2.7,
        w: 2.66,
        h: 3.9,
        fontSize: 10.8,
        color: COLORS.slateDark,
        fontFace: 'Arial',
        valign: 'top'
      });
    });
  }

  // =========================================================================
  // SLIDE 5: SCENARIO & BOUNDARY CONDITIONS (LECTURE 04 COMPLIANCE)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(
      slide,
      'Experimental Scenario & Boundary Conditions (Ceteris Paribus)',
      '3. Scenario (Strictly Separated from Methodology)'
    );
    addSlideFooter(slide, 5);

    // Left column: Domain & Ceteris Paribus Controls
    slide.addShape('roundRect', {
      x: 0.5,
      y: 1.15,
      w: 6.0,
      h: 5.65,
      rectRadius: 0.08,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.blue, width: 1.2 }
    });
    slide.addText('Application Domain & Ceteris-Paribus Controls', {
      x: 0.75,
      y: 1.3,
      w: 5.5,
      h: 0.35,
      fontSize: 14,
      bold: true,
      color: COLORS.blue,
      fontFace: 'Arial'
    });
    slide.addText(
      [
        { text: '1. Domain Replication (cf. Fahrudin et al. [17]):\n', options: { bold: true } },
        {
          text: 'We implemented an Academic Assessment Management System displaying 4 KPI summary cards (Total Entries, Mean Score, Pass Rate, Retake Counter), an interactive search/status/course filter toolbar, and a 13-column assessment table.\n\n',
          options: {}
        },
        { text: '2. Deterministic Synthetic Data (Seed = 20260414):\n', options: { bold: true } },
        {
          text: 'Using a seeded Mulberry32 PRNG (data/generate-data.mjs), we generated identical JSON records across all 7 stages: N ∈ {10, 50, 100, 500, 1,000, 5,000, 10,000} (from 3.4 kB to 3,403.4 kB raw JSON).\n\n',
          options: {}
        },
        { text: '3. Strict Visual & DOM Parity:\n', options: { bold: true } },
        {
          text: 'Both Next.js and Astro imported the exact same CSS stylesheet (shared/styles.css) and rendered ~19 DOM nodes per row, scaling identically from 265 DOM nodes (N=10) to 190,075 DOM nodes (N=10,000).',
          options: {}
        }
      ],
      {
        x: 0.75,
        y: 1.75,
        w: 5.5,
        h: 4.8,
        fontSize: 11.5,
        color: COLORS.slateDark,
        fontFace: 'Arial',
        valign: 'top'
      }
    );

    // Right column: Hardware & Software Specs Table
    slide.addShape('roundRect', {
      x: 6.8,
      y: 1.15,
      w: 6.033,
      h: 5.65,
      rectRadius: 0.08,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.emerald, width: 1.2 }
    });
    slide.addText('Hardware, OS & Benchmarking Stack Specifications', {
      x: 7.05,
      y: 1.3,
      w: 5.5,
      h: 0.35,
      fontSize: 14,
      bold: true,
      color: COLORS.emerald,
      fontFace: 'Arial'
    });

    const specRows = [
      [
        { text: 'Parameter', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } },
        { text: 'Experimental Specification', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } }
      ],
      [{ text: 'Operating System', options: { bold: true } }, { text: 'Debian GNU/Linux 12 (Bookworm), Kernel 6.12.105+ (x64)' }],
      [{ text: 'Processor (CPU)', options: { bold: true } }, { text: 'Intel(R) Xeon(R) 6985P-C (2 logical vCPU cores)' }],
      [{ text: 'System Memory', options: { bold: true } }, { text: '7.76 GB RAM' }],
      [{ text: 'Node.js Runtime', options: { bold: true } }, { text: 'Node.js v24.22.2 / npm 11.21.2' }],
      [{ text: 'Next.js Prototype', options: { bold: true } }, { text: 'Next.js v15.5.29 + React 19.0.0 (output: "export")' }],
      [{ text: 'Astro Prototype', options: { bold: true } }, { text: 'Astro v5.5.0 (output: "static", Zero-JS Table + Island)' }],
      [{ text: 'Browser Engine', options: { bold: true } }, { text: 'Headless Chromium 156.0.8078.79 (--incognito)' }],
      [{ text: 'Auditing Tool', options: { bold: true } }, { text: 'Google Lighthouse v12.4.0 (Desktop Preset, 1350x940)' }],
      [{ text: 'Sample Size (n)', options: { bold: true } }, { text: 'n = 5 runs per stage & architecture (70 total runs)' }]
    ];

    slide.addTable(specRows, {
      x: 7.0,
      y: 1.8,
      w: 5.63,
      colW: [1.9, 3.73],
      fontSize: 10.2,
      fontFace: 'Arial',
      border: { pt: 0.75, color: COLORS.border },
      valign: 'middle'
    });
  }

  // =========================================================================
  // SLIDE 6: METHODOLOGY: DOT-FRAMEWORK & 3-PHASE RESEARCH DESIGN
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(
      slide,
      'Research Methodology: DOT-Framework & 3-Phase Design',
      '4. Methodology (Past Tense & Active Voice)'
    );
    addSlideFooter(slide, 6);

    slide.addText(
      'We structured our empirical methodology using the Development Oriented Triangulation (DOT) Framework to combine internal laboratory precision with normative cross-study comparability:',
      {
        x: 0.5,
        y: 1.1,
        w: 12.3,
        h: 0.45,
        fontSize: 12,
        color: COLORS.slateDark,
        fontFace: 'Arial'
      }
    );

    const phases = [
      {
        step: 'PHASE 1: RESEARCH GAP IDENTIFICATION',
        dot: 'DOT Dimension: Library (Literature Review)',
        color: COLORS.blue,
        items: [
          '• Conducted systematic PRISMA 2020 literature review across 5 scientific databases (30 primary studies included).',
          '• Analyzed rendering trade-offs between CSR, SSR, SSG, and Islands Architecture.',
          '• Identified research gap: absence of multi-stage dataset scaling benchmarks (10 to 10,000 entries) comparing full React hydration (Next.js SSG) vs. Zero-JS Islands (Astro) against SSR/CSR baselines [Ref 17].'
        ]
      },
      {
        step: 'PHASE 2: PROTOTYPE DEVELOPMENT',
        dot: 'DOT Dimension: Workshop (Prototype Engineering)',
        color: COLORS.emerald,
        items: [
          '• Engineered a deterministic Mulberry32 dataset generator producing 7 JSON workload stages (10 to 10,000 entries).',
          '• Implemented Prototype A in Next.js 15 (Static Site Generation + full client-side React component hydration).',
          '• Implemented Prototype B in Astro 5 (Static Site Generation + Zero-JS HTML table + isolated <1.2 kB filter script island).',
          '• Enforced strict Ceteris-Paribus DOM and CSS parity across both applications.'
        ]
      },
      {
        step: 'PHASE 3: EMPIRICAL EVALUATION',
        dot: 'DOT Dimensions: Lab (Experiment) & Showroom (Comparison)',
        color: COLORS.purple,
        items: [
          '• Built static production bundles and served them via local HTTP loopback servers with immutable caching headers.',
          '• Executed 70 automated Google Lighthouse Desktop audits (2 architectures × 7 stages × n = 5 repetitions) in clean incognito Chromium sessions.',
          '• Computed arithmetic mean (μ), standard deviation (σ), and median, and triangulated curves against Fahrudin et al. [Ref 17].'
        ]
      }
    ];

    phases.forEach((p, idx) => {
      const y = 1.65 + idx * 1.72;
      slide.addShape('roundRect', {
        x: 0.5,
        y,
        w: 12.333,
        h: 1.55,
        rectRadius: 0.06,
        fill: { color: COLORS.cardBg },
        line: { color: p.color, width: 1.5 }
      });
      slide.addShape('rect', {
        x: 0.5,
        y,
        w: 3.45,
        h: 1.55,
        fill: { color: p.color }
      });
      slide.addText(`${p.step}\n\n${p.dot}`, {
        x: 0.65,
        y: y + 0.15,
        w: 3.15,
        h: 1.25,
        fontSize: 11,
        bold: true,
        color: 'FFFFFF',
        fontFace: 'Arial',
        valign: 'middle'
      });
      slide.addText(p.items.join('\n'), {
        x: 4.15,
        y: y + 0.12,
        w: 8.5,
        h: 1.3,
        fontSize: 11,
        color: COLORS.slateDark,
        fontFace: 'Arial',
        valign: 'middle'
      });
    });
  }

  // =========================================================================
  // SLIDE 7: 4 BENCHMARKING QUESTIONS (LECTURE 04 SLIDES 42-45)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(
      slide,
      'Benchmarking Design: Answering the 4 Methodological Questions',
      '4. Methodology (Lecture 04 – Slides 42–45)'
    );
    addSlideFooter(slide, 7);

    const questions = [
      {
        q: '1. Which baselines did we choose, and why?',
        a: 'We selected Laravel Blade (SSR), React (CSR), and Vue (CSR) from Fahrudin et al. (2025) [Ref 17] as external baselines and compared them against our two Jamstack implementations: Next.js (SSG + Full Hydration) and Astro (SSG + Islands). This covers all major web rendering paradigms without redundant re-measurement of CSR.',
        color: COLORS.blue
      },
      {
        q: '2. Which datasets were used for testing, and why?',
        a: 'We used 7 exponentially scaling workload stages: N ∈ {10, 50, 100, 500, 1,000, 5,000, 10,000} assessment records. These match the exact gradations of [Ref 17] and span light DOM loads (<2,000 nodes), moderate loads (9,500–19,000 nodes), and extreme stress loads (95,000–190,000 DOM nodes).',
        color: COLORS.emerald
      },
      {
        q: '3. Which metrics were chosen, and why?',
        a: 'We evaluated Google Lighthouse Performance Score (0–100), First Contentful Paint (FCP [s]), Largest Contentful Paint (LCP [s]), Total Blocking Time (TBT [ms] — directly quantifying main-thread hydration cost), Speed Index (SI [s]), and Cumulative Layout Shift (CLS), plus HTML/JS transfer sizes (kB) and DOM node counts.',
        color: COLORS.amber
      },
      {
        q: '4. How did we ensure comparability & reliability?',
        a: 'Internal: Identical datasets (Seed 20260414), CSS/DOM parity, incognito storage reset, n = 5 runs (μ ± σ). Cross-Study vs. [Ref 17]: Standardized Lighthouse Lantern Desktop simulation + Intra-Architecture Relative Scaling Normalization (S_N = M_N / M_10) + Light-Load Hardware Calibration Factor (k_hw = 1.170).',
        color: COLORS.purple
      }
    ];

    questions.forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 0.5 + col * 6.25;
      const y = 1.2 + row * 2.85;

      slide.addShape('roundRect', {
        x,
        y,
        w: 6.08,
        h: 2.6,
        rectRadius: 0.08,
        fill: { color: COLORS.cardBg },
        line: { color: item.color, width: 1.5 }
      });
      slide.addShape('rect', {
        x,
        y,
        w: 6.08,
        h: 0.45,
        fill: { color: item.color }
      });
      slide.addText(item.q, {
        x: x + 0.18,
        y: y + 0.06,
        w: 5.72,
        h: 0.33,
        fontSize: 12,
        bold: true,
        color: 'FFFFFF',
        fontFace: 'Arial'
      });
      slide.addText(item.a, {
        x: x + 0.2,
        y: y + 0.58,
        w: 5.68,
        h: 1.9,
        fontSize: 11.2,
        color: COLORS.slateDark,
        fontFace: 'Arial',
        valign: 'top'
      });
    });
  }

  // =========================================================================
  // SLIDE 8: CROSS-STUDY COMPARABILITY & VALUE NORMALIZATION METHODOLOGY
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(
      slide,
      'Cross-Study Comparability & Value Normalization Methodology',
      '4. Methodology – Guaranteeing Comparability with Fahrudin et al. [Ref 17]'
    );
    addSlideFooter(slide, 8);

    // Left Column: 3-Pillar Normalization Explanation
    slide.addShape('roundRect', {
      x: 0.45,
      y: 1.15,
      w: 6.05,
      h: 5.7,
      rectRadius: 0.08,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.purple, width: 1.5 }
    });
    slide.addShape('rect', {
      x: 0.45,
      y: 1.15,
      w: 6.05,
      h: 0.48,
      fill: { color: COLORS.purple }
    });
    slide.addText('How We Guarantee Cross-Study Comparability (3 Pillars)', {
      x: 0.65,
      y: 1.22,
      w: 5.65,
      h: 0.35,
      fontSize: 12.5,
      bold: true,
      color: 'FFFFFF',
      fontFace: 'Arial'
    });

    slide.addText(
      [
        {
          text: '1. Lighthouse Lantern Simulation Standardization:\n',
          options: { bold: true, color: COLORS.blue }
        },
        {
          text: 'Both our study and Fahrudin et al. [Ref 17] used Google Lighthouse in Desktop mode (1350×940, simulated 40 ms RTT, 10,240 Kbps throughput, 1x CPU multiplier) across the exact same 7 workload stages (N = 10 to 10,000) in an Academic Assessment System.\n\n',
          options: { color: COLORS.slateDark }
        },
        {
          text: '2. Relative Scaling Normalization (S_N = M_N / M_10):\n',
          options: { bold: true, color: COLORS.emerald }
        },
        {
          text: 'To eliminate any constant hardware offset between [Ref 17] (Intel Core i7-8650U, 16 GB RAM) and our Linux VM (Intel Xeon 6985P-C, 7.76 GB RAM), we normalize each metric M_N by its own baseline value at N = 10 on the same host:\n',
          options: { color: COLORS.slateDark }
        },
        {
          text: '   S_N(Metric) = M_N / M_10   (Dimensionless, 1.00x at N = 10)\n\n',
          options: { bold: true, color: COLORS.navy }
        },
        {
          text: '3. Light-Load Hardware Calibration Factor (k_hw = 1.170):\n',
          options: { bold: true, color: COLORS.amber }
        },
        {
          text: 'In the zero-blocking regime (N ∈ {10, 50, 100}, where TBT = 0 ms everywhere), mean pre-rendered FCP is 0.333s in [Ref 17] vs. 0.285s on our VM. Applying the calibration coefficient:\n',
          options: { color: COLORS.slateDark }
        },
        {
          text: '   k_hw = μ_FCP,[17](N≤100) / μ_FCP,Own(N≤100) = 0.3333 / 0.2850 = 1.170\n',
          options: { bold: true, color: COLORS.navy }
        },
        {
          text: 'projects our raw measurements (M_calib = 1.170 · M_own) directly onto the hardware baseline of [Ref 17].',
          options: { color: COLORS.slateDark }
        }
      ],
      {
        x: 0.65,
        y: 1.72,
        w: 5.65,
        h: 5.0,
        fontSize: 10.3,
        fontFace: 'Arial',
        valign: 'top'
      }
    );

    // Right Column Top: Normalized LCP Scaling Chart
    slide.addImage({
      path: pngPaths['chart-normalized-lcp'],
      x: 6.68,
      y: 1.15,
      w: 6.2,
      h: 3.15
    });

    // Right Column Bottom: Calibrated LCP & Scaling Factor Table
    const calibRows = [
      [
        { text: 'Load (N)', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } },
        { text: 'Astro [Calib / S_N]', options: { bold: true, fill: COLORS.emerald, color: 'FFFFFF' } },
        { text: 'Next.js [Calib / S_N]', options: { bold: true, fill: COLORS.blue, color: 'FFFFFF' } },
        { text: 'Blade [17 / S_N]', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } },
        { text: 'React [17 / S_N]', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } },
        { text: 'Vue [17 / S_N]', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } }
      ],
      ['10', { text: '0.29s (1.0x)', options: { bold: true, fill: COLORS.emeraldLight } }, '0.77s (1.0x)', '0.40s (1.0x)', '0.60s (1.0x)', '0.50s (1.0x)'],
      ['50', '0.32s (1.1x)', '0.82s (1.1x)', { text: '0.30s (0.8x)', options: { bold: true, fill: COLORS.amberLight } }, '0.60s (1.0x)', '0.60s (1.2x)'],
      ['100', '0.33s (1.1x)', '0.86s (1.1x)', { text: '0.30s (0.8x)', options: { bold: true, fill: COLORS.amberLight } }, '0.60s (1.0x)', '0.60s (1.2x)'],
      ['500', '0.69s (2.4x)', '1.11s (1.4x)', { text: '0.40s (1.0x)', options: { bold: true, fill: COLORS.amberLight } }, '0.60s (1.0x)', '0.80s (1.6x)'],
      ['1,000', '0.97s (3.3x)', '1.60s (2.1x)', { text: '0.50s (1.3x)', options: { bold: true, fill: COLORS.amberLight } }, '0.80s (1.3x)', '0.90s (1.8x)'],
      ['5,000', '3.50s (12.0x)', '5.09s (6.6x)', { text: '1.50s (3.8x)', options: { bold: true, fill: COLORS.amberLight } }, '1.90s (3.2x)', '1.80s (3.6x)'],
      ['10,000', '6.67s (22.8x)', '9.50s (12.3x)', { text: '3.10s (7.8x)', options: { bold: true, fill: COLORS.amberLight } }, '5.80s (9.7x)', '4.90s (9.8x)']
    ];

    slide.addTable(calibRows, {
      x: 6.68,
      y: 4.4,
      w: 6.2,
      colW: [0.8, 1.2, 1.2, 1.0, 1.0, 1.0],
      fontSize: 8.5,
      fontFace: 'Arial',
      border: { pt: 0.6, color: COLORS.border },
      align: 'center',
      valign: 'middle'
    });
  }

  // =========================================================================
  // SLIDE 9: EMPIRICAL RESULTS I - OWN JAMSTACK MEASUREMENTS TABLE
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(
      slide,
      'Empirical Results I: Own Jamstack Measurements (μ ± σ, n = 5 Runs)',
      '5. Empirical Results (Next.js SSG vs. Astro Islands)'
    );
    addSlideFooter(slide, 9);

    const header = [
      { text: 'Architecture', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } },
      { text: 'Load (N)', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } },
      { text: 'Score (μ±σ)', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } },
      { text: 'FCP [s]', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } },
      { text: 'LCP [s]', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } },
      { text: 'TBT [ms]', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } },
      { text: 'SI [s]', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } },
      { text: 'CLS', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } },
      { text: 'HTML [kB]', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } },
      { text: 'JS [kB]', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } },
      { text: 'DOM Nodes', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } }
    ];

    const dataRows = [
      ['Astro Islands', '10', '100.0 (±0.0)', '0.250 (±0.027)', '0.250 (±0.027)', '0.0 (±0.0)', '0.304 (±0.077)', '0.000', '17.0', '0.0', '265'],
      ['Astro Islands', '50', '100.0 (±0.0)', '0.271 (±0.001)', '0.271 (±0.001)', '0.0 (±0.0)', '0.271 (±0.001)', '0.000', '43.8', '0.0', '1,025'],
      ['Astro Islands', '100', '100.0 (±0.0)', '0.278 (±0.008)', '0.278 (±0.008)', '0.0 (±0.0)', '0.278 (±0.008)', '0.000', '77.9', '0.0', '1,975'],
      ['Astro Islands', '500', '100.0 (±0.0)', '0.575 (±0.051)', '0.589 (±0.038)', '2.9 (±4.1)', '0.575 (±0.051)', '0.000', '348.1', '0.0', '9,575'],
      ['Astro Islands', '1,000', '98.4 (±0.5)', '0.797 (±0.034)', '0.832 (±0.039)', '62.1 (±29.3)', '0.797 (±0.034)', '0.000', '685.3', '0.0', '19,075'],
      ['Astro Islands', '5,000', '37.8 (±0.4)', '2.961 (±0.027)', '2.990 (±0.042)', '1307.9 (±67.6)', '2.961 (±0.027)', '0.000', '3,385.2', '0.0', '95,075'],
      ['Astro Islands', '10,000', '26.0 (±0.0)', '5.667 (±0.006)', '5.700 (±0.009)', '2675.5 (±102.6)', '5.667 (±0.006)', '0.000', '6,760.2', '0.0', '190,075'],
      ['Next.js SSG', '10', '100.0 (±0.0)', '0.259 (±0.002)', '0.658 (±0.004)', '0.0 (±0.0)', '0.259 (±0.002)', '0.000', '18.6', '350.5', '275'],
      ['Next.js SSG', '50', '100.0 (±0.0)', '0.295 (±0.007)', '0.701 (±0.002)', '0.0 (±0.0)', '0.295 (±0.007)', '0.000', '55.8', '350.5', '1,035'],
      ['Next.js SSG', '100', '100.0 (±0.0)', '0.337 (±0.008)', '0.736 (±0.006)', '0.0 (±0.0)', '0.337 (±0.008)', '0.000', '102.9', '350.5', '1,985'],
      ['Next.js SSG', '500', '98.4 (±0.5)', '0.640 (±0.022)', '0.950 (±0.077)', '10.4 (±16.2)', '0.640 (±0.022)', '0.000', '476.7', '350.5', '9,585'],
      ['Next.js SSG', '1,000', '94.0 (±0.7)', '1.061 (±0.064)', '1.371 (±0.060)', '60.0 (±34.9)', '1.061 (±0.064)', '0.000', '943.0', '350.5', '19,085'],
      ['Next.js SSG', '5,000', '31.2 (±0.4)', '4.030 (±0.092)', '4.353 (±0.006)', '1030.7 (±134.7)', '4.030 (±0.092)', '0.000', '4,676.4', '350.5', '95,085'],
      ['Next.js SSG', '10,000', '25.0 (±0.0)', '7.751 (±0.014)', '8.121 (±0.005)', '2344.0 (±251.8)', '7.751 (±0.014)', '0.000', '9,343.2', '350.5', '190,085']
    ].map((r, idx) =>
      r.map((cell, cIdx) => ({
        text: cell,
        options: {
          fill: idx < 7 ? 'F0FDF4' : 'EFF6FF',
          bold: cIdx === 0 || cIdx === 1 || cIdx === 2
        }
      }))
    );

    slide.addTable([header, ...dataRows], {
      x: 0.4,
      y: 1.1,
      w: 12.533,
      colW: [1.55, 0.85, 1.25, 1.35, 1.35, 1.5, 1.35, 0.7, 0.95, 0.78, 0.9],
      fontSize: 8.5,
      fontFace: 'Arial',
      border: { pt: 0.5, color: COLORS.border },
      align: 'right',
      valign: 'middle'
    });

    slide.addText(
      'Key Observation: Astro ships 0.0 kB of external JS framework runtime (vs. 350.5 kB in Next.js) and avoids Next.js RSC double serialization (6,760.2 kB vs. 9,343.2 kB HTML at N = 10,000), yielding 39%–62% faster LCP across all workload stages.',
      {
        x: 0.5,
        y: 6.55,
        w: 12.3,
        h: 0.4,
        fontSize: 10.5,
        bold: true,
        color: COLORS.navy,
        fontFace: 'Arial'
      }
    );
  }

  // =========================================================================
  // SLIDE 10: CROSS-STUDY RESULTS II - FCP & SPEED INDEX CHARTS
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(
      slide,
      'Cross-Study Results II: First Contentful Paint (FCP) & Speed Index (SI)',
      '5. Cross-Study Comparison vs. Fahrudin et al. (2025) [Ref 17]'
    );
    addSlideFooter(slide, 10);

    slide.addImage({
      path: pngPaths['chart-fcp'],
      x: 0.45,
      y: 1.15,
      w: 6.1,
      h: 3.26
    });

    slide.addImage({
      path: pngPaths['chart-si'],
      x: 6.75,
      y: 1.15,
      w: 6.1,
      h: 3.26
    });

    slide.addShape('roundRect', {
      x: 0.45,
      y: 4.55,
      w: 12.4,
      h: 2.3,
      rectRadius: 0.06,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.border, width: 1 }
    });

    slide.addText(
      [
        {
          text: '1. Why React/Vue CSR Show Constant 0.30s FCP at N = 10,000 (Left Chart):\n',
          options: { bold: true, color: COLORS.amber }
        },
        {
          text: 'In CSR [Ref 17], FCP only measures the initial paint of the empty application shell before the 10,000 records are rendered. In contrast, SSG (Astro/Next.js) and SSR (Blade) transmit the complete pre-rendered HTML table in the initial document.\n\n',
          options: { color: COLORS.slateDark }
        },
        {
          text: '2. Astro Islands Achieves Best Speed Index for N = 50 to 1,000 (Right Chart):\n',
          options: { bold: true, color: COLORS.emerald }
        },
        {
          text: 'From N = 50 (0.27s raw / 0.32s calibrated) to N = 1,000 (0.80s raw / 0.93s calibrated), Astro achieves tremendous visual progression speed—outperforming Next.js SSG (1.06s) and Blade SSR (1.50s) at N = 1,000.',
          options: { color: COLORS.slateDark }
        }
      ],
      {
        x: 0.65,
        y: 4.68,
        w: 12.0,
        h: 2.05,
        fontSize: 11,
        fontFace: 'Arial',
        valign: 'middle'
      }
    );
  }

  // =========================================================================
  // SLIDE 11: CROSS-STUDY RESULTS III - LARGEST CONTENTFUL PAINT (LCP)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(
      slide,
      'Cross-Study Results III: Largest Contentful Paint (LCP [s], Lower is Better)',
      '5. Cross-Study Comparison vs. Fahrudin et al. (2025) [Ref 17]'
    );
    addSlideFooter(slide, 11);

    slide.addImage({
      path: pngPaths['chart-lcp'],
      x: 0.45,
      y: 1.15,
      w: 6.65,
      h: 3.55
    });

    const lcpRows = [
      [
        { text: 'Load (N)', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } },
        { text: 'Astro [Own]', options: { bold: true, fill: COLORS.emerald, color: 'FFFFFF' } },
        { text: 'Next.js [Own]', options: { bold: true, fill: COLORS.blue, color: 'FFFFFF' } },
        { text: 'Blade [17]', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } },
        { text: 'React [17]', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } },
        { text: 'Vue [17]', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } }
      ],
      ['10', { text: '0.25s', options: { bold: true, fill: COLORS.emeraldLight } }, '0.66s', '0.40s', '0.60s', '0.50s'],
      ['50', { text: '0.27s', options: { bold: true, fill: COLORS.emeraldLight } }, '0.70s', '0.30s', '0.60s', '0.60s'],
      ['100', { text: '0.28s', options: { bold: true, fill: COLORS.emeraldLight } }, '0.74s', '0.30s', '0.60s', '0.60s'],
      ['500', '0.59s', '0.95s', { text: '0.40s', options: { bold: true, fill: COLORS.amberLight } }, '0.60s', '0.80s'],
      ['1,000', '0.83s', '1.37s', { text: '0.50s', options: { bold: true, fill: COLORS.amberLight } }, '0.80s', '0.90s'],
      ['5,000', '2.99s', '4.35s', { text: '1.50s', options: { bold: true, fill: COLORS.amberLight } }, '1.90s', '1.80s'],
      ['10,000', '5.70s', '8.12s', { text: '3.10s', options: { bold: true, fill: COLORS.amberLight } }, '5.80s', '4.90s']
    ];

    slide.addTable(lcpRows, {
      x: 7.25,
      y: 1.15,
      w: 5.6,
      colW: [0.95, 1.05, 1.05, 0.85, 0.85, 0.85],
      fontSize: 9.5,
      fontFace: 'Arial',
      border: { pt: 0.75, color: COLORS.border },
      align: 'center',
      valign: 'middle'
    });

    slide.addShape('roundRect', {
      x: 0.45,
      y: 4.9,
      w: 12.4,
      h: 1.95,
      rectRadius: 0.06,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.emerald, width: 1.2 }
    });
    slide.addText(
      [
        { text: 'Key LCP Takeaways (Best values highlighted in table per Lecture 04, Slide 51):\n', options: { bold: true, color: COLORS.navy } },
        {
          text: '• Light Workloads (N = 10 to 100): Astro Islands achieves the fastest LCP overall (0.25s–0.28s raw; 0.29s–0.33s calibrated), reducing LCP by 62% compared to Next.js SSG and by >50% compared to React CSR [Ref 17].\n',
          options: { color: COLORS.slateDark }
        },
        {
          text: '• Medium Workloads (N = 500 to 1,000): Both Astro (0.59s / 0.83s) and Next.js (0.95s / 1.37s) stay well below Google’s "Good" Core Web Vitals threshold of 2.50s.\n',
          options: { color: COLORS.slateDark }
        },
        {
          text: '• Heavy Workloads (N = 10,000): Astro (5.70s) outperforms both Next.js SSG (8.12s, slowed by double RSC payload) and React CSR (5.80s in [Ref 17]).',
          options: { color: COLORS.slateDark }
        }
      ],
      {
        x: 0.65,
        y: 5.0,
        w: 12.0,
        h: 1.75,
        fontSize: 10.8,
        fontFace: 'Arial',
        valign: 'middle'
      }
    );
  }

  // =========================================================================
  // SLIDE 12: CROSS-STUDY RESULTS IV - TOTAL BLOCKING TIME (TBT)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(
      slide,
      'Cross-Study Results IV: Total Blocking Time (TBT [ms], Lower is Better)',
      '5. Cross-Study Comparison vs. Fahrudin et al. (2025) [Ref 17]'
    );
    addSlideFooter(slide, 12);

    slide.addImage({
      path: pngPaths['chart-tbt'],
      x: 0.45,
      y: 1.15,
      w: 6.65,
      h: 3.55
    });

    const tbtRows = [
      [
        { text: 'Load (N)', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } },
        { text: 'Astro [Own]', options: { bold: true, fill: COLORS.emerald, color: 'FFFFFF' } },
        { text: 'Next.js [Own]', options: { bold: true, fill: COLORS.blue, color: 'FFFFFF' } },
        { text: 'Blade [17]', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } },
        { text: 'React [17]', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } },
        { text: 'Vue [17]', options: { bold: true, fill: COLORS.navy, color: 'FFFFFF' } }
      ],
      ['10', { text: '0 ms', options: { bold: true, fill: COLORS.emeraldLight } }, { text: '0 ms', options: { bold: true, fill: COLORS.blueLight } }, { text: '0 ms', options: { bold: true } }, { text: '0 ms', options: { bold: true } }, { text: '0 ms', options: { bold: true } }],
      ['50', { text: '0 ms', options: { bold: true, fill: COLORS.emeraldLight } }, { text: '0 ms', options: { bold: true, fill: COLORS.blueLight } }, { text: '0 ms', options: { bold: true } }, { text: '0 ms', options: { bold: true } }, { text: '0 ms', options: { bold: true } }],
      ['100', { text: '0 ms', options: { bold: true, fill: COLORS.emeraldLight } }, { text: '0 ms', options: { bold: true, fill: COLORS.blueLight } }, { text: '0 ms', options: { bold: true } }, { text: '0 ms', options: { bold: true } }, { text: '0 ms', options: { bold: true } }],
      ['500', '3 ms', '10 ms', '210 ms', { text: '0 ms', options: { bold: true, fill: COLORS.amberLight } }, '30 ms'],
      ['1,000', '62 ms', { text: '60 ms', options: { bold: true, fill: COLORS.blueLight } }, '510 ms', { text: '60 ms', options: { bold: true, fill: COLORS.amberLight } }, { text: '60 ms', options: { bold: true, fill: COLORS.amberLight } }],
      ['5,000', '1,308 ms', '1,031 ms', '1,710 ms', '560 ms', { text: '480 ms', options: { bold: true, fill: COLORS.amberLight } }],
      ['10,000', '2,676 ms', '2,344 ms', '4,860 ms', { text: '650 ms', options: { bold: true, fill: COLORS.amberLight } }, '930 ms']
    ];

    slide.addTable(tbtRows, {
      x: 7.25,
      y: 1.15,
      w: 5.6,
      colW: [0.95, 1.05, 1.05, 0.85, 0.85, 0.85],
      fontSize: 9.5,
      fontFace: 'Arial',
      border: { pt: 0.75, color: COLORS.border },
      align: 'center',
      valign: 'middle'
    });

    slide.addShape('roundRect', {
      x: 0.45,
      y: 4.9,
      w: 12.4,
      h: 1.95,
      rectRadius: 0.06,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.blue, width: 1.2 }
    });
    slide.addText(
      [
        { text: 'Key TBT Takeaways (Main-Thread Responsiveness & Interactivity):\n', options: { bold: true, color: COLORS.navy } },
        {
          text: '• N ≤ 1,000: Both Jamstack architectures maintain near-zero blocking time (0 ms up to N=100; ~60 ms at N=1,000), beating Laravel Blade SSR (210 ms at N=500; 510 ms at N=1,000) by 88%.\n',
          options: { color: COLORS.slateDark }
        },
        {
          text: '• N = 10,000 (45%–52% Raw / 36%–44% Calibrated Reduction vs. Blade SSR): While Blade SSR reaches 4,860 ms TBT in [Ref 17], Next.js SSG (2,344 ms raw / 2,742 ms calibrated) and Astro Islands (2,676 ms raw / 3,131 ms calibrated) substantially reduce blocking time.\n',
          options: { color: COLORS.slateDark }
        },
        {
          text: '• Why Astro still incurs 2,676 ms TBT at N = 10,000 despite 0 kB JS: Parsing 6.76 MB of HTML and computing CSS table layout for 190,075 DOM nodes blocks Chromium’s main thread.',
          options: { color: COLORS.slateDark }
        }
      ],
      {
        x: 0.65,
        y: 5.0,
        w: 12.0,
        h: 1.75,
        fontSize: 10.8,
        fontFace: 'Arial',
        valign: 'middle'
      }
    );
  }

  // =========================================================================
  // SLIDE 13: CAUSAL ANALYSIS - DOUBLE PAYLOAD & DOM INFLECTION POINT
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(
      slide,
      'Causal Analysis: The "Double-Payload Penalty" & DOM Inflection Point',
      '6. Scientific Discussion'
    );
    addSlideFooter(slide, 13);

    // Box 1: Double Payload
    slide.addShape('roundRect', {
      x: 0.5,
      y: 1.2,
      w: 5.95,
      h: 5.55,
      rectRadius: 0.08,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.blue, width: 1.5 }
    });
    slide.addShape('rect', {
      x: 0.5,
      y: 1.2,
      w: 5.95,
      h: 0.55,
      fill: { color: COLORS.blue }
    });
    slide.addText('Finding 1: Next.js RSC "Double-Payload Penalty"', {
      x: 0.7,
      y: 1.28,
      w: 5.55,
      h: 0.4,
      fontSize: 13,
      bold: true,
      color: 'FFFFFF',
      fontFace: 'Arial'
    });
    slide.addText(
      [
        { text: 'Why is Next.js HTML +38.2% larger than Astro for identical DOM?\n\n', options: { bold: true, color: COLORS.navy } },
        { text: '• At N = 1,000: ', options: { bold: true } },
        { text: 'Astro = 685.3 kB HTML vs. Next.js = 943.0 kB HTML (+350.5 kB JS)\n', options: {} },
        { text: '• At N = 10,000: ', options: { bold: true } },
        { text: 'Astro = 6,760.2 kB HTML vs. Next.js = 9,343.2 kB HTML (+350.5 kB JS)\n\n', options: {} },
        { text: 'Causal Mechanism:\n', options: { bold: true, color: COLORS.blue } },
        {
          text: 'When a Next.js Server Component passes build-time data (items) as props to an interactive Client Component ("use client"), Next.js serializes the entire dataset TWICE inside the HTML file:\n' +
            '1) Once as rendered HTML <tr> table rows.\n' +
            '2) A second time inside inline <script>self.__next_f.push(...)</script> React Server Component (RSC) hydration payloads.\n\n' +
            'Transferring and parsing this extra 2.58 MB directly causes Next.js LCP to rise from 5.70s (Astro) to 8.12s at N = 10,000.',
          options: {}
        }
      ],
      {
        x: 0.75,
        y: 1.9,
        w: 5.45,
        h: 4.65,
        fontSize: 11,
        color: COLORS.slateDark,
        fontFace: 'Arial',
        valign: 'top'
      }
    );

    // Box 2: DOM Inflection Point
    slide.addShape('roundRect', {
      x: 6.85,
      y: 1.2,
      w: 5.98,
      h: 5.55,
      rectRadius: 0.08,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.red, width: 1.5 }
    });
    slide.addShape('rect', {
      x: 6.85,
      y: 1.2,
      w: 5.98,
      h: 0.55,
      fill: { color: COLORS.red }
    });
    slide.addText('Finding 2: The N = 1,000 → 5,000 DOM Inflection Point', {
      x: 7.05,
      y: 1.28,
      w: 5.58,
      h: 0.4,
      fontSize: 13,
      bold: true,
      color: 'FFFFFF',
      fontFace: 'Arial'
    });
    slide.addText(
      [
        { text: 'Sharp Performance Cliff Above ~19,000 DOM Nodes:\n\n', options: { bold: true, color: COLORS.navy } },
        { text: '• Up to N = 1,000 (19,075 DOM nodes): ', options: { bold: true } },
        { text: 'Astro scores 98.4 (LCP 0.83s, TBT 62 ms) and Next.js scores 94.0 (LCP 1.37s, TBT 60 ms).\n', options: {} },
        { text: '• At N = 5,000 (95,075 DOM nodes): ', options: { bold: true } },
        { text: 'Scores drop sharply to 37.8 (Astro) and 31.2 (Next.js) as TBT exceeds 1,000 ms.\n\n', options: {} },
        { text: 'Causal Mechanism:\n', options: { bold: true, color: COLORS.red } },
        {
          text: 'Google Lighthouse recommends keeping total DOM elements below 1,500 nodes. At N = 5,000 (95,075 nodes) and N = 10,000 (190,075 nodes), even a Zero-JS architecture (Astro) becomes bottlenecked by the browser’s native C++ HTML parser and CSS table layout engine.\n\n' +
            'Thus, Zero-JS Islands solve the JavaScript Hydration Tax, but cannot bypass browser DOM tree construction limits above N = 1,000 rows.',
          options: {}
        }
      ],
      {
        x: 7.1,
        y: 1.9,
        w: 5.48,
        h: 4.65,
        fontSize: 11,
        color: COLORS.slateDark,
        fontFace: 'Arial',
        valign: 'top'
      }
    );
  }

  // =========================================================================
  // SLIDE 14: TECHNICAL ADVICE FOR SCALABLE DESIGN (TOPIC #14 PART 2)
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(
      slide,
      'Technical Advice for Scalable Web Architecture Design',
      '7. Actionable Engineering Recommendations (Topic #14)'
    );
    addSlideFooter(slide, 14);

    const guidelines = [
      {
        num: 'G1',
        title: 'Adopt Astro Islands for Dashboards & Catalogs up to N = 1,000 Records',
        desc: 'For data-driven views up to 1,000 entries (~19,000 DOM nodes), prefer Astro (SSG + Islands) over full-hydration frameworks (Next.js) and CSR SPAs. It delivers a 98.4–100.0 Lighthouse Score, eliminates 350.5 kB of React JS runtime, and reduces LCP by 39%–62%.',
        color: COLORS.emerald
      },
      {
        num: 'G2',
        title: 'Enforce a Hard Architectural Ceiling of N ≤ 1,000 Rows (≤ 20,000 DOM Nodes) per Page',
        desc: 'All 5 architectures (Astro, Next.js, Blade SSR, React CSR, Vue CSR) violate Core Web Vitals between N = 1,000 and N = 5,000. Beyond 1,000 rows, architects must decouple dataset size from initial DOM size via Static Pagination (/assessments/page/1) or DOM Virtualization (@tanstack/virtual).',
        color: COLORS.blue
      },
      {
        num: 'G3',
        title: 'Prevent the Next.js RSC Double-Payload Anti-Pattern in "use client" Components',
        desc: 'When using Next.js App Router, never pass large arrays (N > 500) from a Server Component into a "use client" component, as Next.js duplicates the dataset in self.__next_f.push(...) script tags (+38% HTML bloat). Render large tables inside pure Server Components instead.',
        color: COLORS.amber
      },
      {
        num: 'G4',
        title: 'Use Hybrid SSG + Asynchronous Web-Worker Chunking for Datasets ≥ 5,000 Entries',
        desc: 'When instant client-side filtering across 5,000–10,000 records is required without a backend database, pre-render only the first 50–100 rows in static HTML (achieving FCP/LCP < 0.30s and TBT = 0 ms) and lazy-load remaining records asynchronously via a background Web Worker.',
        color: COLORS.purple
      }
    ];

    guidelines.forEach((g, idx) => {
      const y = 1.2 + idx * 1.4;
      slide.addShape('roundRect', {
        x: 0.5,
        y,
        w: 12.333,
        h: 1.25,
        rectRadius: 0.06,
        fill: { color: COLORS.cardBg },
        line: { color: g.color, width: 1.5 }
      });
      slide.addShape('roundRect', {
        x: 0.65,
        y: y + 0.2,
        w: 0.85,
        h: 0.85,
        rectRadius: 0.08,
        fill: { color: g.color }
      });
      slide.addText(g.num, {
        x: 0.65,
        y: y + 0.2,
        w: 0.85,
        h: 0.85,
        fontSize: 16,
        bold: true,
        align: 'center',
        valign: 'middle',
        color: 'FFFFFF',
        fontFace: 'Arial'
      });
      slide.addText(g.title, {
        x: 1.7,
        y: y + 0.12,
        w: 10.9,
        h: 0.32,
        fontSize: 13,
        bold: true,
        color: COLORS.navy,
        fontFace: 'Arial'
      });
      slide.addText(g.desc, {
        x: 1.7,
        y: y + 0.46,
        w: 10.9,
        h: 0.7,
        fontSize: 10.8,
        color: COLORS.slateDark,
        fontFace: 'Arial',
        valign: 'top'
      });
    });
  }

  // =========================================================================
  // SLIDE 15: THREATS TO VALIDITY, CONCLUSION & REFERENCES
  // =========================================================================
  {
    const slide = pptx.addSlide();
    addSlideHeader(
      slide,
      'Threats to Validity, Conclusion & Primary References',
      '8. Conclusion & References'
    );
    addSlideFooter(slide, 15);

    slide.addShape('roundRect', {
      x: 0.5,
      y: 1.2,
      w: 5.95,
      h: 5.55,
      rectRadius: 0.08,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.slate, width: 1.2 }
    });
    slide.addText('Threats to Validity & Summary Conclusion', {
      x: 0.75,
      y: 1.35,
      w: 5.45,
      h: 0.35,
      fontSize: 14,
      bold: true,
      color: COLORS.navy,
      fontFace: 'Arial'
    });
    slide.addText(
      [
        { text: 'Internal Validity:\n', options: { bold: true, color: COLORS.emerald } },
        {
          text: 'All 70 runs between Next.js and Astro were executed on the exact same Linux VM, Chromium binary (156.0.8078.79), loopback network, and seeded data (Seed 20260414), yielding minimal variance (LCP σ ≤ 0.08s).\n\n',
          options: {}
        },
        { text: 'External / Cross-Study Validity & Normalization:\n', options: { bold: true, color: COLORS.blue } },
        {
          text: 'By combining standardized Lighthouse Lantern Desktop simulation with Intra-Architecture Relative Scaling Normalization (S_N = M_N / M_10) and Light-Load Hardware Calibration (k_hw = 1.170), our cross-study conclusions remain invariant to raw CPU clock differences.\n\n',
          options: {}
        },
        { text: 'Open-Science Reproducibility Repository:\n', options: { bold: true, color: COLORS.purple } },
        {
          text: 'All prototypes, dataset generators, raw CSV/JSON metrics, and analysis scripts are publicly available at:\ngithub.com/MarcoM114/research-methods-experiment',
          options: {}
        }
      ],
      {
        x: 0.75,
        y: 1.85,
        w: 5.45,
        h: 4.7,
        fontSize: 11,
        color: COLORS.slateDark,
        fontFace: 'Arial',
        valign: 'top'
      }
    );

    slide.addShape('roundRect', {
      x: 6.8,
      y: 1.2,
      w: 6.03,
      h: 5.55,
      rectRadius: 0.08,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.blue, width: 1.2 }
    });
    slide.addText('Key References (IEEE Format)', {
      x: 7.05,
      y: 1.35,
      w: 5.5,
      h: 0.35,
      fontSize: 14,
      bold: true,
      color: COLORS.blue,
      fontFace: 'Arial'
    });
    slide.addText(
      '[17] T. M. Fahrudin, I. D. Wijaya, and A. H. Nasyuha, "Performance Comparison of Blade, Vue, and React Under Variable Data Loads," in Proc. Int. Conf. Computer Science, Information Technology and Engineering (ICCoSITE), IEEE, 2025, pp. 904–909, doi: 10.1109/ICCoSITE64204.2025.10939821.\n\n' +
        '[30] O. Lonka, "Performance comparison of two full-stack web frameworks: Astro and Next.js," Bachelor’s Thesis, Univ. of Oulu, 2023.\n\n' +
        '[2] T. Yavuz and I. Miladinovic, "Rendering Performance Analysis of Modern JavaScript Frameworks," in Proc. ICICT, 2023.\n\n' +
        '[20] M. Đurić, "Comparative Analysis of Client-Side and Server-Side Rendering in React Web Applications," 2025.\n\n' +
        '[6] I. Shitov, "Comparative Performance Analysis of Client-Side and Server-Side Rendering across Varying Hardware Configurations," 2025.',
      {
        x: 7.05,
        y: 1.85,
        w: 5.5,
        h: 4.7,
        fontSize: 10.5,
        color: COLORS.slateDark,
        fontFace: 'Arial',
        valign: 'top'
      }
    );
  }

  await pptx.writeFile({ fileName: OUT_PPTX });
  console.log(`Generated presentation: ${OUT_PPTX}`);
}

buildPresentation().catch((err) => {
  console.error(err);
  process.exit(1);
});
