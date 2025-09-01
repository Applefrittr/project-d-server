import settings from "../settings.json";

export default class FPSController {
  msPrev: number = performance.now();
  fps: number = settings["fps"];
  msPerFrame: number = 1000 / this.fps;

  constructor() {}

  renderFrame(msNow: number) {
    const msPassed = msNow - this.msPrev;

    if (msPassed < this.msPerFrame) return false;

    const msExcess = Math.round(msPassed % this.msPerFrame);
    this.msPrev = msNow - msExcess;
    return true;
  }
}
