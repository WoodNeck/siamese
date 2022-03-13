import Othello from "./othello";
import Yacht from "./yacht";

import Category from "~/core/Category";
import { GAME } from "~/const/category";

const category = new Category(GAME);

category.add(
  Othello,
  Yacht
);

export default category;

