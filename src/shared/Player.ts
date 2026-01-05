interface PlayerConfig {
  id: string;
  username: string;
  x: number;
  y: number;
  color: string;
}

export default class Player {
  id: string;
  username: string;
  x: number;
  y: number;
  color: string;
  radius: number;
  speed: number;

  targetX?: number; 
  targetY?: number;

  constructor({
    id,
    username,
    x,
    y,
    color
  }: PlayerConfig) {
    this.id = id;
    this.username = username;
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = 17;
    this.speed = 5;
  }

  draw(ctx: CanvasRenderingContext2D) {
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

  update(deltaTime: number) {
    if (this.targetX !== undefined && this.targetY !== undefined) {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;

      const smoothing = 15;
      this.x += dx * smoothing * deltaTime;
      this.y += dy * smoothing * deltaTime;
    }
  }
}