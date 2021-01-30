import Discord from "discord.js";
import Josa from "josa-js";

import Siamese from "~/Siamese";
import Command from "~/core/Command";
import * as EMOJI from "~/const/emoji";
import { dedent } from "~/util/helper";
import { strong, underline } from "~/util/markdown";

export const BOT = {
  READY_INDICATOR: (bot: Siamese) => ` _____ _
/  ___(_)
\\ \`--. _  __ _ _ __ ___   ___  ___  ___
 \`--. \\ |/ _\` | '_ \` _ \\ / _ \\/ __|/ _ \\
/\\__/ / | (_| | | | | | |  __/\\__ \\  __/
\\____/|_|\\__,_|_| |_| |_|\\___||___/\\___|

- ${bot.user?.tag}`,
  READY_TITLE: (bot: Siamese) => dedent`
    ${bot.user.tag} 일할 준비 됐다냥!`,
  READY_DESC: (bot: Siamese) => `- ${bot.guilds.cache.size.toString()}개의 서버에서 사용 중이다냥!`,
  GUILD_JOIN_TITLE: "안냥! 만나서 반갑다냥!",
  GUILD_JOIN_DESC: (bot: Siamese, helpCmd) => dedent`
    ${underline(strong(helpCmd))}이라고 말하면 ${Josa.r(bot.user.username, "이/가")} 할 수 있는 일을 알 수 있다냥!`,
  GUILD_JOIN_FOOTER: (bot: Siamese) => dedent`
    여기는 ${Josa.r(bot.user.username, "이/가")} 일하는 ${bot.guilds.cache.size.toString()}번째 서버다냥!`,
  ERROR_MSG: (user: Discord.User, errorMsg: string) => `${user.toString()}냥, ${errorMsg}`,
  CMD_REGISTER_FAILED: (cmd: Command) => `명령어 "${cmd.name}"의 beforeReigster 판정에 실패해서 명령어를 등록하지 못했다냥!`
} as const;

export const FORMAT = {
  DATE: (date: Date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`,
  FLAG: (iso: string[]) => `${EMOJI.LETTER[iso[0].toUpperCase()]}${EMOJI.LETTER[iso[1].toUpperCase()]}`
} as const;
