import { MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import CommandContext from "~/core/CommandContext";
import Menu, { MENU_END_REASON } from "~/core/Menu";
import { strong, block } from "~/util/markdown";
import { HELP } from "~/const/command/bot";
import * as COLOR from "~/const/color";
import * as EMOJI from "~/const/emoji";
import * as PERMISSION from "~/const/permission";

export default new Command({
  name: HELP.CMD,
  description: HELP.DESC,
  alias: HELP.ALIAS,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.ADD_REACTIONS,
    PERMISSION.READ_MESSAGE_HISTORY,
    PERMISSION.MANAGE_MESSAGES
  ],
  cooldown: Cooldown.PER_CHANNEL(5),
  slashData: new SlashCommandBuilder()
    .setName(HELP.CMD)
    .setDescription(HELP.DESC),
  execute: async (ctx: CommandContext) => {
    const { bot } = ctx;
    const prefix = bot.prefix;

    const categories = bot.categories
      .map(category => {
        const embed = new MessageEmbed()
          .setDescription(`${category.categoryEmoji} ${strong(category.name)}\n${category.description}`)
          .setColor(COLOR.BOT);
        const commands = category.commands;
        commands
          .filter(command => command.devOnly || command)
          .forEach(cmd => {
            if (cmd.execute) {
              // Works whether space exist in prefix or not
              const commandTitle = strong(`${EMOJI.SMALL_BLUE_DIAMOND} ${cmd.name}`);
              const commandUsage = [EMOJI.ARROW_SHADED_RIGHT, `${prefix}${cmd.name}`, cmd.usage].filter(str => str).join(" ");
              embed.addField(commandTitle, `${commandUsage}\n${block(cmd.description || "")}`);
            }
            if (cmd.subcommands) {
              cmd.subcommands.forEach(subcmd => {
                const commandTitle = strong(`${EMOJI.SMALL_BLUE_DIAMOND} ${cmd.name} ${subcmd.name}`);
                const commandUsage = [EMOJI.ARROW_SHADED_RIGHT, `${prefix}${cmd.name} ${subcmd.name}`, subcmd.usage].filter(str => str).join(" ");
                embed.addField(commandTitle, `${commandUsage}\n${block(subcmd.description || "")}`);
              });
            }
          });

        return embed;
      });

    const menu = new Menu(ctx, { ephemeral: true });
    menu.addReactionCallback({ id: "LINK", style: "LINK", text: "웹에서 보기", url: HELP.WEB_CATEGORY_INVITE_LINK }, () => MENU_END_REASON.CONTINUE);
    menu.addReactionCallback({ id: "LINK", style: "LINK", text: "개인정보 처리방침", url: HELP.WEB_PRIVACY_LINK }, () => MENU_END_REASON.CONTINUE);
    menu.setPages(categories);

    await menu.start();
  }
});
