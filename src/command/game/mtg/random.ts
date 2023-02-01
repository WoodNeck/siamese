import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import * as Scry from "scryfall-sdk";

import { cardToEmbed } from "./utils";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import * as PERMISSION from "~/const/permission";
import { MTG } from "~/const/command/game";

export default new Command({
  name: MTG.RANDOM.CMD,
  description: MTG.RANDOM.DESC,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.READ_MESSAGE_HISTORY,
    PERMISSION.MANAGE_MESSAGES
  ],
  cooldown: Cooldown.PER_USER(5),
  slashData: new SlashCommandSubcommandBuilder()
    .setName(MTG.RANDOM.CMD)
    .setDescription(MTG.RANDOM.DESC),
  execute: async ctx => {
    const { bot } = ctx;

    const card = await Scry.Cards.random();
    const embed = cardToEmbed(card);

    await bot.send(ctx, { embeds: [ embed ]});
  }
});
