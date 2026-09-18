import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { KnowledgeGraph } from "../components/graph/KnowledgeGraph";
import { EntityBadge } from "../components/ui/EntityBadge";
import { useKnowledge } from "../state/knowledgeContext";
import { entityPath, formatDate, kindLabel } from "../lib/format";

export function GraphPage() {
  const { state, dispatch } = useKnowledge();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const entity = params.get("entity");
    if (!entity) return;
    const node = state.graphNodes.find((item) => item.entityId === entity);
    if (node) dispatch({ type: "select-graph-node", id: node.id });
  }, [dispatch, params, state.graphNodes]);
  const selected = state.graphNodes.find((node) => node.id === state.selectedGraphNodeId);

  const process =
    selected?.kind === "process" ? state.processes.find((item) => item.id === selected.entityId) : undefined;
  const decision =
    selected?.kind === "decision" ? state.decisions.find((item) => item.id === selected.entityId) : undefined;
  const person =
    selected?.kind === "person" ? state.people.find((item) => item.id === selected.entityId) : undefined;
  const team = selected?.kind === "team" ? state.teams.find((item) => item.id === selected.entityId) : undefined;
  const system =
    selected?.kind === "system" ? state.systems.find((item) => item.id === selected.entityId) : undefined;

  return (
    <main className="page wide">
      <header className="page-header">
        <h2>Knowledge graph</h2>
        <p>A compact view of how Engineering, processes, systems, and Decision #184 currently relate.</p>
      </header>
      <div className="graph-layout" style={{ marginTop: 18 }}>
        <KnowledgeGraph
          nodes={state.graphNodes}
          edges={state.graphEdges}
          selectedId={state.selectedGraphNodeId}
          emphasizedNodeIds={state.emphasizedNodeIds}
          emphasizedEdgeIds={state.emphasizedEdgeIds}
          onSelect={(id) => dispatch({ type: "select-graph-node", id })}
          onMove={(id, x, y) => dispatch({ type: "move-graph-node", id, x, y })}
        />
        <aside className="card detail">
          {selected ? (
            <>
              <EntityBadge kind={selected.kind} label={kindLabel(selected.kind)} />
              <h3>{selected.label}</h3>
              <p className="muted">{selected.subtitle}</p>
              {process ? (
                <dl>
                  <dt>Owner</dt>
                  <dd>{state.teams.find((item) => item.id === process.ownerTeamId)?.name}</dd>
                  <dt>Status</dt>
                  <dd>{process.status === "current" ? "Current" : "Deprecated"}</dd>
                  <dt>Updated</dt>
                  <dd>{formatDate(process.lastUpdated)}</dd>
                  <dt>Change</dt>
                  <dd>{process.recentChange}</dd>
                </dl>
              ) : null}
              {decision ? (
                <dl>
                  <dt>Made by</dt>
                  <dd>{decision.madeBy}</dd>
                  <dt>Date</dt>
                  <dd>{formatDate(decision.date)}</dd>
                  <dt>Impact</dt>
                  <dd>{decision.impactLabel}</dd>
                </dl>
              ) : null}
              {person ? (
                <dl>
                  <dt>Role</dt>
                  <dd>{person.role}</dd>
                </dl>
              ) : null}
              {team ? <p className="muted">{team.description}</p> : null}
              {system ? (
                <>
                  <p className="muted">{system.description}</p>
                  <dl>
                    <dt>Owner</dt>
                    <dd>{state.teams.find((item) => item.id === system.ownerTeamId)?.name}</dd>
                  </dl>
                </>
              ) : null}
              <div className="actions">
                {process ? (
                  <>
                    <button
                      className="btn primary"
                      onClick={() => navigate(`/knowledge/processes/${process.id}?view=why`)}
                    >
                      Why did this change?
                    </button>
                    <button className="btn" onClick={() => navigate(`/knowledge/processes/${process.id}`)}>
                      Open process
                    </button>
                  </>
                ) : (
                  <button className="btn primary" onClick={() => navigate(entityPath(selected.kind, selected.entityId))}>
                    Open {kindLabel(selected.kind).toLowerCase()}
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="muted">Select a node to inspect its current state, then open the related entity.</p>
          )}
        </aside>
      </div>
    </main>
  );
}
