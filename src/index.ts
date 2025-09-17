import app from "./app";
import http from "http";
import { mountSockets } from "./sockets/server";
import { intializeWorkers } from "./workers/intializeWorkers";
import { workerLB } from "./workers/WorkerLoadBalancer";
const debug = require("debug")("project-d-server:server");

// Create Express Server
const server = http.createServer(app);

// Mount Socket.io Server onto Express
mountSockets(server);

// Create worker pool based on system CPU cores and load them into the Worker Load Balancer
const workers = intializeWorkers();
workerLB.loadWorkers(workers);

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
