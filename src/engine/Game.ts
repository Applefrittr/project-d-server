import FPSController from "./classes/FPSController";
import Minion from "./classes/Minion";
import initializeMinionPool from "./functions/intializeMinionPool";
import settings from "./settings.json";
import Fortress from "./classes/Fortress";
import GameObject from "./classes/GameObject";
import spawnMinions from "./functions/spawnMinions";

export default class Game {
  ctx: CanvasRenderingContext2D | null = null;
  canvasWidth: number;
  canvasHeight: number;
  frame: number = 0;
  fpsController = new FPSController();
  prevWaveTime: number = 0;
  prevMinionSpawn: number = 0;
  minionsSpawnedCurrWave: number = 0;
  minionPool: Minion[] = [];
  renderRate = 1000 / settings["fps"];
  blueTeam: Set<GameObject> = new Set();
  redTeam: Set<GameObject> = new Set();
  isPaused: boolean = false;
  isWaveSpawning: boolean = true;
  startTime: number = 0;
  pausedTime: number = 0;

  constructor(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  setCanvasContext(ctx: CanvasRenderingContext2D | null) {
    this.ctx = ctx;
  }

  // intialize creates intial gamestate and creates object pools
  initialize() {
    this.blueTeam.add(new Fortress("blue"));
    this.redTeam.add(new Fortress("red"));
    this.minionPool = initializeMinionPool(this.minionPool, 100);

    this.prevWaveTime = performance.now();
    //spawnWave(this.minionPool, this.redTeam, this.blueTeam);
  }

  // render function loops through all game assets (class instances) and calls their respective update()

  // REWORK THIS to interate through team Sets instead of Minion pool
  // will have to add type property to GameObject class (ex: Minon, Tower, Fortress, etc)
  render(currMs: number) {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.minionPool.forEach((minion) => {
        if (minion.team === null) return;
        if (minion.inCombat) {
          minion.attack(currMs);
        }
        if (minion.team === "blue") {
          if (minion.hitPoints <= 0) {
            minion.destroy(this.blueTeam);
            return;
          }
          minion.adjustPathingToTarget(this.blueTeam);
          minion.detectTarget(this.redTeam);
        } else {
          if (minion.hitPoints <= 0) {
            minion.destroy(this.redTeam);
            return;
          }
          minion.adjustPathingToTarget(this.redTeam);
          minion.detectTarget(this.blueTeam);
        }
        minion.update(this.ctx);

        // temp just to render Fortresses
        [...this.redTeam][0].draw(this.ctx);
        [...this.blueTeam][0].draw(this.ctx);
      });
    }
  }

  close() {
    window.cancelAnimationFrame(this.frame);
    this.minionPool = [];
    this.redTeam = new Set();
    this.blueTeam = new Set();
  }

  pause() {
    if (!this.isPaused) {
      cancelAnimationFrame(this.frame);
      this.pausedTime += performance.now() - (this.startTime + this.startTime);
      this.isPaused = true;
    } else {
      this.startTime = performance.now();
      this.frame = window.requestAnimationFrame(this.loop);
      this.isPaused = false;
    }
    console.log("minons: ", this.minionPool);
    console.log("blue team: ", this.blueTeam);
    console.log("red team: ", this.redTeam);
  }

  // main game loop -> loop is executed via requestAnimationFrame, checks game state, keeps track of game time, checks for win/lose conditions and calls render function
  loop = (msNow: number) => {
    // set intial start time of game loop
    if (!this.startTime) this.startTime = msNow;

    // Current in game time -> used for gamestate checks and rendering
    // Ensures game continues at a consistance pace, even when game is paused/resumed
    const gameTime = msNow - this.startTime - this.pausedTime;

    this.frame = window.requestAnimationFrame(this.loop);

    // fpsController ensures render and game state checks are locked to specific FPS
    if (!this.fpsController.renderFrame(gameTime)) return;

    // toggle spawn wave switch on if time elasped between waves exceeds settings['time-between-waves]
    if (gameTime - this.prevWaveTime >= settings["time-between-waves"]) {
      this.isWaveSpawning = true;
      this.prevWaveTime = gameTime;
    }

    // spawns minions based on settings["time-between-minions"] interval
    if (
      this.isWaveSpawning &&
      this.minionPool &&
      gameTime - this.prevMinionSpawn >= settings["time-between-minions"]
    ) {
      spawnMinions(this.minionPool, this.redTeam, this.blueTeam);
      this.prevMinionSpawn = gameTime;
      this.minionsSpawnedCurrWave++;
      // checks to see if amount of minions spawned during current wave exceeds max per wave, if so, end wave spawning cycle
      if (this.minionsSpawnedCurrWave >= settings["minions-per-wave"]) {
        this.isWaveSpawning = false;
        this.minionsSpawnedCurrWave = 0;
      }
    }

    this.render(gameTime);
  };
}
