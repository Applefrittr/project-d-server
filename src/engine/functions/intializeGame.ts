import Game from "../Game";

export default function intializeGame(id: number) {
  const game = new Game(id);
  game.initialize();

  game.loop(performance.now());

  return game;
}
