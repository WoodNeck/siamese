import path from "path";

import { env } from "@siamese/env";

import type { Channel } from "discord.js";

export const TEMP_DIR_PATH = path.resolve(import.meta.dirname, "../../../temp");

export const ERROR = {
  GUILD_ONLY: "서버 안에서만 음성 채널에 접속할 수 있다냥!",
  TEXT_BASED_ONLY: "텍스트 기반 채널에서만 사용할 수 있다냥!",
  CONNECT_VOICE_FIRST: "먼저 음성 채널에 접속하라냥!",
  ALREADY_CONNECTED: "이미 음성 채널에 접속해있다냥!",
  NOT_CONNECTED: "음성 채널에 접속해있지 않다냥!",
  UNEXPECTED_DISCONNECT: "알 수 없는 이유로 음성 채널 연결이 종료되었다냥!",
  FAILED_TO_DOWNLOAD_TTS: "TTS 음성 다운로드에 실패했다냥!",
  TTS_WRONG_CONFIG_TITLE: "사용자 설정에 오류가 있다냥!",
  TTS_SERVER_ERROR: "TTS 서버에 오류가 발생했다냥!",
  FAILED_TO_PLAY_RESOURCE: "음성 리소스에 문제가 있어 재생할 수 없었다냥!",
  FAILED_TO_PLAY_RESOURCE_NAME: "재생하고자 했던 리소스"
};

export const MSG = {
  CONNECTED: (channel: Channel) => `${channel}에 접속했다냥!`,
  CONNECT_FAILED: "음성 채널 접속에 실패했다냥!",
  DISCONNECTED: (channel: Channel) => `${channel}에서 나갔다냥!`,
  UNKNOWN_CONNECTION_ERROR: "알 수 없는 이유로 접속에 실패했다냥!",
  TOO_MANY_RESOURCES: "서버에서 너무 많은 음성을 한번에 재생하려고 한다냥!\n이전 음성이 다 재생될때까지 기다려달라냥!"
};

export const TTS = {
  ENDPOINT: "https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts",
  HEADER: {
    "X-NCP-APIGW-API-KEY-ID": env.NAVER_AI_ID,
    "X-NCP-APIGW-API-KEY": env.NAVER_AI_SECRET,
    "Content-Type": "application/x-www-form-urlencoded"
  },
  MAX_QUEUE_LENGTH: 10
};
