import Othello from "./othello";

import Category from "~/core/Category";
import { GAME } from "~/const/category";

const category = new Category(GAME);

category.add(
  Othello
);

export default category;

