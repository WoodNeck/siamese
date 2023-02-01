import { SlashCommandBuilder } from "@discordjs/builders";

import Card from "./mtg/card";
import Random from "./mtg/random";

import Command from "~/core/Command";
import { MTG } from "~/const/command/game";

export default new Command({
  name: MTG.CMD,
  alias: MTG.ALIAS,
  subcommands: [
    Card,
    Random
  ],
  slashData: new SlashCommandBuilder()
    .setName(MTG.CMD)
    .setDescription(MTG.DESC)
});
