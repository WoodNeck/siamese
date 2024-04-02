import { PERMISSION, type CommandOptions } from "@siamese/core";
import { EMOJI } from "@siamese/emoji";
import { strong } from "@siamese/markdown";
import { stripIndents } from "common-tags";
import Josa from "josa-js";

import { CATEGORY } from "../../const/category";

export const PING = {
  CMD: "핑",
  DESC: "퐁을 대답한다냥!",
  CATEGORY: CATEGORY.BOT,
  MSG: (ping: string, botName: string, botDisplayName: string, uptime: string) => stripIndents`
    퐁이다냥! 현재 샴고양이 웹소켓 핑 평균은 ${strong(`${ping}ms`)}다냥!
    ${botName}${Josa.c(botDisplayName, "은/는")} ${uptime}동안 일하고 있다냥!`
} satisfies CommandOptions;

export const INVITE = {
  CMD: "초대",
  DESC: "봇을 초대할 수 있는 링크를 준다냥!",
  CATEGORY: CATEGORY.BOT,
  TITLE: (botName: string) => `${botName}의 초대링크다냥!`,
  MSG: (botName: string) => `${EMOJI.LINK} 클릭해서 ${botName} 초대하기`
} satisfies CommandOptions;

export const HELP = {
  CMD: "도움",
  DESC: "명령어 목록을 보여준다냥!",
  CATEGORY: CATEGORY.BOT,
  ALIASES: ["help", "도움말"],
  PERMISSIONS: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.ADD_REACTIONS,
    PERMISSION.READ_MESSAGE_HISTORY,
    PERMISSION.MANAGE_MESSAGES
  ],
  WEB_LINK: "https://para.n-e.kr/#/command/bot",
  WEB_BTN_LABEL: "웹에서 보기"
} satisfies CommandOptions;

export const INFO = {
  CMD: "정보",
  DESC: "봇과 관련된 정보를 볼 수 있다냥!",
  CATEGORY: CATEGORY.BOT,
  GUILD_CNT: (guildCnt: number) => `${EMOJI.UP_TRIANGLE} 서버 수 - ${guildCnt}개`,
  USER_CNT: (userCnt: number) => `${EMOJI.PEOPLE} 사용자 수 - ${userCnt}명`,
  DEV_SERVER: (inviteLink: string) => `${EMOJI.ENVELOPE_WITH_ARROW} [개발 서버](${inviteLink})`,
  GITHUB_ICON_URL: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
} satisfies CommandOptions;
