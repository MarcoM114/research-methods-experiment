import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const RESULTS_DIR = path.join(__dirname, 'results');

const DEFAULT_STAGES = [10, 50, 100, 500, 1000, 5000, 10000];
const DEFAULT_RUNS = 5;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function parseArgs() {
  const args = process.argv.slice(2);
  let runs = DEFAULT_RUNS;
  let stages = DEFAULT_STAGES;
  let archs = ['nextjs-ssg', 'astro-islands'];
  let append = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--runs' && args[i + 1]) {
      runs = Number(args[i + 1]);
      i++;
    } else if (args[i] === '--stages' && args[i + 1]) {
      stages = args[i + 1].split(',').map((s) => Number(s.trim()));
      i++;
    } else if (args[i] === '--archs' && args[i + 1]) {
      archs = args[i + 1].split(',').map((s) => s.trim());
      i++;
    } else if (args[i] === '--append') {
      append = true;
    }
  }
  return { runs, stages, archs, append };
}

function createStaticServer(rootDir, port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
        let candidate = path.join(rootDir, urlPath);

        if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
          candidate = path.join(candidate, 'index.html');
        } else if (!fs.existsSync(candidate)) {
          if (fs.existsSync(`${candidate}.html`)) {
            candidate = `${candidate}.html`;
          } else if (fs.existsSync(path.join(candidate, 'index.html'))) {
            candidate = path.join(candidate, 'index.html');
          }
        }

        if (!fs.existsSync(candidate) || fs.statSync(candidate).isDirectory()) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
          return;
        }

        const ext = path.extname(candidate).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        const content = fs.readFileSync(candidate);
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable'
        });
        res.end(content);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(String(err));
      }
    });

    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

function getEnvironmentMetadata() {
  const cpus = os.cpus();
  let chromeVersion = 'Unknown';
  try {
    chromeVersion = execSync('chromium --version || google-chrome --version', {
      encoding: 'utf-8'
    }).trim();
  } catch {
    // ignore
  }
  return {
    timestamp: new Date().toISOString(),
    platform: `${os.type()} ${os.release()} (${os.arch()})`,
    cpuModel: cpus[0]?.model || 'Unknown CPU',
    cpuCores: cpus.length,
    totalMemoryGB: Number((os.totalmem() / 1024 ** 3).toFixed(2)),
    nodeVersion: process.version,
    chromeVersion
  };
}

function getDesktopLighthouseConfig() {
  return {
    extends: 'lighthouse:default',
    settings: {
      formFactor: 'desktop',
      throttling: {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0
      },
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false
      },
      disableStorageReset: false,
      onlyCategories: ['performance']
    }
  };
}

function extractMetricsFromLhr(lhr) {
  const audits = lhr.audits;
  const fcpMs = audits['first-contentful-paint']?.numericValue ?? 0;
  const lcpMs = audits['largest-contentful-paint']?.numericValue ?? 0;
  const tbtMs = audits['total-blocking-time']?.numericValue ?? 0;
  const siMs = audits['speed-index']?.numericValue ?? 0;
  const ttiMs = audits['interactive']?.numericValue ?? 0;
  const cls = audits['cumulative-layout-shift']?.numericValue ?? 0;
  const totalBytes = audits['total-byte-weight']?.numericValue ?? 0;
  const domSize = audits['dom-size']?.numericValue ?? 0;

  let jsBytes = 0;
  let htmlBytes = 0;
  const resourceItems = audits['resource-summary']?.details?.items || [];
  for (const item of resourceItems) {
    if (item.resourceType === 'script') jsBytes = item.transferSize || 0;
    if (item.resourceType === 'document') htmlBytes = item.transferSize || 0;
  }

  return {
    perfScore: Number(((lhr.categories.performance?.score ?? 0) * 100).toFixed(1)),
    fcp_s: Number((fcpMs / 1000).toFixed(3)),
    lcp_s: Number((lcpMs / 1000).toFixed(3)),
    tbt_ms: Number(tbtMs.toFixed(1)),
    si_s: Number((siMs / 1000).toFixed(3)),
    tti_s: Number((ttiMs / 1000).toFixed(3)),
    cls: Number(cls.toFixed(4)),
    total_kb: Number((totalBytes / 1024).toFixed(1)),
    js_kb: Number((jsBytes / 1024).toFixed(1)),
    html_kb: Number((htmlBytes / 1024).toFixed(1)),
    dom_nodes: Math.round(domSize)
  };
}

function saveResults(envMeta, runsCount, allRuns) {
  const outputPayload = {
    metadata: {
      ...envMeta,
      runsPerStage: runsCount,
      stages: DEFAULT_STAGES,
      formFactor: 'desktop',
      referenceStudy: 'Fahrudin et al. (2025) [Ref 17]'
    },
    runs: allRuns
  };

  const jsonPath = path.join(RESULTS_DIR, 'raw-runs.json');
  fs.writeFileSync(jsonPath, JSON.stringify(outputPayload, null, 2), 'utf-8');

  const csvHeaders = [
    'architectureId',
    'architectureLabel',
    'stage',
    'run',
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
  const csvLines = [
    csvHeaders.join(','),
    ...allRuns.map((r) =>
      csvHeaders
        .map((h) => (typeof r[h] === 'string' && r[h].includes(',') ? `"${r[h]}"` : r[h]))
        .join(',')
    )
  ];
  const csvPath = path.join(RESULTS_DIR, 'raw-runs.csv');
  fs.writeFileSync(csvPath, csvLines.join('\n') + '\n', 'utf-8');
  return { jsonPath, csvPath };
}

async function main() {
  const { runs, stages, archs, append } = parseArgs();
  fs.mkdirSync(RESULTS_DIR, { recursive: true });

  const targets = [
    {
      id: 'nextjs-ssg',
      label: 'Next.js (Jamstack SSG + Hydration)',
      dir: path.join(ROOT_DIR, 'apps/jamstack-nextjs/out'),
      port: 4101
    },
    {
      id: 'astro-islands',
      label: 'Astro (Jamstack SSG + Islands)',
      dir: path.join(ROOT_DIR, 'apps/jamstack-astro/dist'),
      port: 4102
    }
  ].filter((t) => archs.includes(t.id));

  for (const target of targets) {
    if (!fs.existsSync(target.dir)) {
      throw new Error(`Build directory missing for ${target.label}: ${target.dir}. Run "npm run build" first.`);
    }
  }

  const envMeta = getEnvironmentMetadata();
  let allRuns = [];
  const existingJsonPath = path.join(RESULTS_DIR, 'raw-runs.json');
  if (append && fs.existsSync(existingJsonPath)) {
    const existing = JSON.parse(fs.readFileSync(existingJsonPath, 'utf-8'));
    allRuns = existing.runs || [];
  }

  console.log('====================================================================');
  console.log('Google Lighthouse Empirical Benchmark Runner (Desktop Preset)');
  console.log(`Environment : ${envMeta.platform} | ${envMeta.cpuModel} (${envMeta.cpuCores} cores, ${envMeta.totalMemoryGB} GB RAM)`);
  console.log(`Chrome      : ${envMeta.chromeVersion}`);
  console.log(`Stages (N)  : ${stages.join(', ')}`);
  console.log(`Runs / Stage: n = ${runs} (append=${append}, existing=${allRuns.length})`);
  console.log('====================================================================');

  const servers = [];
  for (const target of targets) {
    const { server, port } = await createStaticServer(target.dir, target.port);
    target.port = port;
    servers.push(server);
    console.log(`[Server] Serving ${target.label} at http://127.0.0.1:${target.port}`);
  }

  const config = getDesktopLighthouseConfig();
  const chrome = await chromeLauncher.launch({
    chromeFlags: [
      '--headless=new',
      '--incognito',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--window-size=1350,940'
    ]
  });

  try {
    for (const target of targets) {
      for (const stage of stages) {
        const url = `http://127.0.0.1:${target.port}/assessments/${stage}`;
        console.log(`\n---> Benchmarking [${target.label}] | Stage N = ${stage} (${url})`);

        // Remove any prior runs for this (architectureId, stage) when appending
        allRuns = allRuns.filter((r) => !(r.architectureId === target.id && r.stage === stage));

        for (let runIdx = 1; runIdx <= runs; runIdx++) {
          const runnerResult = await lighthouse(
            url,
            {
              port: chrome.port,
              output: 'json',
              logLevel: 'error'
            },
            config
          );

          const metrics = extractMetricsFromLhr(runnerResult.lhr);
          const record = {
            architectureId: target.id,
            architectureLabel: target.label,
            stage,
            run: runIdx,
            ...metrics
          };
          allRuns.push(record);
          console.log(
            `   Run ${runIdx}/${runs}: Score=${metrics.perfScore} | FCP=${metrics.fcp_s}s | LCP=${metrics.lcp_s}s | TBT=${metrics.tbt_ms}ms | SI=${metrics.si_s}s | JS=${metrics.js_kb}kB | HTML=${metrics.html_kb}kB`
          );
        }

        // Incremental checkpoint after each stage
        saveResults(envMeta, runs, allRuns);
      }
    }
  } finally {
    await chrome.kill();
    for (const srv of servers) {
      srv.close();
    }
  }

  const { jsonPath, csvPath } = saveResults(envMeta, runs, allRuns);
  console.log('\n====================================================================');
  console.log(`Saved raw benchmark data (${allRuns.length} total runs) to:\n - ${jsonPath}\n - ${csvPath}`);
  console.log('Run "npm run analyze" to compute statistics and generate comparison charts.');
  console.log('====================================================================');
}

main().catch((err) => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
