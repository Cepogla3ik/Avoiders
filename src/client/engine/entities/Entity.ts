import type { EntityNetData } from "@shared/types/NetData";

export default abstract class Entity {
  readonly id: number;

  constructor(id: number) {
    this.id = id;
  }

  abstract update(netData: EntityNetData): void;
  abstract draw(ctx: CanvasRenderingContext2D): void;
}