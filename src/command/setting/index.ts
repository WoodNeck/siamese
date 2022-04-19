import RoleRestrict from "./role-restrict";

import Category from "~/core/Category";
import { SETTING } from "~/const/category";

const category = new Category(SETTING);

category.add(
  RoleRestrict
);

export default category;
