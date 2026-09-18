import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useKnowledge } from "../state/knowledgeContext";
import { EntityBadge } from "../components/ui/EntityBadge";
import { formatRelativeTime, entityPath } from "../lib/format";
import type { ConflictStatus, ConflictSeverity } from "../data/types";

export function ConflictsPage() {
  const { state } = useKnowledge();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | ConflictStatus>("all");

  const filteredConflicts = useMemo(() => {
    if (filter === "all") return state.conflicts;
    return state.conflicts.filter((c) => c.status === filter);
  }, [state.conflicts, filter]);

  const openCount = state.conflicts.filter((c) => c.status === "open").length;
  const underReviewCount = state.conflicts.filter((c) => c.status === "under-review").length;
  const resolvedCount = state.conflicts.filter((c) => c.status === "resolved").length;

  const severityBadge = (severity: ConflictSeverity) => {
    const config = {
      high: { label: "High Severity", bg: "var(--danger-soft)", color: "var(--danger)" },
      medium: { label: "Medium", bg: "var(--warning-soft)", color: "var(--warning)" },
      low: { label: "Low", bg: "var(--surface-2)", color: "var(--text-secondary)" },
    }[severity];
    return (
      <span
        style={{
          fontSize: "11px",
          fontWeight: 600,
          padding: "2px 7px",
          borderRadius: "4px",
          backgroundColor: config.bg,
          color: config.color,
        }}
      >
        {config.label}
      </span>
    );
  };

  const statusBadge = (status: ConflictStatus) => {
    const config = {
      open: { label: "Open Dispute", bg: "var(--danger-soft)", color: "var(--danger)" },
      "under-review": { label: "Under Review", bg: "var(--warning-soft)", color: "var(--warning)" },
      resolved: { label: "Resolved", bg: "var(--success-soft)", color: "var(--success)" },
    }[status];
    return (
      <span
        style={{
          fontSize: "11px",
          fontWeight: 600,
          padding: "2px 8px",
          borderRadius: "4px",
          backgroundColor: config.bg,
          color: config.color,
        }}
      >
        {config.label}
      </span>
    );
  };

  return (
    <main className="page">
      <div className="crumbs">
        <Link to="/knowledge">Knowledge</Link>
        <span>/</span>
        <span>Conflicts</span>
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
          <h2>Organizational Conflicts</h2>
          <p style={{ color: "var(--text-secondary)", margin: "4px 0 0" }}>
            Themistocles detects when organizational policies, documentation, and statements contradict each other.
          </p>
        </div>

        <button
          className="btn"
          onClick={() =>
            navigate(
              `/chat?prompt=${encodeURIComponent("Show me all unresolved organizational conflicts and their impact.")}`,
            )
          }
        >
          Ask Memory about conflicts →
        </button>
      </header>

      {/* Overview Stats */}
      <section className="section">
        <div className="stats">
          <div className="stat">
            <div className="stat-label">Open Conflicts</div>
            <div className="stat-value" style={{ color: openCount > 0 ? "var(--danger)" : "inherit" }}>
              {openCount}
            </div>
            <div className="stat-detail">Requires immediate resolution</div>
          </div>
          <div className="stat">
            <div className="stat-label">Under Review</div>
            <div className="stat-value" style={{ color: underReviewCount > 0 ? "var(--warning)" : "inherit" }}>
              {underReviewCount}
            </div>
            <div className="stat-detail">Teams actively evaluating</div>
          </div>
          <div className="stat">
            <div className="stat-label">Resolved</div>
            <div className="stat-value" style={{ color: "var(--success)" }}>
              {resolvedCount}
            </div>
            <div className="stat-detail">Harmonized in knowledge graph</div>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button
          className={`filter-chip ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({state.conflicts.length})
        </button>
        <button
          className={`filter-chip ${filter === "open" ? "active" : ""}`}
          onClick={() => setFilter("open")}
        >
          Open ({openCount})
        </button>
        <button
          className={`filter-chip ${filter === "under-review" ? "active" : ""}`}
          onClick={() => setFilter("under-review")}
        >
          Under Review ({underReviewCount})
        </button>
        <button
          className={`filter-chip ${filter === "resolved" ? "active" : ""}`}
          onClick={() => setFilter("resolved")}
        >
          Resolved ({resolvedCount})
        </button>
      </div>

      {/* Conflict Items List */}
      <section className="section">
        {filteredConflicts.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filteredConflicts.map((conflict) => (
              <article
                key={conflict.id}
                className="card clickable"
                onClick={() => navigate(`/conflicts/${conflict.id}`)}
                style={{
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                      {severityBadge(conflict.severity)}
                      {statusBadge(conflict.status)}
                      <span className="tiny" style={{ color: "var(--text-muted)" }}>
                        Detected {formatRelativeTime(conflict.detectedAt)}
                      </span>
                    </div>
                    <h3 style={{ margin: "2px 0 0", fontSize: "16px" }}>{conflict.topic}</h3>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent)" }}>
                    Inspect Conflict →
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                  {conflict.summary}
                </p>

                {/* Side-by-side snippet preview */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: 12,
                    backgroundColor: "var(--bg)",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                >
                  <div>
                    <strong style={{ color: "var(--text-secondary)", fontSize: "11px", textTransform: "uppercase" }}>
                      Source A: {conflict.sourceA.sourceName}
                    </strong>
                    <div style={{ fontStyle: "italic", marginTop: 2 }}>“{conflict.sourceA.claim}”</div>
                  </div>
                  <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 12 }}>
                    <strong style={{ color: "var(--text-secondary)", fontSize: "11px", textTransform: "uppercase" }}>
                      Source B: {conflict.sourceB.sourceName}
                    </strong>
                    <div style={{ fontStyle: "italic", marginTop: 2 }}>“{conflict.sourceB.claim}”</div>
                  </div>
                </div>

                {/* Affected Entities Chips */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, paddingTop: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span className="tiny" style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
                      Affected:
                    </span>
                    {conflict.affectedEntities.map((ae) => (
                      <span
                        key={ae.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(entityPath(ae.kind, ae.id));
                        }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: "11.5px",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          backgroundColor: "var(--surface-2)",
                          color: "var(--text)",
                          cursor: "pointer",
                        }}
                      >
                        <EntityBadge kind={ae.kind} label={ae.kind} />
                        <span>{ae.label}</span>
                      </span>
                    ))}
                  </div>

                  <div className="tiny" style={{ color: "var(--text-secondary)" }}>
                    Impacts: {conflict.impactedAreas.join(" · ")}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="card empty" style={{ padding: "32px", textAlign: "center", color: "var(--text-secondary)" }}>
            <p style={{ margin: 0, fontSize: "15px" }}>
              Your organizational memory has no conflicts matching this filter.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
