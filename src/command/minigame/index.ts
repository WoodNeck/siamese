import Othello from "./othello";
import Yacht from "./yacht";
import Connect4 from "./connect4";
import TicTacToe from "./tictactoe";
import OneCard from "./onecard";

import Category from "~/core/Category";
import { MINIGAME } from "~/const/category";

const category = new Category(MINIGAME);

category.add(
  Othello,
  Yacht,
  Connect4,
  TicTacToe,
  OneCard
);

export default category;

