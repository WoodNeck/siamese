import Image from "./image";
import Youtube from "./youtube";
import Shopping from "./shopping";
import Kin from "./kin";
import Cheapest from "./cheapest";
import Search from "./search";
import Stock from "./stock";

import Category from "~/core/Category";
import { SEARCH } from "~/const/category";

const category = new Category(SEARCH);

category.add(
  Image,
  Youtube,
  Shopping,
  Kin,
  Cheapest,
  Search,
  Stock
);

export default category;
