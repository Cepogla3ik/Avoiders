import Vec2 from "@shared/util/Vec2.ts";
import Shape from "./shapes/Shape.ts";
import ResolveCollision from "./util/ResolveCollision.ts";
import CheckCollision from "./util/CheckCollision.ts";

export default class Body {
  public position: Vec2 = new Vec2();
  public velocity: Vec2 = new Vec2();
  
  public isStatic: boolean;
  public shape?: Shape;
  public sensors: Set<Shape> = new Set();

  constructor(x: number, y: number, shape?: Shape, sensors?: Shape | Iterable<Shape>, isStatic: boolean = false) {
    this.position.set(x, y);

    this.shape = shape;
    this.isStatic = isStatic;
    
    if (sensors) {
      if (sensors instanceof Shape) this.sensors.add(sensors);
      else for (const sensor of sensors) this.sensors.add(sensor);
    }
  }

  update(delta: number) {
    console.log(delta);
    this.position.x += this.velocity.x * delta / 1000;
    this.position.y += this.velocity.y * delta / 1000;
  }

  checkCollision(target: Body, shape: Shape | undefined = target.shape, includeBoxAngle: boolean = false, ignoreOutFill: boolean = false) {
    if (!this.shape) throw new Error("this.shape is undefined");
    if (!shape) return false;
    
    return CheckCollision(this, this.shape, target, shape, includeBoxAngle, ignoreOutFill);
  }

  resolveBodyCollision(target: Body, shape: Shape | undefined = target.shape) {
    if (!shape) console.error("Resolve collision with undefined shape!");
    if (this.isStatic || !this.shape || !shape) return;
    ResolveCollision(this, this.shape, target, shape);
  }

  canCollide(body: Body): Boolean {
    if (!this.shape || !body.shape || (this.isStatic && body.isStatic) || (this.shape.isSensor && body.shape.isSensor)) return false;
    return this.position.distance(body.position) <= Math.ceil(this.shape?.getRadius() + body.shape?.getRadius());
  }
}