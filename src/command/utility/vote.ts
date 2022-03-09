import Discord, { ButtonInteraction, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import Conversation from "~/core/Conversation";
import { VOTE } from "~/const/command/utility";
import * as ERROR from "~/const/error";
import * as COLOR from "~/const/color";
import * as EMOJI from "~/const/emoji";
import * as PERMISSION from "~/const/permission";
import { isBetween } from "~/util/helper";

export default new Command({
  name: VOTE.CMD,
  description: VOTE.DESC,
  usage: VOTE.USAGE,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.ADD_REACTIONS,
    PERMISSION.READ_MESSAGE_HISTORY,
    PERMISSION.MANAGE_MESSAGES
  ],
  cooldown: Cooldown.PER_CHANNEL(5),
  slashData: new SlashCommandBuilder()
    .setName(VOTE.CMD)
    .setDescription(VOTE.DESC)
    .addStringOption(option => option
      .setName(VOTE.USAGE)
      .setDescription(VOTE.DESC_OPTION)
      .setRequired(true)
    ) as SlashCommandBuilder,
  execute: async ctx => {
    const { bot, author } = ctx;

    const content = ctx.isSlashCommand()
      ? ctx.interaction.options.getString(VOTE.USAGE, true)
      : ctx.content;

    if (!content) {
      await bot.replyError(ctx, ERROR.CMD.EMPTY_CONTENT(VOTE.TARGET));
      return;
    }

    // Start gathering detailed info
    const conversation = new Conversation(ctx);
    const optionsDialogue = new MessageEmbed()
      .setTitle(VOTE.OPTIONS_TITLE)
      .setDescription(VOTE.OPTIONS_DESC)
      .setColor(COLOR.BOT)
      .setFooter(VOTE.OPTIONS_FOOTER);
    conversation.add({
      content: optionsDialogue,
      // Should contain more than 1 comma, and should not empty
      checker: message => {
        const correctOptions = message.content.split(",")
          .map(option => option.trim())
          .filter(option => !!option);
        return isBetween(correctOptions.length, 2, 9);
      },
      errMsg: VOTE.ERROR.OPTIONS_BETWEEN_2_9
    });

    const durationDialogue = new MessageEmbed()
      .setTitle(VOTE.DURATION_TITLE)
      .setDescription(VOTE.DURATION_DESC)
      .setColor(COLOR.BOT)
      .setFooter(VOTE.DURATION_FOOTER);
    conversation.add({
      content: durationDialogue,
      // Should in between 1 and DURATION_MAX
      checker: message => /^([1-9]\d*|0)$/.test(message.content)
				&& isBetween(parseInt(message.content, 10), VOTE.DURATION_MIN, VOTE.DURATION_MAX),
      errMsg: VOTE.ERROR.DURATION_SHOULD_CLAMPED(VOTE.DURATION_MAX)
    });

    const result = await conversation.start(VOTE.CONVERSATION_TIME).catch(() => void 0);

    if (!result) return;

    const options = result[0]
      .split(",")
      .map(option => option.trim())
      .filter(option => option);

    const durationMinute = parseInt(result[1], 10);

    const voteCreated = new Date();
    const voteEmbed = new MessageEmbed()
      .setTitle(VOTE.TITLE(content))
      .setDescription(EMOJI.ZERO_WIDTH_SPACE)
      .setFooter(VOTE.FOOTER(author.displayName, durationMinute), author.user.avatarURL() || "")
      .setColor(COLOR.BOT)
      .setTimestamp(voteCreated);

    options.forEach((option, idx) => {
      voteEmbed.addField(`${idx + 1}${EMOJI.KEYCAP} ${option}`, EMOJI.ZERO_WIDTH_SPACE);
    });

    const buttons = options.map((option, idx) => new MessageButton()
      .setLabel(option)
      .setCustomId(idx.toString())
      .setEmoji(`${idx + 1}${EMOJI.KEYCAP}`)
      .setStyle("SECONDARY")
    );

    const row = new MessageActionRow()
      .addComponents(...buttons);

    const voteMsg = await bot.send(ctx, {
      content: VOTE.HELP_DESC,
      embeds: [voteEmbed],
      components: [row],
      fetchReply: true
    }) as Discord.Message;

    const reactionCollector = voteMsg.createMessageComponentCollector({
      filter: (interaction: ButtonInteraction) => !interaction.user.bot,
      time: durationMinute * 60 * 1000
    });

    reactionCollector.on("collect", (interaction: ButtonInteraction) => {
      void interaction.deferUpdate();
    });

    reactionCollector.on("end", async (collection) => {
      // Remove vote msg, could been deleted already
      if (!voteMsg.deleted) {
        await voteMsg.delete().catch(() => void 0);
      }

      const voteCollection = collection.reduce((collected: { [id: string]: ButtonInteraction }, interaction) => {
        const prevInteraction = collected[interaction.user.id];
        if (!prevInteraction || prevInteraction.createdTimestamp < interaction.createdTimestamp) {
          collected[interaction.user.id] = interaction as any;
        } else {
          collected[interaction.user.id] = interaction as any;
        }

        return collected;
      }, {});

      const voteCounts: {[key: number]: number} = options.reduce((counts, _, idx) => {
        counts[idx] = 0;
        return counts;
      }, {});
      Object.values(voteCollection).forEach(interaction => voteCounts[interaction.customId] += 1);

      const bestIndexes: number[] = [0];
      options.forEach((_, idx) => {
        if (idx === 0) return;

        const bestIndex = bestIndexes[0];

        if (voteCounts[idx] > voteCounts[bestIndex]) {
          bestIndexes.splice(0, bestIndexes.length);
          bestIndexes.push(idx);
        } else if (voteCounts[idx] === voteCounts[bestIndex]) {
          bestIndexes.push(idx);
        }
      });

      const voteResultEmbed = new MessageEmbed()
        .setTitle(VOTE.TITLE(content))
        .setDescription(EMOJI.ZERO_WIDTH_SPACE)
        .setColor(COLOR.BOT)
        .setFooter(VOTE.FOOTER(author.displayName, durationMinute), author.user.avatarURL() || "")
        .setTimestamp(voteCreated);

      options.forEach((option, idx) => {
        const emoji = bestIndexes.findIndex(val => val === idx) >= 0 ? EMOJI.CROWN : `${idx + 1}${EMOJI.KEYCAP}`;
        voteResultEmbed.addField(`${emoji} ${option} - ${VOTE.COUNT(voteCounts[idx])}`, EMOJI.ZERO_WIDTH_SPACE);
      });

      await bot.send(ctx, {
        content: bestIndexes.length > 1
          ? VOTE.RESULT_DESC_TIE(bestIndexes.map(idx => options[idx]), voteCounts[bestIndexes[0]])
          : VOTE.RESULT_DESC(options[bestIndexes[0]], voteCounts[bestIndexes[0]]),
        embeds: [voteResultEmbed]
      });
    });
  }
});
