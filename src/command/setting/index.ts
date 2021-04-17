import AutoOut from "./auto-out";

import Category from "~/core/Category";
import { SETTING } from "~/const/category";

const category = new Category(SETTING);

category.add(
  AutoOut
);

export default category;
