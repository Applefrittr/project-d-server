import GameObject from "./GameObject";
import settings from "../settings.json";

export default class Fortress extends GameObject {
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
}
