import { EmbedBuilder } from "@siamese/embed";
import { env } from "@siamese/env";
import { stripIndents } from "common-tags";
import { type Message } from "discord.js";

import { ERROR } from "../const/message";
import TextCommandContext from "../context/TextCommandContext";

import type Bot from "../Bot";

const onTTSMessage = async (bot: Bot, msg: Message) => {
  if (!msg.content.startsWith(env.BOT_TTS_PREFIX)) return;

  // prefix 다음에 빈 공간이 있을 경우 무시
  if (msg.content.charAt(env.BOT_TTS_PREFIX.length) === " ") return;

  const cmd = bot.commands.get("TTS")!;
  const ctx = new TextCommandContext(bot, cmd, msg, env.BOT_TTS_PREFIX.length);

  try {
    await cmd.execute(ctx);
  } catch (err) {
    await handleError(ctx, err);
  }
};

const handleError = async (ctx: TextCommandContext, err: unknown) => {
  await ctx.sender.replyError(ERROR.CMD_FAILED)
    .catch(() => void 0);

  const msg = ctx.msg;
  const errorDesc = stripIndents`
    ${ERROR.CMD_FAIL_PLACE(msg)}
    ${ERROR.CMD_FAIL_TTS(msg.content)}
    ${ERROR.CMD_FAIL_DESC(err)}`;

  const errorEmbed = new EmbedBuilder({
    title: ERROR.CMD_FAIL_TITLE(err),
    description: errorDesc
  });

  await ctx.bot.logger.error(errorEmbed);
};

export default onTTSMessage;
