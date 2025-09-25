export type Lobby = {
  gameID: number;
  name: string;
  playerCount: number;
  players: string[];
  sockets: string[];
  host: string;
};

export const lobbyCache: { [id: string]: Lobby } = {};
