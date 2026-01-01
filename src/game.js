import { socket } from "./main";
import Player from "./Player";
import Zone from "./Zone";

let clientEnemies = {};
const clientPlayers = {};

const canvas = document.querySelector("#canvas");

let mouseCanvasX = 0;
let mouseCanvasY = 0;

canvas.addEventListener("pointermove", e => {
  mouseCanvasX = e.offsetX;
  mouseCanvasY = e.offsetY;
});

/* document.addEventListener("keydown", e => {
  if (e.code === "KeyY") {
    console.log(`mouseCanvasX: ${mouseCanvasX}\nmouseCanvasY: ${mouseCanvasY}`);
    const canvasXCenter = canvas.width / 2;
    const canvasYCenter = canvas.height / 2;
    const x = Math.abs(canvasXCenter - mouseCanvasX);
    const y = Math.abs(canvasYCenter - mouseCanvasY);
    playerToCursorX = mouseCanvasX;
    playerToCursorY = mouseCanvasY;
    const dist = Math.hypot(x, y).toFixed(4);
  }
}); */


let cameraX = 0;
let cameraY = 0;
const lerpFactor = 0.125;

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

    for (let id in clientEnemies) {
      const enemy = clientEnemies[id];
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
      ctx.fillStyle = "hsl(270 10% 40%)";
      ctx.fill();
      ctx.strokeStyle = "hsl(270 7.5% 35%)";
      ctx.stroke();
      ctx.closePath();
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
/* canvas.addEventListener("pointerleave", () => {
  mouseClick = false;
}); */
canvas.addEventListener("pointerdown", () => {
  mouseClick = !mouseClick;
  const chatContainer = document.querySelector(".chat-container");
  if (mouseClick && chatContainer) {
    chatContainer.style.pointerEvents = "none";
  } else if (!mouseClick && chatContainer) {
    chatContainer.style.pointerEvents = "auto";
  }
});
/* canvas.addEventListener("pointerup", () => {
  mouseClick = false;
}); */

export default function init() {
  new Zone("area", 14, -2, 10, 4);
  new Zone("safe", 2, 2, 10, 24);
  new Zone("area", 12, 2, 40, 24);
  new Zone("safe", 52, 2, 10, 24);

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
    if (localStorage.getItem("chat-drag-to-resize-size")) {
      const size = JSON.parse(localStorage.getItem("chat-drag-to-resize-size"));
      chatContainerElement.style.width = `${size.width}px`;
      chatContainerElement.style.height = `${size.height}px`;
    }
    chatContainerElement.style.left = `${((window.innerWidth - canvas.width) / 2) + 20}px`;
    const chatLogElement = document.createElement("div");
    chatLogElement.classList.add("chat-log");
    const chatInputElement = document.createElement("input");
    chatInputElement.classList.add("chat-input");
    chatInputElement.maxLength = 80;
    chatInputElement.placeholder = "Enter to chat";
  
    const svgNS = "http://www.w3.org/2000/svg";
    const chatDragtoresizeElement = document.createElementNS(svgNS, "svg");
    chatDragtoresizeElement.setAttribute("width", "35");
    chatDragtoresizeElement.setAttribute("height", "35");
    chatDragtoresizeElement.setAttribute("viewBox", "0 0 50 50");
    chatDragtoresizeElement.classList.add("chat-drag-to-resize");
  
    function createLine(points) {
      const polyline = document.createElementNS(svgNS, "polyline");
      polyline.setAttribute("points", points);
      polyline.setAttribute("fill", "none");
      polyline.setAttribute("stroke", "hsl(270 20% 37.5%)");
      polyline.setAttribute("stroke-width", "3");
      polyline.setAttribute("stroke-linecap", "round");
      polyline.setAttribute("stroke-linejoin", "round");
      return polyline;
    }
    chatDragtoresizeElement.appendChild(createLine("17.5,25 5,25 11.5,18.5 5,25 11.5,31.5")); // left arrow
    chatDragtoresizeElement.appendChild(createLine("25,17.5 25,5 18.5,11.5 25,5 31.5,11.5")); // top arrow
    chatDragtoresizeElement.appendChild(createLine("32.5,25 45,25 38.5,18.5 45,25 38.5,31.5"));
    chatDragtoresizeElement.appendChild(createLine("25,32.5 25,45 18.5,38.5 25,45 31.5,38.5"));
    chatContainerElement.appendChild(chatDragtoresizeElement);
  
    let isDragtoresizeMoving = false;
    chatDragtoresizeElement.addEventListener("mousedown", (e) => {
      e.preventDefault();
  
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = chatContainerElement.offsetWidth;
      const startHeight = chatContainerElement.offsetHeight;
  
      let finalWidth = startWidth;
      let finalHeight = startHeight;
  
      const onMouseMove = (moveEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
  
        finalWidth = Math.max(200, startWidth + deltaX);
        finalHeight = Math.max(150, startHeight + deltaY);
  
        chatContainerElement.style.width = `${finalWidth}px`;
        chatContainerElement.style.height = `${finalHeight}px`;
  
        updatePopupPosition();
      };
  
      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        chatDragtoresizeElement.style.cursor = "grab";
  
        localStorage.setItem("chat-drag-to-resize-size", JSON.stringify({ 
          width: finalWidth, 
          height: finalHeight 
        }));
      };
  
      chatDragtoresizeElement.style.cursor = "grabbing";
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    });
  
    function updatePopupPosition() {
      const rect = chatContainerElement.getBoundingClientRect();
      additionalInformationPopupElement.style.top = `${rect.bottom + 10}px`;
      additionalInformationPopupElement.style.maxWidth = `${rect.width}px`;
    }
    chatDragtoresizeElement.addEventListener("mouseup", () => {
      isDragtoresizeMoving = false;
      const chatWidth = chatContainerElement.getBoundingClientRect().width;
      const chatHeight = chatContainerElement.getBoundingClientRect().height;
      localStorage.setItem("chat-drag-to-resize-size", JSON.stringify({ width: chatWidth, height: chatHeight }));
    });
  
    document.body.appendChild(chatContainerElement);
    chatContainerElement.appendChild(chatLogElement);
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
      if (data.isDead) {
        chatMessageElement.style.color = "hsl(290 30% 45% / 0.9)";
      }
      switch (data.rank) {
        case "server":
          messageTagSpanElement.textContent = "[Server]";
          messageTagSpanElement.classList.add("server-tag");
          chatMessageElement.style.color = "hsl(275 60% 50%)";
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
      if (data.rank === "server") {
        setTimeout(() => {
          chatMessageElement.style.transition = "opacity 1.5s ease-in-out";
          chatMessageElement.style.opacity = "0";
          setTimeout(() => {
            chatMessageElement.remove();
          }, 1500);
        }, 3500);
      }
      const isAtBottom = chatLogElement.scrollHeight - chatLogElement.scrollTop <= chatLogElement.clientHeight + 50;
      chatLogElement.appendChild(chatMessageElement);
      chatMessageElement.prepend(messageTagSpanElement);
      if (isAtBottom) {
          chatLogElement.scrollTop = chatLogElement.scrollHeight;
      }
    });
  
    const additionalInformationPopupElement = document.createElement("div");
    let chatTop = chatContainerElement.getBoundingClientRect().top;
    let chatHeight = chatContainerElement.getBoundingClientRect().height;
    let chatWidth = chatContainerElement.getBoundingClientRect().width;
    additionalInformationPopupElement.classList.add("additional-information-popup");
    additionalInformationPopupElement.style.top = `${chatTop + chatHeight + 10}px`;
    additionalInformationPopupElement.style.left = `${canvas.getBoundingClientRect().left + 15}px`;
    additionalInformationPopupElement.style.maxWidth = `${chatWidth}px`;
    additionalInformationPopupElement.textContent = "";
    document.body.appendChild(additionalInformationPopupElement);
  
    window.addEventListener("resize", () => {
      canvas.height = window.innerHeight;
      canvas.width = (window.innerHeight * 1044) / 588;
      chatTop = chatContainerElement.getBoundingClientRect().top;
      chatHeight = chatContainerElement.getBoundingClientRect().height;
      chatWidth = chatContainerElement.getBoundingClientRect().width;
  
      chatContainerElement.style.left = `${((window.innerWidth - canvas.width) / 2) + 15}px`;
  
      additionalInformationPopupElement.style.top = `${chatTop + chatHeight + 10}px`;
      additionalInformationPopupElement.style.left = `${canvas.getBoundingClientRect().left + 15}px`;
      additionalInformationPopupElement.style.maxWidth = `${chatWidth}px`;
    });
  
    socket.on("player-disconnected", socketId => {
      const additionalInformationSpan = document.createElement("span");
      additionalInformationSpan.classList.add("additional-information-disconnect");
      additionalInformationSpan.textContent = `${clientPlayers[socketId].username} left the game`;
      additionalInformationPopupElement.appendChild(additionalInformationSpan);
  
      setTimeout(() => {
        additionalInformationSpan.style.opacity = "0";
        setTimeout(() => {
          additionalInformationSpan.remove();
        }, 2250);
      }, 4000);
    });
    socket.on("player-logined", player => {
      const additionalInformationSpan = document.createElement("span");
      additionalInformationSpan.classList.add("additional-information-join");
      additionalInformationSpan.textContent = `${player.username} has joined the game`;
      additionalInformationPopupElement.appendChild(additionalInformationSpan);
  
      setTimeout(() => {
        additionalInformationSpan.style.opacity = "0";
        setTimeout(() => {
          additionalInformationSpan.remove();
        }, 2500 - 250);
      }, 3500);
    });
    socket.on("mod-action", (action) => {
      if ("mute" in action) {
        let remaining = action.mute.duration;
        const additionalInformationSpan = document.createElement("span");
        additionalInformationSpan.classList.add("additional-information-mute");
        additionalInformationSpan.textContent = `MUTE: ${remaining}s (${action.mute.reason})`;
        additionalInformationPopupElement.prepend(additionalInformationSpan);
  
        const countdown = setInterval(() => {
          remaining--;
          additionalInformationSpan.textContent = `MUTE: ${remaining}s (${action.mute.reason})`;
        }, 1000);
        setTimeout(() => {
          additionalInformationSpan.style.opacity = "0";
          setTimeout(() => {
            clearInterval(countdown);
            additionalInformationSpan.remove();
          }, 2000 - 250);
        }, (action.mute.duration * 1000) - 2000);
      }
    });
    requestAnimationFrame(gameLoop);
  });

  socket.on('update-enemies', (serverEnemies) => {
    for (let id in serverEnemies) {
      const se = serverEnemies[id];
      if (!clientEnemies[id]) {
        clientEnemies[id] = { ...se };
      } else {
        clientEnemies[id].x = se.x;
        clientEnemies[id].y = se.y;
      }
    }
    for (let id in clientEnemies) {
      if (!serverEnemies[id]) delete clientEnemies[id];
    }
  });
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
}