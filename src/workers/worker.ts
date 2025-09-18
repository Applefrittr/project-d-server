import { parentPort, workerData } from "worker_threads";
import intializeGame from "../engine/functions/intializeGame";
import Game from "../engine/Game";
import { type FormattedClientState } from "../engine/functions/formatStateforClient";

export type WorkerIncomingMessage = {
  gameID: number;
  flag: string;
  data?: number;
};

export type WorkerOutgoingMessage = {
  gameID?: number;
  workerID: number;
  flag: string;
  data?: number[];
  state?: FormattedClientState;
};

const currentGames: { [id: number]: Game } = {};
const workerID = workerData.workerID;

// Since parentPort.on(...) cannot accept custom flags (ex: parentPort.on("game_start", ...)) we have to handle the incoming message based on
// the message.flag value => message = {flag: "do something", data: 0}
// Attach listeners to this worker from the main parent thread
parentPort?.on("message", (msg: WorkerIncomingMessage) => {
  switch (msg.flag) {
    case "game_start":
      const game = intializeGame(msg.gameID);
      currentGames[msg.gameID] = game;

      sendMessageToParent("game_start", msg.gameID);
      break;
    case "game_end":
      currentGames[msg.gameID].close();
      delete currentGames[msg.gameID];

      sendMessageToParent("game_end", msg.gameID);
      break;
    default:
      console.log(
        `Unhandled message - '${msg.flag}' - from worker main thread`
      );
  }
});

export function workerForwardState(state: FormattedClientState) {
  const msg: WorkerOutgoingMessage = {
    flag: "game_update",
    state: state,
    gameID: state.id,
    workerID: workerID,
  };
  parentPort?.postMessage(msg);
}

function sendMessageToParent(flag: string, id?: number, data?: any) {
  const msg: WorkerOutgoingMessage = {
    flag: flag,
    gameID: id,
    data: data,
    workerID: workerID,
  };
  parentPort?.postMessage(msg);
}
