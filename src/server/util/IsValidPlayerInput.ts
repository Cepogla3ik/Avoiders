import type { PlayerInput } from "@shared/types/player.ts";

export default function IsValidPlayerInput(input: PlayerInput) {
  return input && ((input.direction && typeof input.direction.x === "number" && typeof input.direction.y === "number") || !input.direction);
}