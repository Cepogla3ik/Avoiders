import Vec2 from "@shared/util/Vec2.ts";
import Shape from "./Shape.ts";

export default class BoxShape extends Shape {
  readonly offset: Vec2 = new Vec2();

  public width: number;
  public height: number;
  public angle: number;

  public isFillOut: boolean = false;

  constructor(width: number, height: number, angle?: number);
  constructor(width: number, height: number, angle: number, isFillOut?: boolean);
  constructor(width: number, height: number, angle: number, isFillOut: boolean, isSensor?: boolean);
  constructor(width: number, height: number, angle: number, isFillOut: boolean, offset: Vec2, isSensor?: boolean);
  constructor(width: number, height: number, angle?: number, isFillOut?: boolean, offset?: Vec2, isSensor?: boolean);
  constructor(width: number, height: number, angle: number = 0, isFillOut: boolean = false, offset: boolean | Vec2 = false, isSensor: boolean = false) {
    super();

    if (typeof offset === "boolean") this.isSensor = offset;
    else {
      this.isSensor = isSensor;
      this.offset.set(offset);
    }

    this.width = width;
    this.height = height;
    this.angle = angle;
    this.isFillOut = isFillOut;
  }

  getRadius(): number {
    return Math.hypot(this.width, this.height) / 2;
  }

  getCenter(): Vec2 {
    return this.offset
      .clone()
      .subLocal(this.width / 2, this.height / 2);
  }
}