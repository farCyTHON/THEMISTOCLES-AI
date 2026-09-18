import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { SearchOverlay } from "../search/SearchOverlay";
import { SimulateSignal } from "../demo/SimulateSignal";
import { NotificationPopover } from "../ui/NotificationPopover";
import { useKnowledge } from "../../state/knowledgeContext";
import { ShellActionsContext } from "./shellActions";
import { useToast } from "../ui/Toast";

export function AppShell() {
  const { state } = useKnowledge();
  const { showToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [signalOpen, setSignalOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("themistocles-theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("themistocles-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Track mutation state changes to show toasts
  const prevMutationRef = useRef(state.mutationApplied);
  useEffect(() => {
    if (!prevMutationRef.current && state.mutationApplied) {
      showToast({
        title: "Knowledge updated",
        detail: "Database Migration → v2.4 (Workflow moved to Tuesday)",
        type: "success",
      });
    } else if (prevMutationRef.current && !state.mutationApplied) {
      showToast({
        title: "Demo reset",
        detail: "Baseline Acme organizational memory restored",
        type: "info",
      });
    }
    prevMutationRef.current = state.mutationApplied;
  }, [state.mutationApplied, showToast]);

  const user = state.people.find((person) => person.id === state.currentUserId);
  const initials = user?.name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("");

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <ShellActionsContext.Provider
      value={{
        openSearch: (query) => {
          setSearchQuery(query ?? "");
          setSearchOpen(true);
        },
        openSignal: () => setSignalOpen(true),
      }}
    >
      <div className="app-shell">
        {sidebarOpen ? (
          <button
            className="sidebar-backdrop visible"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}
        <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
        <div className="workspace">
          <header className="topbar">
            <button
              className="menu-btn"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen((value) => !value)}
            >
              ☰
            </button>
            <button className="search-trigger" onClick={() => setSearchOpen(true)}>
              Ask your organization...
              <kbd>⌘K</kbd>
            </button>
            <div className="topbar-actions">
              <button className="btn quiet" onClick={() => setSignalOpen(true)}>
                + Simulate new signal
              </button>

              <button
                className="icon-btn theme-toggle"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                onClick={toggleTheme}
              >
                {theme === "dark" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>

              <div style={{ position: "relative" }}>
                <button className="icon-btn" aria-label="Notifications" onClick={() => setNotifOpen((v) => !v)}>
                  <span className="notice-dot" />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </button>
                <NotificationPopover open={notifOpen} onClose={() => setNotifOpen(false)} />
              </div>
              <span className="workspace-chip" style={{ width: "auto" }} title={user?.name}>
                <span className="avatar">{initials}</span>
              </span>
            </div>
          </header>
          <Outlet />
        </div>
        <SearchOverlay
          open={searchOpen}
          initialQuery={searchQuery}
          onClose={() => {
            setSearchOpen(false);
            setSearchQuery("");
          }}
        />
        <SimulateSignal open={signalOpen} onClose={() => setSignalOpen(false)} />
      </div>
    </ShellActionsContext.Provider>
  );
}
