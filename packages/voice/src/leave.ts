import { COLOR } from "@siamese/color";
import { CommandContext } from "@siamese/core";
import { EmbedBuilder } from "@siamese/embed";

import { connections } from "./connections";
import { ERROR, MSG } from "./const";

import type { Channel } from "discord.js";

/**
 * 음성 채널에서 나가기 + 올바르게 나갔을 경우 메시지 전송
 */
export const leave = async ({ sender, ctx }: CommandContext) => {
  const prevVoiceChannel = await leaveVoiceChannel(ctx);
  if (!prevVoiceChannel) return;

  const disconnectEmbed = new EmbedBuilder({
    description: MSG.DISCONNECTED(prevVoiceChannel),
    color: COLOR.BOT
  });
  await sender.send(disconnectEmbed);
};

/**
 * 음성 채널 연결 해제
 * @returns `Channel` - 연결을 정상적으로 해제한 경우
 * @returns `null` - 연결하지 않았거나 하는 등의 이유로 연결을 해제하지 않은 경우
 */
export const leaveVoiceChannel = async ({ sender, getGuild }: CommandContext): Promise<Channel | null> => {
  const guild = getGuild();
  if (!guild) {
    await sender.replyError(ERROR.GUILD_ONLY);
    return null;
  }

  const prevConnection = connections.get(guild.id);
  if (!prevConnection) {
    await sender.replyError(ERROR.NOT_CONNECTED);
    return null;
  }

  const prevVoiceChannel = prevConnection.getVoiceChannel();
  prevConnection.destroy();

  return prevVoiceChannel;
};
