import { COLOR } from "@siamese/color";
import { EmbedBuilder } from "@siamese/embed";
import { EMOJI } from "@siamese/emoji";
import { env } from "@siamese/env";
import { ActivityType } from "discord.js";

import { BOT } from "../const/message";

import type Bot from "../Bot";

const onReady = async (bot: Bot) => {
  const readyMsg = new EmbedBuilder({
    title: BOT.READY_TITLE(bot),
    description: BOT.READY_DESC(bot),
    thumbnail: bot.client.user.avatarURL(),
    color: COLOR.GOOD
  });

  await bot.logger.info(readyMsg);

  // 30분 주기로 봇의 활동을 업데이트
  setInterval(updateActivity.bind(void 0, bot), 1000 * 60 * 30);
  updateActivity(bot);
};

const updateActivity = (bot: Bot) => {
  const activity = `${env.BOT_DEFAULT_PREFIX}${env.BOT_HELP_CMD}${EMOJI.CAT.GRINNING}`;

  bot.client.user.setActivity({
    name: activity,
    type: ActivityType.Listening
  });
};

export default onReady;
