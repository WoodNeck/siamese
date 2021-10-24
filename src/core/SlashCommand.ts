import { SlashCommandBuilder } from "@discordjs/builders";

import SlashCommandContext from "~/core/SlashCommandContext";

interface SlashCommandOption {
  data: SlashCommandBuilder;
  execute: (ctx: SlashCommandContext) => Promise<void>;
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
