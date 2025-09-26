import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { lobbyCache } from "../utils/lobbyCache";

export const getLobbies = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(Object.values(lobbyCache));
  } catch (err) {
    next(createError(500, "Internal server error, try again"));
  }
};

export const getLobby = (req: Request, res: Response, next: NextFunction) => {
  try {
    const lobby = lobbyCache[req.params.id];
    if (!lobby) throw createError(404, "Lobby no longer exists!!!");
    if (lobby.playerCount >= 2) throw createError(403, "Lobby is full!!!");

    res.json(lobby);
  } catch (err) {
    if (err instanceof Error) next(err);
    next(createError(500, "Internal server error, try again"));
  }
};

export const createLobby = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Sanatize user input here, throw error if need be
    const lobbyData = req.body;
    lobbyCache[lobbyData.gameID] = lobbyData;
    res.json(lobbyData);
  } catch (err) {
    next(createError(500, "Internal server error, try again"));
  }
};
