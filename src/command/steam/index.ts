import Steam from "./steam";

import Category from "~/core/Category";
import { STEAM } from "~/const/category";

const category = new Category(STEAM);

category.add(Steam);

export default category;

