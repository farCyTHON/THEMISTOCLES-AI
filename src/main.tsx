import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { KnowledgeProvider } from "./state/KnowledgeProvider";
import { ToastProvider } from "./components/ui/Toast";
import "./styles/global.css";
import "./styles/app.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <KnowledgeProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </KnowledgeProvider>
    </BrowserRouter>
  </StrictMode>,
);
