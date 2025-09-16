import Fortress from "../classes/Fortress";
import GameObject from "../classes/GameObject";
import Minion from "../classes/Minion";
import Vector from "../classes/Vector";

export type GameState = {
  id: number;
  gameObjects: GameObject[];
  gameTime: number;
  frame: number;
};

export type FormattedClientState = {
  id: number;
  objMap: GameObjectMap;
  serverTime: number;
  frame: number;
};

type GameObjectData = {
  id: number;
  position: Vector;
  velocity: Vector;
  hitPoints: number;
  team: string;
  radius: number;
};

type GameObjectMap = {
  [id: string]: GameObjectData;
};

export function formatStateforClient(state: GameState): FormattedClientState {
  const objMap: GameObjectMap = {};

  for (const obj of state.gameObjects) {
    const newObj: GameObjectData = {
      id: obj.id,
      position: new Vector(obj.position.x, obj.position.y),
      velocity: new Vector(obj.position.x, obj.position.y),
      hitPoints: obj.hitPoints,
      radius: obj.radius,
      team: obj.team,
    };
    if (obj instanceof Minion) {
      objMap[obj.id] = newObj;
    } else if (obj instanceof Fortress) {
      if (obj.team === "red") objMap["red-fort"] = newObj;
      else objMap["blue-fort"] = newObj;
    }
  }

  return {
    id: state.id,
    serverTime: state.gameTime,
    frame: state.frame,
    objMap: objMap,
  };
}
