
import { EmbedBuilder } from "@siamese/embed";
import { stripIndents } from "common-tags";

import { ERROR } from "../const/message";
import AutocompleteContext from "../context/AutocompleteContext";
import getInteractionCommand from "../helper/getInteractionCommand";

import type Bot from "../Bot";
import type { Interaction } from "discord.js";

// 자동완성만 다룸
const onAutocomplete = async (bot: Bot, interaction: Interaction) => {
  if (!interaction.isAutocomplete()) return;

  const cmd = getInteractionCommand(interaction, bot);
  if (!cmd) return;

  const content = interaction.options.getFocused();
  const ctx = new AutocompleteContext(bot, cmd, content, interaction);
  try {
    await cmd.autocomplete(ctx);
  } catch (err) {
    await handleError(ctx, err);
  }
};

const handleError = async (ctx: AutocompleteContext, err: unknown) => {
  const interactionContent = ctx.interaction.options.data.map(option => option.value).join(" ");
  const errorDesc = stripIndents`
    ${ERROR.CMD_FAIL_CMD(interactionContent)}
    ${ERROR.CMD_FAIL_DESC(err)}`;

  const errorEmbed = new EmbedBuilder({
    title: ERROR.CMD_FAIL_TITLE(err),
    description: errorDesc
  });

  await ctx.bot.logger.error(errorEmbed);
};

export default onAutocomplete;
