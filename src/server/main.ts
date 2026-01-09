import express from "express";
import { createServer } from "http";
import path from "path";
import { Server } from "socket.io";
import GameWorld from "./GameWorld/GameWorld.ts";
import Player from "./GameWorld/entities/Player/Player.ts";
import { fileURLToPath } from "url";

const port = process.env.PORT || 8000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const http = createServer(app);
const io = new Server(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, '../../dist')));


const gameWorld = new GameWorld();
gameWorld.run();

io.on("connect", (socket) => {
  const player = new Player(socket, gameWorld);

  // socket.on("input", () => player.onInput());
  socket.on("disconnect", () => player.onDisconnect());
})

http.listen(port, () => {
  console.log(`Server started on: http://localhost:${port}`);
});