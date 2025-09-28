export type Lobby = {
  gameID: number;
  name: string;
  playerCount: number;
  players: { username: string; ready: boolean }[];
  sockets: string[];
  host: string;
  gameRunning: boolean;
};

export const lobbyCache: { [id: string]: Lobby } = {};
