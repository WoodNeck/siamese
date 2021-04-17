import TTS from "./tts";
import In from "./in";
import Out from "./out";

import Category from "~/core/Category";
import { SOUND } from "~/const/category";

const category = new Category(SOUND);

category.add(
  TTS,
  In,
  Out
);

export default category;

