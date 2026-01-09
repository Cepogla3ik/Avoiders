import GameObject from "@server/GameWorld/GameObject.ts";
import type Area from "../Area.ts";
import BoxShape from "@server/GameWorld/physics/shapes/BoxShape.ts";
import { CollisionMask } from "@server/GameWorld/physics/CollisionMask.ts";

export default class Segment extends GameObject {
  readonly area: Area;
  public shape: BoxShape;

  constructor(width: number, height: number, area: Area) {
    super(area.body);
    this.area = area;
    this.shape = new BoxShape(width, height, undefined, true).setMask(CollisionMask.AREA_FLOOR);
  }
}