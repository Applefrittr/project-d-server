import { Worker } from "worker_threads";
import { WorkerIncomingMessage } from "./worker";

type GameIDs = number[];

class WorkerLoadBalancer {
  workers: Map<Worker, GameIDs> = new Map();
  currPointer = 0;

  loadWorkers(workerArray: Worker[]) {
    for (const worker of workerArray) {
      this.workers.set(worker, []);
    }
  }

  assignNewGame(gameID: number) {
    const worker = this.roundRobin();
    this.workers.get(worker)?.push(gameID);

    const msg: WorkerIncomingMessage = { flag: "game_start", gameID: gameID };
    worker.postMessage(msg);
  }

  closeGame(gameID: number) {
    for (const [worker, games] of Array.from(this.workers.entries())) {
      if (games.indexOf(gameID) > -1) {
        const msg: WorkerIncomingMessage = {
          flag: "game_end",
          gameID: gameID,
        };

        worker.postMessage(msg);
        break;
      }
    }
  }

  roundRobin() {
    const allWorkers = Array.from(this.workers.keys());

    const currWorker = allWorkers[this.currPointer];
    this.currPointer = (this.currPointer + 1) % allWorkers.length;
    return currWorker;
  }
}

export const workerLB = new WorkerLoadBalancer();
