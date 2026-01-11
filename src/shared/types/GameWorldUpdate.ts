import type { AreaConfig } from "./AreaConfig";
import type { EntityNetData, ImmutableNetDataProps } from "./NetData";

export interface GameWorldUpdate {
  area?: AreaConfig;
  entities?: (Partial<Omit<EntityNetData, ImmutableNetDataProps>> & Pick<EntityNetData, ImmutableNetDataProps>)[];
}