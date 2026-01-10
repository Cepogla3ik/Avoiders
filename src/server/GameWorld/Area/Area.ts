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
  get segments(): ReadonlySet<Segment> { return this._segments; }

  private _players: Set<Player> = new Set();
  get players(): ReadonlySet<Player> { return this._players; }
  
  private hasNewPlayers: boolean = false;

  private updating: boolean = false;
  get isUpdating() { return this.updating; }
  private addingEntities: boolean = false;
  get isAddingEntities() { return this.addingEntities; }
  private removingEntities: boolean = false;
  get isRemovingEntities() { return this.removingEntities; }

  private _addedEntities: Set<Entity> = new Set();
  private _removedEntities: Set<Entity> = new Set();

  private _entities: Set<Entity> = new Set();
  get entities(): ReadonlySet<Entity> { return this._entities; }

  constructor(gameWorld: GameWorld) {
    this._gameWorld = gameWorld;
    this._body = new Body(0, 0);

    this._segments.add(new Segment(100, 200, this));
  }

  update(delta: number) {
    this.updating = true;
    
    this.addedEntitiesProcess();
    this.physicsProcess(delta);
    this.sendNetDataProcess();
    this.removedEntitiesProcess();
    
    this.hasNewPlayers = false;
    this.updating = false;
  }

  // Processes
  private addedEntitiesProcess() {
    this.addingEntities = true;
    for (const entity of this._addedEntities) {
      if (entity instanceof Player) {
        this.hasNewPlayers = true;
        this._players.add(entity);
      }
      this._entities.add(entity);
    }

    this._addedEntities.clear();
    this.addingEntities = false;
  }
  private removedEntitiesProcess() {
    this.removingEntities = true;
    for (const entity of this._removedEntities) {
      if (entity instanceof Player) this._players.delete(entity);
      this._entities.delete(entity);
    }

    this._removedEntities.clear();
    this.removingEntities = false;
  }
  private physicsProcess(delta: number) {
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
  }
  private sendNetDataProcess() {
    const fullEntitiesNetData = [];
    const entitiesNetData = [];

    const areaConfig = {
      segments: [{ position: { x: 0, y: 0 }, width: 100, height: 200 }]
    };

    for (const entity of this._entities) {
      if (entity.area !== this) continue;
      if (this.hasNewPlayers) fullEntitiesNetData.push(entity.fullNetData);

      if (entity.isNewOnArea) entitiesNetData.push(entity.fullNetData);
      else {
        const netData = entity.netData;
        if (netData) entitiesNetData.push(netData);
      }

      if (!(entity instanceof Player)) entity.nullify();
    }
    for (const player of this._players) {
      if (player.area !== this) continue;

      if (player.isNewOnArea){
        player.send(fullEntitiesNetData, areaConfig);
      }
      else player.send(entitiesNetData);

      player.nullify();
    }
  }
  
  private physicsStep(delta: number, entities: Entity[], isVelocityStep: Boolean = false, isLastStep: Boolean = false, _isFirstStep: Boolean = false) {
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      if (entity.area !== this || entity.isDestroyed) continue;

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
        if (entity2.area !== this || entity2.isDestroyed) continue;
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
        if (entity.area !== this) continue;
        entity.update(delta);
      }
    }
  }

  addEntity(entity: Entity) {
    if (this.isAddingEntities) throw new Error("Area already locked for add entities!");
    this._addedEntities.add(entity);
    /* if (entity instanceof Player) this._players.add(entity);
    this._entities.add(entity); */
  }

  removeEntity(entity: Entity) {
    if (this.isRemovingEntities) throw new Error("Area already locked for remove entities!");
    this._removedEntities.add(entity);
    /* if (entity instanceof Player) this._players.delete(entity);
    this._entities.delete(entity); */
  }
}