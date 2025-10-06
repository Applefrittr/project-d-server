import { io } from "../server";
import { FormattedClientState } from "../../engine/functions/formatStateforClient";
import { type Lobby } from "../../utils/types";

export function broadCastState(state: FormattedClientState) {
  io.to(`${state.id}`).volatile.emit("update_game", state);
}

export function sendStartSignal() {
  io.emit("cl_start");
}

export function sendServerError(msg: string) {
  io.emit("sv_error", msg);
}

export function sendLobbyNotification(msg: string, id: number) {
  io.to(`${id}`).emit("lby_notification", msg);
}

export function sendLobbyUpdate(lobbyData: Lobby | null, id: number) {
  io.to(`${id}`).emit("lby_update", lobbyData);
}
