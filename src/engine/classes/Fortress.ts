import GameObject from "./GameObject";
import settings from "../settings.json";

export default class Fortress extends GameObject {
  team: string | null = null;
  argoRange = 200;

  constructor(team: "red" | "blue") {
    super();
    this.radius = settings["tower-radius"];
    this.hitPoints = settings["fortress-hitpoints"];
    this.team = team;
    if (team === "red") {
      this.position.update(
        settings["arena-width"] / 2 + settings["tower-radius"],
        settings["arena-height"] - settings["tower-radius"]
      );
    } else {
      this.position.update(
        settings["arena-width"] / 2 - settings["tower-radius"],
        settings["tower-radius"]
      );
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.team) {
      ctx.beginPath();
      ctx.fillStyle = this.team;
      ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();

      ctx.fillStyle = "black";
      ctx.font = "16px serif";
      ctx.fillText(this.hitPoints.toString(), this.position.x, this.position.y);
    }
  }
}
