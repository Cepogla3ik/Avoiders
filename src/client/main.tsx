import { StrictMode } from "react";
import App from "./App/App";
import { createRoot } from "react-dom/client";
import "./main.scss";
import socketTest from "./socketTest";

socketTest();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);