import app from "./app";
import http from "http";
import { mountSockets } from "./sockets/server";
const debug = require("debug")("project-d-server:server");

// Create Express Server
const server = http.createServer(app);

// Mount Socket.io Server onto Express
mountSockets(server);

// Listen :)
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
