import type GameWorld from "@server/GameWorld/GameWorld.ts";
import type { IPlayerInput } from "@shared/types/player.ts";
import type { Socket } from "socket.io";
import Entity from "../Entity.ts";
import CircleShape from "@server/GameWorld/physics/shapes/CircleShape.ts";
import { CollisionMask } from "@server/GameWorld/physics/CollisionMask.ts";
import Body from "@server/GameWorld/physics/Body.ts";
import type GameObject from "@server/GameWorld/GameObject.ts";
import Segment from "@server/GameWorld/Area/segments/Segment.ts";

export default class Player extends Entity {
  private _socket?: Socket;
  private _gameWorld: GameWorld;

  private _inputs: IPlayerInput[] = [];

  constructor(socket: Socket | undefined, gameWorld: GameWorld) {
    super(new Body(0, 0, new CircleShape(0.5).setMask(CollisionMask.AREA_FLOOR))); // TODO
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

  send() {
    // this._socket.send();
  }
  onInput(input: IPlayerInput) {
    this._inputs.push(input);
  }
  onDisconnect() {}
}