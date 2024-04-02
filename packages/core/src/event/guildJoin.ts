import { COLOR } from "@siamese/color";
import { EmbedBuilder } from "@siamese/embed";
import { env } from "@siamese/env";

import { BOT } from "../const/message";
import { PERMISSION } from "../const/permission";

import type Bot from "../Bot";
import type { Guild } from "discord.js";

const onGuildJoin = async (bot: Bot, guild: Guild) => {
  if (!guild.systemChannel) return;

  const permissions = guild.systemChannel.permissionsFor(bot.client.user);

  if (
    !permissions
    || !permissions.has(PERMISSION.VIEW_CHANNEL.flag)
    || !permissions.has(PERMISSION.SEND_MESSAGES.flag)
  ) return;

  const helpCmd = `${env.BOT_DEFAULT_PREFIX}${env.BOT_HELP_CMD}`;
  const msg = new EmbedBuilder({
    title: BOT.GUILD_JOIN_TITLE,
    description: BOT.GUILD_JOIN_DESC(bot, helpCmd),
    thumbnail: bot.client.user.avatarURL() || "",
    color: COLOR.BOT
  });

  await guild.systemChannel.send({ embeds: [msg.build()] })
    .catch(() => void 0);
};

export default onGuildJoin;
