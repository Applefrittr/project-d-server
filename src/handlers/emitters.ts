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

type JSONableGameObject = {
  id: number;
  position: Vector;
  velocity: Vector;
  hitpoints: number;
  team: string | null;
};

export function formatAndBroadcastGameState(state: GameState) {
  const gameObjects: JSONableGameObject[] = [];

  for (const obj of Object.values(state.blueTeam)) {
    const blueObj: JSONableGameObject = {
      id: obj.id,
      position: obj.position,
      velocity: obj.velocity,
      hitpoints: obj.hitPoints,
      team: obj.team,
    };
    gameObjects.push(blueObj);
  }
  for (const obj of Object.values(state.redTeam)) {
    const redObj: JSONableGameObject = {
      id: obj.id,
      position: obj.position,
      velocity: obj.velocity,
      hitpoints: obj.hitPoints,
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
