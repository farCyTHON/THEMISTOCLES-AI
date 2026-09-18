import { createContext, useContext } from "react";

interface ShellActions {
  openSearch: (query?: string) => void;
  openSignal: () => void;
}

export const ShellActionsContext = createContext<ShellActions>({
  openSearch: () => undefined,
  openSignal: () => undefined,
});

export function useShellActions() {
  return useContext(ShellActionsContext);
}
