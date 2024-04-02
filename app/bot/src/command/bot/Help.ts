import { COLOR } from "@siamese/color";
import { Command, CommandContext, Cooldown, DevOnly, Usage } from "@siamese/core";
import { EmbedBuilder } from "@siamese/embed";
import { EMOJI } from "@siamese/emoji";
import { env } from "@siamese/env";
import { block, strong } from "@siamese/markdown";
import { Menu } from "@siamese/menu";

import { CATEGORY } from "../../const/category";

import { HELP } from "./const";

class Help extends Command {
  public override define() {
    return {
      data: HELP,
      preconditions: [
        new Cooldown(5)
      ]
    };
  }

  public override async execute({ bot, ctx }: CommandContext) {
    const prefix = env.BOT_DEFAULT_PREFIX;
    const allCommands = Array.from(new Set(bot.commands.values()).values());

    const categories = Object.values(CATEGORY)
      .map(category => {
        const embed = new EmbedBuilder({
          description: `${category.EMOJI} ${strong(category.NAME)}\n${category.DESC}`,
          color: COLOR.BOT
        });

        const commands = allCommands.filter(cmd => {
          const inCategory = cmd.category.ID === category.ID;

          if (inCategory) {
            const isDevonly = cmd.preconditions.find(condition => condition === DevOnly);

            return !isDevonly;
          } else {
            return cmd.executable;
          }
        });

        commands.forEach(cmd => {
          const commandTitle = strong(`${EMOJI.SMALL_BLUE_DIAMOND} ${cmd.name}`);
          const commandUsage = [EMOJI.ARROW_SHADED_RIGHT, `${prefix}${cmd.name}`, formatUsage(cmd.usage)].filter(str => str).join(" ");
          embed.addField(commandTitle, `${commandUsage}\n${block(cmd.description || "")}`);

          if (cmd.subcommands) {
            cmd.subcommands.forEach(subcmd => {
              const commandTitle = strong(`${EMOJI.SMALL_BLUE_DIAMOND} ${cmd.name} ${subcmd.name}`);
              const commandUsage = [EMOJI.ARROW_SHADED_RIGHT, `${prefix}${cmd.name} ${subcmd.name}`, formatUsage(cmd.usage)].filter(str => str).join(" ");
              embed.addField(commandTitle, `${commandUsage}\n${block(subcmd.description || "")}`);
            });
          }
        });

        return embed;
      });

    const menu = new Menu({ ctx });
    menu.setEmbedPages(categories);

    await menu.start();
  }
}

const formatUsage = (usages: Usage[]) => {
  if (usages.length <= 0) return null;

  return usages.map(usage => {
    return usage.toString();
  }).join(" ");
};

export default Help;
