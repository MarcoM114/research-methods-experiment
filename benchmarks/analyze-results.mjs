import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RESULTS_DIR = path.join(__dirname, 'results');

/**
 * Empirical reference values from Fahrudin et al. (2025) [Ref 17], Table III:
 * "Performance Comparison of Blade, Vue, and React Under Variable Data Loads"
 * Units in [17]: FCP (s), LCP (s), TBT (ms), SI (s), CLS (-).
 */
export const FAHRUDIN_2025_REF = {
  'blade-ssr': {
    label: 'Laravel Blade (SSR) [Ref 17]',
    source: 'Fahrudin et al. (2025)',
    stages: {
      10: { fcp_s: 0.4, lcp_s: 0.4, tbt_ms: 0, si_s: 0.4, cls: 0.004 },
      50: { fcp_s: 0.3, lcp_s: 0.3, tbt_ms: 0, si_s: 0.3, cls: 0.004 },
      100: { fcp_s: 0.3, lcp_s: 0.3, tbt_ms: 0, si_s: 0.5, cls: 0.004 },
      500: { fcp_s: 0.2, lcp_s: 0.4, tbt_ms: 210, si_s: 0.9, cls: 0.006 },
      1000: { fcp_s: 0.3, lcp_s: 0.5, tbt_ms: 510, si_s: 1.5, cls: 0.006 },
      5000: { fcp_s: 0.8, lcp_s: 1.5, tbt_ms: 1710, si_s: 4.5, cls: 0.006 },
      10000: { fcp_s: 1.6, lcp_s: 3.1, tbt_ms: 4860, si_s: 5.5, cls: 0.005 }
    }
  },
  'react-csr': {
    label: 'React (SPA / CSR) [Ref 17]',
    source: 'Fahrudin et al. (2025)',
    stages: {
      10: { fcp_s: 0.3, lcp_s: 0.6, tbt_ms: 0, si_s: 0.5, cls: 0.011 },
      50: { fcp_s: 0.3, lcp_s: 0.6, tbt_ms: 0, si_s: 0.5, cls: 0.003 },
      100: { fcp_s: 0.3, lcp_s: 0.6, tbt_ms: 0, si_s: 0.7, cls: 0.003 },
      500: { fcp_s: 0.4, lcp_s: 0.6, tbt_ms: 0, si_s: 0.7, cls: 0.003 },
      1000: { fcp_s: 0.3, lcp_s: 0.8, tbt_ms: 60, si_s: 0.9, cls: 0.003 },
      5000: { fcp_s: 0.3, lcp_s: 1.9, tbt_ms: 560, si_s: 1.9, cls: 0.003 },
      10000: { fcp_s: 0.3, lcp_s: 5.8, tbt_ms: 650, si_s: 3.5, cls: 0.003 }
    }
  },
  'vue-csr': {
    label: 'Vue (SPA / CSR) [Ref 17]',
    source: 'Fahrudin et al. (2025)',
    stages: {
      10: { fcp_s: 0.4, lcp_s: 0.5, tbt_ms: 0, si_s: 0.4, cls: 0.011 },
      50: { fcp_s: 0.3, lcp_s: 0.6, tbt_ms: 0, si_s: 0.5, cls: 0.003 },
      100: { fcp_s: 0.3, lcp_s: 0.6, tbt_ms: 0, si_s: 0.6, cls: 0.003 },
      500: { fcp_s: 0.3, lcp_s: 0.8, tbt_ms: 30, si_s: 0.6, cls: 0.003 },
      1000: { fcp_s: 0.4, lcp_s: 0.9, tbt_ms: 60, si_s: 0.9, cls: 0.003 },
      5000: { fcp_s: 0.3, lcp_s: 1.8, tbt_ms: 480, si_s: 1.5, cls: 0.003 },
      10000: { fcp_s: 0.3, lcp_s: 4.9, tbt_ms: 930, si_s: 4.3, cls: 0.003 }
    }
  }
};

function computeMean(values) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function computeStdDev(values) {
  if (values.length <= 1) return 0;
  const mean = computeMean(values);
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function computeMedian(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function generateLineChartSvg({ title, subtitle, yLabel, stages, series, maxYOverride }) {
  const width = 860;
  const height = 460;
  const padLeft = 75;
  const padRight = 40;
  const padTop = 75;
  const padBottom = 85;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const allValues = series.flatMap((s) => s.values.filter((v) => typeof v === 'number'));
  const rawMax = Math.max(...allValues, 0.1);
  const maxY = maxYOverride || Number((rawMax * 1.12).toFixed(2));

  const xForIdx = (idx) =>
    stages.length === 1 ? padLeft + plotW / 2 : padLeft + (idx / (stages.length - 1)) * plotW;
  const yForVal = (val) => padTop + plotH - Math.min(1, Math.max(0, val / maxY)) * plotH;

  const yTicks = 5;
  let gridLines = '';
  for (let i = 0; i <= yTicks; i++) {
    const val = (maxY / yTicks) * i;
    const y = yForVal(val);
    const label = maxY >= 100 ? Math.round(val) : val.toFixed(2);
    gridLines += `
      <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="${i === 0 ? 'none' : '4 4'}" stroke-width="1" />
      <text x="${padLeft - 10}" y="${y + 4}" text-anchor="end" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#475569">${label}</text>
    `;
  }

  let xLabels = '';
  stages.forEach((st, idx) => {
    const x = xForIdx(idx);
    xLabels += `
      <line x1="${x}" y1="${padTop + plotH}" x2="${x}" y2="${padTop + plotH + 6}" stroke="#64748b" stroke-width="1" />
      <text x="${x}" y="${padTop + plotH + 24}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="600" fill="#1e293b">${st.toLocaleString('en-US')}</text>
    `;
  });

  let pathsAndPoints = '';
  series.forEach((s) => {
    const pts = s.values
      .map((v, idx) => (typeof v === 'number' ? { x: xForIdx(idx), y: yForVal(v), v } : null))
      .filter(Boolean);
    if (!pts.length) return;
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    pathsAndPoints += `
      <path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.isOwn ? '3' : '2'}" stroke-dasharray="${s.dashed ? '6 4' : 'none'}" />
    `;
    pts.forEach((p) => {
      pathsAndPoints += `
        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${s.isOwn ? '4.5' : '3.5'}" fill="${s.color}" stroke="#ffffff" stroke-width="1.5" />
      `;
    });
  });

  let legendItems = '';
  series.forEach((s, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const lx = padLeft + col * 255;
    const ly = height - 38 + row * 20;
    legendItems += `
      <line x1="${lx}" y1="${ly - 4}" x2="${lx + 22}" y2="${ly - 4}" stroke="${s.color}" stroke-width="${s.isOwn ? '3' : '2'}" stroke-dasharray="${s.dashed ? '5 3' : 'none'}" />
      <circle cx="${lx + 11}" cy="${ly - 4}" r="3.5" fill="${s.color}" />
      <text x="${lx + 28}" y="${ly}" font-family="Inter, system-ui, sans-serif" font-size="11.5" font-weight="${s.isOwn ? '700' : '500'}" fill="#0f172a">${s.label}</text>
    `;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <rect width="${width}" height="${height}" fill="#ffffff" rx="8" stroke="#cbd5e1" stroke-width="1" />
  <text x="${padLeft}" y="32" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="700" fill="#0f172a">${title}</text>
  <text x="${padLeft}" y="52" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#475569">${subtitle}</text>
  ${gridLines}
  <line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${padTop + plotH}" stroke="#64748b" stroke-width="1.2" />
  <line x1="${padLeft}" y1="${padTop + plotH}" x2="${width - padRight}" y2="${padTop + plotH}" stroke="#64748b" stroke-width="1.2" />
  ${xLabels}
  <text x="${padLeft + plotW / 2}" y="${padTop + plotH + 44}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="12.5" font-weight="600" fill="#334155">Dataset Load Stage (Number of Rendered Assessment Entries N)</text>
  <text x="20" y="${padTop + plotH / 2}" text-anchor="middle" transform="rotate(-90, 20, ${padTop + plotH / 2})" font-family="Inter, system-ui, sans-serif" font-size="12.5" font-weight="600" fill="#334155">${yLabel}</text>
  ${pathsAndPoints}
  ${legendItems}
</svg>`;
}

function main() {
  const rawJsonPath = path.join(RESULTS_DIR, 'raw-runs.json');
  if (!fs.existsSync(rawJsonPath)) {
    throw new Error(`Missing ${rawJsonPath}. Run "npm run benchmark" first.`);
  }

  const payload = JSON.parse(fs.readFileSync(rawJsonPath, 'utf-8'));
  const { metadata, runs } = payload;

  const grouped = {};
  for (const r of runs) {
    const key = `${r.architectureId}__${r.stage}`;
    if (!grouped[key]) {
      grouped[key] = {
        architectureId: r.architectureId,
        architectureLabel: r.architectureLabel,
        stage: r.stage,
        items: []
      };
    }
    grouped[key].items.push(r);
  }

  const metricKeys = [
    'perfScore',
    'fcp_s',
    'lcp_s',
    'tbt_ms',
    'si_s',
    'tti_s',
    'cls',
    'total_kb',
    'js_kb',
    'html_kb',
    'dom_nodes'
  ];

  const summaryRows = Object.values(grouped)
    .sort((a, b) => a.architectureId.localeCompare(b.architectureId) || a.stage - b.stage)
    .map((g) => {
      const row = {
        architectureId: g.architectureId,
        architectureLabel: g.architectureLabel,
        stage: g.stage,
        n: g.items.length
      };
      for (const mk of metricKeys) {
        const vals = g.items.map((x) => x[mk]);
        row[`${mk}_mean`] = Number(computeMean(vals).toFixed(mk === 'cls' ? 4 : 3));
        row[`${mk}_sd`] = Number(computeStdDev(vals).toFixed(mk === 'cls' ? 4 : 3));
        row[`${mk}_median`] = Number(computeMedian(vals).toFixed(mk === 'cls' ? 4 : 3));
      }
      return row;
    });

  // Write summary-stats.csv
  const csvHeaders = Object.keys(summaryRows[0] || {});
  const csvLines = [
    csvHeaders.join(','),
    ...summaryRows.map((r) =>
      csvHeaders
        .map((h) => (typeof r[h] === 'string' && r[h].includes(',') ? `"${r[h]}"` : r[h]))
        .join(',')
    )
  ];
  const summaryCsvPath = path.join(RESULTS_DIR, 'summary-stats.csv');
  fs.writeFileSync(summaryCsvPath, csvLines.join('\n') + '\n', 'utf-8');

  // Helper to lookup mean/sd for own measurements
  const getOwnStat = (archId, stage) =>
    summaryRows.find((r) => r.architectureId === archId && r.stage === stage);

  const stages = metadata.stages || [10, 50, 100, 500, 1000, 5000, 10000];

  // Generate SVG charts with zero baseline (as required by Lecture 04 Slides 55-60)
  const chartConfigs = [
    {
      filename: 'chart-fcp.svg',
      metric: 'fcp_s',
      title: 'First Contentful Paint (FCP) Across Variable Data Loads (Lower is Better)',
      subtitle: 'Comparison of Own Measurements (Next.js SSG, Astro Islands) vs. Fahrudin et al. (2025) [Ref 17]',
      yLabel: 'FCP Time (Seconds)'
    },
    {
      filename: 'chart-lcp.svg',
      metric: 'lcp_s',
      title: 'Largest Contentful Paint (LCP) Across Variable Data Loads (Lower is Better)',
      subtitle: 'Comparison of Own Measurements (Next.js SSG, Astro Islands) vs. Fahrudin et al. (2025) [Ref 17]',
      yLabel: 'LCP Time (Seconds)'
    },
    {
      filename: 'chart-tbt.svg',
      metric: 'tbt_ms',
      title: 'Total Blocking Time (TBT) Across Variable Data Loads (Lower is Better)',
      subtitle: 'Hydration Tax vs. Zero-JS Islands vs. SSR/CSR Baselines from Fahrudin et al. (2025) [Ref 17]',
      yLabel: 'Total Blocking Time (Milliseconds)'
    },
    {
      filename: 'chart-si.svg',
      metric: 'si_s',
      title: 'Speed Index (SI) Across Variable Data Loads (Lower is Better)',
      subtitle: 'Visual Progression Comparison Across 5 Web Application Architectures',
      yLabel: 'Speed Index (Seconds)'
    }
  ];

  for (const cfg of chartConfigs) {
    const series = [
      {
        label: 'Astro Jamstack (Islands) [Own Study]',
        color: '#059669',
        dashed: false,
        isOwn: true,
        values: stages.map((st) => getOwnStat('astro-islands', st)?.[`${cfg.metric}_mean`] ?? null)
      },
      {
        label: 'Next.js Jamstack (SSG + Hydration) [Own Study]',
        color: '#2563eb',
        dashed: false,
        isOwn: true,
        values: stages.map((st) => getOwnStat('nextjs-ssg', st)?.[`${cfg.metric}_mean`] ?? null)
      },
      {
        label: 'Laravel Blade (SSR) [Fahrudin et al., 2025]',
        color: '#dc2626',
        dashed: true,
        isOwn: false,
        values: stages.map((st) => FAHRUDIN_2025_REF['blade-ssr'].stages[st]?.[cfg.metric] ?? null)
      },
      {
        label: 'React (SPA / CSR) [Fahrudin et al., 2025]',
        color: '#d97706',
        dashed: true,
        isOwn: false,
        values: stages.map((st) => FAHRUDIN_2025_REF['react-csr'].stages[st]?.[cfg.metric] ?? null)
      },
      {
        label: 'Vue (SPA / CSR) [Fahrudin et al., 2025]',
        color: '#7c3aed',
        dashed: true,
        isOwn: false,
        values: stages.map((st) => FAHRUDIN_2025_REF['vue-csr'].stages[st]?.[cfg.metric] ?? null)
      }
    ];

    const svgContent = generateLineChartSvg({
      title: cfg.title,
      subtitle: cfg.subtitle,
      yLabel: cfg.yLabel,
      stages,
      series
    });
    fs.writeFileSync(path.join(RESULTS_DIR, cfg.filename), svgContent, 'utf-8');
  }

  // Format helper that bolds the best (lowest) value in a row per Lecture 04 Slide 51
  function formatComparisonRow(stage, metricKey, decimals = 2, unit = '') {
    const astroStat = getOwnStat('astro-islands', stage);
    const nextStat = getOwnStat('nextjs-ssg', stage);
    const bladeVal = FAHRUDIN_2025_REF['blade-ssr'].stages[stage]?.[metricKey];
    const reactVal = FAHRUDIN_2025_REF['react-csr'].stages[stage]?.[metricKey];
    const vueVal = FAHRUDIN_2025_REF['vue-csr'].stages[stage]?.[metricKey];

    const entries = [
      {
        id: 'astro',
        val: astroStat ? astroStat[`${metricKey}_mean`] : Infinity,
        sd: astroStat ? astroStat[`${metricKey}_sd`] : 0,
        isOwn: true
      },
      {
        id: 'next',
        val: nextStat ? nextStat[`${metricKey}_mean`] : Infinity,
        sd: nextStat ? nextStat[`${metricKey}_sd`] : 0,
        isOwn: true
      },
      { id: 'blade', val: bladeVal ?? Infinity, isOwn: false },
      { id: 'react', val: reactVal ?? Infinity, isOwn: false },
      { id: 'vue', val: vueVal ?? Infinity, isOwn: false }
    ];

    const minVal = Math.min(...entries.map((e) => e.val));

    const cells = entries.map((e) => {
      if (e.val === Infinity) return 'N/A';
      const formatted = e.isOwn
        ? `${e.val.toFixed(decimals)}${unit} (±${e.sd.toFixed(decimals)})`
        : `${e.val.toFixed(decimals)}${unit}`;
      return Math.abs(e.val - minVal) < 1e-6 ? `**${formatted}**` : formatted;
    });

    return `| **${stage.toLocaleString('en-US')}** | ${cells.join(' | ')} |`;
  }

  const reportMd = `# Empirical Benchmark Report: Jamstack (Next.js SSG & Astro Islands) vs. SSR & CSR [Ref 17]

## 1. Benchmark Execution Environment (Scenario Metadata)
- **Timestamp:** \`${metadata.timestamp}\`
- **OS / Kernel:** \`${metadata.platform}\`
- **CPU:** \`${metadata.cpuModel}\` (${metadata.cpuCores} logical cores)
- **RAM:** \`${metadata.totalMemoryGB} GB\`
- **Node.js Runtime:** \`${metadata.nodeVersion}\`
- **Browser Engine:** \`${metadata.chromeVersion}\`
- **Lighthouse Configuration:** Desktop Preset (\`1350x940\`, \`formFactor: desktop\`), **n = ${metadata.runsPerStage} repetitions** per stage and architecture
- **Primary Reference Baseline:** Fahrudin et al. (2025) [Ref 17] (*Laravel Blade SSR, React CSR, Vue CSR*)

---

## 2. Own Empirical Measurements: Detailed Summary Statistics ($\\mu \\pm \\sigma$)

| Architecture | Data Load ($N$) | Perf. Score ($\\mu \\pm \\sigma$) | FCP [s] ($\\mu \\pm \\sigma$) | LCP [s] ($\\mu \\pm \\sigma$) | TBT [ms] ($\\mu \\pm \\sigma$) | Speed Index [s] ($\\mu \\pm \\sigma$) | CLS ($\\mu$) | HTML Size [kB] | JS Bundle [kB] | DOM Elements |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${summaryRows
  .map(
    (r) =>
      `| **${r.architectureLabel}** | ${r.stage.toLocaleString('en-US')} | **${r.perfScore_mean.toFixed(1)}** (±${r.perfScore_sd.toFixed(1)}) | ${r.fcp_s_mean.toFixed(3)} (±${r.fcp_s_sd.toFixed(3)}) | ${r.lcp_s_mean.toFixed(3)} (±${r.lcp_s_sd.toFixed(3)}) | ${r.tbt_ms_mean.toFixed(1)} (±${r.tbt_ms_sd.toFixed(1)}) | ${r.si_s_mean.toFixed(3)} (±${r.si_s_sd.toFixed(3)}) | ${r.cls_mean.toFixed(4)} | ${r.html_kb_mean.toFixed(1)} | ${r.js_kb_mean.toFixed(1)} | ${Math.round(r.dom_nodes_mean).toLocaleString('en-US')} |`
  )
  .join('\n')}

---

## 3. Cross-Study Comparison: Own Measurements vs. Fahrudin et al. (2025) [Ref 17]
*(Best values per data load stage are highlighted in **bold** in accordance with Lecture 04 – Documentation, Slide 51.)*

### 3.1 First Contentful Paint — FCP (in Seconds, Lower is Better)
| Data Load ($N$) | Astro Islands [Own, $\\mu \\pm \\sigma$] | Next.js SSG [Own, $\\mu \\pm \\sigma$] | Blade SSR [Ref 17] | React CSR [Ref 17] | Vue CSR [Ref 17] |
| ---: | :---: | :---: | :---: | :---: | :---: |
${stages.map((st) => formatComparisonRow(st, 'fcp_s', 2, 's')).join('\n')}

### 3.2 Largest Contentful Paint — LCP (in Seconds, Lower is Better)
| Data Load ($N$) | Astro Islands [Own, $\\mu \\pm \\sigma$] | Next.js SSG [Own, $\\mu \\pm \\sigma$] | Blade SSR [Ref 17] | React CSR [Ref 17] | Vue CSR [Ref 17] |
| ---: | :---: | :---: | :---: | :---: | :---: |
${stages.map((st) => formatComparisonRow(st, 'lcp_s', 2, 's')).join('\n')}

### 3.3 Total Blocking Time — TBT (in Milliseconds, Lower is Better)
| Data Load ($N$) | Astro Islands [Own, $\\mu \\pm \\sigma$] | Next.js SSG [Own, $\\mu \\pm \\sigma$] | Blade SSR [Ref 17] | React CSR [Ref 17] | Vue CSR [Ref 17] |
| ---: | :---: | :---: | :---: | :---: | :---: |
${stages.map((st) => formatComparisonRow(st, 'tbt_ms', 0, ' ms')).join('\n')}

### 3.4 Speed Index — SI (in Seconds, Lower is Better)
| Data Load ($N$) | Astro Islands [Own, $\\mu \\pm \\sigma$] | Next.js SSG [Own, $\\mu \\pm \\sigma$] | Blade SSR [Ref 17] | React CSR [Ref 17] | Vue CSR [Ref 17] |
| ---: | :---: | :---: | :---: | :---: | :---: |
${stages.map((st) => formatComparisonRow(st, 'si_s', 2, 's')).join('\n')}

---

## 4. Visualized Performance Curves (Zero-Baseline Axes)
- ![FCP Comparison](./chart-fcp.svg)
- ![LCP Comparison](./chart-lcp.svg)
- ![TBT Comparison](./chart-tbt.svg)
- ![Speed Index Comparison](./chart-si.svg)
`;

  const reportPath = path.join(RESULTS_DIR, 'comparison-report.md');
  fs.writeFileSync(reportPath, reportMd, 'utf-8');

  console.log('====================================================================');
  console.log('Statistical Analysis & Chart Generation Complete!');
  console.log(` - Summary CSV      : ${summaryCsvPath}`);
  console.log(` - Markdown Report  : ${reportPath}`);
  console.log(` - SVG Line Charts  : chart-fcp.svg, chart-lcp.svg, chart-tbt.svg, chart-si.svg`);
  console.log('====================================================================');
}

main();
