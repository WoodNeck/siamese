import TTS from "./tts";
import Out from "./out";

import Category from "~/core/Category";
import * as EMOJI from "~/const/emoji";
import { SOUND } from "~/const/category";

const category = new Category({
  name: SOUND.NAME,
  description: SOUND.DESC,
  categoryEmoji: EMOJI.MUSIC_NOTES
});

category.add(
  TTS,
  Out
);

export default category;

