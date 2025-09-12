import Vector from "./Vector";

export default class GameObject {
  id: number = -1;
  position: Vector = new Vector(0, 0);
  velocity: Vector = new Vector(0, 0);
  radius: number = 0;
  target: GameObject | null = null;
  hitPoints: number = 0;
  inCombat: boolean = false;
  team: string = "";

  reset() {
    this.position = new Vector(0, 0);
    this.velocity = new Vector(0, 0);
    this.radius = 0;
    this.target = null;
    this.hitPoints = 0;
    this.team = "";
    this.inCombat = false;
  }
}
