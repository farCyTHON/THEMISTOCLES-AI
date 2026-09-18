import { formatDate } from "../../lib/format";

export function ActivityItem({
  title,
  detail,
  occurredAt,
  sourceLabel,
  activityType,
  actorName,
  impactLevel,
  isFresh,
  onClick,
}: {
  title: string;
  detail: string;
  occurredAt: string;
  sourceLabel?: string;
  activityType?: string;
  actorName?: string;
  impactLevel?: string;
  isFresh?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="dot" aria-hidden />
      <span>
        <strong>{title}</strong>
        <span>{detail}</span>
        {sourceLabel || actorName || activityType || impactLevel ? (
          <span className="tiny" style={{ display: "flex", gap: 8, marginTop: 2, opacity: 0.8 }}>
            {actorName ? <span>By {actorName}</span> : null}
            {activityType ? <span>· {activityType}</span> : null}
            {impactLevel ? <span style={{ textTransform: "capitalize" }}>· {impactLevel} impact</span> : null}
            {sourceLabel ? <span>· Source {sourceLabel}</span> : null}
          </span>
        ) : null}
      </span>
      <time dateTime={occurredAt}>{isFresh ? "Just now" : formatDate(occurredAt)}</time>
    </>
  );

  if (onClick) {
    return (
      <button className={`activity clickable ${isFresh ? "fresh" : ""}`} onClick={onClick}>
        {content}
      </button>
    );
  }

  return <div className={`activity ${isFresh ? "fresh" : ""}`}>{content}</div>;
}
