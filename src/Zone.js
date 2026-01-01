import { socket } from "./main";

export default class Zone {
  static allZones = [];

  constructor(type, posXZone, posYZone, widthZone, heightZone) {
    this.type = type;
    this.widthZone = widthZone;
    this.heightZone = heightZone;
    this.posXZone = posXZone;
    this.posYZone = posYZone;

    Zone.allZones.push(this);
    if (typeof socket !== 'undefined' && socket.connected) {
        this.sendToServer();
    } else {
        socket.on('connect', () => this.sendToServer());
    }
  }

  sendToServer() {
    socket.emit("zones-build", {
      x: this.posXZone,
      y: this.posYZone,
      w: this.widthZone,
      h: this.heightZone
    });
  }

  draw(ctx) {
    let zoneColor;
    let zoneStrokeColor;
    const sqrScale = 36;
    const zoneStrokeWidth = 0.5;

    switch (this.type) {
      case "area":
        zoneColor = "hsl(270 10% 60%)";
        zoneStrokeColor = "hsl(270 10% 47.5% / 0.7)";
        break;
      case "safe":
        zoneColor = "hsl(270 10% 47.5%)";
        zoneStrokeColor = "hsl(270 10% 35% / 0.7)";
        break;
      case "teleport":
        zoneColor = "hsl(245 30% 42.5%)";
        zoneStrokeColor = "hsl(245 27.5% 37.5%)";
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
}