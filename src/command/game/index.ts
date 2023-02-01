import FFXIV from "./ffxiv";
import HEARTHSTONE from "./hearthstone";
import MTG from "./mtg";

import Category from "~/core/Category";
import { GAME } from "~/const/category";

const category = new Category(GAME);

category.add(
  FFXIV,
  HEARTHSTONE,
  MTG
);

export default category;

