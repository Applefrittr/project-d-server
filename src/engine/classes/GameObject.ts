import Vector from "./Vector";

export default class GameObject {
  id: number = -1;
  position: Vector = new Vector(0, 0);
  velocity: Vector = new Vector(0, 0);
  radius: number = 0;
  target: GameObject | null = null;
  inCombat: boolean = false;
  hitPoints: number = 0;

  reset() {
    this.position = new Vector(0, 0);
    this.velocity = new Vector(0, 0);
    this.radius = 0;
    this.target = null;
    this.inCombat = false;
    this.hitPoints = 0;
  }

  draw(ctx: CanvasRenderingContext2D | null) {
    // temporary super method draw()
    if (ctx) return;
  }
}
