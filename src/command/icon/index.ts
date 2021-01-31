import Icon from "./icon";

import Category from "~/core/Category";
import * as EMOJI from "~/const/emoji";
import { ICON } from "~/const/category";

const category = new Category({
  name: ICON.NAME,
  description: ICON.DESC,
  categoryEmoji: EMOJI.PICTURE
});

category.add(
  Icon
);

export default category;

