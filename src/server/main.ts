import express from "express";
import { createServer } from "http";
import path from "path";
import { WebSocketServer } from "ws";
import GameWorld from "./GameWorld/GameWorld.ts";
import Player from "./GameWorld/entities/Player/Player.ts";
import { fileURLToPath } from "url";

const port = process.env.PORT || 8000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../../dist')));

const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

const gameWorld = new GameWorld();
gameWorld.run();

wss.on("connection", (ws) => {
  const player = new Player(ws, gameWorld);

  ws.on("message", (e) => {
    try {
      player.onInput(JSON.parse(String(e)));
    } catch {
      ws.close();
    }
  });
  ws.on("close", () => player.onDisconnect());
})

httpServer.listen(port, () => {
  console.log(`Server started on: http://localhost:${port}`);
});