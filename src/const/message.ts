import type Discord from "discord.js";
import Josa from "josa-js";

import type Siamese from "~/Siamese";
import type Command from "~/core/Command";
import { dedent } from "~/util/helper";
import * as EMOJI from "~/const/emoji";
import * as PERMISSION from "~/const/permission";
import { link, strong, underline } from "~/util/markdown";

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
  GUILD_JOIN_TITLE: `${EMOJI.PAW} 안냥! 만나서 반갑다냥!`,
  GUILD_JOIN_DESC: (bot: Siamese, helpCmd) => dedent`
    ${EMOJI.MIDDLE_DOT} ${underline(strong(helpCmd))}이라고 말하면 ${Josa.r(bot.user.username, "이/가")} 할 수 있는 일을 알 수 있다냥!
    ${EMOJI.MIDDLE_DOT} ${link("공식 홈페이지", bot.env.WEB_URL_BASE)}에서 서버 전용 아이콘을 추가하거나, 명령어 설명을 볼 수 있다냥!
    ${bot.env.BOT_DEV_SERVER_INVITE ? `${EMOJI.MIDDLE_DOT} 궁금한게 있다면 ${link("개발 서버", bot.env.BOT_DEV_SERVER_INVITE)}에 물어보거나 피드백을 남겨달라냥!` : ""}`,
  GUILD_JOIN_FOOTER: (bot: Siamese) => dedent`
    여기는 ${Josa.r(bot.user.username, "이/가")} 일하는 ${bot.guilds.cache.size.toString()}번째 서버다냥!`,
  ERROR_MSG: (user: Discord.GuildMember, errorMsg: string) => `${user.toString()}냥, ${errorMsg}`,
  DM_ERROR_MSG: (user: Discord.GuildMember, guild: Discord.Guild, channel: Discord.TextChannel, errorMsg: string) => `${user.toString()}냥, ${guild.toString()}/${channel.toString()}에 ${PERMISSION.SEND_MESSAGES.message} 권한이 없다냥!\n${errorMsg}`,
  CMD_REGISTER_FAILED: (cmd: Command) => `명령어 "${cmd.name}"의 beforeReigster 판정에 실패해서 명령어를 등록하지 못했다냥!`,
  SKIP_SLASH_CMD_REGISTER: "BOT_DEV_SERVER_ID가 bot.env파일에 없다냥! 슬래시 명령어 등록을 스킵한다냥!"
} as const;
