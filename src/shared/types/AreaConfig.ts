import type { Vec2Like } from "@shared/util/Vec2";

export interface SegmentConfig {
  position: Vec2Like;
  width: number;
  height: number;
}

export interface AreaConfig {
  segments: SegmentConfig[];
}