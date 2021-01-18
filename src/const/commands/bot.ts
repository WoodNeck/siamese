import Discord from "discord.js";
import Josa from "josa-js";

import Siamese from "~/Siamese";
import dedent from "~/utils/dedent";
import { strong } from "~/utils/markdown";
import * as EMOJI from "~/const/emoji";


export const PING = {
  CMD: "핑",
  DESC: "퐁을 대답한다냥!",
  MSG: (ping: string, bot: Siamese, guild: Discord.Guild, uptime: Date) => dedent`
    퐁이다냥! 현재 샴고양이 웹소켓 핑 평균은 ${strong(`${ping}ms`)}다냥!
    ${bot.user.toString()}${Josa.c(bot.getDisplayName(guild), "은/는")} ${uptime.getHours().toString()}시간 ${uptime.getMinutes().toString()}분 ${uptime.getSeconds().toString()}초동안 일하고 있다냥!`
};
export const INVITE = {
  CMD: "초대",
  DESC: "봇을 초대할 수 있는 링크를 준다냥!",
  MSG: (botMention, link) => `${botMention}의 초대 링크다냥!\n${link}`
};
export const HELP = {
  CMD: "도움",
  DESC: "명령어 목록을 보여준다냥!",
  RECITAL_TIME: 30
};
export const DEV_SERVER = {
  CMD: "개발서버",
  DESC: "개발 서버로 올 수 있는 초대 링크를 준다냥!",
  INVITE_LINK: (bot: Siamese, inviteLink: string) => dedent`
			${bot.user.toString()}의 개발 서버 초대 링크다냥!
			와서 사용/개발에 관한 질문, 기능요청, 버그제보 등을 할 수 있다냥!
			${inviteLink}`
};
export const INFO = {
  CMD: "정보",
  DESC: "봇과 관련된 정보를 볼 수 있다냥!",
  GUILD_CNT: (guildCnt: number) => `${EMOJI.UP_TRIANGLE} 서버 수 - ${guildCnt}개`,
  USER_CNT: (userCnt: number) => `${EMOJI.PEOPLE} 사용자 수 - ${userCnt}명`,
  DEV_SERVER: (server: Discord.Guild, inviteLink: string) => `${EMOJI.ENVELOPE_WITH_ARROW} [${server.name}](${inviteLink})`,
  GITHUB_ICON_URL: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
};
