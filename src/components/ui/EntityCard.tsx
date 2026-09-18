import { Link } from "react-router-dom";
import { EntityBadge } from "./EntityBadge";

export function EntityCard({
  to,
  kind,
  title,
  description,
  meta,
}: {
  to?: string;
  kind: string;
  title: string;
  description: string;
  meta?: string;
}) {
  const body = (
    <>
      <EntityBadge kind={kind} label={kind} />
      <h4>{title}</h4>
      <p>{description}</p>
      {meta ? <p className="tiny" style={{ marginTop: 8 }}>{meta}</p> : null}
    </>
  );

  if (to) {
    return (
      <Link to={to} className="card entity-card clickable">
        {body}
      </Link>
    );
  }

  return <div className="card entity-card">{body}</div>;
}
