class Zone {
  static allZones = [];

  constructor(type, posXZone, posYZone, widthZone, heightZone) {
    this.type = type;
    this.widthZone = widthZone;
    this.heightZone = heightZone;
    this.posXZone = posXZone;
    this.posYZone = posYZone;

    Zone.allZones.push(this);
  }

  draw(ctx) {
    let zoneColor;
    let zoneStrokeColor;
    const sqrScale = 33;
    const zoneStrokeWidth = 0.5;

    switch (this.type) {
      case "area":
        zoneColor = "hsl(270 10% 60%)";
        zoneStrokeColor = "hsl(270 5% 35%)";
        break;
      case "safe":
        zoneColor = "hsl(270 10% 45%)";
        zoneStrokeColor = "hsl(270 5% 35%)";
        break;
    }

    for (let x = 0; x < this.widthZone; x++) {
      for (let y = 0; y < this.heightZone; y++) {
        const drawX = (this.posXZone + x) * sqrScale;
        const drawY = (this.posYZone + y) * sqrScale;

        ctx.beginPath();
        ctx.fillStyle = zoneColor;
        ctx.fillRect(drawX, drawY, sqrScale, sqrScale);

        ctx.strokeStyle = zoneStrokeColor;
        ctx.lineWidth = zoneStrokeWidth;

        const offset = zoneStrokeWidth / 2;
        ctx.strokeRect(
          drawX + offset,
          drawY + offset,
          sqrScale - zoneStrokeWidth,
          sqrScale - zoneStrokeWidth
        );
      }
    }
  }
};

new Zone("safe", 2, 2, 10, 24);
new Zone("area", 12, 2, 40, 24);
new Zone("safe", 52, 2, 10, 24);

class Player {
  constructor({
    id,
    username,
    x,
    y,
    color
  }) {
    this.id = id;
    this.username = username;
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = 17.5;
    this.speed = 5;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.strokeStyle = 'hsl(265 45% 30%)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    ctx.fillStyle = "black";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.username, this.x, this.y - 25);
  }

  update(deltaTime) {
    if (this.targetX !== undefined && this.targetY !== undefined) {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;

      const smoothing = 15;
      this.x += dx * smoothing * deltaTime;
      this.y += dy * smoothing * deltaTime;
    }
  }
}

const clientPlayers = {};

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

let mouseCanvasX = 0;
let mouseCanvasY = 0;

let playerToCursorX = 0;
let playerToCursorY = 0;

canvas.addEventListener("mousemove", e => {
  mouseCanvasX = e.offsetX;
  mouseCanvasY = e.offsetY;
});

document.addEventListener("keydown", e => {
  if (e.code === "KeyY") {
    console.log(`mouseCanvasX: ${mouseCanvasX}\nmouseCanvasY: ${mouseCanvasY}`);
    const canvasXCenter = canvas.width / 2;
    const canvasYCenter = canvas.height / 2;
    const x = Math.abs(canvasXCenter - mouseCanvasX);
    const y = Math.abs(canvasYCenter - mouseCanvasY);
    playerToCursorX = mouseCanvasX;
    playerToCursorY = mouseCanvasY;
    const dist = Math.hypot(x, y).toFixed(4);

    console.log(`x: ${x}\ny: ${y}\ndist: ${dist}`);
  }
});


let cameraX = 0;
let cameraY = 0;
const lerpFactor = 0.1;

socket.on('update-players', (serverPlayers) => {
  for (let playerId in serverPlayers) {
    const sp = serverPlayers[playerId];
    if (!clientPlayers[playerId]) {
      clientPlayers[playerId] = new Player(sp);
    } else {
      clientPlayers[playerId].targetX = sp.x;
      clientPlayers[playerId].targetY = sp.y;
    }
  }

  for (let id in clientPlayers) {
    if (!serverPlayers[id]) {
      delete clientPlayers[id];
    }
  }
});

let lastTime = performance.now();

// GameLoop
function gameLoop(currentTime) {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const myPlayer = clientPlayers[socket.id];

  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (myPlayer) {
    for (let id in clientPlayers) {
      clientPlayers[id].update(deltaTime);
    }

    const targetX = canvas.width / 2 - myPlayer.x;
    const targetY = canvas.height / 2 - myPlayer.y;
    cameraX += (targetX - cameraX) * lerpFactor;
    cameraY += (targetY - cameraY) * lerpFactor;

    ctx.save();
    ctx.translate(cameraX, cameraY);

    Zone.allZones.forEach(zone => zone.draw(ctx));

    for (let id in clientPlayers) {
      clientPlayers[id].draw(ctx);
    }

    ctx.restore();
  }

  requestAnimationFrame(gameLoop);
}

let isClientChatting = false;
const keys = {};
let mouseClick = false;
document.addEventListener('keydown', (e) => {
  keys[e.code] = true;
});
document.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});
canvas.addEventListener("click", () => {
  mouseClick = !mouseClick
});

setInterval(() => {
  if (mouseClick) {
    const worldMouseX = mouseCanvasX - cameraX;
    const worldMouseY = mouseCanvasY - cameraY;

    socket.emit("player-mouse-move", {
      targetX: worldMouseX,
      targetY: worldMouseY,
      keys: keys
    });
  } else if (Object.values(keys).includes(true) && !isClientChatting) {
    socket.emit("player-keyboard-move", keys);
  }
}, 15);


socket.on("client-logined", () => {
  document.addEventListener("contextmenu", event => {
    event.preventDefault();
  });

  const canvas = document.getElementById("canvas");
  canvas.style.display = "block";
  canvas.height = window.innerHeight;
  canvas.width = (window.innerHeight / 588) * 1044;

  const chatContainerElement = document.createElement("div");
  chatContainerElement.classList.add("chat-container");
  chatContainerElement.style.left = `${((window.innerWidth - canvas.width) / 2) + 20}px`;
  const chatMessagesElement = document.createElement("div");
  chatMessagesElement.classList.add("chat-log");
  const chatInputElement = document.createElement("input");
  chatInputElement.classList.add("chat-input");
  chatInputElement.maxLength = 80;
  chatInputElement.placeholder = "Enter to chat";

  document.body.appendChild(chatContainerElement);
  chatContainerElement.appendChild(chatMessagesElement);
  chatContainerElement.appendChild(chatInputElement);

  chatInputElement.addEventListener("focus", () => isClientChatting = true);
  chatInputElement.addEventListener("blur", () => isClientChatting = false);
  document.addEventListener("keydown", e => {
    if (e.code === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const message = chatInputElement.value.trim();
      if (isClientChatting && message !== "") {
        socket.emit("chat-message", {
          msg: message,
          user: clientPlayers[socket.id].username
        });
        chatInputElement.value = "";
        chatInputElement.blur();
      } else {
        isClientChatting ? chatInputElement.blur() : chatInputElement.focus();
      }
    }
  });

  socket.on("chat-new-message", data => {
    const chatMessageElement = document.createElement("div");
    const messageTagSpanElement = document.createElement("span");
    chatMessageElement.classList.add("chat-message");
    switch (data.rank) {
      case "server":
        messageTagSpanElement.textContent = "[Server]";
        messageTagSpanElement.classList.add("server-tag");
        break;
      case "dev":
        messageTagSpanElement.textContent = "[Dev]";
        messageTagSpanElement.classList.add("dev-tag");
        break;
      case "sr-mod":
        messageTagSpanElement.textContent = "[Sr. Mod]";
        messageTagSpanElement.classList.add("sr-mod-tag");
        break;
      case "mod":
        messageTagSpanElement.textContent = "[Mod]";
        messageTagSpanElement.classList.add("mod-tag");
        break;
      case "jr-mod":
        messageTagSpanElement.textContent = "[Jr. Mod]";
        messageTagSpanElement.classList.add("jr-mod-tag");
        break;
      case "supporter":
        messageTagSpanElement.textContent = "[Supporter]";
        messageTagSpanElement.classList.add("supporter-tag");
        break;
      case "player":
        messageTagSpanElement.textContent = "";
        break;
    }
    chatMessageElement.textContent = `${data.user}: ${data.msg}`;
    chatMessagesElement.appendChild(chatMessageElement);
    chatMessageElement.prepend(messageTagSpanElement);
    chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
  });

  window.addEventListener("resize", () => {
    canvas.height = window.innerHeight;
    canvas.width = (window.innerHeight * 1044) / 588;

    chatContainerElement.style.left = `${((window.innerWidth - canvas.width) / 2) + 15}px`;
  });

  requestAnimationFrame(gameLoop);
});