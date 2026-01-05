/* import Enemy from "../src/Enemy";
import { getRandomInt } from "../src/utils";
*/

import 'dotenv/config';
import express, { type Application } from 'express';
import path from 'path';
import { createServer, Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { MongoClient, Db } from 'mongodb';
import bcrypt from 'bcrypt';

const saltRounds: number = 10;
const app: Application = express();
const http: HttpServer = createServer(app);
const io: Server = new Server(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port: string | number = process.env.PORT || 3000;
const uri: string = process.env.MONGO_URI || '';

if (!uri) {
  throw new Error("MONGO_URI is not defined in .env file");
}

const client: MongoClient = new MongoClient(uri);
let db: Db;

async function connectToDB(): void {
  try {
    await client.connect();
    db = client.db('avoiders_game');
    console.log("✅ DataBase MongoDB was connected");
  } catch (err) {
    console.error("❌ DataBase wasn't connected", err);
  }
}
connectToDB();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// interface configs and types in classes and export ?
type PlayerRank = "player" | "supporter" | "jr-mod" | "mod" | "sr-mod" | "dev";
type EnemyType = "normal";

interface PlayerConfig {
  id: string;
  x: number;
  y: number;
  username: string;
  isAlive?: boolean;
  inGame?: boolean;
  rank: PlayerRank;
  color: string;
}
interface EnemyConfig {
  id: string;
  x: number;
  y: number;
  type: EnemyType;
  radius: number;
  speed: number;
}

const players: Record<string, PlayerConfig> = {};
const enemies: Record<string, EnemyConfig> = {};

for (let n = 1; n <= 15; n++) {
  new Enemy("normal", getRandomInt(10, 50), getRandomInt(0.5, 4));
}
 // ?
Enemy.allEnemies.forEach(enemy => {
  enemies[enemy.id] = enemy;
});