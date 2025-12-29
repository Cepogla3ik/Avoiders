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
app.use(express.static(path.join(__dirname, '../public')));

const players = {};

setInterval(() => {
  io.emit("update-players", players);
}, 30);

const sqrScale = 33;
const allZones = [{
    x: 2 * sqrScale,
    y: 2 * sqrScale,
    w: 10 * sqrScale,
    h: 24 * sqrScale
  },
  {
    x: 12 * sqrScale,
    y: 2 * sqrScale,
    w: 40 * sqrScale,
    h: 24 * sqrScale
  },
  {
    x: 52 * sqrScale,
    y: 2 * sqrScale,
    w: 10 * sqrScale,
    h: 24 * sqrScale
  }
];

function isPointInAnyZone(x, y) {
  return allZones.some(zone => {
    return x >= zone.x &&
      x <= zone.x + zone.w &&
      y >= zone.y &&
      y <= zone.y + zone.h;
  });
}

function isPlayerValid(x, y, radius) {
  return isPointInAnyZone(x - radius, y) &&
    isPointInAnyZone(x + radius, y) &&
    isPointInAnyZone(x, y - radius) &&
    isPointInAnyZone(x, y + radius);
}

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.emit('message', "Welcome to the server!");

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
          rank: "player"
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
          players[socket.id] = {
            id: socket.id,
            x: 150,
            y: 250,
            username: data.username,
            rank: user.rank,
            color: "hsl(265 45% 45%)"
          };

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

    const radius = 17.5;

    let dx = 0;
    let dy = 0;
    if (keys['KeyW'] || keys['ArrowUp']) dy -= speed;
    if (keys['KeyS'] || keys['ArrowDown']) dy += speed;
    if (keys['KeyA'] || keys['ArrowLeft']) dx -= speed;
    if (keys['KeyD'] || keys['ArrowRight']) dx += speed;

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

    const targetX = data.targetX;
    const targetY = data.targetY;

    const dx = targetX - player.x;
    const dy = targetY - player.y;

    const distance = Math.hypot(dx, dy);

    if (distance < 8) return;

    let speed = 7.5;
    if (distance < 100) {
      speed = 7.5 * (distance / 100);
    }

    const keys = data.keys || {};
    if (keys['ShiftLeft'] || keys['ShiftRight'] || keys['Shift']) {
      speed *= 0.5;
    }

    const moveX = (dx / distance) * speed;
    const moveY = (dy / distance) * speed;

    const radius = 17.5;

    if (isPlayerValid(player.x + moveX, player.y + moveY, radius)) {
      player.x += moveX;
      player.y += moveY;
    } else {
      if (isPlayerValid(player.x + moveX, player.y, radius)) {
        player.x += moveX;
      } else if (isPlayerValid(player.x, player.y + moveY, radius)) {
        player.y += moveY;
      }
    }
  });

  const spamData = {
    points: 0,
    lastMessageTime: performance.now(),
    muteUntil: 0
  };

  socket.on("chat-message", (data) => {
    if (!data || !data.msg) return;
    
    const now = performance.now();

    if (now < spamData.muteUntil) {
      const timeLeft = Math.ceil((spamData.muteUntil - now) / 1000);
      socket.emit("chat-new-message", { user: "", msg: `MUTE - ${timeLeft}s left`, rank: "server" });
      return;
    }

    const elapsed = (now - spamData.lastMessageTime) / 1000;
    spamData.points = Math.max(0, spamData.points - elapsed);
    spamData.lastMessageTime = now;
    spamData.points++;

    if (spamData.points > 4) {
      spamData.muteUntil = now + (30 * 1000);
      socket.emit("chat-new-message", { user: "", msg: "You were muted for 30s", rank: "server" });
      return;
    }

    const player = players[socket.id];
    if (player) {
      io.emit("chat-new-message", {
        user: player.username,
        msg: data.msg.substring(0, 80),
        rank: player.rank,
        time: Date.now()
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    delete players[socket.id];
    io.emit('player-disconnected', socket.id);
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'avoiders.html'));
});

http.listen(port, () => {
  console.log(`🚀 Server was launched: http://localhost:${port}`);
});