import { PermissionsBitField } from "discord.js";

export interface Permission {
  flag: bigint;
  message: string;
}

export const PERMISSION = {
  ADMINISTRATOR: {
    flag: PermissionsBitField.Flags.Administrator,
    message: "관리자"
  },
  CREATE_INSTANT_INVITE: {
    flag: PermissionsBitField.Flags.CreateInstantInvite,
    message: "초대 코드 만들기"
  },
  KICK_MEMBERS: {
    flag: PermissionsBitField.Flags.KickMembers,
    message: "멤버 추방하기"
  },
  BAN_MEMBERS: {
    flag: PermissionsBitField.Flags.BanMembers,
    message: "멤버 차단하기"
  },
  MANAGE_CHANNELS: {
    flag: PermissionsBitField.Flags.ManageChannels,
    message: "채널 관리하기"
  },
  MANAGE_GUILD: {
    flag: PermissionsBitField.Flags.ManageGuild,
    message: "서버 관리하기"
  },
  ADD_REACTIONS: {
    flag: PermissionsBitField.Flags.AddReactions,
    message: "반응 추가하기"
  },
  VIEW_AUDIT_LOG: {
    flag: PermissionsBitField.Flags.ViewAuditLog,
    message: "감사 로그 보기"
  },
  VIEW_CHANNEL: {
    flag: PermissionsBitField.Flags.ViewChannel,
    message: "채널 보기"
  },
  SEND_MESSAGES: {
    flag: PermissionsBitField.Flags.SendMessages,
    message: "메시지 보내기"
  },
  SEND_TTS_MESSAGES: {
    flag: PermissionsBitField.Flags.SendTTSMessages,
    message: "텍스트 음성 변환 메시지 전송"
  },
  MANAGE_MESSAGES: {
    flag: PermissionsBitField.Flags.ManageMessages,
    message: "메시지 관리"
  },
  EMBED_LINKS: {
    flag: PermissionsBitField.Flags.EmbedLinks,
    message: "링크 첨부"
  },
  ATTACH_FILES: {
    flag: PermissionsBitField.Flags.AttachFiles,
    message: "파일 첨부"
  },
  READ_MESSAGE_HISTORY: {
    flag: PermissionsBitField.Flags.ReadMessageHistory,
    message: "메시지 기록 보기"
  },
  MENTION_EVERYONE: {
    flag: PermissionsBitField.Flags.MentionEveryone,
    message: "@everyone, @here, 모든 역할 멘션하기"
  },
  USE_EXTERNAL_EMOJIS: {
    flag: PermissionsBitField.Flags.UseExternalEmojis,
    message: "외부 이모지 사용"
  },
  CONNECT: {
    flag: PermissionsBitField.Flags.Connect,
    message: "연결"
  },
  SPEAK: {
    flag: PermissionsBitField.Flags.Speak,
    message: "말하기"
  },
  MUTE_MEMBERS: {
    flag: PermissionsBitField.Flags.MuteMembers,
    message: "멤버들의 마이크 음소거하기"
  },
  DEAFEN_MEMBERS: {
    flag: PermissionsBitField.Flags.DeafenMembers,
    message: "멤버 헤드셋 음소거하기"
  },
  MOVE_MEMBERS: {
    flag: PermissionsBitField.Flags.MoveMembers,
    message: "멤버 이동"
  },
  USE_VAD: {
    flag: PermissionsBitField.Flags.UseVAD,
    message: "음성 감지 사용"
  },
  PRIORITY_SPEAKER: {
    flag: PermissionsBitField.Flags.PrioritySpeaker,
    message: "우선 발언권"
  },
  CHANGE_NICKNAME: {
    flag: PermissionsBitField.Flags.ChangeNickname,
    message: "별명 변경하기"
  },
  MANAGE_NICKNAMES: {
    flag: PermissionsBitField.Flags.ManageNicknames,
    message: "별명 관리하기"
  },
  MANAGE_ROLES: {
    flag: PermissionsBitField.Flags.ManageRoles,
    message: "역할 관리하기"
  },
  MANAGE_WEBHOOKS: {
    flag: PermissionsBitField.Flags.ManageWebhooks,
    message: "웹후크 관리하기"
  },
  MANAGE_GUILD_EXPRESSIONS: {
    flag: PermissionsBitField.Flags.ManageGuildExpressions,
    message: "표현 관리하기"
  },
  CREATE_PUBLIC_THREADS: {
    flag: PermissionsBitField.Flags.CreatePublicThreads,
    message: "공개 스레드 만들기"
  },
  CREATE_PRIVATE_THREADS: {
    flag: PermissionsBitField.Flags.CreatePrivateThreads,
    message: "비공개 스레드 만들기"
  },
  SEND_MESSAGES_IN_THREADS: {
    flag: PermissionsBitField.Flags.SendMessagesInThreads,
    message: "스레드에서 메시지 보내기"
  },
  MANAGE_THREADS: {
    flag: PermissionsBitField.Flags.ManageThreads,
    message: "스레드 관리하기"
  }
} satisfies Record<string, { flag: bigint, message: string }>;

export const DEFAULT_PERMISSIONS = [
  PERMISSION.VIEW_CHANNEL,
  PERMISSION.ADD_REACTIONS,
  PERMISSION.EMBED_LINKS,
  PERMISSION.MANAGE_MESSAGES,
  PERMISSION.SEND_MESSAGES,
  PERMISSION.SEND_MESSAGES_IN_THREADS
] as const;
