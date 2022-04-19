import FFXIV from "./ffxiv";
import HEARTHSTONE from "./hearthstone";

import Category from "~/core/Category";
import { GAME } from "~/const/category";

const category = new Category(GAME);

category.add(
  FFXIV,
  HEARTHSTONE
);

export default category;

