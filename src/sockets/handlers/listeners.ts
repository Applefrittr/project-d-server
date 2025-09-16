import { broadCastState, sendStartSignal } from "./emitters";
import intializeGame from "../../engine/functions/intializeGame";
import { sv_games } from "../../utils/sv_games";
import { Socket, DefaultEventsMap } from "socket.io";
import { Worker } from "worker_threads";

export default function attachListeners(
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  socket.on("join_lobby", (id: number) => {
    console.log(`User connecting to lobby - ${id}`);
    socket.join(`${id}`);
    socket.data.gameID = id;
  });

  socket.on("sv_start", (id: number) => {
    //console.log(`launching Game ${id}`);
    // const nwGame = intializeGame(id);
    // sv_games[id] = nwGame;
    console.log("Sending client start message...");

    // assign game instnace to assigned worker thread for this socket

    sendStartSignal();

    const worker = new Worker("./dist/workers/game-worker.js", {
      workerData: id,
    });
    worker.on("message", (msg) => {
      if (msg.start) console.log(msg.start);
      else if (msg.state) {
        //console.log(msg.state);
        broadCastState(msg.state);
      }
    });
  });

  socket.on("disconnect", () => {
    const id = socket.data.gameID;
    console.log(`user disconnected from room - ${id} - closing game ${id}`);
    sv_games[id]?.close();
    delete sv_games[id];
  });
}
