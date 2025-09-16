import { parentPort, workerData } from "worker_threads";
import intializeGame from "../engine/functions/intializeGame";

parentPort?.postMessage({ start: `Game ${workerData} started` });
parentPort?.postMessage(typeof workerData === "number");

const id = Number(workerData);

intializeGame(id);
