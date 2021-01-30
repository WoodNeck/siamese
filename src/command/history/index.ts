import Random from "./random";
import Discharge from "./discharge";

import Category from "~/core/Category";
import * as EMOJI from "~/const/emoji";
import { HISTORY } from "~/const/category";

const category = new Category({
  name: HISTORY.NAME,
  description: HISTORY.DESC,
  categoryEmoji: EMOJI.SCROLL
});

category.add(
  Random,
  Discharge
);

export default category;

