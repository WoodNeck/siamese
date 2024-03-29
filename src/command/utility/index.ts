import Avatar from "./avatar";
import Dice from "./dice";
import Choose from "./choose";
import Say from "./say";
import Vote from "./vote";
import Translate from "./translate";
import Calculator from "./calculator";
import Spelling from "./spelling";

import Category from "~/core/Category";
import { UTILITY } from "~/const/category";

const category = new Category(UTILITY);

category.add(
  Avatar,
  Dice,
  Choose,
  Say,
  Vote,
  Translate,
  Calculator,
  Spelling
);

export default category;
