import { getRandomInt } from "./utils";
import Zone from "./Zone";
type Direction = 1 | -1;

export default class Enemy {
  static allEnemies: Enemy[] = [];
  static enemyId: number = 1;

  id: string;
  type: string;
  radius: number;
  speed: number;
  x: number;
  y: number;
  dirX: Direction;
  dirY: Direction;
  color: string;

  constructor(type: string, radius: number, speed: number) {
    this.type = type;
    this.radius = radius;
    this.speed = speed;

    const area = Zone.allZones[getRandomInt(0, Zone.allZones.length - 1)];
    this.x = getRandomInt((area.posXZone * area.scale) + this.radius / 2, (area.posXZone * area.scale) + (area.widthZone * area.scale) - this.radius / 2);
    this.y = getRandomInt((area.posYZone * area.scale) + this.radius / 2, (area.posYZone * area.scale) + (area.heightZone * area.scale) - this.radius / 2);
    this.dirX = Math.random() < 0.5 ? 1 : -1;
    this.dirY = Math.random() < 0.5 ? 1 : -1;
    switch(this.type) {
      case "normal":
        this.color = "hsl(270 7.5% 50%)";
        break;
      default:
        this.color = "hsl(0 0% 25%)";
    }
    this.id = `e${Enemy.enemyId}`;

    Enemy.enemyId++;
    Enemy.allEnemies.push(this);
  }
}