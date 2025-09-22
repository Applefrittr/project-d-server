export type Lobby = {
  gameID: number;
  name: string;
  playerCount: number;
  host: string;
  sockets: string[];
};

export const lobbyCache: { [id: string]: Lobby } = {};
