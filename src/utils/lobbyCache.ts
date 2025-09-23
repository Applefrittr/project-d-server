export type Lobby = {
  gameID: number;
  name: string;
  playerCount: number;
  players: string[];
  sockets: string[];
};

export const lobbyCache: { [id: string]: Lobby } = {};
