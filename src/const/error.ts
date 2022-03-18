import type Discord from "discord.js";
import Josa from "josa-js";

import { strong, block, code, link } from "~/util/markdown";

export const BOT = {
  FAILED_TO_START: "❗ 봇 시작을 실패했다냥 ❗",
  FAILED_TO_INIT_DB: "데이터베이스 생성에 실패했다냥!"
};

export const ENV = {
  VAR_MISSING: (key: string) => `${key}가 bot.env파일에 없다냥!`,
  VAR_NO_EMPTY_STRING: "이 변수는 비어있지 않은 문자열을 줘야한다냥!",
  VAR_MUST_ENV: "이 변수는 development 혹은 production 값을 줘야한다냥!"
};

export const CMD = {
  CATEGORY_LOAD_FAILED: (category: string) => `"${category}" 명령어 카테고리를 로드하는데 실패했다냥! ("index.js"가 폴더 안에 있는지 확인하라냥!)`,
  LOAD_FAILED: (cmd: string) => `"${cmd}" 명령어를 로드하는데 실패했다냥!`,
  SUB_LOAD_FAILED: (cmd: string, sub: string) => `"${cmd}/${sub}" 서브 명령어를 로드하는데 실패했다냥!`,
  FAILED: (inviteLink?: string) => inviteLink
    ? `명령어 실행에 실패했다냥!\n똑같은 문제가 계속 발생한다면 ${link("개발서버", inviteLink)}에 와서 물어보라냥!`
    : "명령어 실행에 실패했다냥!",
  PERMISSION_IS_MISSING: (bot: Discord.Client, permissions: string) => `명령어를 실행할 수 있는 권한이 없다냥! ${bot.user}에 아래 권한들이 있는지 확인해달라냥!${block(permissions)}`,
  USER_SHOULD_BE_ADMIN: "이 명령어는 관리자 권한이 있는 사용자만 쓸 수 있다냥!",
  FAIL_TITLE: (error: Error) => `${error.name}: ${error.message}`,
  FAIL_PLACE: (channel: Discord.TextBasedChannel, guild: Discord.Guild | null) => `${guild?.name}(${guild?.id}):${(channel as Discord.TextChannel).name}(${channel.id})`,
  FAIL_CMD: (content: string) => `이 명령어를 실행중이었다냥: ${strong(content)}`,
  FAIL_DESC: (error: Error) => `${error.stack ? error.stack : ""}`,
  ON_COOLDOWN: (seconds: string) => `명령어가 쿨다운중이다냥! ${seconds}초 더 기다리라냥!`,
  EMPTY_CONTENT: (target: string) => `${Josa.r(target, "을/를")} 달라냥!`,
  ONLY_IN_TEXT_CHANNEL: "명령어는 길드 채널에서만 사용할 수 있다냥!",
  NOT_FOUND: target => `${Josa.r(target, "을/를")} 찾을 수 없다냥!`,
  PERMISSION_FAILED: permission => `${permission} 권한이 없어 명령어를 실행할 수 없었다냥!`,
  MENTION_NEEDED: `명령어 대상을 ${code("@멘션")}해서 사용하는 명령어다냥!`,
  MENTION_ONLY_ONE: "한 명의 유저만 멘션해달라냥!",
  MENTION_NO_BOT: "봇은 멘션할 수 없다냥!",
  ONLY_ACTIVE_ROLES: "봇을 사용할 수 있는 역할로 배정되지 않았다냥! 서버 관리자에게 문의해달라냥!"
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
  NO_RESPONSE: (time: number) => `제한시간이 지났다냥! ${time.toFixed(0)}초 안에 대답해달라냥!`
};

export const SOUND = {
  MESSAGE_TOO_LONG: "문장이 너무 길다냥! 500자 이하의 문장을 달라냥!",
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

export const ICON = {
  MISSING_PERMISSION: "아이콘 관리 권한이 없다냥!",
  NOT_FOUND: (name: string) => `이 이름을 가진 아이콘을 찾을 수가 없다냥! - "${name}"`
};
