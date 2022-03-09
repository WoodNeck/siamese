import Random from "./random";
import Discharge from "./discharge";

import Category from "~/core/Category";
import { HISTORY } from "~/const/category";

const category = new Category(HISTORY);

category.add(
  Random,
  Discharge
);

export default category;

