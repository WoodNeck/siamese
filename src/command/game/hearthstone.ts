import { SlashCommandBuilder } from "@discordjs/builders";

import Card from "./hearthstone/card";

import Siamese from "~/Siamese";
import Command from "~/core/Command";
import { HEARTHSTONE } from "~/const/command/game";

export default new Command({
  name: HEARTHSTONE.CMD,
  alias: HEARTHSTONE.ALIAS,
  subcommands: [
    Card
  ],
  beforeRegister: (bot: Siamese) => bot.env.NAVER_ID != null && bot.env.NAVER_SECRET != null,
  slashData: new SlashCommandBuilder()
    .setName(HEARTHSTONE.CMD)
    .setDescription(HEARTHSTONE.DESC)
});
