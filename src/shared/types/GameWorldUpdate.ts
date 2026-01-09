import type { AreaConfig } from "./AreaConfig";
import type { EntityNetData } from "./NetData";

export interface GameWorldUpdate {
  area?: AreaConfig;
  entities?: EntityNetData[];
}