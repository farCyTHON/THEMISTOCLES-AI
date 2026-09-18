import type { EntityKind, KnowledgeSnapshot } from "../data/types";
import { entityPath } from "./format";

export function entityName(state: KnowledgeSnapshot, kind: EntityKind | string, id: string): string {
  switch (kind) {
    case "person":
      return state.people.find((item) => item.id === id)?.name ?? id;
    case "team":
      return state.teams.find((item) => item.id === id)?.name ?? id;
    case "system":
      return state.systems.find((item) => item.id === id)?.name ?? id;
    case "process":
      return state.processes.find((item) => item.id === id)?.name ?? id;
    case "decision": {
      const decision = state.decisions.find((item) => item.id === id);
      return decision ? `Decision #${decision.number}` : id;
    }
    case "project":
      return state.projects.find((item) => item.id === id)?.name ?? id;
    case "source": {
      const source = state.sources.find((item) => item.id === id);
      return source ? `${source.name} · ${source.location}` : id;
    }
    case "change":
      return state.changes.find((item) => item.id === id)?.title ?? id;
    case "conflict":
      return state.conflicts.find((item) => item.id === id)?.topic ?? id;
    case "action":
      return state.actions.find((item) => item.id === id)?.title ?? id;
    case "agent":
      return state.agents.find((item) => item.id === id)?.name ?? id;
    case "artifact":
      return state.artifacts.find((item) => item.id === id)?.title ?? id;
    default:
      return id;
  }
}

export function entityHref(kind: EntityKind | string, id: string): string {
  return entityPath(kind, id);
}
