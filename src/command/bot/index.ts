import Help from "./help";
import Ping from "./ping";
import Invite from "./invite";
import Info from "./info";

import Category from "~/core/Category";
import { BOT } from "~/const/category";
import * as EMOJI from "~/const/emoji";

const category = new Category({
  name: BOT.NAME,
  description: BOT.DESC,
  categoryEmoji: EMOJI.BOT
});

category.add(
  Help, Ping, Invite, Info
);

export default category;
