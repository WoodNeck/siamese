import TTS from "./tts";
import Out from "./out";

import Category from "~/core/Category";
import { SOUND } from "~/const/category";

const category = new Category(SOUND);

category.add(
  TTS,
  Out
);

export default category;

