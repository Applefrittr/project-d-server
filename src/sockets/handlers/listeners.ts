import { sendStartSignal } from "./emitters";
import intializeGame from "../../engine/functions/intializeGame";
import { sv_games } from "../../utils/sv_games";
import { Socket, DefaultEventsMap } from "socket.io";

export default function attachListeners(
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  socket.on("join_lobby", (id: number) => {
    console.log(`User connecting to lobby - ${id}`);
    socket.join(`${id}`);
    socket.data.gameID = id;
  });

  socket.on("sv_start", (id: number) => {
    console.log(`launching Game ${id}`);
    const nwGame = intializeGame(id);
    sv_games[id] = nwGame;
    console.log("Sending client start message...");
    sendStartSignal();
  });

  socket.on("disconnect", () => {
    const id = socket.data.gameID;
    console.log(`user disconnected from room - ${id} - closing game ${id}`);
    sv_games[id]?.close();
    delete sv_games[id];
  });
}
