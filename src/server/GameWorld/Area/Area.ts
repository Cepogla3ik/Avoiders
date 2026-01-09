import type Entity from "../entities/Entity.ts";
import Player from "../entities/Player/Player.ts";
import type GameWorld from "../GameWorld.ts";
import Body from "../physics/Body.ts";
import CheckCollision from "../physics/util/CheckCollision.ts";
import Segment from "./segments/Segment.ts";

export default class Area {
  private _gameWorld: GameWorld;
  
  private _body: Body;
  get body() { return this._body; }
  private _segments: Set<Segment> = new Set();

  private _players: Set<Player> = new Set();
  private _entities: Set<Entity> = new Set();

  constructor(gameWorld: GameWorld) {
    this._gameWorld = gameWorld;
    this._body = new Body(0, 0);

    const player = new Player(undefined, this._gameWorld);
    this._players.add(player);
    this._entities.add(player);

    this._segments.add(new Segment(100, 200, this));
  }

  private physicsStep(delta: number, entities: Entity[], isVelocityStep: Boolean = false, isLastStep: Boolean = false, isFirstStep: Boolean = false) {
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      if (isVelocityStep) entity.body.update(delta / this._gameWorld.VelocityIterations);

      if (entity.body.shape && !entity.body.isStatic) {
        for (const segment of this._segments) {
          if (entity.body.shape.isCanCollide(segment.shape) && entity.body.checkCollision(this._body, segment.shape, false, /* entity instanceof Player && segment instanceof Danger */)) {
            entity.onCollision(segment);
          }
        }
      }
          
      for (let j = i + 1; j < entities.length; j++) {
        const entity2 = entities[j];
        // if (entity2.isDestroyed) continue;
        
        if (entity.body.shape) for (const sensor of entity2.body.sensors) {
          if (CheckCollision(entity2.body, sensor, entity.body, entity.body.shape)) entity2.onSensorCollision(sensor, entity);
        }
        if (entity2.body.shape) for (const sensor of entity.body.sensors) {
          if (CheckCollision(entity.body, sensor, entity2.body, entity2.body.shape)) entity.onSensorCollision(sensor, entity);
        }

        if (!(entity.body.isStatic && entity2.body.isStatic) && entity.body.shape && entity2.body.shape) {
          if ((entity.body.shape.isCanCollide(entity2.body.shape) || entity2.body.shape.isCanCollide(entity.body.shape)) && entity.body.canCollide(entity2.body)) {
            
            if (CheckCollision(entity.body, entity.body.shape, entity2.body, entity2.body.shape)) {
              if (entity.body.shape.isCanCollide(entity2.body.shape)) entity.onCollision(entity2);
              if (entity2.body.shape.isCanCollide(entity.body.shape)) entity2.onCollision(entity);
            }
          }
        }
      }

      if (isLastStep) {
        entity.update(delta);
      }
    }
  }

  update(delta: number) {
    const FIRST_VELOCITY_ITERATION = 0;
    const LAST_VELOCITY_ITERATION = FIRST_VELOCITY_ITERATION + this._gameWorld.VelocityIterations - 1;

    const FIRST_POSITION_ITERATION = LAST_VELOCITY_ITERATION + 1;
    const LAST_POSITION_ITERATION = FIRST_POSITION_ITERATION + this._gameWorld.PositionIterations - 1;

    const LAST_ITERATION = LAST_POSITION_ITERATION;
    const TOTAL_ITERATIONS = LAST_POSITION_ITERATION + 1;

    const entities = Array.from(this._entities);
    for (let iteration = 0; iteration < TOTAL_ITERATIONS; iteration++) {
      this.physicsStep(delta, entities,
        FIRST_VELOCITY_ITERATION <= iteration && iteration <= LAST_VELOCITY_ITERATION,
        iteration == LAST_ITERATION,
        iteration == FIRST_VELOCITY_ITERATION
      );
    }

    for (const player of this._players) console.log(player);
  }
}