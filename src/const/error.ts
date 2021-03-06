import type Discord from "discord.js";
import Josa from "josa-js";

import { strong, block } from "~/util/markdown";

export const BOT = {
  FAILED_TO_START: "❗ 봇 시작을 실패했다냥 ❗",
  FAILED_TO_INIT_DB: "데이터베이스 생성에 실패했다냥!"
};

export const ENV = {
  VAR_MISSING: (key: string) => `${key}가 bot.env파일에 없다냥!`,
  VAR_NO_EMPTY_STRING: "이 변수는 비어있지 않은 문자열을 줘야된다냥!"
};

export const CMD = {
  CATEGORY_LOAD_FAILED: (category: string) => `"${category}" 명령어 카테고리를 로드하는데 실패했다냥! ("index.js"가 폴더 안에 있는지 확인하라냥!)`,
  LOAD_FAILED: (cmd: string) => `"${cmd}" 명령어를 로드하는데 실패했다냥!`,
  SUB_LOAD_FAILED: (cmd: string, sub: string) => `"${cmd}/${sub}" 서브 명령어를 로드하는데 실패했다냥!`,
  FAILED: "명령어 실행에 실패했다냥!",
  PERMISSION_IS_MISSING: (bot: Discord.Client, permissions: string) => `명령어를 실행할 수 있는 권한이 없다냥! ${bot.user}에 아래 권한들이 있는지 확인해달라냥!${block(permissions)}`,
  USER_SHOULD_BE_ADMIN: "이 명령어는 관리자 권한이 있는 사용자만 쓸 수 있다냥!",
  FAIL_TITLE: (error: Error) => `${error.name}: ${error.message}`,
  FAIL_PLACE: (msg: Discord.Message) => `${msg.guild?.name}(${msg.guild?.id}):${(msg.channel as Discord.TextChannel).name}(${msg.channel.id})`,
  FAIL_CMD: (msg: Discord.Message) => `이 명령어를 실행중이었다냥: ${strong(msg.content)}`,
  FAIL_DESC: (error: Error) => `${error.stack ? error.stack : ""}`,
  ON_COOLDOWN: (seconds: string) => `명령어가 쿨다운중이다냥! ${seconds}초 더 기다리라냥!`,
  EMPTY_CONTENT: (target: string) => `${Josa.r(target, "을/를")} 달라냥!`,
  ONLY_IN_TEXT_CHANNEL: "명령어는 길드 채널에서만 사용할 수 있다냥!",
  NOT_FOUND: target => `${Josa.r(target, "을/를")} 찾을 수 없다냥!`,
  PERMISSION_FAILED: permission => `${permission} 권한이 없어 명령어를 실행할 수 없었다냥!`
};

export const API = {
  KEY_MISSING: "API 키가 정의되지 않았다냥!",
  TEST_EMPTY_RESULT: "API test case returned empty result"
};

export const SEARCH = {
  EMPTY_CONTENT: "검색할 내용을 달라냥!",
  EMPTY_RESULT: (target: string) => `그 검색어로는 ${target}${Josa.c(target, "을/를")} 하나도 찾을수가 없었다냥!`,
  FAILED: "데이터 취득에 실패했다냥!",
  USER_NOT_FOUND: "유저를 찾을 수 없었다냥!"
};

export const CONVERSATION = {
  NO_RESPONSE: (time: number) => `${time.toFixed(0)}초 안에 대답해달라냥!`
};

export const SOUND = {
  RECONNECTING: "음성채널에 다시 참가하고 있다냥...",
  JOIN_VOICE_CHANNEL_FAILED: "음성채널 참가에 실패했다냥! 연결 권한이 있는지 확인해달라냥!",
  JOIN_VOICE_CHANNEL_FIRST: "음성채널에 들어가 있어야만 사용할 수 있는 명령어다냥!",
  NO_VOICE_CHANNEL_IN: "들어가있는 음성 채널이 없다냥!",
  NO_PLAYERS_AVAILABLE: "이 서버에는 재생중인 음악이 없다냥!",
  NO_PERMISSION_GRANTED: "음성채널에 접속하기 위한 권한이 없다냥!",
  NO_SONGS_AVAILABLE: "곡이 하나도 없다냥!",
  VOICE_CHANNEL_IS_FULL: "음성채널에 들어갈 자리가 없다냥!",
  VOICE_CONNECTION_HAD_ERROR: "음성채널 연결중에 오류가 발생했다냥!",
  VOICE_CONNECTION_JOIN_FAILED: "음성채널 연결에 실패했다냥!",
  NOT_PLAYING: "재생하고 있는 곡이 없다냥!",
  FAILED_TO_PLAY: "재생에 실패했다냥!",
  CONNECTION_NOT_ESTABLISHED_YET: "아직 음성채널에 연결중이다냥! 조금만 기다려달라냥!"
};
