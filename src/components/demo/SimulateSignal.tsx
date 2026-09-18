import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useKnowledge } from "../../state/knowledgeContext";
import { useShellActions } from "../layout/shellActions";

export function SimulateSignal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { state, dispatch } = useKnowledge();
  const navigate = useNavigate();
  const { openSearch } = useShellActions();

  useEffect(() => {
    if (state.status !== "processing") return;
    if (state.completedSteps >= state.processingSteps.length) {
      const timer = window.setTimeout(() => dispatch({ type: "apply-mutation" }), 160);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => dispatch({ type: "advance-step" }), 180);
    return () => window.clearTimeout(timer);
  }, [dispatch, state.completedSteps, state.processingSteps.length, state.status]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && state.status !== "processing") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, open, state.status]);

  if (!open) return null;

  const busy = state.status === "processing";

  return (
    <div
      className="overlay"
      onClick={() => {
        if (!busy) onClose();
      }}
      role="presentation"
    >
      <div
        className="dialog signal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="signal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="section-head">
          <h3 id="signal-title">
            {state.status === "complete" ? "Workflow updated" : "New organizational signal"}
          </h3>
          <button className="btn" onClick={onClose} disabled={busy}>
            {state.status === "idle" ? "Cancel" : "Close"}
          </button>
        </div>

        {state.status === "idle" ? (
          <>
            <p className="tiny">{state.signal.channel}</p>
            <div className="thread">
              {state.signal.messages.map((message) => (
                <p key={message.text}>
                  <strong>{message.speaker}</strong>
                  <br />
                  “{message.text}”
                </p>
              ))}
            </div>
            <div className="actions">
              <button className="btn" onClick={onClose}>
                Cancel
              </button>
              <button className="btn primary" onClick={() => dispatch({ type: "start-processing" })}>
                Process signal
              </button>
            </div>
          </>
        ) : null}

        {state.status === "processing" || (state.status === "complete" && !state.mutation) ? (
          <div className="pipeline">
            <strong>Processing new organizational signal</strong>
            {state.processingSteps.map((step, index) => {
              const done = index < state.completedSteps || state.status === "complete";
              return (
                <div key={step.id} className={`step ${done ? "done" : ""}`}>
                  <span className="check">{done ? "✓" : "·"}</span>
                  {step.label}
                </div>
              );
            })}
          </div>
        ) : null}

        {state.status === "complete" && state.mutation ? (
          <div className="mutation-panel">
            <div className="pipeline" style={{ marginTop: 0 }}>
              {state.processingSteps.map((step) => (
                <div key={step.id} className="step done">
                  <span className="check">✓</span>
                  {step.label}
                </div>
              ))}
            </div>
            <article className="mutation-card">
              <div className="tiny">Workflow updated</div>
              <h3>{state.mutation.processName}</h3>
              <dl className="kv">
                <dt>Previous</dt>
                <dd>{state.mutation.previousValue}</dd>
                <dt>Current</dt>
                <dd>{state.mutation.currentValue}</dd>
                <dt>Owner</dt>
                <dd>{state.mutation.ownerName}</dd>
                <dt>New version</dt>
                <dd>{state.mutation.version}</dd>
              </dl>
            </article>
            <div className="actions">
              <button
                className="btn primary"
                onClick={() => {
                  onClose();
                  navigate(`/knowledge/processes/${state.mutation?.processId}?view=why`);
                }}
              >
                View process
              </button>
              <button
                className="btn"
                onClick={() => {
                  onClose();
                  navigate(`/knowledge/processes/${state.mutation?.processId}?view=evidence`);
                }}
              >
                View evidence
              </button>
              <button
                className="btn"
                onClick={() => {
                  onClose();
                  navigate("/knowledge/graph?entity=proc-migrate");
                }}
              >
                View graph
              </button>
              <button
                className="btn"
                onClick={() => {
                  onClose();
                  openSearch("Why do database migrations happen on Tuesday now?");
                }}
              >
                Ask about this change
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
