import { EmbedBuilder } from "@siamese/embed";

import type Bot from "../Bot";
import type Command from "../Command";
import type { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";

const getInteractionCommand = (interaction: ChatInputCommandInteraction | AutocompleteInteraction, bot: Bot): Command | null => {
  const commands = bot.commands;

  if (!commands.has(interaction.commandName)) return null;

  let cmd = commands.get(interaction.commandName)!;

  if (cmd.subcommands) {
    const subCmd = interaction.options.getSubcommand(false);

    if (subCmd) {
      const subcommand = cmd.subcommands
        .find(subcmd => subcmd.name === subCmd || subcmd.aliases.includes(subCmd));

      if (subcommand) {
        cmd = subcommand;
      } else {
        const errorEmbed = new EmbedBuilder({
          title: `대응하는 서브커맨드를 찾지 못했습니다. ${cmd.name} - ${subCmd}`
        });
        bot.logger.error(errorEmbed);

        return null;
      }
    }
  }

  return cmd;
};

export default getInteractionCommand;
