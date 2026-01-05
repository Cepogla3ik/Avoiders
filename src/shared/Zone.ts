export default class Zone {
  static allZones: Zone[] = [];

  type: string;
  posXZone: number;
  posYZone: number;
  widthZone: number;
  heightZone: number;
  scale: number;

  constructor(type: string, posXZone: number, posYZone: number, widthZone: number, heightZone: number) {
    this.type = type;
    this.widthZone = widthZone;
    this.heightZone = heightZone;
    this.posXZone = posXZone;
    this.posYZone = posYZone;
    this.scale = 36;
  }

  draw(ctx: CanvasRenderingContext2D) {
    let zoneColor: string = "";
    let zoneStrokeColor: string = "";
    const sqrScale: number = 36;
    const zoneStrokeWidth: number = 0.5;

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