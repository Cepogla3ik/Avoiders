import type { EntityNetData, PlayerNetData } from "@shared/types/NetData";
import Entity from "./Entity";

export default class Player extends Entity {
  constructor(config: PlayerNetData) {
    super(config.id);
  }
  
  update(_netData: PlayerNetData): void {
    
  }

  draw(_ctx: CanvasRenderingContext2D): void {
    
  }
}