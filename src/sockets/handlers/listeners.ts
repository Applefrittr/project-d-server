import {
  sendStartSignal,
  sendServerError,
  sendLobbyNotification,
  sendLobbyUpdate,
} from "./emitters";
import { Socket, DefaultEventsMap } from "socket.io";
import { workerLB } from "../../workers/WorkerLoadBalancer";
import { lobbyCache } from "../../utils/lobbyCache";

export default function attachListeners(
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  socket.on("lby_join", (gameID: number, user: string) => {
    console.log("in socket listener: ", gameID, lobbyCache);
    console.log("socket ID: ", socket.id);
    const lobby = lobbyCache[gameID];
    if (!lobby) {
      sendServerError("Lobby no longer exists!");
      return;
    }
    if (lobby.sockets.indexOf(socket.id) > -1) {
      console.log(`User ${socket.id} is already connected to room`);
      return;
    }
    if (lobby.playerCount < 3) {
      socket.join(`${gameID}`);
      socket.data.gameID = gameID;
      socket.data.user = user;
      lobby.playerCount++;
      lobby.sockets.push(socket.id);
      lobby.players.push(user);
      console.log(
        `User ${socket.id} connecting to lobby - ${gameID} - currently ${lobby.playerCount} users connected`
      );
      sendLobbyUpdate(lobby, gameID);
    } else sendServerError("Game lobby is full!");
  });

  socket.on("sv_start", (gameID: number) => {
    console.log("Sending client start message...");
    sendStartSignal();

    // assign a new game instance to a worker through our Worker Load Balancer
    workerLB.assignNewGame(gameID);
  });

  socket.on("disconnect", () => {
    const gameID = socket.data.gameID;
    const user = socket.data.user;

    if (!lobbyCache[gameID]) return;

    if (lobbyCache[gameID].host === user) {
      console.log(`lobby ${gameID} closed!`);
      workerLB.closeGame(gameID);
      delete lobbyCache[gameID];
      sendLobbyUpdate(null, gameID);
      return;
    }
    console.log(lobbyCache[gameID]);
    sendLobbyNotification("User disconnected!", gameID);
    lobbyCache[gameID].playerCount--;
    lobbyCache[gameID].players = lobbyCache[gameID].players.filter(
      (currUser) => currUser !== user
    );
    lobbyCache[gameID].sockets = lobbyCache[gameID].sockets.filter(
      (currSocket) => currSocket !== socket.id
    );
    console.log(`User ${socket.id} disconnected from lobby - ${gameID}`);
    console.log(`updated cache: `, lobbyCache);
    sendLobbyUpdate(lobbyCache[gameID], gameID);
  });
}
