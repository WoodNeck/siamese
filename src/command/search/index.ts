import Image from "./image";
import Youtube from "./youtube";
import Shopping from "./shopping";
import Kin from "./kin";
import Cheapest from "./cheapest";
import Search from "./search";

import Category from "~/core/Category";
import { SEARCH } from "~/const/category";
import * as EMOJI from "~/const/emoji";

const category = new Category({
  name: SEARCH.NAME,
  description: SEARCH.DESC,
  categoryEmoji: EMOJI.WWW
});

category.add(
  Image,
  Youtube,
  Shopping,
  Kin,
  Cheapest,
  Search
);

export default category;
