import { EmbedBuilder } from "@siamese/embed";

import type { BaseMessageOptions, MessageCreateOptions, User } from "discord.js";

export const toMessageOptions = (msg: string | EmbedBuilder): BaseMessageOptions => {
  if (msg instanceof EmbedBuilder) {
    return { embeds: [msg.build()] };
  } else {
    return { content: msg };
  }
};

export const isValidOptions = (options: BaseMessageOptions) => {
  return options.content !== ""
    || (options.embeds && options.embeds.length > 0)
    || (options.files && options.files.length > 0);
};

export const sendDM = async (user: User, options: MessageCreateOptions) => {
  try {
    await user.send(options);
  } catch (err) {
    throw new Error(`DM 전송 실패: ${err}`);
  }
};
