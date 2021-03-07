import { MessageEmbed } from "discord.js";

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
  execute: async ({ bot, channel, guild }) => {
    const link = `${bot.env.WEB_URL_BASE}/siamese/#/icon/${guild.id}`;

    const embed = new MessageEmbed()
      .setDescription(`[${ICON.TITLE(guild)}](${link})`)
      .setColor(COLOR.BOT);

    await bot.send(channel, embed);
  }
});
