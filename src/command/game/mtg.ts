import { SlashCommandBuilder } from "@discordjs/builders";

import Card from "./mtg/card";

import Command from "~/core/Command";
import { MTG } from "~/const/command/game";

export default new Command({
  name: MTG.CMD,
  alias: MTG.ALIAS,
  subcommands: [
    Card
  ],
  slashData: new SlashCommandBuilder()
    .setName(MTG.CMD)
    .setDescription(MTG.DESC)
});
