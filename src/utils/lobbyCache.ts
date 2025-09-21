export type Lobby = {
  gameID: number;
  name: string;
  playerCount: number;
  host: string;
};

export const lobbyCache: { [id: string]: Lobby } = {};
