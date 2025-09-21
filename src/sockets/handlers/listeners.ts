import {
  sendStartSignal,
  sendServerError,
  sendLobbyNotification,
} from "./emitters";
import { Socket, DefaultEventsMap } from "socket.io";
import { workerLB } from "../../workers/WorkerLoadBalancer";
import { io } from "../server";
import { lobbyCache } from "../../utils/lobbyCache";

export default function attachListeners(
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  socket.on("join_lobby", async (gameID: number) => {
    console.log("in socket listener: ", gameID, lobbyCache);
    const lobby = lobbyCache[gameID];
    if (!lobby) {
      sendServerError("Lobby no longer exists!");
      return;
    }
    if (lobby.playerCount < 3) {
      socket.join(`${gameID}`);
      socket.data.gameID = gameID;
      // socket.data.user = abc123
      lobby.playerCount++;
      console.log(
        `User connecting to lobby - ${gameID} - currently ${lobby.playerCount} users connected`
      );
    } else sendServerError("Game lobby is full!");
  });

  socket.on("sv_start", (gameID: number) => {
    console.log("Sending client start message...");
    sendStartSignal();

    // assign a new game instance to a worker through our Worker Load Balancer
    workerLB.assignNewGame(gameID);
  });

  socket.on("disconnect", async () => {
    const gameID = socket.data.gameID;
    console.log(lobbyCache[gameID]);
    sendLobbyNotification("User disconnected!", gameID);
    lobbyCache[gameID].playerCount--;
    console.log(`user disconnected from lobby - ${gameID}`);
    console.log(`updated cache: `, lobbyCache);
    if (lobbyCache[gameID].playerCount === 0) {
      console.log(`lobby ${gameID} closed!`);
      workerLB.closeGame(gameID);
      delete lobbyCache[gameID];
    }
  });
}
