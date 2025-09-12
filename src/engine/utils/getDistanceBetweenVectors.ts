import roundHundrethPercision from "./roundHundrethPercision";
import Vector from "../classes/Vector";

// Use Pythagorean Theorem to find distance between 2 Vectors
export default function getDistanceBetweenVectors(
  vector1: Vector,
  vector2: Vector
): number {
  const a = (vector1.x - vector2.x) ** 2;
  const b = (vector1.y - vector2.y) ** 2;

  return roundHundrethPercision(Math.sqrt(a + b));
}
