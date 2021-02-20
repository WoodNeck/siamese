import TTS from "./tts";

import Category from "~/core/Category";
import * as EMOJI from "~/const/emoji";
import { SOUND } from "~/const/category";

const category = new Category({
  name: SOUND.NAME,
  description: SOUND.DESC,
  categoryEmoji: EMOJI.MUSIC_NOTES
});

category.add(
  TTS
);

export default category;

