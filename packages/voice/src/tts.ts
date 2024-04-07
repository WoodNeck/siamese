
import { COLOR } from "@siamese/color";
import { TTSConfig } from "@siamese/db";
import { EmbedBuilder } from "@siamese/embed";
import axios, { AxiosError } from "axios";
import fs from "fs-extra";

import { connections } from "./connections";
import { ERROR, MSG, TTS } from "./const";
import { joinVoiceChannel } from "./join";
import { toTempMp3Path } from "./utils";

import type { CommandContext } from "@siamese/core";

export const tts = async ({ ctx, sender, getUser, getGuild }: CommandContext, text: string) => {
  const guild = getGuild();
  if (!guild) {
    await sender.replyError(ERROR.GUILD_ONLY);
    return null;
  }

  // 사용자가 접속하지 않았을 경우 실행하지 않음
  const user = getUser();
  const member = await guild.members.fetch(user);
  const voiceChannel = member.voice.channel;

  // 사용자가 음성 채널에 접속하지 않았음
  if (!voiceChannel) {
    await sender.replyError(ERROR.CONNECT_VOICE_FIRST);
    return null;
  }

  // 음성 채널에 접속하지 않았을 경우 먼저 채널에 접속
  if (!connections.has(guild.id)) {
    const connected = await joinVoiceChannel(ctx);
    if (!connected) return;
  }

  const connection = connections.get(guild.id);
  if (!connection) {
    await sender.replyError(MSG.UNKNOWN_CONNECTION_ERROR);
    return;
  }

  if (connection.getQueuedLength() >= TTS.MAX_QUEUE_LENGTH) {
    await sender.replyError(MSG.TOO_MANY_RESOURCES);
    return;
  }

  // TTS 음성 다운로드
  const id = await downloadTTSVoice(ctx, text);
  if (!id) return;

  connection.queueLocalMp3File(id, text);

  await connection.playAudio();
};

export const downloadTTSVoice = async ({ bot, getUser, sender }: CommandContext, text: string): Promise<string | null> => {
  const id = crypto.randomUUID();
  const {
    speaker,
    volume,
    speed,
    pitch,
    emotion,
    emotionStrength,
    alpha,
    endPitch
  } = await TTSConfig.findOrCreate(getUser().id);

  try {
    const response = await axios.post(TTS.ENDPOINT, {
      text,
      speaker,
      volume,
      speed,
      pitch,
      emotion,
      alpha,
      "emotion-strength": emotionStrength,
      "end-pitch": endPitch
    }, {
      headers: TTS.HEADER,
      responseType: "stream"
    }).catch(async (error: Error | AxiosError) => {
      if (axios.isAxiosError(error) && error.response) {
        error.response.data.setEncoding("utf8");

        const stream = error.response!.data;
        const chunks: string[] = [];

        for await (const chunk of stream) {
          chunks.push(chunk);
        }

        const response = JSON.parse(chunks.join("")) as {
          details: string;
          errorCode: string;
          message: string;
        };

        if (response.errorCode === "VS99") {
          // TTS 서버 오류
          await sender.replyError(ERROR.TTS_SERVER_ERROR);
        } else {
          // 사용자 설정 오류
          const errorEmbed = new EmbedBuilder({
            title: ERROR.TTS_WRONG_CONFIG_TITLE,
            description: response.message,
            footer: { text: response.details },
            color: COLOR.ERROR
          });

          await sender.reply(errorEmbed);
        }
      } else {
        // 아래 catch 구절로 전달
        throw error;
      }
    });

    if (!response) return null;

    const filePath = toTempMp3Path(id);
    const fileStream = fs.createWriteStream(filePath);
    response.data.pipe(fileStream);

    return new Promise<string>(resolve => {
      fileStream.on("finish", () => {
        resolve(id);
      });
    });
  } catch (err) {
    await sender.replyError(ERROR.FAILED_TO_DOWNLOAD_TTS);
    await bot.logger.error(err as Error);

    return null;
  }
};
