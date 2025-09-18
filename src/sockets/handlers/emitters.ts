import { io } from "../server";
import { FormattedClientState } from "../../engine/functions/formatStateforClient";

export function broadCastState(state: FormattedClientState) {
  io.to(`${state.id}`).volatile.emit("update", state);
}

export function sendStartSignal() {
  io.emit("cl_start");
}
