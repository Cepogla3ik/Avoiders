console.log("TODO");

import "./main.scss";
import { StrictMode } from "react";
import App from "./App/App";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);