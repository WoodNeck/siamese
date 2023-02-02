import { MessageEmbed } from "discord.js";
import * as Scry from "scryfall-sdk";

import * as EMOJI from "~/const/emoji";
import * as COLOR from "~/const/color";
import { MTG } from "~/const/command/game";
import { toEmoji } from "~/util/helper";

export const cardToEmbed = (card: Scry.Card) => {
  const embed = new MessageEmbed();
  const desc = card.printed_text ?? card.oracle_text;

  embed.setTitle(card.printed_name ?? card.name);
  if (desc) {
    embed.setDescription(parseEmoji(desc));
  }

  if (card.image_uris) {
    embed.setImage(card.image_uris.large);
  }
  embed.setFooter({
    text: card.printed_name ?? card.name
  });
  embed.setColor(COLOR.BOT);

  if (card.mana_cost) {
    embed.addField(MTG.CARD.FIELD.COST, parseEmoji(card.mana_cost), true);
  }

  const type = card.printed_type_line ?? card.type_line;
  if (type) {
    embed.addField(MTG.CARD.FIELD.TYPE, type, true);
  }
  embed.addField(MTG.CARD.FIELD.SET, card.set_name, true);

  return embed;
};

export const cardToQuizEmbed = (card: Scry.Card) => {
  const embed = new MessageEmbed();

  const name = card.printed_name ?? card.name;
  const desc = card.printed_text ?? card.oracle_text;

  if (desc) {
    embed.setDescription(parseEmoji(desc).replaceAll(name, EMOJI.QUESTION_MARK.repeat(3)));
  }

  embed.setFooter({
    text: MTG.QUIZ.FOOTER
  });
  embed.setColor(COLOR.BOT);

  if (card.mana_cost) {
    embed.addField(MTG.CARD.FIELD.COST, parseEmoji(card.mana_cost), true);
  }

  const type = card.printed_type_line ?? card.type_line;
  if (type) {
    embed.addField(MTG.CARD.FIELD.TYPE, type, true);
  }
  embed.addField(MTG.CARD.FIELD.SET, card.set_name, true);

  return embed;
};

export const parseEmoji = (text: string): string => {
  return text.replace(/{(\w+)}/g, (orig, str) => {
    const emoji = MTG.EMOJI[str];
    if (emoji) {
      return toEmoji(emoji.name, emoji.id);
    } else {
      return orig;
    }
  });
};

export const blurCardName = (name: string) => name
  .replaceAll(" ", "")
  .replaceAll("-", "");
