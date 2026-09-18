import { formatDateTime } from "../../lib/format";
import type { Evidence, Source } from "../../data/types";

export function EvidenceCard({
  item,
  source,
  onOpen,
}: {
  item: Evidence;
  source?: Source;
  onOpen?: () => void;
}) {
  const reliability = item.reliability || "supported";
  const badgeStyle = {
    verified: { bg: "var(--success-soft)", color: "var(--success)", label: "Verified" },
    supported: { bg: "var(--accent-soft)", color: "var(--accent)", label: "Supported" },
    "needs-review": { bg: "var(--warning-soft)", color: "var(--warning)", label: "Needs Review" },
    conflicting: { bg: "var(--danger-soft)", color: "var(--danger)", label: "Conflicting" },
  }[reliability];

  return (
    <article className="card evidence" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <strong style={{ fontSize: "14px" }}>{item.title || source?.name || "Evidence Source"}</strong>
          <div className="tiny" style={{ color: "var(--text-secondary)" }}>
            {source?.name ? `${source.name} · ` : ""}{source?.location || "Internal Source"}
          </div>
        </div>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            padding: "2px 7px",
            borderRadius: "4px",
            backgroundColor: badgeStyle.bg,
            color: badgeStyle.color,
            whiteSpace: "nowrap",
          }}
        >
          {badgeStyle.label}
        </span>
      </div>
      <blockquote className="quote" style={{ margin: "2px 0" }}>“{item.quote}”</blockquote>
      <div className="tiny" style={{ color: "var(--text-secondary)" }}>
        {item.speaker ? `${item.speaker} · ` : ""}
        {formatDateTime(item.occurredAt)}
        {item.meetingMark ? ` · Timestamp ${item.meetingMark}` : ""}
      </div>
      <div style={{ marginTop: "auto", paddingTop: 4 }}>
        <button className="btn" onClick={onOpen} style={{ width: "100%", justifyContent: "center" }}>
          {source?.kind === "meeting" ? "Inspect timestamp & provenance" : "Inspect source evidence"}
        </button>
      </div>
    </article>
  );
}
