import Icon from "./icon";
import ShowIcon from "./show-icon";

import Category from "~/core/Category";
import { ICON } from "~/const/category";

const category = new Category(ICON);

category.add(
  Icon,
  ShowIcon
);

export default category;

