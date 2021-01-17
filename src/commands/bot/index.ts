import Category from "~/core/Category";
import Help from "./help";
import Ping from "./ping";

import { BOT } from "~/const/category";
import * as EMOJI from "~/const/emoji";

const category = new Category({
  name: BOT.NAME,
  description: BOT.DESC,
  categoryEmoji: EMOJI.BOT,
  commandEmoji: EMOJI.WRENCH
});

category.add(Help, Ping);

export default category;
