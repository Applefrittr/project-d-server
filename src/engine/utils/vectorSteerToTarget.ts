import GameObject from "../classes/GameObject";
import settings from "../settings.json";
import Vector from "../classes/Vector";
import roundHundrethPercision from "./roundHundrethPercision";

export default function vectorSteerToTarget(obj: GameObject) {
  if (obj.target) {
    const targetX = obj.target.position.x;
    const targetY = obj.target.position.y;

    const vectorToTarget = new Vector(
      targetX - obj.position.x,
      targetY - obj.position.y
    )
      .normalize()
      .scaler(settings["minion-speed"]);

    const steeringVector = new Vector(
      vectorToTarget.x - obj.velocity.x,
      vectorToTarget.y - obj.velocity.y
    ).scaler(settings["steering-force"]);

    obj.velocity.update(
      roundHundrethPercision(obj.velocity.x + steeringVector.x),
      roundHundrethPercision(obj.velocity.y + steeringVector.y)
    );
  }
}
