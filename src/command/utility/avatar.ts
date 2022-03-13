import { Collection, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "~/core/Command";
import * as COLOR from "~/const/color";
import * as PERMISSION from "~/const/permission";
import * as ERROR from "~/const/error";
import { AVATAR } from "~/const/command/utility";

export default new Command({
  name: AVATAR.CMD,
  description: AVATAR.DESC,
  usage: AVATAR.USAGE,
  permissions: [PERMISSION.EMBED_LINKS],
  sendTyping: false,
  slashData: new SlashCommandBuilder()
    .setName(AVATAR.CMD)
    .setDescription(AVATAR.DESC)
    .addUserOption(option => option
      .setName(AVATAR.USAGE_OPTION)
      .setDescription(AVATAR.DESC_OPTION)
      .setRequired(true)
    ) as SlashCommandBuilder,
  execute: async ctx => {
    const { bot } = ctx;

    const users = ctx.isSlashCommand()
      ? new Collection([["mentioned", ctx.interaction.options.getUser(AVATAR.USAGE_OPTION, true)]])
      : ctx.msg.mentions.users;

    if (!users.size) {
      await bot.replyError(ctx, ERROR.CMD.MENTION_NEEDED);
      return;
    }
    if (users.size > 1) {
      await bot.replyError(ctx, ERROR.CMD.MENTION_ONLY_ONE);
      return;
    }

    const mentioned = users.first()!;

    const embed = new MessageEmbed()
      .setImage(mentioned.displayAvatarURL())
      .setFooter(mentioned.username, mentioned.displayAvatarURL())
      .setColor(COLOR.BOT);

    await bot.send(ctx, { embeds: [embed] });
  }
});
