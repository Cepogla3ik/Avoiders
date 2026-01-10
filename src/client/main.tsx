import { StrictMode } from "react";
import App from "./App/App";
import { createRoot } from "react-dom/client";
import "./main.scss";

const protocol = location.protocol === "https:" ? "wss" : "ws";
const ws = new WebSocket(`${protocol}://${location.host}/ws`);
ws.addEventListener("open", () => console.log("connected"));
ws.addEventListener("message", (event) => console.log("from server:", JSON.parse(event.data)));
ws.addEventListener("close", () => console.log("disconnected"));
ws.addEventListener("error", (e) => console.error("ws error", e));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);