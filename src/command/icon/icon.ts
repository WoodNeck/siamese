import { MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import Add from "./subcommands/add";
import Remove from "./subcommands/remove";
import List from "./subcommands/list";
import Role from "./subcommands/role";

import Command from "~/core/Command";
import { ICON } from "~/const/command/icon";
import * as COLOR from "~/const/color";
import * as PERMISSION from "~/const/permission";

export default new Command({
  name: ICON.CMD,
  description: ICON.DESC,
  permissions: [PERMISSION.EMBED_LINKS],
  subcommands: [
    Add, List, Remove, Role
  ],
  slashData: new SlashCommandBuilder()
    .setName(ICON.CMD)
    .setDescription(ICON.SLASH_DESC)
    .addSubcommand(subCmd => subCmd
      .setName(ICON.MANAGE)
      .setDescription(ICON.DESC)
    ) as SlashCommandBuilder,
  execute: async ctx => {
    const { bot, guild } = ctx;

    const link = `${bot.env.WEB_URL_BASE}/#/icon/${guild.id}`;

    const embed = new MessageEmbed()
      .setDescription(`[${ICON.TITLE(guild.name)}](${link})`)
      .setColor(COLOR.BOT);

    await bot.send(ctx, { embeds: [embed] });
  }
});
