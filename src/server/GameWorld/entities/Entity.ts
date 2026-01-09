import type { EntityNetData } from "@shared/types/NetData.ts";
import GameObject from "../GameObject.ts";
import type Body from "../physics/Body.ts";
import type Shape from "../physics/shapes/Shape.ts";

export default abstract class Entity<T extends EntityNetData = EntityNetData> extends GameObject {
  readonly id: number;
  /** Entity type */
  readonly type: number;
  
  protected _netData: Partial<Omit<T, "id">> = {};
  abstract getFullNetData(): T;
  getNetData(): Omit<Partial<T>, "id"> & Pick<T, "id"> | undefined {
    return {
      id: this.id,
      ...this._netData
    };
  }
  
  constructor(body: Body, id: number, type: number) {
    super(body);
    this.id = id;
    this.type = type;
  }
  
  abstract update(delta: number): void;
  
  onCollision(object: GameObject) {}
  onSensorCollision(sensor: Shape, target: Entity) {}
  // abstract isCanCollideWith(entity: any): boolean; 
}
