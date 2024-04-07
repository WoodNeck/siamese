import { EMOJI } from "@siamese/emoji";
import { env } from "@siamese/env";
import { underline, strong, link, block } from "@siamese/markdown";
import { stripIndents } from "common-tags";
import { ChannelType, ChatInputCommandInteraction, type Message } from "discord.js";
import Josa from "josa-js";

import { type Permission } from "../const/permission";

import type Bot from "../Bot";
import type Command from "../Command";

export const BOT = {
  READY_TITLE: (bot: Bot) => stripIndents`
    ${bot.client.user.tag} 일할 준비 됐다냥!`,
  READY_DESC: (bot: Bot) => `- ${bot.client.guilds.cache.size.toString()}개의 서버에서 사용 중이다냥!`,
  GUILD_JOIN_TITLE: `${EMOJI.PAW} 안냥! 만나서 반갑다냥!`,
  GUILD_JOIN_DESC: (bot: Bot, helpCmd: string) => stripIndents`
    ${EMOJI.MIDDLE_DOT} ${underline(strong(helpCmd))}이라고 말하면 ${Josa.r(bot.client.user.username, "이/가")} 할 수 있는 일을 알 수 있다냥!
    ${EMOJI.MIDDLE_DOT} ${link("공식 홈페이지", env.WEB_URL_BASE)}에서 서버 전용 아이콘을 추가하거나, 명령어 설명을 볼 수 있다냥!
    ${env.BOT_DEV_SERVER_INVITE ? `${EMOJI.MIDDLE_DOT} 궁금한게 있다면 ${link("개발 서버", env.BOT_DEV_SERVER_INVITE)}에 물어보거나 피드백을 남겨달라냥!` : ""}`
} as const;

export const ERROR = {
  SLASH_ONLY_CMD: "이 명령어는 슬래시(/) 명령어로만 사용할 수 있다냥!",
  GUILD_ONLY_CMD: "이 명령어는 서버 안에서만 사용할 수 있다냥!",
  GUILD_TEXT_ONLY_CMD: "이 명령어는 서버의 텍스트 채널에서만 사용할 수 있다냥!",
  NSFW_ONLY_CMD: "이 명령어는 후방주의 채널에서만 사용할 수 있다냥!",
  USER_SHOULD_BE_ADMIN: "이 명령어는 관리자 권한이 있는 사용자만 쓸 수 있다냥!",
  NO_ACTIVE_ROLE: "명령어를 사용할 수 있는 역할이 배정되어 있지 않다냥!",
  CMD_ON_COOLDOWN: (seconds: string) => `명령어가 쿨다운중이다냥! ${seconds}초 더 기다리라냥!`,
  BOT_PERMISSIONS_MISSING: (bot: Bot, permissions: Permission[]) => stripIndents`
    봇을 사용하기 위한 최소한의 권한이 없다냥!
    ${bot.client.user}에 아래 권한들이 있는지 확인해달라냥!
    ${block(permissions.map(p => `- ${p.message}`).join("\n"))}
  `,
  CMD_PERMISSIONS_MISSING: (bot: Bot, permissions: Permission[]) => stripIndents`
    명령어를 실행할 수 있는 권한이 전부 배정되지 않았다냥!
    ${bot.client.user}에 아래 권한들이 있는지 확인해달라냥!
    ${block(permissions.map(p => `- ${p.message}`).join("\n"))}
  `,
  CMD_FAILED: `명령어 실행에 실패했다냥!\n똑같은 문제가 계속 발생한다면 ${link("개발서버", env.BOT_DEV_SERVER_INVITE)}에 와서 물어보라냥!`,
  CMD_FAIL_TITLE: (error: unknown) => error instanceof Error
    ? `${error.name}: ${error.message}`
    : `${error}`,
  CMD_FAIL_PLACE: (msg: Message) => {
    if (msg.inGuild()) {
      const guild = msg.guild;
      const channel = msg.channel;
      return `${guild.name}(${guild.id}):${channel.name}(${channel.id})`;
    } else {
      const channelType = ChannelType[msg.channel.type];

      return `${channelType}(${msg.channel.id})`;
    }
  },
  CMD_SLASH_FAIL_PLACE: (interaction: ChatInputCommandInteraction) => {
    if (interaction.inCachedGuild()) {
      const guild = interaction.guild;
      const channel = interaction.channel;

      if (channel) {
        return `${guild.name}(${guild.id}):${channel.name}(${channel.id})`;
      } else {
        return `${guild.name}(${guild.id})`;
      }
    } else {
      const channel = interaction.channel;

      if (channel) {
        const channelType = ChannelType[channel.type];

        return `${channelType}(${channel.id})`;
      } else {
        return "UNKNOWN";
      }
    }
  },
  CMD_FAIL_CMD: (content: string) => `이 명령어를 실행중이었다냥: ${strong(content)}`,
  CMD_FAIL_DESC: (error: unknown) => `${(error && (error as Error).stack) ? (error as Error).stack : ""}`,
  CMD_FAIL_TTS: (content: string) => `이 TTS 메시지를 재생하고 있었다냥: ${strong(content)}`
};

export const CMD = {
  PRE_REGISTER_FAILED: (cmd: Command) => `${EMOJI.WARNING} 명령어 "${cmd.name}"의 canRegister 판정에 실패해서 명령어를 등록하지 못했습니다.`
};
