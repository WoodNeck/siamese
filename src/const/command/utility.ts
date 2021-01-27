import Discord from "discord.js";
import Josa from "josa-js";

import { dedent } from "~/util/helper";
import { block, code, strong } from "~/util/markdown";
import * as EMOJI from "~/const/emoji";
import Siamese from "~/Siamese";

export const DICE = {
  CMD: "주사위",
  DESC: "n면짜리 주사위를 굴린다냥! (기본값: 100)",
  USAGE: "[n]",
  MIN: 2,
  MAX: 10000,
  DEFAULT: 100,
  MSG: (user: Discord.GuildMember, num: number, maxNum: number) => {
    // Korean josa for number 0-9
    const josa = ["이", "이", "가", "이", "가", "가", "이", "이", "이", "가"];
    const numStr = num.toString();
    return `${user.toString()}냥이 주사위를 굴려 🎲${strong(numStr)}${josa[num % 10]} 나왔다냥! (1-${maxNum})`;
  },
  ARG_INCORRECT: (min: number, max: number) => `${min}에서 ${max}사이의 숫자를 달라냥!`
};
export const CHOOSE = {
  CMD: "골라줘",
  DESC: "받은 항목들 중 하나를 임의로 골라준다냥!",
  USAGE: "항목1 항목2 [항목3...]",
  ARG_NOT_SUFFICIENT: (bot: Siamese) => dedent`
    고를 수 있는 항목을 충분히 달라냥!
    ${block(`> ${bot.prefix}${CHOOSE.CMD} 샴 먼치킨 아비시니안 페르시안 메인쿤`)}`
};
export const SAY = {
  CMD: "따라해",
  DESC: "해준 말을 지운 후에 따라한다냥!",
  USAGE: "따라할 문장",
  TARGET: "따라할 문장"
};
export const VOTE = {
  CMD: "투표",
  DESC: "채널 내에서 간단한 투표를 할 수 있다냥!",
  USAGE: "제목",
  TARGET: "투표 제목",
  CONVERSATION_TIME: 120,
  OPTIONS_TITLE: "투표 항목들을 말해달라냥!",
  OPTIONS_DESC: "콤마(,)로 항목들을 구분해서, 최소 2개에서 9개까지 투표 항목들을 말해달라냥!",
  OPTIONS_FOOTER: "예) 옵션1, 옵션2, 옵션3",
  DURATION_TITLE: "투표를 몇 분동안 하면 될까냥?",
  DURATION_DESC: dedent`
			투표를 종료하기까지 시간을 분 단위로 말해달라냥!
			최소 1분에서 최대 1440분(하루)까지 가능하다냥!`,
  DURATION_FOOTER: "예) 30",
  DURATION_MIN: 0.1,
  DURATION_MAX: 1440,
  HELP_DESC: dedent`
			투표를 시작한다냥! 번호 이모지를 클릭해서 투표하라냥!
			각자 가장 마지막에 클릭한 이모지가 최종 투표 항목이 된다냥!`,
  RESULT_DESC: (name: string, votes: number) => `${strong(name)}${Josa.c(name, "이/가")} ${strong(votes.toString())}표로 가장 높은 표를 기록했다냥!`,
  RESULT_DESC_TIE: (options: string[], vote: number) => `${options.map(strong).join(", ")}${Josa.c(options[options.length - 1], "이/가")} ${vote}표로 동점이다냥!`,
  TITLE: (title: string) => `${EMOJI.BALLOT_BOX} ${title}`,
  FOOTER: (name: string, time: number) => `${name}의 투표 (${EMOJI.STOPWATCH}${time}m)`,
  COUNT: (cnt: number) => `${cnt}표`,
  ERROR: {
    OPTIONS_BETWEEN_2_9: "투표 항목을 콤마(,)로 구분해서 2개에서 9개 사이로 달라냥!",
    DURATION_SHOULD_CLAMPED: max => `투표 시간은 1에서 ${max} 사이의 숫자를 말해달라냥!`
  }
};
export const AVATAR = {
  CMD: "아바타",
  DESC: "사용자의 아바타 이미지를 크게 보여준다냥!",
  USAGE: "@사용자",
  MENTION_NEEDED: (bot: Siamese) => dedent`
    명령어 대상을 ${code("@멘션")}해서 사용하는 명령어다냥!
    ${block(`> ${bot.prefix}${AVATAR.CMD} @${bot.user.username}`)}`,
  MENTION_ONLY_ONE: "한 명의 유저만 멘션해달라냥!"
};
