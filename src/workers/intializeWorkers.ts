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

    // attach listeners to the main thread from that specific worker
    worker.on("message", (msg: WorkerOutgoingMessage) => {
      if (msg.flag === "game_start")
        console.log(`Game ID ${msg.gameID} started on worker ${msg.workerID}`);
      else if (msg.flag === "game_update" && msg.state) {
        broadCastState(msg.state);
      } else if (msg.flag === "game_end")
        console.log(
          `Game ID ${msg.gameID} closed on worker ${msg.workerID} - users disconnected!`
        );
    });
    workers.push(worker);
  }

  return workers;
}
