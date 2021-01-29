import Steam from "./steam";

import Category from "~/core/Category";
import * as EMOJI from "~/const/emoji";
import { STEAM } from "~/const/category";

const category = new Category({
  name: STEAM.NAME,
  description: STEAM.DESC,
  categoryEmoji: EMOJI.MONEY_WITH_WINGS
});

category.add(Steam);

export default category;

