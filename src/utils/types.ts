export type User = {
  id: string;
  username: string;
  ready: boolean;
};

export type Lobby = {
  gameID: number;
  name: string;
  playerCount: number;
  players: User[];
  sockets: string[];
  host: string;
  gameRunning: boolean;
};
