'use client';

import React, { useState, useMemo } from 'react';

const STAGES = [10, 50, 100, 500, 1000, 5000, 10000];

function getStatusBadgeClass(status) {
  if (status === 'Distinction') return 'badge badge-distinction';
  if (status === 'Passed') return 'badge badge-passed';
  return 'badge badge-retake';
}

export default function AssessmentDashboardClient({ items, count, stats }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [flaggedIds, setFlaggedIds] = useState({});

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (courseFilter !== 'ALL' && item.courseCode !== courseFilter) return false;
      if (
        q &&
        !item.studentName.toLowerCase().includes(q) &&
        !item.id.toLowerCase().includes(q) &&
        !item.courseName.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [items, query, statusFilter, courseFilter]);

  const toggleFlag = (id) => {
    setFlaggedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetFilters = () => {
    setQuery('');
    setStatusFilter('ALL');
    setCourseFilter('ALL');
  };

  return (
    <main className="container">
      <header className="header-bar">
        <div className="header-title">
          <h1>Academic Assessment Management System</h1>
          <p>
            Empirical Benchmark View — Data Load: <strong>{count.toLocaleString('en-US')} Entries</strong> (cf. Fahrudin et al., 2025 [Ref 17])
          </p>
        </div>
        <span className="arch-badge">Next.js Jamstack (SSG + Full Hydration)</span>
      </header>

      <nav className="stage-nav" aria-label="Data Load Stage Selector">
        <span>Data Load Stage (N):</span>
        {STAGES.map((stage) => (
          <a
            key={stage}
            href={`/assessments/${stage}`}
            className={stage === count ? 'stage-link active' : 'stage-link'}
          >
            {stage.toLocaleString('en-US')}
          </a>
        ))}
      </nav>

      <section className="kpi-grid" aria-label="Assessment Summary Metrics">
        <div className="kpi-card">
          <div className="kpi-label">Total Loaded Entries</div>
          <div className="kpi-value">{count.toLocaleString('en-US')}</div>
          <div className="kpi-sub">Pre-rendered at build time (SSG)</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Mean Score</div>
          <div className="kpi-value">{stats.avgScore}%</div>
          <div className="kpi-sub">Across 8 academic courses</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Pass Rate (Score &ge; 50)</div>
          <div className="kpi-value">{stats.passRate}%</div>
          <div className="kpi-sub">{stats.distinctionCount.toLocaleString('en-US')} with distinction</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Retake Required</div>
          <div className="kpi-value">{stats.retakeCount.toLocaleString('en-US')}</div>
          <div className="kpi-sub">Flagged for review: {Object.values(flaggedIds).filter(Boolean).length}</div>
        </div>
      </section>

      <section className="filter-toolbar" aria-label="Interactive Filter Controls">
        <div className="filter-controls">
          <input
            type="search"
            className="filter-input"
            placeholder="Search student, ID, or course..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search assessments"
          />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="ALL">All Statuses</option>
            <option value="Distinction">Distinction</option>
            <option value="Passed">Passed</option>
            <option value="Retake Required">Retake Required</option>
          </select>
          <select
            className="filter-select"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            aria-label="Filter by course"
          >
            <option value="ALL">All Courses</option>
            <option value="CS-301">CS-301 Web Arch</option>
            <option value="CS-204">CS-204 Distributed Sys</option>
            <option value="RM-401">RM-401 Research Methods</option>
            <option value="DS-302">DS-302 Data Science</option>
            <option value="SE-210">SE-210 Frontend Perf</option>
            <option value="NW-105">NW-105 Networking</option>
            <option value="AI-404">AI-404 Knowledge Graphs</option>
            <option value="SEC-202">SEC-202 Web Security</option>
          </select>
          <button type="button" className="filter-btn" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
        <div className="filter-status">
          Showing <strong>{filteredItems.length.toLocaleString('en-US')}</strong> of{' '}
          <strong>{count.toLocaleString('en-US')}</strong> records
        </div>
      </section>

      <section className="table-card" aria-label="Academic Assessments Data Table">
        <table className="assessment-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Course</th>
              <th>Category</th>
              <th>Assessment Type</th>
              <th>Semester</th>
              <th>ECTS</th>
              <th>Score</th>
              <th>Grade</th>
              <th>Status</th>
              <th>Evaluated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id} className="assessment-row">
                <td className="code-cell">{item.id}</td>
                <td className="code-cell">{item.studentId}</td>
                <td><strong>{item.studentName}</strong></td>
                <td>{item.courseCode} – {item.courseName}</td>
                <td>{item.category}</td>
                <td>{item.assessmentType}</td>
                <td>{item.semester}</td>
                <td>{item.credits}</td>
                <td>
                  <div className="score-bar-wrap">
                    <span className="score-num">{item.score}</span>
                  </div>
                </td>
                <td>{item.grade}</td>
                <td>
                  <span className={getStatusBadgeClass(item.status)}>{item.status}</span>
                </td>
                <td className="code-cell">{item.evaluatedAt}</td>
                <td>
                  <button
                    type="button"
                    className="filter-btn"
                    onClick={() => toggleFlag(item.id)}
                  >
                    {flaggedIds[item.id] ? 'Flagged' : 'Flag'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
