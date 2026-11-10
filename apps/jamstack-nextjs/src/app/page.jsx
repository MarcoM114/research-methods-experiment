import Link from 'next/link';
import { DATA_STAGES } from '../../../../data/generate-data.mjs';

export default function HomePage() {
  return (
    <main className="container">
      <header className="header-bar">
        <div className="header-title">
          <h1>Academic Assessment Management System</h1>
          <p>Benchmark Prototype – Next.js (Jamstack Static Site Generation + React Hydration)</p>
        </div>
        <span className="arch-badge">Architecture: Next.js Jamstack (SSG)</span>
      </header>
      <nav className="stage-nav" aria-label="Dataset Stages">
        <span>Select Data Load (N):</span>
        {DATA_STAGES.map((stage) => (
          <Link key={stage} href={`/assessments/${stage}`} className="stage-link">
            {stage.toLocaleString('en-US')} Entries
          </Link>
        ))}
      </nav>
    </main>
  );
}
