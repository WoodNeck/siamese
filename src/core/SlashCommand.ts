import { CommandInteraction, Guild, GuildMember } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import Siamese from "~/Siamese";

interface SlashCommandOption {
  data: SlashCommandBuilder;
  execute: (ctx: {
    bot: Siamese;
    interaction: CommandInteraction & {
      guildId: string;
      guild: Guild;
      member: GuildMember;
    };
  }) => Promise<void>;
}

class SlashCommand {
  public readonly data: SlashCommandBuilder;
  public readonly execute: SlashCommandOption["execute"];

  public constructor({
    data,
    execute
  }: SlashCommandOption) {
    this.data = data;
    this.execute = execute;
  }
}

export default SlashCommand;
