import { sendStartSignal } from "./emitters";
import { Socket, DefaultEventsMap } from "socket.io";
import { workerLB } from "../../workers/WorkerLoadBalancer";

export default function attachListeners(
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  socket.on("join_lobby", (gameID: number) => {
    console.log(`User connecting to lobby - ${gameID}`);
    socket.join(`${gameID}`);
    socket.data.gameID = gameID;
  });

  socket.on("sv_start", (gameID: number) => {
    console.log("Sending client start message...");
    sendStartSignal();

    // assign a new game instance to a worker through our Worker Load Balancer
    workerLB.assignNewGame(gameID);
  });

  socket.on("disconnect", () => {
    const gameID = socket.data.gameID;
    workerLB.closeGame(gameID);
  });
}
