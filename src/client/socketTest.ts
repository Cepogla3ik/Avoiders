export default function socketTest() {
  const protocol = location.protocol === "https:" ? "wss" : "ws";
  const ws = new WebSocket(`${protocol}://${location.host}/ws`);

  ws.addEventListener("open", () => console.log("connected"));
  ws.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.entities?.[0]?.position) {
      console.log("from server:", data.entities[0].position);
    }
  });
  ws.addEventListener("close", () => console.log("disconnected"));
  ws.addEventListener("error", (e) => console.error("ws error", e));

  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  setInterval(() => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    let dx = mouseX - centerX;
    let dy = mouseY - centerY;

    const length = Math.sqrt(dx * dx + dy * dy);
    if (length > 0) {
      dx /= length;
      dy /= length;
    }

    ws.send(JSON.stringify({ direction: { x: dx, y: dy } }));
  }, 16.6);
}