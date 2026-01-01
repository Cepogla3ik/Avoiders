require('dotenv').config();
const express = require('express');
const path = require('path');
const {
  MongoClient
} = require('mongodb');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 3000;
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let db;

async function connectToDB() {
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

const players = {};
const enemies = {
  "e1": { id: "e1", x: 550, y: 400, radius: 17, speed: 2, dirX: 1, dirY: 1, type: "normal" },
  "e2": { id: "e2", x: 550, y: 400, radius: 17, speed: 5, dirX: 1, dirY: -1, type: "normal" },
  "e3": { id: "e3", x: 550, y: 400, radius: 17, speed: 4, dirX: -1, dirY: 1, type: "normal" },
  "e4": { id: "e4", x: 550, y: 400, radius: 24, speed: 3, dirX: -1, dirY: -1, type: "normal" }
};

setInterval(() => {
  for (let id in enemies) {
    let enemy = enemies[id];
    
    let nextX = enemy.x + enemy.speed * enemy.dirX;
    if (isPlayerValid(nextX, enemy.y, enemy.radius)) {
      enemy.x = nextX;
    } else {
      enemy.dirX *= -1;
    }

    let nextY = enemy.y + enemy.speed * enemy.dirY;
    if (isPlayerValid(enemy.x, nextY, enemy.radius)) {
      enemy.y = nextY;
    } else {
      enemy.dirY *= -1;
    }

    for (let playerId in players) {
      let player = players[playerId];
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      if (dist < player.radius + enemy.radius) {
        player.x = 150; 
        player.y = 250;
      }
    }
  }
}, 15);

setInterval(() => {
  io.emit("update-players", players);
  io.emit("update-enemies", enemies);
}, 30);

const sqrScale = 36;
const allZones = [];

function isPointInAnyZone(x, y) {
  return allZones.some(zone => {
    return x >= zone.x &&
      x <= zone.x + zone.w &&
      y >= zone.y &&
      y <= zone.y + zone.h;
  });
}

function isPlayerValid(x, y, radius) {
  const pointsCount = 64;
  const bufferRadius = radius - 0.2; 
  
  for (let i = 0; i < pointsCount; i++) {
    const angle = (i * 2 * Math.PI) / pointsCount;
    const pointX = x + Math.cos(angle) * bufferRadius;
    const pointY = y + Math.sin(angle) * bufferRadius;

    if (!isPointInAnyZone(pointX, pointY)) {
      return false;
    }
  }
  return true;
}

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.emit('message', "Welcome to the server!");

  socket.on("zones-build", (zone) => {
    for (const char in zone) {
      zone[char] *= sqrScale;
    }
    allZones.push(zone);
  });

  // --- Registration ---
  socket.on('register', async (data) => {
    console.log('Register try', data.username);

    if (db) {
      try {
        const usersCollection = db.collection("users");
        const existingUser = await usersCollection.findOne({
          username: {
            $regex: new RegExp(`^${data.username}$`, 'i')
          }
        });

        if (existingUser) {
          socket.emit("user-already-registered-error");
          return;
        }
        if (data.username.toLowerCase().includes("server")) {
          socket.emit("forbidden-nickname-reg");
          return;
        }

        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        await usersCollection.insertOne({
          username: data.username,
          password: hashedPassword,
          createdAt: new Date(),
          rank: "player",
          inGame: false
        });

        socket.emit('registration-success');
        console.log(`User ${data.username} was saved in base`);

      } catch (err) {
        console.error("Error by making data to the base", err);
        socket.emit('message', "Server registration error");
      }
    } else {
      socket.emit('message', "Database is not available");
    }
  });



  // --- Login ---
  socket.on('login', async (data) => {
    console.log("Login try:", data.username);

    if (db) {
      try {
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({
          username: data.username
        });

        if (!user) {
          socket.emit("client-login-error-usn");
          socket.emit('message', "User not found");
          return;
        }

        const isMatch = await bcrypt.compare(data.password, user.password);

        function isPlayerInGame(nickname) {
          for (let playerId in players) {
            if (players[playerId].username === nickname) {
              return true;
            }
          }
          return false;
        }

        const alreadyInGame = isPlayerInGame(data.username);

        if (isMatch && !alreadyInGame) {
          socket.emit("client-logined");
          await db.collection('users').updateOne({ username: data.username }, { $set: { inGame: true } });
          players[socket.id] = {
            id: socket.id,
            x: 150,
            y: 250,
            username: data.username,
            isAlive: true, // later check, is player dead before login
            inGame: true,
            rank: user.rank,
            color: "hsl(265 45% 45%)"
          };
          socket.on("enemy-created", enemy => {
            enemies[enemy.id] = {
              id: enemy.id,
              x: enemy.x,
              y: enemy.y,
              type: enemy.type,
              radius: enemy.radius,
              speed: enemy.speed
            }
          });

          io.emit("player-logined", {
            id: socket.id,
            username: data.username
          });
          console.log(`User ${data.username} has entered the game`);
        } else if (!isMatch && !alreadyInGame) {
          socket.emit("client-login-error-psw");
        } else if (isMatch && alreadyInGame) {
          socket.emit("login-error-user-ingame");
        }
      } catch (err) {
        console.error("Error by logging in", err);
      }
    }
  });

  socket.on('player-keyboard-move', (keys) => {
    const player = players[socket.id];
    if (!player) return;

    let speed = 7.5;
    if (keys['ShiftLeft'] || keys['ShiftRight'] || keys['Shift']) {
      speed *= 0.5;
    }

    const radius = 17;

    if (!player.moveQueueX) player.moveQueueX = [];
    if (!player.moveQueueY) player.moveQueueY = [];

    const keyA = keys['KeyA'] || keys['ArrowLeft'];
    const keyD = keys['KeyD'] || keys['ArrowRight'];

    if (keyA && !player.moveQueueX.includes('A')) player.moveQueueX.push('A');
    if (!keyA) player.moveQueueX = player.moveQueueX.filter(k => k !== 'A');
    if (keyD && !player.moveQueueX.includes('D')) player.moveQueueX.push('D');
    if (!keyD) player.moveQueueX = player.moveQueueX.filter(k => k !== 'D');

    const keyW = keys['KeyW'] || keys['ArrowUp'];
    const keyS = keys['KeyS'] || keys['ArrowDown'];

    if (keyW && !player.moveQueueY.includes('W')) player.moveQueueY.push('W');
    if (!keyW) player.moveQueueY = player.moveQueueY.filter(k => k !== 'W');
    if (keyS && !player.moveQueueY.includes('S')) player.moveQueueY.push('S');
    if (!keyS) player.moveQueueY = player.moveQueueY.filter(k => k !== 'S');

    let dx = 0;
    let dy = 0;

    const lastX = player.moveQueueX[player.moveQueueX.length - 1];
    const lastY = player.moveQueueY[player.moveQueueY.length - 1];

    if (lastX === 'A') dx = -speed;
    else if (lastX === 'D') dx = speed;

    if (lastY === 'W') dy = -speed;
    else if (lastY === 'S') dy = speed;

    if (dx !== 0) {
      if (isPlayerValid(player.x + dx, player.y, radius)) {
        player.x += dx;
      } else {
        let step = Math.sign(dx);
        while (Math.abs(step) <= Math.abs(dx)) {
          if (isPlayerValid(player.x + step, player.y, radius)) {
            player.x += step;
            step += Math.sign(dx);
          } else {
            break;
          }
        }
      }
    }

    if (dy !== 0) {
      if (isPlayerValid(player.x, player.y + dy, radius)) {
        player.y += dy;
      } else {
        let step = Math.sign(dy);
        while (Math.abs(step) <= Math.abs(dy)) {
          if (isPlayerValid(player.x, player.y + step, radius)) {
            player.y += step;
            step += Math.sign(dy);
          } else {
            break;
          }
        }
      }
    }
  });

  socket.on("player-mouse-move", (data) => {
    const player = players[socket.id];
    if (!player) return;

    const dx = data.targetX - player.x;
    const dy = data.targetY - player.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 8) return;

    let speed = 7.5;
    if (distance < 100) speed = 7.5 * (distance / 100);

    const keys = data.keys || {};
    if (keys['ShiftLeft'] || keys['ShiftRight'] || keys['Shift']) speed *= 0.5;

    const vx = (dx / distance) * speed;
    const vy = (dy / distance) * speed;
    const radius = 17;

    const moveStrict = (amtX, amtY) => {
      const steps = Math.max(Math.abs(amtX), Math.abs(amtY));
      const stepX = amtX / steps;
      const stepY = amtY / steps;

      for (let i = 0; i < steps; i++) {
        let nextX = player.x + stepX;
        let nextY = player.y + stepY;

        if (isPlayerValid(nextX, nextY, radius)) {
          player.x = nextX;
          player.y = nextY;
        } else if (isPlayerValid(nextX, player.y, radius)) {
          player.x = nextX;
        } else if (isPlayerValid(player.x, nextY, radius)) {
          player.y = nextY;
        } else {
          break;
        }
      }
    };

    moveStrict(vx, vy);
  });

  const spamData = {
    points: 0,
    lastMessageTime: performance.now(),
    muteUntil: 0
  };

  socket.on("chat-message", (data) => {
    if (!data || !data.msg) return;

    const player = players[socket.id];
    if (!player) return;

    const now = performance.now();

    if (now < spamData.muteUntil) {
      const timeLeft = Math.ceil((spamData.muteUntil - now) / 1000);
      socket.emit("chat-new-message", {
        user: "",
        msg: `MUTE - ${timeLeft}s left`,
        rank: "server"
      });
      return;
    }

    const elapsed = (now - spamData.lastMessageTime) / 1000;
    spamData.points = Math.max(0, spamData.points - elapsed);
    spamData.lastMessageTime = now;
    spamData.points++;

    const durationS = 30;
    if (spamData.points > 4 && player.rank !== "dev" && player.rank !== "sr-mod" && player.rank !== "mod") {
      spamData.muteUntil = now + (30 * 1000);
      socket.emit("chat-new-message", {
        user: "",
        msg: "You were muted for 30s (Spam)",
        rank: "server"
      });
      socket.emit("mod-action", {
        mute: {
          duration: durationS,
          from: "auto-mute",
          reason: "Spam",
          target: socket.id
        }
      });
      return;
    }

    if (player) {
      io.emit("chat-new-message", {
        user: player.username,
        msg: data.msg.substring(0, 80),
        rank: player.rank,
        isDead: !player.isAlive,
        time: Date.now()
      });
    }
  });

  socket.on('disconnect', async () => {
    const player = players[socket.id];
    if (player) {
      if (db) {
        await db.collection('users').updateOne({
          username: player.username
        }, {
          $set: {
            inGame: false
          }
        });
      }
      delete players[socket.id];
      io.emit('player-disconnected', socket.id);
      console.log(`User ${player.username} disconnected (${socket.id})`);
    }
  });
});

/* app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'avoiders.html'));
}); */

http.listen(port, () => {
  console.log(`🚀 Server was launched: http://localhost:${port}`);
});