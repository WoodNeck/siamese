import Discord, { ButtonInteraction, CommandInteraction, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import * as COLOR from "~/const/color";
import * as EMOJI from "~/const/emoji";
import * as ERROR from "~/const/error";
import { YACHT } from "~/const/slashcommand/game";
import SlashCommand from "~/core/SlashCommand";

const yacht = new SlashCommandBuilder()
  .setName(YACHT.CMD)
  .setDescription(YACHT.DESC)
  .addUserOption(option => option
    .setName(YACHT.OPPONENT.NAME)
    .setDescription(YACHT.OPPONENT.DESC)
    .setRequired(false)
  ) as SlashCommandBuilder;

export default new SlashCommand({
  data: yacht,
  execute: async ({ bot, interaction }) => {
    // TODO: 게임이 이미 생성되었는지 여부 판별 + 게임 생성시에 캐시하기

    const mentionedUser = interaction.options.getUser(YACHT.OPPONENT.NAME);

    if (mentionedUser && mentionedUser.bot) {
      return await interaction.reply({ content: ERROR.CMD.MENTION_NO_BOT, ephemeral: true });
    }

    const author = interaction.member;
    const guild = interaction.guild;
    const opponentReceiveMessage = new MessageEmbed()
      .setAuthor(YACHT.MSGS.RECEIVE_TITLE(author), author.user.avatarURL() ?? author.user.defaultAvatarURL)
      .setColor(COLOR.BOT);

    if (mentionedUser) {
      const opponentAsGuildMember = await guild.members.fetch(mentionedUser);

      opponentReceiveMessage.setFooter(
        YACHT.MSGS.OPPONENT_RECEIVE_FOOTER(opponentAsGuildMember),
        mentionedUser.avatarURL() ?? mentionedUser.defaultAvatarURL
      );
    } else {
      opponentReceiveMessage.setFooter(YACHT.MSGS.EVERYONE_RECEIVE_FOOTER());
    }

    const acceptBtn = new MessageButton()
      .setLabel(YACHT.MSGS.JOIN)
      .setEmoji(EMOJI.GREEN_CHECK)
      .setCustomId(YACHT.ID.ACCEPT)
      .setStyle("SUCCESS");
    const declineBtn = new MessageButton()
      .setCustomId(YACHT.ID.DECLINE)
      .setEmoji(EMOJI.CROSS)
      .setStyle("SECONDARY");

    const receiveMsg = await interaction.reply({
      content: mentionedUser?.toString(),
      embeds: [opponentReceiveMessage],
      components: [new MessageActionRow().addComponents(acceptBtn, declineBtn)],
      fetchReply: true
    }) as Discord.Message;

    const listenAccept = receiveMsg.awaitMessageComponent({
      filter: btnInteraction => btnInteraction.customId === YACHT.ID.ACCEPT
        && !btnInteraction.user.bot
        && !btnInteraction.user.equals(author.user)
        && (!mentionedUser || btnInteraction.user.equals(mentionedUser)),
      time: YACHT.RECEIVE_DURATION_MINUTE * 60 * 1000
    }).then(async btnInteraction => {
      try {
        // TODO: 기존 메시지에 현재 게임 상태 지속 업데이트

        await startGame(interaction, btnInteraction as Discord.ButtonInteraction)
          .catch(err => {
            console.error(err);
          });
      } catch (err) {
        console.error(err);
        await bot.handleSlashError(interaction, err);
      }
    });

    const listenDecline = receiveMsg.awaitMessageComponent({
      filter: btnInteraction => btnInteraction.customId === YACHT.ID.DECLINE
        && (
          btnInteraction.user.equals(author.user)
          || (!!mentionedUser && btnInteraction.user.equals(mentionedUser))
        ),
      time: YACHT.RECEIVE_DURATION_MINUTE * 60 * 1000
    }).then(async btnInteraction => {
      const declinedBtn = new MessageButton()
        .setLabel(YACHT.MSGS.DECLINED(btnInteraction.user.equals(author.user)))
        .setCustomId(YACHT.ID.FAILED)
        .setDisabled(true)
        .setStyle("DANGER");

      await btnInteraction.update({
        components: [new MessageActionRow().addComponents(declinedBtn)]
      });
    }).catch(() => {
      // Errored by msg deletion, do nothing
    });

    await Promise.race([listenAccept, listenDecline]);
  }
});

const startGame = async (
  authorInteraction: CommandInteraction,
  opponentInteraction: ButtonInteraction
) => {
  // TODO: 게임 로직 구현

  await authorInteraction.followUp({ content: "시작한 사람만 볼 수 있어용", ephemeral: true })
    .catch(err => {
      console.error("author", err);
    });
  await opponentInteraction.followUp({ content: "상대방만 볼 수 있어용", ephemeral: true })
    .catch(err => {
      console.error("opponent", err);
    });
};
