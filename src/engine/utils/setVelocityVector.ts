import type GameObject from "../classes/GameObject";
import settings from "../settings.json";
import Vector from "../classes/Vector";

export default function setVelocityVector(obj: GameObject) {
  if (obj.target) {
    const targetX = obj.target.position.x;
    const targetY = obj.target.position.y;

    const newVector = new Vector(
      targetX - obj.position.x,
      targetY - obj.position.y
    )
      .normalize()
      .scaler(settings["minion-speed"]);

    obj.velocity.update(newVector.x, newVector.y);
  }
}
