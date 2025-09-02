import FPSController from "./classes/FPSController";
import Minion from "./classes/Minion";
import initializeMinionPool from "./functions/intializeMinionPool";
import settings from "./settings.json";
import Fortress from "./classes/Fortress";
import GameObject from "./classes/GameObject";
import spawnMinions from "./functions/spawnMinions";

export default class Game {
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
  tickRate: number = settings["fps"];
  tickInterval: number = 1000 / this.tickRate;
  tickFrame: NodeJS.Timeout | undefined = undefined;

  // intialize creates intial gamestate and creates object pools
  initialize() {
    this.blueTeam.add(new Fortress("blue"));
    this.redTeam.add(new Fortress("red"));
    this.minionPool = initializeMinionPool(this.minionPool, 100);

    this.prevWaveTime = performance.now();
  }

  // render function loops through all game assets (class instances) and calls their respective update()

  // REWORK THIS to interate through team Sets instead of Minion pool
  // will have to add type property to GameObject class (ex: Minon, Tower, Fortress, etc)
  update(currMs: number) {
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
      minion.update();
    });
  }

  close() {
    clearInterval(this.tickFrame);
    this.minionPool = [];
    this.redTeam = new Set();
    this.blueTeam = new Set();
  }

  pause() {
    if (!this.isPaused) {
      clearInterval(this.tickFrame);
      this.pausedTime += performance.now() - (this.startTime + this.startTime);
      this.isPaused = true;
    } else {
      this.startTime = performance.now();
      this.loop(this.startTime);
      this.isPaused = false;
    }
    console.log("minons: ", this.minionPool);
    console.log("blue team: ", this.blueTeam);
    console.log("red team: ", this.redTeam);
  }

  // main game loop -> loop is executed via requestAnimationFrame, checks game state, keeps track of game time, checks for win/lose conditions and calls render function
  loop = (msNow: number) => {
    this.tickFrame = setInterval(() => {
      // set intial start time of game loop
      if (!this.startTime) this.startTime = msNow;

      // Current in game time -> used for gamestate checks and rendering
      // Ensures game continues at a consistance pace, even when game is paused/resumed
      const gameTime = msNow - this.startTime - this.pausedTime;

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

      this.update(gameTime);

      // Broadcast state to clients
      console.log("blueTeam: ", this.blueTeam);
      console.log("redTeam: ", this.redTeam);
    }, this.tickInterval);
  };
}
