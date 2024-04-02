import { ButtonBuilder } from "@siamese/button";
import { COLOR } from "@siamese/color";
import { Command, CommandContext, Cooldown, PERMISSION, SlashCommandContext } from "@siamese/core";
import { EmbedBuilder } from "@siamese/embed";
import { EMOJI } from "@siamese/emoji";
import { ModalBuilder } from "@siamese/modal";
import { InteractionSender, ModalSender } from "@siamese/sender";
import { randInt } from "@siamese/util";
import { ButtonInteraction, ButtonStyle } from "discord.js";

import { VOTE } from "./const";

class Vote extends Command {
  public override define() {
    return {
      data: VOTE,
      permissions: [
        PERMISSION.MANAGE_MESSAGES
      ],
      slashOnly: true,
      preconditions: [
        new Cooldown(30)
      ]
    };
  }

  public override async execute({ bot, ctx, getUser }: CommandContext) {
    const user = getUser();

    // Modal 빌드
    const modal = new ModalBuilder({ title: VOTE.MODAL.CREATION_TITLE });
    modal.addShortInput({
      label: VOTE.MODAL.TITLE,
      value: VOTE.MODAL.TITLE_DEFAULT(user),
      placeholder: VOTE.MODAL.TITLE_PLACEHOLDER
    });
    modal.addShortInput({
      label: VOTE.MODAL.DURATION,
      value: VOTE.MODAL.DURATION_DEFAULT,
      placeholder: VOTE.MODAL.DURATION_PLACEHOLDER,
      maxLength: 4
    });
    modal.addParagraphInput({
      label: VOTE.MODAL.OPTIONS,
      placeholder: VOTE.MODAL.OPTIONS_PLACEHOLDER
    });

    // Modal 전송
    const modalSender = new ModalSender(ctx as SlashCommandContext);
    const response = await modalSender.send(modal, {
      maxWaitTime: VOTE.CONVERSATION_TIME
    });

    if (!response) return;

    const { sender, values } = response;
    const [title, resDuration, resOptions] = values;

    if (!this._validateDuration(resDuration)) {
      await sender.replyError(VOTE.ERROR.DURATION_SHOULD_CLAMPED);
      return;
    } else if (!this._validateOptions(resOptions)) {
      await sender.replyError(VOTE.ERROR.OPTIONS_BETWEEN_2_9);
      return;
    }

    const duration = parseFloat(values[1]);
    const options = this._parseOptions(values[2]);

    const voteDesc = options.map((option, idx) => {
      return `${idx + 1}${EMOJI.KEYCAP} ${option}`;
    }).join("\n");
    const voteCreated = Date.now();

    const voteEmbed = new EmbedBuilder({
      title: VOTE.TITLE(title),
      description: voteDesc,
      color: COLOR.BOT,
      footer: { text: VOTE.FOOTER(user.displayName, duration), iconURL: user.displayAvatarURL() },
      timestamp: voteCreated
    });

    const buttonBuilder = new ButtonBuilder();

    options.forEach((option, idx) => {
      buttonBuilder.addButton({
        id: idx.toString(),
        label: option,
        emoji: `${idx + 1}${EMOJI.KEYCAP}`,
        style: ButtonStyle.Secondary
      });
    });

    // 랜덤 버튼
    buttonBuilder.addButton({
      label: VOTE.RANDOM_LABEL,
      id: VOTE.RANDOM_SYMBOL,
      emoji: EMOJI.DICE,
      style: ButtonStyle.Secondary
    });

    // 취소 버튼
    buttonBuilder.addButton({
      label: VOTE.STOP_LABEL,
      id: VOTE.STOP_SYMBOL,
      emoji: EMOJI.WARNING,
      style: ButtonStyle.Danger
    });

    const voteMsg = await sender.sendObject({
      content: VOTE.HELP_DESC,
      embeds: [voteEmbed.build()],
      components: buttonBuilder.build()
    });

    const { collected } = await voteMsg.watchBtnClick({
      filter: interaction => !interaction.user.bot,
      maxWaitTime: duration * 60,
      onCollect: async ({ interaction, collector }) => {
        try {
          const reactionSender = new InteractionSender(interaction, true);

          if (interaction.customId === VOTE.STOP_SYMBOL) {
            if (interaction.user.id === user.id) {
              collector.stop();
            } else {
              await reactionSender.replyError(VOTE.ERROR.ONLY_AUTHOR_CAN_STOP);
            }
          } else if (interaction.customId === VOTE.RANDOM_SYMBOL) {
            const voteIdx = randInt(options.length - 1);
            interaction.customId = voteIdx.toString();
            await reactionSender.reply(VOTE.VOTE_MSG(voteIdx));
          } else {
            await reactionSender.reply(VOTE.VOTE_MSG(parseFloat(interaction.customId)));
          }
        } catch (err) {
          bot.logger.error(new Error(`투표 리액션 반응 중에 오류 발생: ${err}`));
        }
      }
    });

    // 투표 메시지를 삭제합니다.
    // 이미 삭제되었을 가능성도 있습니다.
    await voteMsg.delete().catch(() => void 0);

    const voteCollection = collected.reduce((votes: { [id: string]: ButtonInteraction }, interaction) => {
      if (interaction.customId === VOTE.STOP_SYMBOL) return votes;

      const prevInteraction = votes[interaction.user.id];
      if (!prevInteraction || prevInteraction.createdTimestamp < interaction.createdTimestamp) {
        votes[interaction.user.id] = interaction;
      } else {
        votes[interaction.user.id] = interaction;
      }

      return votes;
    }, {});

    const voteCounts = options.reduce((counts, _, idx) => {
      counts[idx] = 0;
      return counts;
    }, {} as Record<string, number>);

    Object.values(voteCollection).forEach(interaction => {
      voteCounts[interaction.customId] += 1;
    });

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

    const voteResultEmbed = new EmbedBuilder({
      title: VOTE.TITLE(title),
      description: EMOJI.ZERO_WIDTH_SPACE,
      color: COLOR.BOT,
      footer: { text: VOTE.FOOTER(user.displayName, duration), iconURL: user.displayAvatarURL() },
      timestamp: voteCreated
    });

    options.forEach((option, idx) => {
      const emoji = bestIndexes.findIndex(val => val === idx) >= 0 ? EMOJI.CROWN : `${idx + 1}${EMOJI.KEYCAP}`;
      voteResultEmbed.addField(`${emoji} ${option} - ${VOTE.COUNT(voteCounts[idx])}`, EMOJI.ZERO_WIDTH_SPACE);
    });

    await sender.sendObject({
      content: bestIndexes.length > 1
        ? VOTE.RESULT_DESC_TIE(bestIndexes.map(idx => options[idx]), voteCounts[bestIndexes[0]])
        : VOTE.RESULT_DESC(options[bestIndexes[0]], voteCounts[bestIndexes[0]]),
      embeds: [voteResultEmbed.build()]
    });
  }

  private _validateDuration(durationStr: string) {
    const duration = parseFloat(durationStr);

    if (isNaN(duration)) return false;
    if (Math.floor(duration) !== duration) return false;
    if (duration < VOTE.DURATION_MIN || duration > VOTE.DURATION_MAX) return false;

    return true;
  }

  private _validateOptions(optionsStr: string) {
    const options = this._parseOptions(optionsStr);

    return options.length >= 2 && options.length <= 9;
  }

  private _parseOptions(optionsStr: string) {
    return optionsStr
      .split(/\n+/)
      .map(option => option.trim())
      .filter(option => !!option);
  }
}

export default Vote;
