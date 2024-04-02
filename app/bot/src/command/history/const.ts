import { StringUsage, type CommandOptions } from "@siamese/core";
import { EMOJI } from "@siamese/emoji";
import { strong } from "@siamese/markdown";
import { Dayjs } from "dayjs";

import { CATEGORY } from "../../const/category";

export const DATE = (date: Dayjs) => `${date.year()}년 ${date.month() + 1}월 ${date.date()}일`;

export const FORCES = [
  "육군", "의경", "해병",
  "해군", "해경", "의방",
  "공군", "공익"
] as const;

export const DISCHARGE = {
  CMD: "전역일",
  DESC: "등록된 전역일 정보를 확인한다냥!",
  CATEGORY: CATEGORY.HISTORY,
  USAGE: [
    new StringUsage({
      name: "이름",
      description: "전역일 정보를 알고 싶은 사람의 이름을 달라냥!"
    })
  ] as const,
  SHORTEN_AFTER_THIS_DATE: "2018-10-1",
  FORCE_INFO: {
    육군: { duration: 21, maxShortenMonth: 3 },
    의경: { duration: 21, maxShortenMonth: 3 },
    해병: { duration: 21, maxShortenMonth: 3 },
    해군: { duration: 23, maxShortenMonth: 3 },
    해경: { duration: 23, maxShortenMonth: 3 },
    의방: { duration: 23, maxShortenMonth: 3 },
    공군: { duration: 24, maxShortenMonth: 2 },
    공익: { duration: 24, maxShortenMonth: 3 }
  } as Record<string, { duration: number, maxShortenMonth: number }>,
  TITLE: (name: string) => `${name}의 전역일 정보다냥!`,
  DETAILED: "자세한 정보",
  PROGRESS_EMOJI: (percent: number) => `${EMOJI.SPARKLING_HEART.repeat(percent)}${EMOJI.BLACK_HEART.repeat(100 - percent)}`,
  FORCE_DETAIL: (force: string) => `${force}`,
  SHORTEN_DATE: (days: number) => `단축일수: ${days}일`,
  JOIN_DATE: (date: Dayjs) => `입대일자: ${DATE(date)}`,
  DISCHARGE_DATE: (date: Dayjs) => `전역일자: ${DATE(date)}`,
  DAYS_PROGRESSED: (days: number) => `복무한 날: ${days}일`,
  DAYS_LEFT: (days: number) => `남은 날: ${days}일`,
  PERCENTAGE: (percent: number) => `복무율: ${percent.toFixed(1)}%`,
  ERROR: {
    EMPTY_CONTENT: "전역일 정보를 확인할 사람의 이름을 달라냥!",
    GUILD_NOT_FOUND: "서버 정보를 확인할 수 없다냥!",
    NOT_FOUND: "아직 등록되지 않은 사람이다냥!",
    EMPTY_RESULT: "전역일 정보가 하나도 등록되지 않았다냥!",
    PROVIDE_NAME_TO_ADD: "등록할 사람의 이름을 달라냥!",
    PROVIDE_NAME_TO_REMOVE: "삭제할 사람의 이름을 달라냥!",
    JOIN_DATE_NOT_FORMATTED: "입대일자는 YYYY/MM/DD 형식으로 달라냥!",
    FORCES_NOT_LISTED: `${FORCES.map(force => strong(force)).join(", ")} 중에 하나를 골라달라냥!`
  }
} satisfies CommandOptions;

export const DISCHARGE_ADD = {
  CMD: "추가",
  DESC: "새로운 전역일 정보를 추가한다냥!",
  CATEGORY: CATEGORY.HISTORY,
  ALIASES: ["추가해줘"],
  MODAL_TITLE: "전역일 정보를 추가한다냥!",
  MODAL_NAME_TITLE: "이름을 알려달라냥!",
  MODAL_NAME_DESC: "이 이름으로 나중에 전역일 정보를 확인할 수 있다냥!",
  MODAL_JOIN_TITLE: "입대일을 알려달라냥!",
  MODAL_JOIN_DESC: "YYYY/MM/DD의 형식으로 입력해달라냥! (예: 2013/1/2)",
  MODAL_FORCE_TITLE: "군별을 알려달라냥!",
  MODAL_FORCE_DESC: () => `${FORCES.join(", ")}`,
  NAME_MAX_LENGTH: 10,
  DATE_REGEX: /^\d+(?:[-/])\d+(?:[-/])\d+$/,
  SUCCESS: (name: string) => `${EMOJI.MILITARY_HELMET} ${strong(name)}의 정보를 추가했다냥!`,
  CONVERSATION_TIME: 600,
  NAME_ALREADY_EXISTS: (name: string) => `${name}의 전역일 정보는 이미 존재한다냥! 먼저 삭제해달라냥!`
} satisfies CommandOptions;

export const DISCHARGE_LIST = {
  CMD: "목록",
  DESC: "전역일 목록을 확인한다냥!",
  CATEGORY: CATEGORY.HISTORY,
  ENTRY_PER_PAGE: 10,
  ENTRY: (info: { name: string; joinDate: Dayjs }) => `${EMOJI.SMALL_WHITE_SQUARE}${info.name} - ${DATE(info.joinDate)}`
} satisfies CommandOptions;

export const DISCHARGE_REMOVE = {
  CMD: "삭제",
  DESC: "전역일 항목을 삭제한다냥!",
  CATEGORY: CATEGORY.HISTORY,
  USAGE: [
    new StringUsage({
      name: "이름",
      description: "삭제할 사람의 이름을 달라냥!"
    })
  ] as const,
  ALIASES: ["삭제해줘", "제거", "제거해줘"],
  SUCCESS: (name: string) => `${EMOJI.MILITARY_HELMET} ${strong(name)}의 전역일 정보를 삭제했다냥!`,
  PROVIDE_NAME: "전역일 정보를 삭제할 사람의 이름을 달라냥!"
} satisfies CommandOptions;

export const DISCHARGE_SHOW = {
  CMD: "확인",
  DESC: "등록된 전역일 항목을 확인한다냥!",
  CATEGORY: CATEGORY.HISTORY,
  USAGE: [
    new StringUsage({
      name: "이름",
      description: "확인할 사람의 이름을 달라냥!"
    })
  ] as const,
  ALIASES: ["확인해줘", "표시", "표시해줘"]
} satisfies CommandOptions;
