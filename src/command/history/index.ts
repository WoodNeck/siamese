import Random from "./random";

import Category from "~/core/Category";
import * as EMOJI from "~/const/emoji";
import { HISTORY } from "~/const/category";

const category = new Category({
  name: HISTORY.NAME,
  description: HISTORY.DESC,
  categoryEmoji: EMOJI.SMALL_WHITE_SQUARE
});

category.add(Random);

export default category;

