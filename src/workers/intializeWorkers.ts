import os from "os";
import { Worker } from "worker_threads";
import { broadCastState } from "../sockets/handlers/emitters";
import { WorkerOutgoingMessage } from "./worker";

// Initialize a pool of workers at server start based on the number of system CPUs
export function intializeWorkers() {
  const workers: Worker[] = [];
  const cpuCount = os.cpus().length;

  for (let i = 0; i < cpuCount; i++) {
    const worker = new Worker("./dist/workers/worker.js", {
      workerData: { workerID: i },
    });

    // attach listeners on the main thread from that specific worker
    worker.on("message", (msg: WorkerOutgoingMessage) => {
      switch (msg.flag) {
        case "game_start":
          console.log(
            `Game ID ${msg.gameID} started on worker ${msg.workerID}`
          );
          break;
        case "game_update":
          if (msg.state) broadCastState(msg.state);
          break;
        case "game_end":
          console.log(
            `Game ID ${msg.gameID} closed on worker ${msg.workerID} - all users disconnected!`
          );
          break;
        default:
          console.log(
            `Unhandled message - '${msg.flag}' - from worker ${msg.workerID}`
          );
      }
    });
    workers.push(worker);
  }

  return workers;
}
