import { COLOR } from "@siamese/color";
import { EmbedBuilder } from "@siamese/embed";

import VoiceSession from "./VoiceSession";
import { connections } from "./connections";
import { ERROR, MSG } from "./const";

import type { CommandContext } from "@siamese/core";
import type { Channel } from "discord.js";

/**
 * 음성 채널에 접속 + 접속 성공 메시지 전송
 */
export const join = async ({ ctx, sender }: CommandContext) => {
  const voiceChannel = await joinVoiceChannel(ctx);
  if (!voiceChannel) return;

  const connectEmbed = new EmbedBuilder({
    description: MSG.CONNECTED(voiceChannel),
    color: COLOR.BOT
  });
  await sender.send(connectEmbed);
};

/**
 * 음성 채널에 접속
 * @returns `Channel` - 접속에 성공한 경우
 * @returns `null` - 접속에 실패한 경우
 */
export const joinVoiceChannel = async ({ bot, getGuild, getChannel, getUser, sender }: CommandContext): Promise<Channel | null> => {
  const guild = getGuild();
  if (!guild) {
    await sender.replyError(ERROR.GUILD_ONLY);
    return null;
  }

  const user = getUser();
  const member = await guild.members.fetch(user);
  const voiceChannel = member.voice.channel;

  // 사용자가 음성 채널에 접속하지 않았음
  if (!voiceChannel) {
    await sender.replyError(ERROR.CONNECT_VOICE_FIRST);
    return null;
  }

  // 이미 접속해있음
  const prevConnection = connections.get(guild.id);
  if (prevConnection && prevConnection.inVoiceChannel(voiceChannel.id)) {
    await sender.replyError(ERROR.ALREADY_CONNECTED);
    return null;
  }

  // 기존 연결 해제
  if (prevConnection) {
    prevConnection.destroy();
  }

  // 새로 연결
  const textChannel = await getChannel();
  if (!textChannel.isTextBased()) {
    await sender.replyError(ERROR.TEXT_BASED_ONLY);
    return null;
  }

  const connection = new VoiceSession(voiceChannel, textChannel, guild);

  try {
    await connection.waitForReady();

    return voiceChannel;
  } catch (err) {
    connection.destroy();
    await sender.replyError(MSG.CONNECT_FAILED);
    bot.logger.error(new Error(`음성 채널 접속 실패: ${err}`));

    return null;
  }
};
