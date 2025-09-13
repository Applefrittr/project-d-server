import { io } from "../server";
import Fortress from "../../engine/classes/Fortress";
import GameObject from "../../engine/classes/GameObject";
import Minion from "../../engine/classes/Minion";
import Vector from "../../engine/classes/Vector";

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

  // Testing Jitter!!!! //
  // const jitter = 10 + Math.random() * 200;
  // setTimeout(() => {
  //   io.volatile.emit("update", {
  //     id: state.id,
  //     serverTime: state.gameTime,
  //     frame: state.frame,
  //     objMap,
  //   });
  // }, jitter);
  // return
  // Jitter Test end //

  io.to(`${state.id}`).volatile.emit("update", {
    id: state.id,
    serverTime: state.gameTime,
    frame: state.frame,
    objMap,
  });
}

export function sendStartSignal() {
  io.emit("cl_start");
}
