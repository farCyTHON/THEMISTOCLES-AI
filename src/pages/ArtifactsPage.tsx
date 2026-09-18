import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useKnowledge } from "../state/knowledgeContext";
import { formatDate } from "../lib/format";

export function ArtifactsPage() {
  const { state } = useKnowledge();
  const navigate = useNavigate();

  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredArtifacts = useMemo(() => {
    if (categoryFilter === "all") return state.artifacts;
    return state.artifacts.filter((art) => art.category === categoryFilter);
  }, [state.artifacts, categoryFilter]);

  const categoryBadge = (cat: string) => {
    const config: Record<string, { label: string; bg: string; color: string }> = {
      brief: { label: "Executive Brief", bg: "var(--accent-soft)", color: "var(--accent)" },
      sop: { label: "Standard / SOP", bg: "var(--decision-soft)", color: "var(--decision)" },
      policy: { label: "Company Policy", bg: "var(--warning-soft)", color: "var(--warning)" },
      report: { label: "Alignment Report", bg: "var(--success-soft)", color: "var(--success)" },
    };
    const c = config[cat] || { label: cat, bg: "var(--surface-2)", color: "var(--text)" };
    return (
      <span
        style={{
          fontSize: "11px",
          fontWeight: 600,
          padding: "2px 7px",
          borderRadius: "4px",
          backgroundColor: c.bg,
          color: c.color,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {c.label}
      </span>
    );
  };

  return (
    <main className="page">
      <div className="crumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>Artifacts</span>
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
          <h2>Living Organizational Artifacts</h2>
          <p style={{ color: "var(--text-secondary)", margin: "4px 0 0" }}>
            Verifiable briefs, standards, and reports synthesized directly from organizational memory and anchored in primary evidence.
          </p>
        </div>

        <button
          className="btn"
          onClick={() =>
            navigate(
              `/chat?prompt=${encodeURIComponent(
                "What living artifacts are available in organizational memory and how are they grounded in evidence?",
              )}`,
            )
          }
        >
          Ask Memory about artifacts →
        </button>
      </header>

      {/* Category Filter Chips */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button
          className={`filter-chip ${categoryFilter === "all" ? "active" : ""}`}
          onClick={() => setCategoryFilter("all")}
        >
          All Artifacts ({state.artifacts.length})
        </button>
        <button
          className={`filter-chip ${categoryFilter === "brief" ? "active" : ""}`}
          onClick={() => setCategoryFilter("brief")}
        >
          Executive Briefs ({state.artifacts.filter((a) => a.category === "brief").length})
        </button>
        <button
          className={`filter-chip ${categoryFilter === "sop" ? "active" : ""}`}
          onClick={() => setCategoryFilter("sop")}
        >
          Standards & SOPs ({state.artifacts.filter((a) => a.category === "sop").length})
        </button>
        <button
          className={`filter-chip ${categoryFilter === "report" ? "active" : ""}`}
          onClick={() => setCategoryFilter("report")}
        >
          Alignment Reports ({state.artifacts.filter((a) => a.category === "report").length})
        </button>
      </div>

      {/* Artifacts Grid */}
      <section className="section">
        {filteredArtifacts.length ? (
          <div className="grid-cards">
            {filteredArtifacts.map((artifact) => {
              const author = state.people.find((p) => p.id === artifact.authorPersonId);

              return (
                <article
                  key={artifact.id}
                  className="card clickable"
                  onClick={() => navigate(`/artifacts/${artifact.id}`)}
                  style={{
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    borderTop: "3px solid var(--accent)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                        {categoryBadge(artifact.category)}
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "2px 6px",
                            borderRadius: "4px",
                            backgroundColor:
                              artifact.status === "published"
                                ? "var(--success-soft)"
                                : "var(--warning-soft)",
                            color:
                              artifact.status === "published"
                                ? "var(--success)"
                                : "var(--warning)",
                            textTransform: "capitalize",
                          }}
                        >
                          {artifact.status}
                        </span>
                        <span className="tiny" style={{ color: "var(--text-muted)" }}>
                          {artifact.currentVersion}
                        </span>
                      </div>
                      <h3 style={{ margin: "2px 0 0", fontSize: "16px" }}>{artifact.title}</h3>
                    </div>

                    <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--accent)" }}>
                      Read Document →
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                    {artifact.summary}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "12px", color: "var(--text-secondary)" }}>
                    <span>By {author ? author.name : "Organizational Lead"}</span>
                    <span>·</span>
                    <span>Updated {formatDate(artifact.lastUpdated)}</span>
                  </div>

                  <div style={{ marginTop: "auto", paddingTop: 8, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="tiny" style={{ fontWeight: 600, color: "var(--success)" }}>
                      ✓ {artifact.evidenceIds.length} Verified Evidence Footnotes
                    </span>
                    <span className="tiny" style={{ color: "var(--text-muted)" }}>
                      {artifact.history.length} revisions logged
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="card empty" style={{ padding: "32px", textAlign: "center", color: "var(--text-secondary)" }}>
            <p style={{ margin: 0 }}>No living artifacts matching this category.</p>
          </div>
        )}
      </section>
    </main>
  );
}
