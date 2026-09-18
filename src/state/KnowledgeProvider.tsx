import { useMemo, useReducer, type ReactNode } from "react";
import { KnowledgeContext } from "./knowledgeContext";
import { createInitialState, knowledgeReducer } from "./knowledgeReducer";

export function KnowledgeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(knowledgeReducer, undefined, createInitialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <KnowledgeContext.Provider value={value}>{children}</KnowledgeContext.Provider>;
}
