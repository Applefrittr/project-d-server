import type Minion from "../classes/Minion";
import settings from "../settings.json";
import setVelocityVector from "../utils/setVelocityVector";
import { TeamObject } from "../Game";
import Fortress from "../classes/Fortress";
import GameObject from "../classes/GameObject";

export default function spawnMinions(
  pool: Minion[],
  gameObjects: GameObject[]
) {
  let redFortress = null;
  let blueFortress = null;

  for (const obj of gameObjects) {
    if (obj instanceof Fortress) {
      if (obj.team === "red") redFortress = obj;
      else blueFortress = obj;
    }
  }

  for (let i = 0; i < pool.length; i++) {
    if (!pool[i].team) {
      pool[i].assignTeam("red");
      pool[i].radius = settings["minion-radius"];
      pool[i].hitPoints = settings["minion-hp"];
      gameObjects.push(pool[i]);
      pool[i].target = blueFortress;
      setVelocityVector(pool[i]);
      break;
    }
  }

  for (let j = pool.length - 1; j >= 0; j--) {
    if (!pool[j].team) {
      pool[j].assignTeam("blue");
      pool[j].radius = settings["minion-radius"];
      pool[j].hitPoints = settings["minion-hp"];
      gameObjects.push(pool[j]);
      pool[j].target = redFortress;
      setVelocityVector(pool[j]);
      break;
    }
  }
}
