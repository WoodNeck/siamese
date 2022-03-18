import FFXIV from "./ffxiv";

import Category from "~/core/Category";
import { GAME } from "~/const/category";

const category = new Category(GAME);

category.add(
  FFXIV
);

export default category;

