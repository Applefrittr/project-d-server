import express from "express";
import {
  getLobbies,
  getLobby,
  createLobby,
} from "../controllers/indexControllers";

const router = express.Router();

router.get("/lobbies", getLobbies);

router.get("/lobbies/:id", getLobby);

router.post("/lobbies/create", createLobby);

export default router;
