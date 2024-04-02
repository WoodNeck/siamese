import { COLOR } from "@siamese/color";
import { EmbedBuilder } from "@siamese/embed";
import { EMOJI } from "@siamese/emoji";
import { toEmoji } from "@siamese/util";
import * as Scry from "scryfall-sdk";

import { FIELD, MTG_EMOJI, QUIZ_FOOTER } from "./const";

export const cardToEmbed = (card: Scry.Card) => {
  const embed = new EmbedBuilder();
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
    embed.addField(FIELD.COST, parseEmoji(card.mana_cost), true);
  }

  const type = card.printed_type_line ?? card.type_line;
  if (type) {
    embed.addField(FIELD.TYPE, type, true);
  }
  embed.addField(FIELD.SET, card.set_name, true);

  return embed;
};

export const cardToQuizEmbed = (card: Scry.Card) => {

  const name = card.printed_name ?? card.name;
  const desc = card.printed_text ?? card.oracle_text;

  const embed = new EmbedBuilder({
    color: COLOR.BOT,
    footer: { text: QUIZ_FOOTER }
  });

  if (desc) {
    embed.setDescription(parseEmoji(desc).replaceAll(name, EMOJI.QUESTION_MARK.repeat(3)));
  }

  if (card.mana_cost) {
    embed.addField(FIELD.COST, parseEmoji(card.mana_cost), true);
  }

  const type = card.printed_type_line ?? card.type_line;
  if (type) {
    embed.addField(FIELD.TYPE, type, true);
  }
  embed.addField(FIELD.SET, card.set_name, true);

  return embed;
};

export const parseEmoji = (text: string): string => {
  return text.replace(/{(\w+)}/g, (orig, str) => {
    const emoji = MTG_EMOJI[str];
    if (emoji) {
      return toEmoji(emoji.name, emoji.id);
    } else {
      return orig;
    }
  });
};

export const blurCardName = (name: string) => name
  .toLowerCase()
  .replaceAll(" ", "")
  .replaceAll("-", "");
