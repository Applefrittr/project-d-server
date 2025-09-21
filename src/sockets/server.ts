import { Server } from "socket.io";
import http from "http";
import attachListeners from "./handlers/listeners";

export const io = new Server();

export function mountSockets(server: http.Server) {
  io.attach(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    attachListeners(socket);
  });
}
