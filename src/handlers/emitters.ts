import { io } from "..";
import Fortress from "../engine/classes/Fortress";
import GameObject from "../engine/classes/GameObject";
import Minion from "../engine/classes/Minion";
import Vector from "../engine/classes/Vector";
import { TeamObject } from "../engine/Game";

type GameState = {
  id: number;
  gameObjects: GameObject[];
  gameTime: number;
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

export function formatAndBroadcastGameState(state: GameState) {
  const objMap: GameObjectMap = {};

  for (const obj of state.gameObjects) {
    const newObj: GameObjectData = {
      id: obj.id,
      position: obj.position,
      velocity: obj.velocity,
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

  io.volatile.emit("update", {
    id: state.id,
    gameTime: state.gameTime,
    frame: state.frame,
    objMap,
  });
}
