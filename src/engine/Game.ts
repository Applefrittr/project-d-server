import Minion from "./classes/Minion";
import initializeMinionPool from "./functions/intializeMinionPool";
import settings from "./settings.json";
import Fortress from "./classes/Fortress";
import GameObject from "./classes/GameObject";
import spawnMinions from "./functions/spawnMinions";
import { broadCastState } from "../sockets/handlers/emitters";
import { isMainThread, parentPort } from "worker_threads";
import {
  formatStateforClient,
  GameState,
} from "./functions/formatStateforClient";

export type TeamObject = {
  [id: number]: GameObject;
};

export default class Game {
  prevWaveTime: number = 0;
  prevMinionSpawn: number = 0;
  minionsSpawnedCurrWave: number = 0;
  minionPool: Minion[] = [];
  gameObjects: GameObject[] = [];
  isPaused: boolean = false;
  isWaveSpawning: boolean = true;
  startTime: number = 0;
  pausedTime: number = 0;

  // Server specific properties
  id: number = 0;
  tickRate: number = settings["tick-rate"];
  tickInterval: number = 1000 / this.tickRate;
  tickFrame: NodeJS.Timeout | undefined = undefined;
  currFame: number = 0;
  prevBroadcastTime: number = 0;
  broadCastInterval: number = 1000 / (this.tickRate / 3);

  constructor(id: number) {
    this.id = id;
  }

  // intialize creates intial gamestate and creates object pools
  initialize() {
    this.gameObjects.push(new Fortress("blue"));
    this.gameObjects.push(new Fortress("red"));
    this.minionPool = initializeMinionPool(this.minionPool, 100);
    console.log(
      "tickInterval: ",
      this.tickInterval,
      "broadCast Interval: ",
      this.broadCastInterval
    );
  }

  // update function loops through all game assets (class instances) and calls their respective update()
  update(currMs: number) {
    for (const obj of this.gameObjects) {
      if (obj instanceof Minion) {
        if (obj.inCombat) {
          obj.attack(currMs);
        }
        obj.adjustPathingToTarget(this.gameObjects);
        obj.detectTarget(this.gameObjects);
        obj.update();
      } else if (obj instanceof Fortress) {
        continue;
      } else continue;
    }
    // filter out dead
    this.gameObjects = this.gameObjects.filter((obj) => obj.hitPoints > 0);
  }

  close() {
    clearInterval(this.tickFrame);
    this.minionPool = [];
    this.gameObjects = [];
    this.startTime = 0;
    this.pausedTime = 0;
    this.currFame = 0;
    this.prevBroadcastTime = 0;
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
  }

  // main game loop -> loop is executed via requestAnimationFrame, checks game state, keeps track of game time, checks for win/lose conditions and calls render function
  loop = (start: number) => {
    this.tickFrame = setInterval(() => {
      // const tick = performance.now();
      // set intial start time of game loop
      if (!this.startTime) this.startTime = start + this.tickInterval;

      const currTime = performance.now();

      // Current in game time -> used for gamestate checks and rendering
      // Ensures game continues at a consistance pace, even when game is paused/resumed
      const gameTime = currTime - this.startTime - this.pausedTime;

      // Set initial time value for prevWaveSpawn -> used to calculate when to spawn Minion waves
      if (!this.prevWaveTime) this.prevWaveTime = gameTime;

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
        spawnMinions(this.minionPool, this.gameObjects);
        this.prevMinionSpawn = gameTime;
        this.minionsSpawnedCurrWave++;
        // checks to see if amount of minions spawned during current wave exceeds max per wave, if so, end wave spawning cycle
        if (this.minionsSpawnedCurrWave >= settings["minions-per-wave"]) {
          this.isWaveSpawning = false;
          this.minionsSpawnedCurrWave = 0;
        }
      }

      this.update(gameTime);
      this.currFame++;
      //console.log(gameTime);

      // TETSING NETWORK STABILITY //
      // Dropped Packet
      // const unstable = Math.random();
      // if (unstable < 0.5) return;
      // TESTING NETWORK STABILITY DONE //

      // Broadcast state to clients at a the broadcast interval rate
      if (gameTime - this.prevBroadcastTime > this.broadCastInterval) {
        const state: GameState = {
          id: this.id,
          gameObjects: this.gameObjects,
          gameTime,
          frame: this.currFame,
        };

        const cl_state = formatStateforClient(state);

        if (isMainThread) {
          broadCastState(cl_state);
        } else {
          parentPort?.postMessage({ state: cl_state });
        }
        this.prevBroadcastTime = gameTime;
      }

      // const tock = performance.now();
      // console.log("loop time: ", tock - tick);
    }, this.tickInterval);
  };
}
