import { StringUsage, type CommandOptions } from "@siamese/core";
import { EMOJI } from "@siamese/emoji";

import { CATEGORY } from "../../const/category";

export const FFXIV = {
  CMD: "파판",
  DESC: "파이널 판타지 14 관련 정보들을 조회할 수 있는 명령어들이다냥!",
  CATEGORY: CATEGORY.GAME,
  ITEM: {
    CMD: "아이템",
    DESC: "파이널 판타지 14 아이템 정보를 검색한다냥!",
    CATEGORY: CATEGORY.GAME,
    USAGE: [
      new StringUsage({
        name: "이름",
        description: "검색할 아이템 이름을 달라냥!"
      })
    ] as const,
    HQ_ITEM_FOOTER: "*는 HQ 아이템일때의 정보를 뜻한다냥",
    HQ_ITEM_IMAGE: "https://image.ff14.co.kr/html2/guide/img/item_hq_icon.png",
    EMPTY_CONTENT: "검색할 아이템 이름을 달라냥!",
    EMPTY_RESULT: "그 검색어로는 아이템을 하나도 찾을 수 없었다냥!",
    FAILED_TO_FETCH: "아이템 정보를 가져올 수 없었다냥!"
  } satisfies CommandOptions
} satisfies CommandOptions;

export const HEARTHSTONE = {
  CMD: "하스스톤",
  DESC: "하스스톤 관련 정보들을 조회할 수 있는 명령어들이다냥!",
  CATEGORY: CATEGORY.GAME,
  ALIASES: ["돌"],
  CARD: {
    CMD: "카드",
    DESC: "하스스톤 카드를 검색한다냥!",
    CATEGORY: CATEGORY.GAME,
    USAGE: [
      new StringUsage({
        name: "키워드",
        description: "검색할 카드 이름이나 키워드를 달라냥!"
      })
    ] as const,
    RARITY_COLOR: {
      [0]: "#9d9d9d",
      [1]: "#ffffff",
      [2]: "#1eff00",
      [3]: "#0070dd",
      [4]: "#a335ee",
      [5]: "#ff8000",
      [6]: "#e6cc80",
      [7]: "#e6cc80"
    } as Record<number, `#${string}`>,
    EMPTY_CONTENT: "검색할 카드 이름을 달라냥!",
    EMPTY_RESULT: "그 검색어로는 카드를 하나도 찾을 수 없었다냥!"
  } satisfies CommandOptions
} satisfies CommandOptions;

export const MTG = {
  CMD: "매더개",
  DESC: "매직 더 개더링 관련 정보들을 검색한다냥!",
  CATEGORY: CATEGORY.GAME,
  ALIAS: ["매직", "매더게"],
  CARD: {
    CMD: "카드",
    DESC: "매직 더 개더링 카드를 검색한다냥!",
    CATEGORY: CATEGORY.GAME,
    USAGE: [
      new StringUsage({
        name: "이름",
        description: "검색할 카드 이름을 달라냥!"
      })
    ] as const,
    EMPTY_CONTENT: "검색할 카드 이름을 달라냥!",
    EMPTY_RESULT: "그 검색어로는 카드를 하나도 찾을 수 없었다냥!"
  } satisfies CommandOptions,
  RANDOM: {
    CMD: "랜덤",
    DESC: "무작위 매직 더 개더링 카드를 검색한다냥!",
    CATEGORY: CATEGORY.GAME
  } satisfies CommandOptions,
  QUIZ: {
    CMD: "퀴즈",
    DESC: "무작위 매직 더 개더링 카드를 제시할테니 이름을 맞춰보라냥!",
    CATEGORY: CATEGORY.GAME,
    MAX_TIME: 30,
    NO_TEXT: (name: string) => `${EMOJI.CROSS} 틀렸다냥! 정답은 **"${name}"** 이다냥!`,
    OK_TEXT: `${EMOJI.OK} 정답이다냥!`
  } satisfies CommandOptions
} satisfies CommandOptions;
