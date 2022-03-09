import Josa from "josa-js";

import { dedent } from "~/util/helper";
import { strong } from "~/util/markdown";
import * as EMOJI from "~/const/emoji";

export const PING = {
  CMD: "핑",
  DESC: "퐁을 대답한다냥!",
  MSG: (ping: string, botName: string, botDisplayName: string, uptime: Date) => dedent`
    퐁이다냥! 현재 샴고양이 웹소켓 핑 평균은 ${strong(`${ping}ms`)}다냥!
    ${botName}${Josa.c(botDisplayName, "은/는")} ${uptime.getUTCHours()}시간 ${uptime.getUTCMinutes()}분 ${uptime.getUTCSeconds()}초동안 일하고 있다냥!`
} as const;

export const INVITE = {
  CMD: "초대",
  DESC: "봇을 초대할 수 있는 링크를 준다냥!",
  TITLE: (botName: string) => `${botName}의 초대링크다냥!`,
  MSG: (botName: string) => `${EMOJI.LINK} 클릭해서 ${botName} 초대하기`
} as const;

export const HELP = {
  CMD: "도움",
  DESC: "명령어 목록을 보여준다냥!",
  ALIAS: ["help", "도움말"],
  WEB_CATEGORY_INVITE_LINK: "https://para.n-e.kr/#/command/bot",
  WEB_PRIVACY_LINK: "http://para.n-e.kr/#/privacy"
} as const;

export const DEV_SERVER = {
  CMD: "개발서버",
  DESC: "개발 서버로 올 수 있는 초대 링크를 준다냥!",
  INVITE_LINK: (botName: string, inviteLink: string) => dedent`
    ${botName}의 개발 서버 초대 링크다냥!
    와서 사용/개발에 관한 질문, 기능요청, 버그제보 등을 할 수 있다냥!
    ${inviteLink}`
} as const;

export const INFO = {
  CMD: "정보",
  DESC: "봇과 관련된 정보를 볼 수 있다냥!",
  GUILD_CNT: (guildCnt: number) => `${EMOJI.UP_TRIANGLE} 서버 수 - ${guildCnt}개`,
  USER_CNT: (userCnt: number) => `${EMOJI.PEOPLE} 사용자 수 - ${userCnt}명`,
  DEV_SERVER: (serverName: string, inviteLink: string) => `${EMOJI.ENVELOPE_WITH_ARROW} [${serverName}](${inviteLink})`,
  GITHUB_ICON_URL: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
} as const;
