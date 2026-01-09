import type Vec2 from "@shared/util/Vec2.ts";

export default abstract class Shape {
  public isSensor: boolean = false;

  private _mask: number = 0;
  get mask() { return this._mask; }
  isCanCollide(mask: number | Shape) {
    if (typeof mask !== "number") mask = mask.mask;
    return (this._mask & mask) !== 0;
  }
  setMask(mask: number) {
    this._mask = mask;
    return this;
  }

  abstract getRadius(): number;
  abstract getCenter(): Vec2;
}