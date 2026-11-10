import fs from 'node:fs';
import path from 'node:path';
import AssessmentDashboardClient from '../../../components/AssessmentDashboardClient';

const STAGES = [10, 50, 100, 500, 1000, 5000, 10000];

export function generateStaticParams() {
  return STAGES.map((count) => ({ count: String(count) }));
}

function loadStageData(count) {
  const filePath = path.resolve(process.cwd(), `../../data/generated/assessments-${count}.json`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function computeStats(items) {
  const total = items.length;
  const sumScore = items.reduce((acc, it) => acc + it.score, 0);
  const distinctionCount = items.filter((it) => it.status === 'Distinction').length;
  const retakeCount = items.filter((it) => it.status === 'Retake Required').length;
  const passedCount = total - retakeCount;

  return {
    avgScore: (sumScore / total).toFixed(1),
    passRate: ((passedCount / total) * 100).toFixed(1),
    distinctionCount,
    retakeCount
  };
}

export default async function AssessmentStagePage({ params }) {
  const resolvedParams = await params;
  const count = Number(resolvedParams.count);
  const items = loadStageData(count);
  const stats = computeStats(items);

  return <AssessmentDashboardClient items={items} count={count} stats={stats} />;
}
