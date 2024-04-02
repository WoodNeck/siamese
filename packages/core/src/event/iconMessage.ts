import { env } from "@siamese/env";
import { type Message } from "discord.js";

import type Bot from "../Bot";

const onIconMessage = async (bot: Bot, msg: Message) => {
  if (!msg.content.startsWith(env.BOT_ICON_PREFIX)) return;

  // return await checkImageCommand(bot, msg);
};

export default onIconMessage;
