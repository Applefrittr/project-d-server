import { io } from "..";
import GameObject from "../engine/classes/GameObject";
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

export function formatAndBroadcastGameState(state: GameState) {
  const gameObjects: GameObjectData[] = [];

  for (const obj of state.gameObjects) {
    const newObj: GameObjectData = {
      id: obj.id,
      position: obj.position,
      velocity: obj.velocity,
      hitPoints: obj.hitPoints,
      radius: obj.radius,
      team: obj.team,
    };
    gameObjects.push(newObj);
  }

  io.volatile.emit("update", {
    id: state.id,
    gameTime: state.gameTime,
    frame: state.frame,
    gameObjects,
  });
}
