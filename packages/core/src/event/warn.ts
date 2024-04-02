import { EmbedBuilder } from "@siamese/embed";
import { EMOJI } from "@siamese/emoji";

import type Bot from "../Bot";

const onWarn = async (bot: Bot, info: string) => {
  const msg = new EmbedBuilder({
    title: `${EMOJI.WARNING} WARNING`,
    description: info
  });

  await bot.logger.warn(msg);
};

export default onWarn;
