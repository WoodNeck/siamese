import Help from "./help";
import Ping from "./ping";
import Invite from "./invite";
import Info from "./info";

import Category from "~/core/Category";
import { BOT } from "~/const/category";

const category = new Category(BOT);

category.add(
  Help, Ping, Invite, Info
);

export default category;
