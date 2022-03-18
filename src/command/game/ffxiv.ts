import { SlashCommandBuilder } from "@discordjs/builders";

import Item from "./ffxiv/item";

import Command from "~/core/Command";
import { FFXIV } from "~/const/command/game";

export default new Command({
  name: FFXIV.CMD,
  subcommands: [
    Item
  ],
  slashData: new SlashCommandBuilder()
    .setName(FFXIV.CMD)
    .setDescription(FFXIV.DESC)
});
