import Discord from "discord.js";
import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import * as Scry from "scryfall-sdk";

import { blurCardName, cardToQuizEmbed } from "./utils";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import * as PERMISSION from "~/const/permission";
import { MTG } from "~/const/command/game";

export default new Command({
  name: MTG.QUIZ.CMD,
  description: MTG.QUIZ.DESC,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.READ_MESSAGE_HISTORY,
    PERMISSION.MANAGE_MESSAGES
  ],
  cooldown: Cooldown.PER_USER(5),
  slashData: new SlashCommandSubcommandBuilder()
    .setName(MTG.QUIZ.CMD)
    .setDescription(MTG.QUIZ.DESC),
  execute: async ctx => {
    const { bot, channel } = ctx;

    let card: Scry.Card | null = null;

    while (!card) {
      card = await Scry.Cards.random();
      const desc = card.printed_text ?? card.oracle_text;
      if (!desc) card = null;
    }

    const embed = cardToQuizEmbed(card);

    await bot.send(ctx, { embeds: [ embed ]});

    const collector = channel.createMessageCollector({
      filter: (msg: Discord.Message) => msg.author.id === ctx.author.id,
      time: MTG.QUIZ.MAX_TIME * 1000
    });

    collector.on("collect", () => {
      collector.stop();
    });

    const origName = card.printed_name ?? card.name;

    collector.on("end", async collected => {
      const msg = collected.first();
      const isCorrectAnswer = msg && blurCardName(msg.content) === blurCardName(origName);
      if (isCorrectAnswer) {
        await bot.send(ctx, { content: MTG.QUIZ.OK_TEXT });
      } else {
        await bot.send(ctx, { content: MTG.QUIZ.NO_TEXT(origName) });
      }
    });
  }
});
