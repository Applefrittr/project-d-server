import type Minion from "../classes/Minion";
import settings from "../settings.json";
import setVelocityVector from "../utils/setVelocityVector";
import { TeamObject } from "../Game";

export default function spawnMinions(
  pool: Minion[],
  redTeam: TeamObject,
  blueTeam: TeamObject
) {
  for (let i = 0; i < pool.length; i++) {
    if (!pool[i].team) {
      pool[i].assignTeam("red");
      pool[i].radius = settings["minion-radius"];
      pool[i].hitPoints = settings["minion-hp"];
      redTeam[pool[i].id] = pool[i];
      pool[i].target = blueTeam["-1"];
      setVelocityVector(pool[i]);
      break;
    }
  }

  for (let j = pool.length - 1; j >= 0; j--) {
    if (!pool[j].team) {
      pool[j].assignTeam("blue");
      pool[j].radius = settings["minion-radius"];
      pool[j].hitPoints = settings["minion-hp"];
      blueTeam[pool[j].id] = pool[j];
      pool[j].target = redTeam["-1"];
      setVelocityVector(pool[j]);
      break;
    }
  }
}
