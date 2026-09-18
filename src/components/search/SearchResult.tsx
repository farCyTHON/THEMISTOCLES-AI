import { useNavigate } from "react-router-dom";
import type { KnowledgeSnapshot, SearchHit } from "../../data/types";
import { entityName } from "../../lib/lookup";
import { entityPath } from "../../lib/format";

export function SearchResult({
  hit,
  state,
  onClose,
}: {
  hit: SearchHit;
  state: KnowledgeSnapshot;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="search-result">
      <section>
        <div className="tiny">Answer</div>
        <p className="answer-lead">{hit.answer}</p>
        {hit.answerDetail ? <p className="muted">{hit.answerDetail}</p> : null}
      </section>

      <section>
        <div className="tiny">Sources</div>
        <ul className="plain-list">
          {hit.evidenceIds.map((id) => {
            const item = state.evidence.find((entry) => entry.id === id);
            const source = state.sources.find((entry) => entry.id === item?.sourceId);
            if (!item || !source) return null;
            return (
              <li key={id}>
                {source.name} · {source.location}
                {item.meetingMark ? ` · ${item.meetingMark}` : ""}
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <div className="tiny">Related</div>
        <ul className="plain-list">
          {hit.related.map((rel) => (
            <li key={`${rel.targetKind}-${rel.targetId}`}>
              <button className="link" onClick={() => go(entityPath(rel.targetKind, rel.targetId))}>
                {entityName(state, rel.targetKind, rel.targetId)}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="actions">
        {hit.relatedProcessId ? (
          <>
            <button className="btn primary" onClick={() => go(`/knowledge/processes/${hit.relatedProcessId}?view=evidence`)}>
              View evidence
            </button>
            <button className="btn" onClick={() => go(`/knowledge/processes/${hit.relatedProcessId}`)}>
              View process
            </button>
            <button className="btn" onClick={() => go(`/knowledge/processes/${hit.relatedProcessId}?view=history`)}>
              View history
            </button>
          </>
        ) : hit.relatedDecisionId ? (
          <button className="btn primary" onClick={() => go(`/knowledge/decisions/${hit.relatedDecisionId}`)}>
            View evidence
          </button>
        ) : (
          <button className="btn primary" onClick={() => go(entityPath(hit.entityKind, hit.entityId))}>
            Open related knowledge
          </button>
        )}
        <button
          className="btn"
          style={{ color: "var(--accent)", borderColor: "var(--accent)" }}
          onClick={() => go(`/chat?prompt=${encodeURIComponent(hit.answer)}`)}
        >
          Ask in Memory Chat →
        </button>
      </div>
    </div>
  );
}
