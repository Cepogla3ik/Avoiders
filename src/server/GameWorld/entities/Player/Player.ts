import type { WebSocket } from "ws";
import type GameWorld from "@server/GameWorld/GameWorld.ts";
import type { PlayerInput } from "@shared/types/player.ts";
import Entity from "../Entity.ts";
import CircleShape from "@server/GameWorld/physics/shapes/CircleShape.ts";
import { CollisionMask } from "@server/GameWorld/physics/CollisionMask.ts";
import Body from "@server/GameWorld/physics/Body.ts";
import type GameObject from "@server/GameWorld/GameObject.ts";
import Segment from "@server/GameWorld/Area/segments/Segment.ts";
import type { PlayerNetData } from "@shared/types/NetData.ts";
import { EntityTypes } from "@shared/EntityTypes.ts";
import type { GameWorldUpdate } from "@shared/types/GameWorldUpdate.ts";
import Vec2 from "@shared/util/Vec2.ts";
import IsValidPlayerInput from "@server/util/IsValidPlayerInput.ts";

export type ServerPlayerInput = Omit<PlayerInput, "direction"> & { direction: Vec2 };

export default class Player extends Entity<PlayerNetData> {
  private _socket: WebSocket;
  private _gameWorld: GameWorld;

  private _input?: ServerPlayerInput;
  // TODO: maybe use: private _inputs: IPlayerInput[] = [];

  constructor(socket: WebSocket, gameWorld: GameWorld) {
    super(new Body(0, 0, new CircleShape(0.5).setMask(CollisionMask.AREA_FLOOR)), { // TODO
      id: gameWorld.getNextPlayerId(),
      type: EntityTypes.Player,
      position: new Vec2(0, 0)
    });

    this._socket = socket;
    this._gameWorld = gameWorld;

    this._gameWorld.addPlayer(this);
  }

  update(_delta: number): void {
    if (this._input) {
      this._body.velocity.set(this._input.direction).mulLocal(10);
      console.log(this._body.velocity, this._input.direction, this.body.position);
    }
    this.updateNetData();
  }

  updateNetData() {
    this._netData.set("position", this._body.position.toObject());
  }

  onCollision(object: GameObject): void {
    if (object instanceof Segment) this._body.resolveBodyCollision(object.body, object.shape);
  }

  getFullNetData(): PlayerNetData {
    return {
      id: this.id,
      type: this.type,
      position: this._body.position
    };
  }

  // Socket
  send(entitiesNetData?: GameWorldUpdate["entities"], areaConfig?: GameWorldUpdate["area"]) {
    if (this._socket.readyState === this._socket.OPEN) {this._socket.send(JSON.stringify({
      entities: entitiesNetData && entitiesNetData.length ? entitiesNetData : undefined,
      area: areaConfig
    } satisfies GameWorldUpdate));}
  }
  onInput(input: PlayerInput) {
    if (!IsValidPlayerInput(input)) return;

    const direction = new Vec2(input.direction);
    if (direction.length() > 1) direction.normalize();

    if (!this._input) {
      this._input = {
        direction: direction
      };
    } else {
      this._input.direction.set(direction);
    }
    /* this._inputs.push(input);
    if (this._inputs.length >= 100) this._inputs.shift(); */
  }
  onDisconnect() {}
}