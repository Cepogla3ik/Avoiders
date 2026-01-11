import type { EntityNetData } from "@shared/types/NetData.ts";
import GameObject from "../GameObject.ts";
import type Body from "../physics/Body.ts";
import type Shape from "../physics/shapes/Shape.ts";
import type Area from "../Area/Area.ts";
import EntityNetDataStorage from "./EntityNetDataStorage.ts";

export default abstract class Entity<T extends EntityNetData = EntityNetData> extends GameObject {
  readonly id: number;
  /** Entity type */
  readonly type: number;

  
  protected destroyed: boolean = false;
  get isDestroyed() { return this.destroyed; }
  
  protected _area?: Area;
  get area() { return this._area; }
  
  private newOnArea: boolean = false;
  get isNewOnArea() { return this.newOnArea; }
  
  protected _netData: EntityNetDataStorage<T>;
  get netData() { return this._netData.getChanged(); }
  get fullNetData() { return this._netData.getFull(); } 
  
  constructor(body: Body, netData: T) { // id: number, type: number ???
    super(body);
    this.id = netData.id;
    this.type = netData.type;
    this._netData = new EntityNetDataStorage(netData);
  }
  
  abstract update(delta: number): void;

  addToArea(area: Area) {
    this._area?.removeEntity(this);
    
    this.newOnArea = true;
    area.addEntity(this);
    this._area = area;
  }

  remove() {
  }
  
  destroy() {
    if (this._area) {
      this._area.removeEntity(this);
      this._area = undefined;
    }

    this.destroyed = true;
  }

  nullify() {
    this._netData.clearChanged();
    this.newOnArea = false;
  }
  
  onCollision(_object: GameObject) {}
  onSensorCollision(_sensor: Shape, _target: Entity) {}
  // abstract isCanCollideWith(entity: any): boolean; 
}
