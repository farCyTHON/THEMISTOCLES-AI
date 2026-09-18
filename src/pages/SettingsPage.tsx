import { useEffect, useState } from "react";
import { useKnowledge } from "../state/knowledgeContext";
import { useToast } from "../components/ui/Toast";

export function SettingsPage() {
  const { dispatch } = useKnowledge();
  const { showToast } = useToast();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light";
  });

  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light";
    setTheme(current);
  }, []);

  const changeTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("themistocles-theme", newTheme);
  };

  const handleReset = () => {
    dispatch({ type: "reset" });
    showToast({
      title: "Demo reset",
      detail: "Baseline Acme organizational memory restored",
      type: "info",
    });
  };

  return (
    <main className="page">
      <header className="page-header">
        <h2>Settings</h2>
        <p>Appearance and prototype controls for this demonstration session.</p>
      </header>

      <section className="card" style={{ padding: 20, marginTop: 18, maxWidth: 640 }}>
        <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600 }}>Appearance</h3>
        <p className="muted" style={{ margin: "0 0 14px", fontSize: 13 }}>
          Select how Themistocles AI appears on your screen.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className={`btn ${theme === "light" ? "primary" : ""}`}
            onClick={() => changeTheme("light")}
            aria-pressed={theme === "light"}
          >
            Light mode
          </button>
          <button
            className={`btn ${theme === "dark" ? "primary" : ""}`}
            onClick={() => changeTheme("dark")}
            aria-pressed={theme === "dark"}
          >
            Dark mode
          </button>
        </div>
      </section>

      <section className="card" style={{ padding: 20, marginTop: 18, maxWidth: 640 }}>
        <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600 }}>Demo State</h3>
        <p className="muted" style={{ margin: "0 0 14px", fontSize: 13 }}>
          Reset restores the baseline Acme organizational memory, clearing all simulated signals, mutations, and derived entities.
        </p>
        <button className="btn danger" onClick={handleReset}>
          Reset prototype memory
        </button>
      </section>
    </main>
  );
}
