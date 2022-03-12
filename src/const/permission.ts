import type { PermissionString } from "discord.js";

export interface Permission {
  flag: PermissionString;
  message: string;
}

export const ADMINISTRATOR: Permission = {
  flag: "ADMINISTRATOR",
  message: "관리자"
};
export const CREATE_INSTANT_INVITE: Permission = {
  flag: "CREATE_INSTANT_INVITE",
  message: "초대 코드 만들기"
};
export const KICK_MEMBERS: Permission = {
  flag: "KICK_MEMBERS",
  message: "멤버 추방"
};
export const BAN_MEMBERS: Permission = {
  flag: "BAN_MEMBERS",
  message: "멤버 차단"
};
export const MANAGE_CHANNELS: Permission = {
  flag: "MANAGE_CHANNELS",
  message: "채널 관리"
};
export const MANAGE_GUILD: Permission = {
  flag: "MANAGE_GUILD",
  message: "서버 관리"
};
export const ADD_REACTIONS: Permission = {
  flag: "ADD_REACTIONS",
  message: "반응 추가"
};
export const VIEW_AUDIT_LOG: Permission = {
  flag: "VIEW_AUDIT_LOG",
  message: "감사 로그 보기"
};
export const VIEW_CHANNEL: Permission = {
  flag: "VIEW_CHANNEL",
  message: "채팅 채널 읽기 및 음성 채널 보기"
};
export const SEND_MESSAGES: Permission = {
  flag: "SEND_MESSAGES",
  message: "메시지 보내기"
};
export const SEND_TTS_MESSAGES: Permission = {
  flag: "SEND_TTS_MESSAGES",
  message: "TTS 메시지 보내기"
};
export const MANAGE_MESSAGES: Permission = {
  flag: "MANAGE_MESSAGES",
  message: "메시지 관리"
};
export const EMBED_LINKS: Permission = {
  flag: "EMBED_LINKS",
  message: "링크 첨부"
};
export const ATTACH_FILES: Permission = {
  flag: "ATTACH_FILES",
  message: "파일 첨부"
};
export const READ_MESSAGE_HISTORY: Permission = {
  flag: "READ_MESSAGE_HISTORY",
  message: "메시지 기록 보기"
};
export const MENTION_EVERYONE: Permission = {
  flag: "MENTION_EVERYONE",
  message: "모두를 호출하기"
};
export const USE_EXTERNAL_EMOJIS: Permission = {
  flag: "USE_EXTERNAL_EMOJIS",
  message: "외부 스티커를 사용"
};
export const CONNECT: Permission = {
  flag: "CONNECT",
  message: "연결"
};
export const SPEAK: Permission = {
  flag: "SPEAK",
  message: "말하기"
};
export const MUTE_MEMBERS: Permission = {
  flag: "MUTE_MEMBERS",
  message: "멤버 마이크 끄기"
};
export const DEAFEN_MEMBERS: Permission = {
  flag: "DEAFEN_MEMBERS",
  message: "멤버 소리 끄기"
};
export const MOVE_MEMBERS: Permission = {
  flag: "MOVE_MEMBERS",
  message: "멤버 이동"
};
export const USE_VAD: Permission = {
  flag: "USE_VAD",
  message: "음성 감지 사용"
};
export const PRIORITY_SPEAKER: Permission = {
  flag: "PRIORITY_SPEAKER",
  message: "Priority Speaker"
};
export const CHANGE_NICKNAME: Permission = {
  flag: "CHANGE_NICKNAME",
  message: "별명 변경"
};
export const MANAGE_NICKNAMES: Permission = {
  flag: "MANAGE_NICKNAMES",
  message: "별명 관리"
};
export const MANAGE_ROLES: Permission = {
  flag: "MANAGE_ROLES",
  message: "역할 관리"
};
export const MANAGE_WEBHOOKS: Permission = {
  flag: "MANAGE_WEBHOOKS",
  message: "웹훅 관리"
};
export const MANAGE_EMOJIS: Permission = {
  flag: "MANAGE_EMOJIS_AND_STICKERS",
  message: "이모지 관리"
};
export const CREATE_PUBLIC_THREADS: Permission = {
  flag: "CREATE_PUBLIC_THREADS",
  message: "공개 스레드 만들기"
};
export const CREATE_PRIVATE_THREADS: Permission = {
  flag: "CREATE_PRIVATE_THREADS",
  message: "비공개 스레드 만들기"
};
export const SEND_MESSAGES_IN_THREADS: Permission = {
  flag: "SEND_MESSAGES_IN_THREADS",
  message: "스레드에서 메시지 보내기"
};
export const MANAGE_THREADS: Permission = {
  flag: "MANAGE_THREADS",
  message: "스레드 관리하기"
};
