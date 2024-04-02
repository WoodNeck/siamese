import { EMOJI } from "@siamese/emoji";

import type { Category } from "@siamese/core";

export const CATEGORY = {
  BOT: {
    ID: "bot",
    NAME: "봇",
    DESC: "봇과 관련된 정보들을 확인할 수 있다냥!",
    EMOJI: EMOJI.BOT
  },
  UTILITY: {
    ID: "utility",
    NAME: "유틸리티",
    DESC: "유용한 명령어들을 모아놨다냥!",
    EMOJI: EMOJI.TOOLS
  },
  SEARCH: {
    ID: "search",
    NAME: "검색",
    DESC: "인터넷으로 검색한 결과를 보여주는 명령어들이다냥!",
    EMOJI: EMOJI.MAGNIFYING_GLASS_LEFT
  },
  HISTORY: {
    ID: "history",
    NAME: "기록",
    DESC: "서버의 각종 기록들을 열람할 수 있다냥!",
    EMOJI: EMOJI.SCROLL
  },
  STEAM: {
    ID: "steam",
    NAME: "스팀",
    DESC: "스팀에서 여러가지 정보를 검색한다냥!",
    EMOJI: EMOJI.MONEY_WITH_WINGS
  },
  ICON: {
    ID: "icon",
    NAME: "아이콘",
    DESC: "아이콘 관련 명령어들을 모아놨다냥!",
    EMOJI: EMOJI.PICTURE
  },
  SETTING: {
    ID: "setting",
    NAME: "설정",
    DESC: "서버 설정 관련 명령어들이다냥!",
    EMOJI: EMOJI.GEAR
  },
  MINIGAME: {
    ID: "minigame",
    NAME: "미니게임",
    DESC: "채널 안에서 플레이 가능한 미니게임들이다냥!",
    EMOJI: EMOJI.JOYSTICK
  },
  GAME: {
    ID: "game",
    NAME: "게임",
    DESC: "각종 게임 관련 정보를 검색할 수 있는 명령어들이다냥!",
    EMOJI: EMOJI.VIDEO_GAME
  }
} satisfies Record<string, Category>;
