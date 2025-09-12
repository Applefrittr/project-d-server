import Minion from "../classes/Minion";

export default function initializeObjectPool(pool: Minion[], count: number) {
  for (let i = 0; i < count; i++) {
    const minion = new Minion();
    minion.id = i;
    pool.push(minion);
  }

  return pool;
}
