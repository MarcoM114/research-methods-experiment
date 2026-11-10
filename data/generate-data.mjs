import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Deterministic PRNG (Mulberry32) so every team member / Linux VM gets identical data
function createRng(seed = 20261110) {
  let state = seed >>> 0;
  return function nextFloat() {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  'Anna', 'Lukas', 'Sophie', 'Maximilian', 'Marie', 'Paul', 'Lena', 'felix',
  'Hannah', 'Jakob', 'Laura', 'David', 'Julia', 'Tobias', 'Sarah', 'Florian',
  'Katharina', 'Alexander', 'Lisa', 'Simon', 'Victoria', 'Daniel', 'Elena', 'Marco',
  'Fabio', 'Desiree', 'Lorenz', 'Danijel', 'Nina', 'Moritz', 'Clara', 'Julian'
];

const LAST_NAMES = [
  'Gruber', 'Huber', 'Bauer', 'Wagner', 'Mueller', 'Pichler', 'Steiner', 'Moser',
  'Mayer', 'Hofer', 'Leitner', 'Berger', 'Fuchs', 'Eder', 'Fischer', 'Schmid',
  'Winkler', 'Weber', 'Schwarz', 'Maier', 'Schneider', 'Reiter', 'Mayr', 'Schmidt',
  'Wimmer', 'Egger', 'Brunner', 'Lang', 'baumgartner', 'Auer', 'Binder', 'Wallner'
];

const COURSES = [
  { code: 'CS-301', name: 'Web Application Architectures', category: 'Software Engineering', credits: 6 },
  { code: 'CS-204', name: 'Distributed Systems & Cloud Computing', category: 'Systems & Cloud', credits: 5 },
  { code: 'RM-401', name: 'Research Methods & Scientific Writing', category: 'Academic Core', credits: 5 },
  { code: 'DS-302', name: 'Data Science & Statistical Benchmarking', category: 'Data Science', credits: 6 },
  { code: 'SE-210', name: 'Frontend Performance Optimization', category: 'Software Engineering', credits: 4 },
  { code: 'NW-105', name: 'High-Performance Browser Networking', category: 'Systems & Cloud', credits: 5 },
  { code: 'AI-404', name: 'Knowledge Graphs & Embedding Models', category: 'Data Science', credits: 6 },
  { code: 'SEC-202', name: 'Web Application Security & Reliability', category: 'Security', credits: 4 }
];

const ASSESSMENT_TYPES = [
  'Final Exam',
  'Midterm Exam',
  'Lab Benchmark Project',
  'Literature Review (PRISMA)',
  'Practical Prototype'
];

const SEMESTERS = ['WS 2025/26', 'SS 2026', 'WS 2026/27'];

export const DATA_STAGES = [10, 50, 100, 500, 1000, 5000, 10000];

function computeGradeAndStatus(score) {
  if (score >= 90) return { grade: '1 (Sehr Gut)', status: 'Distinction' };
  if (score >= 80) return { grade: '2 (Gut)', status: 'Passed' };
  if (score >= 65) return { grade: '3 (Befriedigend)', status: 'Passed' };
  if (score >= 50) return { grade: '4 (Genuegend)', status: 'Passed' };
  return { grade: '5 (Nicht Genuegend)', status: 'Retake Required' };
}

export function generateAssessments(maxCount = 10000) {
  const rng = createRng(20261110);
  const items = new Array(maxCount);

  for (let i = 0; i < maxCount; i++) {
    const idx = i + 1;
    const firstName = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    const course = COURSES[Math.floor(rng() * COURSES.length)];
    const assessmentType = ASSESSMENT_TYPES[Math.floor(rng() * ASSESSMENT_TYPES.length)];
    const semester = SEMESTERS[Math.floor(rng() * SEMESTERS.length)];

    // Realistic score distribution between 38 and 100
    const rawScore = Math.round(38 + rng() * 62);
    const { grade, status } = computeGradeAndStatus(rawScore);
    const submissionMs = Math.round(120 + rng() * 880);
    const day = String(1 + Math.floor(rng() * 28)).padStart(2, '0');
    const month = String(1 + Math.floor(rng() * 11)).padStart(2, '0');

    items[i] = {
      id: `ASM-${String(idx).padStart(5, '0')}`,
      studentId: `S26-${String(10000 + idx)}`,
      studentName: `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${lastName.charAt(0).toUpperCase() + lastName.slice(1)}`,
      courseCode: course.code,
      courseName: course.name,
      category: course.category,
      credits: course.credits,
      assessmentType,
      semester,
      score: rawScore,
      grade,
      status,
      evaluatedAt: `2026-${month}-${day}`,
      durationMin: submissionMs
    };
  }

  return items;
}

const outDir = path.join(__dirname, 'generated');
fs.mkdirSync(outDir, { recursive: true });

const allItems = generateAssessments(10000);

for (const stage of DATA_STAGES) {
  const subset = allItems.slice(0, stage);
  const filePath = path.join(outDir, `assessments-${stage}.json`);
  fs.writeFileSync(filePath, JSON.stringify(subset));
  const sizeKb = (fs.statSync(filePath).size / 1024).toFixed(1);
  console.log(`[data] Generated assessments-${stage}.json (${stage} entries, ${sizeKb} kB)`);
}
