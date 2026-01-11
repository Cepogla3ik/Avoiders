import Vec2 from "@shared/util/Vec2";

export default class MathUtil {
  private constructor() {}

  static rotatePoint(point: Vec2, angle: number): Vec2 {
    const cosTheta = Math.cos(-angle);
    const sinTheta = Math.sin(-angle);
    return new Vec2(point.x * cosTheta - point.y * sinTheta, point.x * sinTheta + point.y * cosTheta);
  }

  static clamp(n: number, min: number, max: number) {
    if (n >= max) return max;
    else if (n <= min) return min;
    else return n;
  }
}