import Vec2 from "@shared/util/Vec2.ts";
import Shape from "./Shape.ts";

export default class CircleShape extends Shape {
  readonly offset: Vec2 = new Vec2();
  public radius: number;

  constructor(radius: number);
  constructor(radius: number, isSensor: boolean);
  constructor(radius: number, offset: Vec2);
  constructor(radius: number, offset: Vec2, isSensor: boolean);
  constructor(radius: number, offset: boolean | Vec2 = false, isSensor: boolean = false) {
    super();

    if (typeof offset === "boolean") this.isSensor = offset;
    else {
      this.isSensor = isSensor;
      this.offset.set(offset);
    }

    this.radius = radius;
  }

  getRadius(): number {
    return this.radius;
  }

  getCenter(): Vec2 {
    return this.offset
      .clone();
  }
}