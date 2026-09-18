import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useKnowledge } from "../../state/knowledgeContext";
import { EmptyState } from "../ui/EmptyState";
import { SearchResult } from "./SearchResult";
import { matchSearchHit, searchSuggestions } from "../../lib/search";

export function SearchOverlay({
  open,
  onClose,
  initialQuery = "",
}: {
  open: boolean;
  onClose: () => void;
  initialQuery?: string;
}) {
  const navigate = useNavigate();
  const { state } = useKnowledge();
  const [query, setQuery] = useState(initialQuery);
  const [submitted, setSubmitted] = useState(initialQuery);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setQuery(initialQuery);
      setSubmitted(initialQuery);
      setLoading(Boolean(initialQuery));
    }
  }, [open, initialQuery]);

  useEffect(() => {
    if (!submitted) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 180);
    return () => window.clearTimeout(timer);
  }, [submitted]);

  const hit = useMemo(
    () => matchSearchHit(state.searchHits, submitted, state.mutationApplied),
    [state.searchHits, submitted, state.mutationApplied],
  );

  if (!open) return null;

  return (
    <div className="overlay" onClick={onClose} role="presentation">
      <div className="dialog search" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(query);
          }}
        >
          <input
            className="search-field"
            autoFocus
            value={query}
            placeholder="Ask your organization..."
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Ask your organization"
          />
        </form>
        <div className="suggestions" style={{ padding: "0 12px 8px" }}>
          {searchSuggestions(state.mutationApplied).map((item) => (
            <button
              key={item}
              className={`chip ${submitted === item ? "active" : ""}`}
              onClick={() => {
                setQuery(item);
                setSubmitted(item);
              }}
            >
              {item}
            </button>
          ))}
        </div>
        {submitted ? (
          <>
            {loading ? (
              <div className="skeleton-stack" aria-busy="true">
                <div className="skeleton" />
                <div className="skeleton short" />
                <div className="skeleton" />
              </div>
            ) : hit ? (
              <SearchResult hit={hit} state={state} onClose={onClose} />
            ) : (
              <EmptyState
                title="No direct match in snapshot"
                body="Try asking Themistocles Memory Chat to synthesize across decisions, evidence, and provenance."
              />
            )}

            <div
              style={{
                margin: "12px 16px 14px",
                padding: "10px 14px",
                background: "var(--surface-sunken)",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Want conversational inquiry with provenance evidence?
              </span>
              <button
                type="button"
                className="link"
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--accent)",
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                }}
                onClick={() => {
                  onClose();
                  navigate(`/chat?prompt=${encodeURIComponent(submitted || query)}`);
                }}
              >
                Ask Themistocles Memory →
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export { searchSuggestions };
