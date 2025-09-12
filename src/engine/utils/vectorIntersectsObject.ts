import type GameObject from "../classes/GameObject";
import Vector from "../classes/Vector";
import getDistanceBetweenVectors from "./getDistanceBetweenVectors";

export default function vectorIntersectsObject(
  obj: GameObject,
  ...vectors: Vector[]
) {
  for (const vector of vectors) {
    const dist = getDistanceBetweenVectors(vector, obj.position);
    if (dist <= obj.radius * 2) return true;
  }
  return false;
}
