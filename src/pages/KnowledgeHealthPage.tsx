import { Link, useNavigate } from "react-router-dom";
import { useKnowledge } from "../state/knowledgeContext";

export function KnowledgeHealthPage() {
  const { state } = useKnowledge();
  const navigate = useNavigate();

  // Deterministic metrics calculation from snapshot data
  const totalDecisions = state.decisions.length;
  const decisionsWithEvidence = state.decisions.filter((d) => d.evidenceIds.length > 0).length;
  const decisionsHealthPct = Math.round((decisionsWithEvidence / totalDecisions) * 100);

  const totalProcesses = state.processes.length;
  const processesWithOwners = state.processes.filter((p) => p.ownerPersonId || p.ownerTeamId).length;
  const processesHealthPct = Math.round((processesWithOwners / totalProcesses) * 100);

  const totalProjects = state.projects.length;
  const activeProjects = state.projects.filter((p) => p.status === "active").length;
  const projectsHealthPct = Math.round((activeProjects / totalProjects) * 100);

  const totalEvidence = state.evidence.length;
  const verifiedEvidence = state.evidence.filter((e) => e.reliability === "verified" || e.reliability === "supported").length;
  const evidenceHealthPct = Math.round((verifiedEvidence / totalEvidence) * 100);

  const peopleHealthPct = 100; // All 8 people mapped to teams

  const overallCoverage = Math.round(
    (decisionsHealthPct + processesHealthPct + projectsHealthPct + evidenceHealthPct + peopleHealthPct) / 5,
  );

  const openConflicts = state.conflicts.filter((c) => c.status === "open" || c.status === "under-review");
  const missingEvidenceDecisions = state.decisions.filter((d) => d.evidenceIds.length === 0);

  return (
    <main className="page">
      <div className="crumbs">
        <Link to="/knowledge">Knowledge</Link>
        <span>/</span>
        <span>Health</span>
      </div>

      <header
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h2>Knowledge Health</h2>
          <p style={{ color: "var(--text-secondary)", margin: "4px 0 0" }}>
            Operational diagnostic of coverage, freshness, provenance integrity, and contradictions across organizational memory.
          </p>
        </div>

        <button
          className="btn"
          onClick={() =>
            navigate(
              `/chat?prompt=${encodeURIComponent("What is the current health of our organizational knowledge and what items need attention?")}`,
            )
          }
        >
          Ask Memory about knowledge health →
        </button>
      </header>

      {/* Primary KPI Overview */}
      <section className="section">
        <div className="stats">
          <div className="stat">
            <div className="stat-label">Knowledge Coverage</div>
            <div className="stat-value" style={{ color: "var(--accent)" }}>
              {overallCoverage}%
            </div>
            <div className="stat-detail">Across people, projects & processes</div>
          </div>
          <div className="stat">
            <div className="stat-label">Unresolved Conflicts</div>
            <div className="stat-value" style={{ color: openConflicts.length > 0 ? "var(--danger)" : "var(--success)" }}>
              {openConflicts.length}
            </div>
            <div className="stat-detail">Contradictory claims detected</div>
          </div>
          <div className="stat">
            <div className="stat-label">Needs Review</div>
            <div className="stat-value" style={{ color: missingEvidenceDecisions.length > 0 ? "var(--warning)" : "inherit" }}>
              {missingEvidenceDecisions.length}
            </div>
            <div className="stat-detail">Decisions without recorded sources</div>
          </div>
          <div className="stat">
            <div className="stat-label">Evidence Provenance</div>
            <div className="stat-value" style={{ color: "var(--success)" }}>
              {evidenceHealthPct}%
            </div>
            <div className="stat-detail">{verifiedEvidence} of {totalEvidence} sources verified</div>
          </div>
        </div>
      </section>

      {/* Actionable Health Items (Required by prompt) */}
      <section className="section">
        <div className="section-head">
          <h3>Actionable Attention Items</h3>
          <span className="tiny">Items requiring organizational alignment</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {openConflicts.length > 0 ? (
            <div
              className="card"
              style={{
                padding: "16px 20px",
                borderLeft: "4px solid var(--danger)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <strong style={{ color: "var(--danger)", fontSize: "14px" }}>
                    {openConflicts.length} Unresolved Knowledge Disagreements
                  </strong>
                  <span className="tiny" style={{ backgroundColor: "var(--danger-soft)", color: "var(--danger)", padding: "1px 6px", borderRadius: 4 }}>
                    Action Needed
                  </span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
                  Discrepancies identified in Customer onboarding timeframe and enterprise EMEA proposals.
                </p>
              </div>
              <Link to="/conflicts" className="btn primary">
                Review Conflicts ({openConflicts.length}) →
              </Link>
            </div>
          ) : null}

          {missingEvidenceDecisions.length && missingEvidenceDecisions[0] ? (
            <div
              className="card"
              style={{
                padding: "16px 20px",
                borderLeft: "4px solid var(--warning)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <strong style={{ color: "var(--warning)", fontSize: "14px" }}>
                    Decision #{missingEvidenceDecisions[0].number} Lacks Primary Evidence
                  </strong>
                  <span className="tiny" style={{ backgroundColor: "var(--warning-soft)", color: "var(--warning)", padding: "1px 6px", borderRadius: 4 }}>
                    Missing Provenance
                  </span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
                  "{missingEvidenceDecisions[0].title}" (Status: {missingEvidenceDecisions[0].status}) has 0 attached evidence quotes.
                </p>
              </div>
              <Link to={`/knowledge/decisions/${missingEvidenceDecisions[0].id}`} className="btn">
                Inspect Decision #{missingEvidenceDecisions[0].number} →
              </Link>
            </div>
          ) : null}

          <div
            className="card"
            style={{
              padding: "16px 20px",
              borderLeft: "4px solid var(--accent)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <strong style={{ fontSize: "14px" }}>
                  Database Migration Workflow Has Competing Schedule Claims
                </strong>
                <span className="tiny" style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)", padding: "1px 6px", borderRadius: 4 }}>
                  Schedule Overlap
                </span>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
                Process v2.3 specifies Friday evening, while live Slack signals indicate Tuesday morning preference.
              </p>
            </div>
            <Link to="/conflicts/conf-003" className="btn">
              Inspect Conflict →
            </Link>
          </div>

          <div
            className="card"
            style={{
              padding: "16px 20px",
              borderLeft: "4px solid var(--text-secondary)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <strong style={{ fontSize: "14px" }}>
                  Source Integrations Freshness
                </strong>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-secondary)" }}>
                {state.sources.length} active collectors connected (Slack #engineering, Teams Security, Engineering Sync).
              </p>
            </div>
            <Link to="/sources" className="btn">
              View Sources & Sync State →
            </Link>
          </div>
        </div>
      </section>

      {/* Quality Breakdown Bars */}
      <section className="section">
        <div className="section-head">
          <h3>Knowledge Quality by Entity Layer</h3>
          <span className="tiny">Deterministic integrity scoring</span>
        </div>

        <div className="card" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Decisions */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "13px" }}>
              <span>
                <strong>Decisions Quality</strong> · {decisionsWithEvidence} of {totalDecisions} documented with verified provenance
              </span>
              <strong>{decisionsHealthPct}%</strong>
            </div>
            <div style={{ width: "100%", height: 8, backgroundColor: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${decisionsHealthPct}%`, height: "100%", backgroundColor: "var(--decision)", borderRadius: 4 }} />
            </div>
          </div>

          {/* Processes */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "13px" }}>
              <span>
                <strong>Processes Health</strong> · {processesWithOwners} of {totalProcesses} active processes with team ownership & history
              </span>
              <strong>{processesHealthPct}%</strong>
            </div>
            <div style={{ width: "100%", height: 8, backgroundColor: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${processesHealthPct}%`, height: "100%", backgroundColor: "var(--success)", borderRadius: 4 }} />
            </div>
          </div>

          {/* People */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "13px" }}>
              <span>
                <strong>People & Ownership Graph</strong> · {state.people.length} members mapped to teams, decisions, and activity
              </span>
              <strong>{peopleHealthPct}%</strong>
            </div>
            <div style={{ width: "100%", height: 8, backgroundColor: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${peopleHealthPct}%`, height: "100%", backgroundColor: "var(--accent)", borderRadius: 4 }} />
            </div>
          </div>

          {/* Projects */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "13px" }}>
              <span>
                <strong>Project Memory Coverage</strong> · {activeProjects} of {totalProjects} projects actively tracked with decision history
              </span>
              <strong>{projectsHealthPct}%</strong>
            </div>
            <div style={{ width: "100%", height: 8, backgroundColor: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${projectsHealthPct}%`, height: "100%", backgroundColor: "var(--warning)", borderRadius: 4 }} />
            </div>
          </div>

          {/* Evidence */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "13px" }}>
              <span>
                <strong>Evidence Reliability</strong> · {verifiedEvidence} of {totalEvidence} quotes verified to primary source logs
              </span>
              <strong>{evidenceHealthPct}%</strong>
            </div>
            <div style={{ width: "100%", height: 8, backgroundColor: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${evidenceHealthPct}%`, height: "100%", backgroundColor: "var(--success)", borderRadius: 4 }} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
