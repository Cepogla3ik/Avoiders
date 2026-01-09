import type { WebSocket } from "ws";
import type GameWorld from "@server/GameWorld/GameWorld.ts";
import type { IPlayerInput } from "@shared/types/player.ts";
import Entity from "../Entity.ts";
import CircleShape from "@server/GameWorld/physics/shapes/CircleShape.ts";
import { CollisionMask } from "@server/GameWorld/physics/CollisionMask.ts";
import Body from "@server/GameWorld/physics/Body.ts";
import type GameObject from "@server/GameWorld/GameObject.ts";
import Segment from "@server/GameWorld/Area/segments/Segment.ts";
import type { EntityNetData, PlayerNetData } from "@shared/types/NetData.ts";
import { EntityTypes } from "@shared/EntityTypes.ts";
import type { AreaConfig } from "@shared/types/AreaConfig.ts";
import type { GameWorldUpdate } from "@shared/types/GameWorldUpdate.ts";

export default class Player extends Entity<PlayerNetData> {
  private _socket: WebSocket;
  private _gameWorld: GameWorld;

  private _inputs: IPlayerInput[] = [];

  constructor(socket: WebSocket, gameWorld: GameWorld) {
    super(new Body(0, 0, new CircleShape(0.5).setMask(CollisionMask.AREA_FLOOR)), gameWorld.getNextPlayerId(), EntityTypes.Player); // TODO
    this._socket = socket;
    this._gameWorld = gameWorld;

    gameWorld.addPlayer(this);
  }

  update(delta: number): void {
    this._body.velocity.set(0.01, -0.01);
  }

  onCollision(object: GameObject): void {
    if (object instanceof Segment) this._body.resolveBodyCollision(object.body, object.shape)
  }

  getFullNetData(): PlayerNetData {
    return {
      id: this.id,
      type: this.type,
      position: this._body.position
    }
  }

  send(entitiesNetData: EntityNetData[], areaConfig: AreaConfig) {
    this._socket.send(JSON.stringify({
      entities: entitiesNetData,
      area: areaConfig
    } satisfies GameWorldUpdate));
  }
  onInput(input: IPlayerInput) {
    this._inputs.push(input);
  }
  onDisconnect() {}
}