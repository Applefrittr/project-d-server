import type GameObject from "../classes/GameObject";
import roundHundrethPercision from "./roundHundrethPercision";

// Hanldes collision between 2 Game Objects -> the subject Game Object and the collided Game Object
export default function handleObjectCollision(
  subject: GameObject,
  collided: GameObject
) {
  // Calc angle of collision (inverse the calc angle as Canvas y-axis is flipped - postive y points downward)
  const radAngle = -Math.atan2(
    collided.position.y - subject.position.y,
    collided.position.x - subject.position.x
  );
  //const degrees = ((radAngle * 180) / Math.PI + 360) % 360;
  //console.log(subject.id + ": " + degrees, radAngle);

  // reposition subject Game Object outside of collided Game Object to ensure no overlap based on collision angle
  subject.position.update(
    roundHundrethPercision(
      collided.position.x - subject.radius * 2 * Math.cos(radAngle)
    ),
    roundHundrethPercision(
      collided.position.y + subject.radius * 2 * Math.sin(radAngle)
    )
  );
}
