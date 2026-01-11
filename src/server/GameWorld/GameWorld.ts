import Area from "./Area/Area.ts";
import type Player from "./entities/Player/Player.ts";

export default class GameWorld {
  readonly TickRate: number;
  readonly MsPerTick: number;
  readonly MaxStepsPerTick: number;
  readonly MaxTickAccumulator: number;

  // Physics
  readonly VelocityIterations: number;
  readonly PositionIterations: number;
  
  // Tick
  private lastTick: number = -1;
  private tickAccumulator = 0;
  
  private running: boolean = false;
  get isRunning() { return this.running; }

  private __lastPlayerId: number = 0;
  public getNextPlayerId() { return this.__lastPlayerId++; }
  
  private _newPlayers: Set<Player> = new Set();
  private _removedPlayers: Set<Player> = new Set();
  private _players: Set<Player> = new Set();
  get players(): ReadonlySet<Player> { return this._players; }

  // TODO
  private _area: Area = new Area(this);

  constructor(tps: number = 60, maxStepsPerTick: number = 5, velocityIterations: number = 8, positionIterations: number = 3) {
    this.TickRate = tps;
    this.MsPerTick = 1000 / tps;
    this.MaxStepsPerTick = maxStepsPerTick;
    this.MaxTickAccumulator = this.MsPerTick * maxStepsPerTick;
    this.VelocityIterations = velocityIterations;
    this.PositionIterations = positionIterations;
  }

  private update(delta: number) {
    for (const player of this._newPlayers) {
      this._players.add(player);
      player.addToArea(this._area);
    }
    this._newPlayers.clear();

    for (const player of this._removedPlayers) this._players.delete(player);
    this._removedPlayers.clear();


    this._area.update(delta);
  }

  private tick(now: number) {
    const delta = now - this.lastTick;

    if (delta > 0 && Number.isFinite(delta)) {
      this.lastTick = now;
      this.tickAccumulator += delta;
      this.tickAccumulator = Math.min(this.tickAccumulator, this.MaxTickAccumulator);
      
      let steps = 0;
  
      while (this.tickAccumulator >= this.MsPerTick && steps < this.MaxStepsPerTick) {
        this.update(this.MsPerTick);
        
        this.tickAccumulator -= this.MsPerTick;
        steps++;
      }

      if (steps === this.MaxStepsPerTick) console.info("Steps out!");
    }

    if (this.isRunning) setImmediate(() => this.tick(performance.now())); 
  }

  run() {
    this.running = true;
    this.lastTick = performance.now();
    this.tick(performance.now());
  }

  addPlayer(player: Player) {
    this._newPlayers.add(player);
  }

  removePlayer(player: Player) {
    this._players.delete(player);
  }
}