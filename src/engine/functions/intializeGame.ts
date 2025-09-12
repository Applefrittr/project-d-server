import Game from "../Game";

export default function intializeGame() {
  const game = new Game(Math.floor(Math.random() * 100000));
  game.initialize();

  game.loop(performance.now());

  return game;
}
