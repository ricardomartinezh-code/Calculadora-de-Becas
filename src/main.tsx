import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { StackProvider } from "@stackframe/react";
import App from "./App";
import "./index.css";
import { stackClientApp } from "./stack/client";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <StackProvider app={stackClientApp}>
        <App />
      </StackProvider>
    </BrowserRouter>
  </React.StrictMode>
);
