import type { Vec2Like } from "@shared/util/Vec2";

export type ImmutableNetDataProps = "id" | "type";
export type MutableEntityNetData<T extends EntityNetData> = Omit<T, ImmutableNetDataProps>;

export interface EntityNetData {
  readonly id: number;
  readonly type: number;
  position: Vec2Like;
  removed?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PlayerNetData extends EntityNetData {
  // TODO
}