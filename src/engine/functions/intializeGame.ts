import Game from "../Game";

export default function intializeGame() {
  const game = new Game();
  game.initialize();

  game.loop(performance.now());

  return game;
}
