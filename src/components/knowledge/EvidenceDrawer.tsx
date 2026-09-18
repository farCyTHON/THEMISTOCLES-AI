import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Evidence, Source } from "../../data/types";
import { formatDateTime, entityPath } from "../../lib/format";
import { entityName } from "../../lib/lookup";
import { useKnowledge } from "../../state/knowledgeContext";

export function EvidenceDrawer({
  evidence,
  source,
  onClose,
}: {
  evidence: Evidence | null;
  source?: Source;
  onClose: () => void;
}) {
  const { state } = useKnowledge();
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (evidence) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [evidence, onClose]);

  if (!evidence) return null;

  const actualSource = source ?? state.sources.find((s) => s.id === evidence.sourceId);
  const targetName = entityName(state, evidence.relatedKind, evidence.relatedId);
  const targetUrl = entityPath(evidence.relatedKind, evidence.relatedId);

  const reliability = evidence.reliability || "supported";
  const reliabilityConfig = {
    verified: {
      label: "Verified",
      bg: "var(--success-soft)",
      color: "var(--success)",
      desc: "Corroborated by primary recorded source and validated by participants.",
    },
    supported: {
      label: "Supported",
      bg: "var(--accent-soft)",
      color: "var(--accent)",
      desc: "Direct quote matches organizational artifact or meeting transcript.",
    },
    "needs-review": {
      label: "Needs Review",
      bg: "var(--warning-soft)",
      color: "var(--warning)",
      desc: "Preliminary signal requiring confirmation before policy enforcement.",
    },
    conflicting: {
      label: "Conflicting",
      bg: "var(--danger-soft)",
      color: "var(--danger)",
      desc: "This evidence statement disagrees with another recorded document.",
    },
  }[reliability];

  return (
    <div
      className="drawer-backdrop"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(12, 16, 22, 0.55)",
        backdropFilter: "blur(2px)",
        zIndex: 1000,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <div
        className="drawer-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 520,
          height: "100%",
          backgroundColor: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          padding: "24px",
          gap: "20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <span className="tiny" style={{ textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
              Evidence & Provenance
            </span>
            <h3 style={{ margin: "4px 0 0", fontSize: "17px" }}>
              {evidence.title || (actualSource ? `${actualSource.name} Reference` : "Recorded Evidence")}
            </h3>
          </div>
          <button
            className="btn icon-btn"
            onClick={onClose}
            aria-label="Close drawer"
            style={{ padding: "4px 10px", fontSize: "16px", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: "6px",
              backgroundColor: reliabilityConfig.bg,
              color: reliabilityConfig.color,
              textTransform: "capitalize",
            }}
          >
            {reliabilityConfig.label}
          </span>
          {evidence.sourceType || actualSource?.kind ? (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 500,
                padding: "3px 8px",
                borderRadius: "6px",
                backgroundColor: "var(--surface-2)",
                color: "var(--text-secondary)",
                textTransform: "capitalize",
              }}
            >
              Source: {evidence.sourceType || actualSource?.kind}
            </span>
          ) : null}
        </div>

        <div className="card" style={{ padding: "16px", margin: 0, backgroundColor: "var(--bg)" }}>
          <blockquote
            style={{
              margin: 0,
              fontStyle: "italic",
              fontSize: "14.5px",
              lineHeight: 1.5,
              color: "var(--text)",
            }}
          >
            “{evidence.quote}”
          </blockquote>
          <div className="tiny" style={{ marginTop: "12px", color: "var(--text-secondary)", display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {evidence.speaker ? <strong>{evidence.speaker}</strong> : null}
            <span>·</span>
            <span>{formatDateTime(evidence.occurredAt)}</span>
            {evidence.meetingMark ? <span>· Mark {evidence.meetingMark}</span> : null}
          </div>
        </div>

        <div className="card" style={{ padding: "16px", margin: 0 }}>
          <h4 style={{ margin: "0 0 10px", fontSize: "13px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Primary Source Origin
          </h4>
          <dl className="kv" style={{ margin: 0 }}>
            <dt>Source System</dt>
            <dd>{actualSource?.name ?? "Internal Log"}</dd>
            <dt>Location / Channel</dt>
            <dd>{actualSource?.location ?? "—"}</dd>
            <dt>Verification Rationale</dt>
            <dd style={{ fontSize: "12.5px", lineHeight: 1.4 }}>{reliabilityConfig.desc}</dd>
          </dl>
        </div>

        <div className="card" style={{ padding: "16px", margin: 0 }}>
          <h4 style={{ margin: "0 0 8px", fontSize: "13px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Connected Claim / Relationship
          </h4>
          <p style={{ margin: "0 0 8px", fontSize: "13px" }}>
            This evidence supports or informs the following organizational entity:
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link
              to={targetUrl}
              onClick={onClose}
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--accent)",
                textDecoration: "none",
              }}
            >
              {targetName} →
            </Link>
          </div>
        </div>

        <div style={{ marginTop: "auto", paddingTop: "16px", display: "flex", gap: "10px" }}>
          <button
            className="btn primary"
            style={{ flex: 1 }}
            onClick={() => {
              onClose();
              navigate(`/chat?contextKind=evidence&contextId=${evidence.id}&prompt=${encodeURIComponent(`What does this evidence indicate about ${targetName}?`)}`);
            }}
          >
            Ask Memory about this evidence →
          </button>
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
