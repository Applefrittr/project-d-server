import app from "./app";
import http from "http";
import { Server } from "socket.io";
const debug = require("debug")("project-d-server:server");

const server = http.createServer(app);

// mount socket.io to http server
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  },
});

// Mount socket handlers on connection
io.on("connection", (socket) => {
  console.log("user is connected");

  // Launch Game

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(process.env.PORT || 6969);
server.on("listening", onListening);
server.on("error", (err) => {
  debug(err.message);
});

function onListening() {
  const addr = server.address();
  debug(
    `Listening on http://localhost:${
      typeof addr === "string" ? addr : addr?.port
    }`
  );
}
