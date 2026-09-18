import { createContext, useContext, type Dispatch } from "react";
import type { KnowledgeSnapshot, MutationResult } from "../data/types";

export type ProcessingStatus = "idle" | "processing" | "complete";

export interface KnowledgeState extends KnowledgeSnapshot {
  status: ProcessingStatus;
  completedSteps: number;
  mutation: MutationResult | null;
  selectedGraphNodeId: string | null;
  emphasizedNodeIds: string[];
  emphasizedEdgeIds: string[];
  freshActivityId: string | null;
}

export type KnowledgeAction =
  | { type: "select-graph-node"; id: string | null }
  | { type: "move-graph-node"; id: string; x: number; y: number }
  | { type: "start-processing" }
  | { type: "advance-step" }
  | { type: "apply-mutation" }
  | {
      type: "resolve-conflict";
      id: string;
      resolutionChoice: "sourceA" | "sourceB" | "custom";
      notes?: string;
      resolvedBy?: string;
    }
  | { type: "update-conflict-status"; id: string; status: "open" | "under-review" | "resolved" }
  | { type: "toggle-watcher"; id: string }
  | {
      type: "update-action-status";
      id: string;
      status: "proposed" | "under-review" | "approved" | "executed";
      executedBy?: string;
      result?: string;
    }
  | { type: "toggle-agent-status"; id: string }
  | { type: "trigger-agent-scan"; id: string }
  | { type: "publish-artifact"; id: string }
  | { type: "trigger-source-sync"; id: string }
  | { type: "reset" };

export interface KnowledgeContextValue {
  state: KnowledgeState;
  dispatch: Dispatch<KnowledgeAction>;
}

export const KnowledgeContext = createContext<KnowledgeContextValue | null>(null);

export function useKnowledge(): KnowledgeContextValue {
  const value = useContext(KnowledgeContext);
  if (!value) {
    throw new Error("useKnowledge must be used within KnowledgeProvider");
  }
  return value;
}
