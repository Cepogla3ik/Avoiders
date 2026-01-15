import type { AreaConfig } from "./AreaConfig.ts";
import type { EntityNetData, ImmutableNetDataProps } from "./NetData.ts";

export interface GameUpdate {
  id?: number;
  area?: AreaConfig;
  entities?: (Partial<Omit<EntityNetData, ImmutableNetDataProps>> & Pick<EntityNetData, ImmutableNetDataProps>)[];
}