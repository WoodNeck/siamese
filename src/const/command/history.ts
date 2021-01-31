import { strong } from "~/util/markdown";
import * as EMOJI from "~/const/emoji";
import { FORMAT } from "~/const/message";

export const RANDOM = {
  CMD: "랜덤",
  DESC: "이 채널의 랜덤한 메시지를 보여준다냥!",
  MSG_FETCH_LIMIT: 100,
  MSG_CHECK: (url: string) => `[원본 메시지${EMOJI.SPEECH_BUBBLE}](${url})`,
  MSG_URL: (guildId: string, channelId: string, msgId: string) => `https://discordapp.com/channels/${guildId}/${channelId}/${msgId}`,
  ERROR: {
    NO_ENTRY_FOUND: "이 채널은 아직 메시지가 충분히 기록되지 않았다냥!",
    CANT_FIND_MSG: "메시지를 하나도 가져오지 못했다냥! 다시 시도해달라냥!"
  }
} as const;

export const FORCES = [
  "육군", "의경", "해병",
  "해군", "해경", "의방",
  "공군", "공익"
] as const;

export const DISCHARGE = {
  CMD: "전역일",
  DESC: "전역일 정보를 확인한다냥!",
  USAGE: "이름",
  TARGET: "찾을 사람",
  SHORTEN_AFTER_THIS_DATE: new Date(2018, 10 - 1, 1),
  FORCE_INFO: {
    육군: { duration: 21, maxShortenMonth: 3 },
    의경: { duration: 21, maxShortenMonth: 3 },
    해병: { duration: 21, maxShortenMonth: 3 },
    해군: { duration: 23, maxShortenMonth: 3 },
    해경: { duration: 23, maxShortenMonth: 3 },
    의방: { duration: 23, maxShortenMonth: 3 },
    공군: { duration: 24, maxShortenMonth: 2 },
    공익: { duration: 24, maxShortenMonth: 3 }
  },
  TITLE: (name: string) => `${name}의 전역일 정보다냥!`,
  DETAILED: "자세한 정보",
  PROGRESS_EMOJI: (percent: number) => `${EMOJI.SPARKLING_HEART.repeat(percent)}${EMOJI.BLACK_HEART.repeat(100 - percent)}`,
  FORCE_DETAIL: (force: string) => `${force}`,
  SHORTEN_DATE: (days: number) => `단축일수: ${days}일`,
  JOIN_DATE: (date: Date) => `입대일자: ${FORMAT.DATE(date)}`,
  DISCHARGE_DATE: (date: Date) => `전역일자: ${FORMAT.DATE(date)}`,
  DAYS_PROGRESSED: (days: number) => `복무한 날: ${days}일`,
  DAYS_LEFT: (days: number) => `남은 날: ${days}일`,
  PERCENTAGE: (percent: number) => `복무율: ${percent.toFixed(1)}%`,
  ADD: {
    CMD: "추가해줘",
    DESC: "새로운 전역일 정보를 추가한다냥!",
    USAGE: "이름",
    ALIAS: ["추가"],
    NAME_MAX_LENGTH: 10,
    CONVERSATION_TIME: 30,
    PROMPT_TIME: 30,
    NAME_ALREADY_EXISTS: (name: string) => `${name}의 전역일 정보는 이미 존재한다냥! 먼저 삭제해달라냥!`,
    DIALOGUE_JOIN_DATE_TITLE: (name: string) => `${name}의 전역일 정보를 추가한다냥!`,
    DIALOGUE_JOIN_DATE_DESC: "먼저, YYYY/MM/DD의 형식으로 입대일을 알려달라냥!",
    DIALOGUE_JOIN_DATE_EXAMPLE: "예) 2013/1/2",
    DIALOGUE_FORCES_TITLE: "다음으로, 군별을 알려달라냥! 다음 중 하나를 골라달라냥!",
    DIALOGUE_FORCES_EXAMPLE: () => `${FORCES.join(", ")}`,
    SUCCESS: (name: string) => `${EMOJI.MILITARY_HELMET} ${strong(name)}의 정보를 추가했다냥!`
  },
  LIST: {
    CMD: "목록",
    DESC: "전역일 목록을 확인한다냥!",
    RECITAL_TIME: 30,
    ENTRY_PER_PAGE: 10,
    ENTRY: (info: { name: string; joinDate: Date }) => `${EMOJI.SMALL_WHITE_SQUARE}${info.name} - ${FORMAT.DATE(info.joinDate)}`
  },
  REMOVE: {
    CMD: "삭제해줘",
    DESC: "전역일 항목을 삭제한다냥!",
    USAGE: "이름",
    ALIAS: ["삭제", "제거", "제거해줘"],
    SUCCESS: (name: string) => `${EMOJI.MILITARY_HELMET} ${strong(name)}의 전역일 정보를 삭제했다냥!`
  },
  ERROR: {
    NOT_FOUND: "아직 등록되지 않은 사람이다냥!",
    EMPTY_RESULT: "전역일 정보가 하나도 등록되지 않았다냥!",
    NAME_TOO_LONG: (max: number) => `이름이 너무 길다냥! ${max}자 이내로 달라냥!`,
    PROVIDE_NAME_TO_ADD: "등록할 사람의 이름을 달라냥!",
    PROVIDE_NAME_TO_REMOVE: "삭제할 사람의 이름을 달라냥!",
    JOIN_DATE_NOT_FORMATTED: "입대일자는 YYYY/MM/DD 형식으로 달라냥!",
    FORCES_NOT_LISTED: `${FORCES.map(force => strong(force)).join(", ")} 중에 하나를 골라달라냥!`
  }
} as const;
