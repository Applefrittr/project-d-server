import type GameObject from "../classes/GameObject";
import type Minion from "../classes/Minion";
import settings from "../settings.json";
import setVelocityVector from "../utils/setVelocityVector";

export default function spawnMinions(
  pool: Minion[],
  redTeam: Set<GameObject>,
  blueTeam: Set<GameObject>
) {
  for (let i = 0; i < pool.length; i++) {
    if (!pool[i].team) {
      pool[i].assignTeam("red");
      pool[i].radius = settings["minion-radius"];
      pool[i].hitPoints = settings["minion-hp"];
      redTeam.add(pool[i]);
      pool[i].target = [...blueTeam][0];
      setVelocityVector(pool[i]);
      break;
    }
  }

  for (let j = pool.length - 1; j >= 0; j--) {
    if (!pool[j].team) {
      pool[j].assignTeam("blue");
      pool[j].radius = settings["minion-radius"];
      pool[j].hitPoints = settings["minion-hp"];
      blueTeam.add(pool[j]);
      pool[j].target = [...redTeam][0];
      setVelocityVector(pool[j]);
      break;
    }
  }
}
