import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { lobbyCache } from "../utils/lobbyCache";

export const getHome = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.send("Welcome to Express w/ Typescript!");
  } catch (err) {
    next(createError(500, "Internal server error, try again"));
  }
};

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
    if (!lobby)
      res
        .status(404)
        .json({ message: "Lobby no longer exists! - from the server" });
    res.json(lobby);
  } catch (err) {
    next(createError(500, "Internal server error, try again"));
  }
};

export const createLobby = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lobbyData = req.body;
    lobbyCache[lobbyData.gameID] = lobbyData;
    res.json(lobbyData);
  } catch (err) {
    next(createError(500, "Internal server error, try again"));
  }
};
