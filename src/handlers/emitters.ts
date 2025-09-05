import { io } from "..";
import Vector from "../engine/classes/Vector";
import { TeamObject } from "../engine/Game";

type GameState = {
  id: number;
  blueTeam: TeamObject;
  redTeam: TeamObject;
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

  for (const obj of Object.values(state.blueTeam)) {
    const blueObj: GameObjectData = {
      id: obj.id,
      position: obj.position,
      velocity: obj.velocity,
      hitPoints: obj.hitPoints,
      radius: obj.radius,
      team: obj.team,
    };
    gameObjects.push(blueObj);
  }
  for (const obj of Object.values(state.redTeam)) {
    const redObj: GameObjectData = {
      id: obj.id,
      position: obj.position,
      velocity: obj.velocity,
      hitPoints: obj.hitPoints,
      radius: obj.radius,
      team: obj.team,
    };
    gameObjects.push(redObj);
  }
  io.volatile.emit("update", {
    id: state.id,
    gameTime: state.gameTime,
    frame: state.frame,
    gameObjects,
  });
}
