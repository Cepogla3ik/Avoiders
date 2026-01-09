import GameObject from "../GameObject.ts";
import type Body from "../physics/Body.ts";
import type Shape from "../physics/shapes/Shape.ts";

export default abstract class Entity extends GameObject {
  constructor(body: Body) {
    super(body);
  }
  
  abstract update(delta: number): void;
  
  onCollision(object: GameObject) {}
  onSensorCollision(sensor: Shape, target: Entity) {}
  // abstract isCanCollideWith(entity: any): boolean; 
}
