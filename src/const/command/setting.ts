import { Guild, Role } from "discord.js";
import Josa from "josa-js";

import Siamese from "~/Siamese";
import { roleMention } from "~/util/helper";

export const ROLE_RESTRICT = {
  CMD: "역할제한",
  DESC: "봇을 사용할 수 있는 역할을 제한한다냥!",
  ADD: {
    CMD: "추가해줘",
    DESC: "봇을 사용할 수 있는 역할을 추가한다냥!",
    USAGE: "@역할명1 @역할명2 @역할명3",
    ALIAS: ["추가"],
    ADDED: (bot: Siamese, guild: Guild, roles: Role[]) => `${bot.user.toString()}${Josa.c(bot.getDisplayName(guild), "을/를")} 사용할 수 있는 역할에 ${roles.map(role => role.toString()).join(", ")}를 추가했다냥!`
  },
  LIST: {
    CMD: "목록",
    DESC: "현재 봇을 사용할 수 있는 역할들을 표시한다냥!",
    CAN_BE_USED_FOR_EVERYONE: (bot: Siamese) => `이 서버에서는 누구나 ${bot.user.toString()}를 사용할 수 있다냥!`,
    ACTIVE_ROLES: (roles: Role[]) => `현재 활성화된 역할들이다냥! - ${roles.map(role => role.toString()).join(", ")}`
  },
  REMOVE: {
    CMD: "삭제해줘",
    DESC: "봇을 사용할 수 있는 역할들 중에서 해당 역할을 제거한다냥!",
    USAGE: "@역할명1 @역할명2 @역할명3",
    ALIAS: ["삭제", "제거", "제거해줘"],
    REMOVED: (bot: Siamese, guild: Guild, roles: string[]) => `${bot.user.toString()}${Josa.c(bot.getDisplayName(guild), "을/를")} 사용할 수 있는 역할에서 ${roles.map(role => roleMention(role)).join(", ")}를 제거했다냥!`
  },
  ERROR: {
    MENTION_ROLE: "역할을 @멘션해서 달라냥!",
    NO_ROLES_TO_REMOVE: "이 서버에서는 누구나 명령어를 사용할 수 있다냥!"
  }
};
