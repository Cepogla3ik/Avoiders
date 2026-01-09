import type { Vec2Like } from "@shared/util/Vec2";


export interface EntityNetData {
  id: number;
  type: number;
  position: Vec2Like;
}

export interface PlayerNetData extends EntityNetData {

}