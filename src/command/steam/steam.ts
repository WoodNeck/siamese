import { SlashCommandBuilder } from "@discordjs/builders";

import Library from "./subcommands/library";
import Profile from "./subcommands/profile";
import Random from "./subcommands/random";
import Players from "./subcommands/players";
import TopGames from "./subcommands/top";

import Siamese from "~/Siamese";
import Command from "~/core/Command";
import { STEAM } from "~/const/command/steam";

export default new Command({
  name: STEAM.CMD,
  beforeRegister: (bot: Siamese) => bot.env.STEAM_API_KEY != null,
  subcommands: [
    Library,
    Profile,
    Random,
    Players,
    TopGames
  ],
  slashData: new SlashCommandBuilder()
    .setName(STEAM.CMD)
    .setDescription(STEAM.DESC)
});
