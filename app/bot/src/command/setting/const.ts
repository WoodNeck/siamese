import { RoleUsage, type Bot, type CommandOptions } from "@siamese/core";
import { Role } from "discord.js";
import Josa from "josa-js";

import { CATEGORY } from "../../const/category";

export const ROLE_RESTRICT = {
  CMD: "역할제한",
  DESC: "봇을 사용할 수 있는 역할을 제한한다냥!",
  CATEGORY: CATEGORY.SETTING,
  ADD: {
    CMD: "추가",
    DESC: "봇을 사용할 수 있는 역할을 추가한다냥!",
    CATEGORY: CATEGORY.SETTING,
    USAGE: [
      new RoleUsage({
        name: "역할",
        description: "봇을 사용할 수 있는 역할로 추가할 역할을 지정해달라냥!"
      })
    ] as const,
    ALIASES: ["추가해줘"],
    ADDED: (bot: Bot, role: Role) => `${bot.client.user.toString()}${Josa.c(bot.client.user.displayName, "을/를")} 사용할 수 있는 역할에 ${role}를 추가했다냥!`
  } satisfies CommandOptions,
  LIST: {
    CMD: "목록",
    DESC: "현재 봇을 사용할 수 있는 역할들을 표시한다냥!",
    CATEGORY: CATEGORY.SETTING,
    CAN_BE_USED_FOR_EVERYONE: (bot: Bot) => `이 서버에서는 누구나 ${bot.client.user.toString()}를 사용할 수 있다냥!`,
    ACTIVE_ROLES: (roles: Role[]) => `현재 활성화된 역할들이다냥! - ${roles.map(role => role.toString()).join(", ")}`
  } satisfies CommandOptions,
  REMOVE: {
    CMD: "삭제",
    DESC: "봇을 사용할 수 있는 역할들 중에서 해당 역할을 제거한다냥!",
    CATEGORY: CATEGORY.SETTING,
    USAGE: [
      new RoleUsage({
        name: "역할",
        description: "봇을 사용할 수 있는 역할에서 뺄 역할을 지정해달라냥!"
      })
    ] as const,
    ALIASES: ["삭제해줘", "제거", "제거해줘"],
    REMOVED: (bot: Bot, role: Role) => `${bot.client.user.toString()}${Josa.c(bot.client.user.displayName, "을/를")} 사용할 수 있는 역할에서 ${role}를 제거했다냥!`,
    NOT_ACTIVE_ROLE: (bot: Bot, role: Role) => `${role}은 ${bot.client.user.toString()}${Josa.c(bot.client.user.displayName, "을/를")} 사용할 수 있는 역할이 아니다냥!`
  } satisfies CommandOptions,
  ERROR: {
    MENTION_ROLE: "역할을 @멘션해서 달라냥!",
    GUILD_NOT_FOUND: "서버 정보를 확인할 수 없다냥!",
    NO_ROLES_TO_REMOVE: "이 서버에서는 누구나 명령어를 사용할 수 있다냥!"
  }
} satisfies CommandOptions;
