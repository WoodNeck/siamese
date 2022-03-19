import Othello from "./othello";
import Yacht from "./yacht";

import Category from "~/core/Category";
import { MINIGAME } from "~/const/category";

const category = new Category(MINIGAME);

category.add(
  Othello,
  Yacht
);

export default category;

