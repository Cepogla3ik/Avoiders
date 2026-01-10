import type { WebSocket } from "ws";
import type GameWorld from "@server/GameWorld/GameWorld.ts";
import type { IPlayerInput } from "@shared/types/player.ts";
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

export default class Player extends Entity<PlayerNetData> {
  private _socket: WebSocket;
  private _gameWorld: GameWorld;

  private _inputs: IPlayerInput[] = [];

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
    this._body.velocity.set(0.01, -0.01);
  }

  onCollision(object: GameObject): void {
    if (object instanceof Segment) this._body.resolveBodyCollision(object.body, object.shape);
  }

  getFullNetData(): PlayerNetData {
    return {
      id: this.id,
      type: this.type,
      position: this._body.position
    }
  }

  // Socket
  send(entitiesNetData?: GameWorldUpdate["entities"], areaConfig?: GameWorldUpdate["area"]) {
    if (this._socket.readyState === this._socket.OPEN) this._socket.send(JSON.stringify({
      entities: entitiesNetData && entitiesNetData.length ? entitiesNetData : undefined,
      area: areaConfig
    } satisfies GameWorldUpdate));
  }
  onInput(input: IPlayerInput) {
    this._inputs.push(input);
  }
  onDisconnect() {}
}