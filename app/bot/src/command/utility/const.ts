import { type CommandOptions, UserUsage, StringUsage, IntegerUsage } from "@siamese/core";
import { EMOJI } from "@siamese/emoji";
import { env } from "@siamese/env";
import { block, code, strong } from "@siamese/markdown";
import { Duration } from "@siamese/time";
import { stripIndents } from "common-tags";
import { GuildMember, User } from "discord.js";
import Josa from "josa-js";

import { CATEGORY } from "../../const/category";

export const DICE = {
  CMD: "주사위",
  DESC: "n면짜리 주사위를 굴린다냥! (기본값: 100)",
  CATEGORY: CATEGORY.UTILITY,
  USAGE: [
    new IntegerUsage({
      name: "면",
      description: "굴릴 주사위의 면의 수다냥, 100일 경우 1에서 100 사이의 숫자가 나온다냥!",
      optional: true,
      minValue: 2,
      maxValue: 10000
    })
  ] as const,
  MIN: 2,
  MAX: 10000,
  DEFAULT: 100,
  MSG: (user: User, num: number, maxNum: number) => {
    // 숫자 0부터 9까지의 조사
    const josa = ["이", "이", "가", "이", "가", "가", "이", "이", "이", "가"];
    const numStr = num.toString();
    return `${user}냥이 주사위를 굴려 🎲${strong(numStr)}${josa[num % 10]} 나왔다냥! (1-${maxNum})`;
  },
  ARG_INCORRECT: (min: number, max: number) => `${min}에서 ${max}사이의 숫자를 달라냥!`
} satisfies CommandOptions;

export const CHOOSE = {
  CMD: "골라줘",
  DESC: "받은 항목들 중 하나를 임의로 골라준다냥!",
  CATEGORY: CATEGORY.UTILITY,
  USAGE: [
    new StringUsage({
      name: "항목1",
      description: "첫번째 항목"
    }),
    new StringUsage({
      name: "항목2",
      description: "두번째 항목"
    }),
    new StringUsage({
      name: "항목3",
      description: "세번째 항목",
      optional: true
    }),
    new StringUsage({
      name: "항목4",
      description: "세번째 항목",
      optional: true
    }),
    new StringUsage({
      name: "항목5",
      description: "세번째 항목",
      optional: true
    })
  ] as const,
  ARG_NOT_SUFFICIENT: stripIndents`
    고를 수 있는 항목을 충분히 달라냥!
    ${block(`> ${env.BOT_DEFAULT_PREFIX}골라줘 랙돌 먼치킨 아비시니안 페르시안 메인쿤`)}`
} satisfies CommandOptions;

export const SAY = {
  CMD: "따라해",
  DESC: "해준 말을 지운 후에 따라한다냥!",
  CATEGORY: CATEGORY.UTILITY,
  USAGE: [
    new StringUsage({
      name: "따라할 문장",
      description: "따라할 문장을 달라냥!"
    })
  ] as const,
  NO_EMPTY_CONTENT: "빈 문장을 따라할수는 없다냥!"
} satisfies CommandOptions;

export const VOTE = {
  CMD: "투표",
  DESC: "채널 내에서 간단한 익명 투표를 할 수 있다냥!",
  CATEGORY: CATEGORY.UTILITY,
  MODAL: {
    CREATION_TITLE: "투표를 생성한다냥!",
    TITLE: "투표 제목",
    TITLE_DEFAULT: (user: User) => `${user.displayName}의 투표`,
    TITLE_PLACEHOLDER: "투표 제목을 입력해달라냥!",
    DURATION: "투표 시간 (분)",
    DURATION_DEFAULT: "30",
    DURATION_PLACEHOLDER: "최소 1분에서 최대 1440분(하루)까지 가능하다냥!",
    OPTIONS: "투표 항목",
    OPTIONS_PLACEHOLDER: "엔터로 항목들을 구분해서, 최소 2개에서 9개까지 투표 항목들을 말해달라냥!"
  },
  CONVERSATION_TIME: 600, // 10min
  DURATION_MIN: 1,
  DURATION_MAX: 1440,
  HELP_DESC: stripIndents`
    투표를 시작한다냥! 번호 이모지를 클릭해서 투표하라냥!
    각자 가장 마지막에 클릭한 버튼이 최종 투표 항목이 된다냥!`,
  RESULT_DESC: (name: string, votes: number) => `${strong(name)}${Josa.c(name, "이/가")} ${strong(votes.toString())}표로 가장 높은 표를 기록했다냥!`,
  RESULT_DESC_TIE: (options: string[], vote: number) => `${options.map(strong).join(", ")}${Josa.c(options[options.length - 1], "이/가")} ${vote}표로 동점이다냥!`,
  DEFAULT_TITLE: (author: GuildMember) => `${author.displayName}의 투표`,
  TITLE: (title: string) => `${EMOJI.BALLOT_BOX} ${title}`,
  FOOTER: (name: string, minute: number) => `${name}의 투표 (${EMOJI.STOPWATCH}${Duration.format(minute * 60 * 1000)})`,
  COUNT: (cnt: number) => `${cnt}표`,
  RANDOM_LABEL: "랜덤",
  RANDOM_SYMBOL: "RANDOM",
  VOTE_MSG: (index: number) => `${index + 1}번에 투표했다냥!`,
  STOP_LABEL: "투표종료",
  STOP_SYMBOL: "STOP",
  ERROR: {
    OPTIONS_BETWEEN_2_9: "투표 항목을 엔터로 구분해서 2개에서 9개 사이로 달라냥!",
    DURATION_SHOULD_CLAMPED: "투표 시간은 1에서 1440 사이의 숫자를 입력해달라냥!",
    ONLY_AUTHOR_CAN_STOP: "투표를 생성한 사람만 투표를 종료할 수 있다냥!"
  }
} satisfies CommandOptions;

export const AVATAR = {
  CMD: "아바타",
  DESC: "사용자의 아바타 이미지를 크게 보여준다냥!",
  CATEGORY: CATEGORY.UTILITY,
  USAGE: [
    new UserUsage({
      name: "사용자",
      description: "아바타를 볼 사용자다냥!"
    })
  ] as const,
  MENTION_NEEDED: `명령어 대상을 ${code("@멘션")}해서 사용하는 명령어다냥!`
} satisfies CommandOptions;

export const TRANSLATE = {
  CMD: "번역",
  DESC: "외국어 문장을 번역한다냥!\n언어를 지정하지 않을 경우 한국어로 번역한다냥!",
  CATEGORY: CATEGORY.UTILITY,
  ALIAS: ["번역해줘"],
  USAGE: [
    new StringUsage({
      name: "언어",
      description: "번역 결과로 나올 언어를 달라냥!",
      optional: true,
      autocomplete: true
    }),
    new StringUsage({
      name: "문장",
      description: "번역할 문장을 달라냥!"
    })
  ] as const,
  FOOTER_FORMAT: (orig: string) => `원문: ${orig}`,
  DEFAULT_LANG: "한국어",
  ERROR: {
    NO_CONTENT: "번역할 내용을 달라냥!"
  },
  LIST: {
    CMD: "목록",
    DESC: "번역 가능한 언어들을 보여준다냥!",
    ENTRY_PER_PAGE: 20,
    ENTRY: (lang: string) => `${EMOJI.SMALL_WHITE_SQUARE}${lang}`,
    MENU_TIME: 30
  }
} satisfies CommandOptions;

export const CALCULATOR = {
  CMD: "계산기",
  DESC: "계산기를 표시한다냥!",
  CATEGORY: CATEGORY.UTILITY
} satisfies CommandOptions;
