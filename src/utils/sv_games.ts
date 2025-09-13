import Game from "../engine/Game";

// Our in memory map of currently running game lobbies
export const sv_games: { [id: number]: Game } = {};
