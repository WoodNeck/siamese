import * as EMOJI from "~/const/emoji";

export const FFXIV = {
  CMD: "파판",
  DESC: "파이널 판지 14 관련 정보들을 조회할 수 있는 명령어들이다냥!",
  ITEM: {
    CMD: "아이템",
    DESC: "파이널 판타지 14 아이템 정보를 검색한다냥!",
    USAGE: "이름",
    USAGE_DESC: "검색할 아이템 이름을 달라냥!",
    ENTRIES_ENDPOINT: "http://guide.ff14.co.kr/lodestone/search",
    ITEM_ENDPOINT: (subURL: string) => `http://guide.ff14.co.kr${subURL}`,
    COLOR: {
      "col2": "#61b400",
      "col3": "#1a66ff",
      "col4": "#910fff",
      "col7": "#ff3dad",
      "col8": "#959595"
    },
    HQ_ITEM_FOOTER: "*는 HQ 아이템일때의 정보를 뜻한다냥",
    HQ_ITEM_IMAGE: "https://image.ff14.co.kr/html2/guide/img/item_hq_icon.png"
  },
  LOG: {
    CMD: "로그",
    DESC: "파이널 판타지 14 유저의 로그 정보를 검색한다냥!",
    USAGE: "유저",
    USAGE_DESC: "검색할 유저 이름을 달라냥!",
    CHAR_SEARCH_ENDPOINT: "https://ko.fflogs.com/search/autocomplete",
    REQUEST_HEADERS: {
      referer: "https://ko.fflogs.com"
    },
    CHAR_TYPE: "캐릭터",
    PERSON_ICON_URL: "https://cdn.discordapp.com/attachments/817765838001668116/964539996184903780/All-Rounder_Icon_1.png",
    ZONE_THUMB_URL: (id: string) => `https://assets.rpglogs.com/img/ff/zones/zone-${id}.png`,
    ZONE_INFO_URL: (zoneID: string, charID: string) => `https://ko.fflogs.com/character/rankings-zone/${charID}/dps/3/${zoneID}/0/5000/0/-1/Any/rankings/0/0`,
    ZONE_INFO_FOOTER: `${EMOJI.SMALL_ORANGE_DIAMOND} 정규 파티 / rdps 기준`,
    COLOR: {
      artifact: "#e5cc80",
      legendary: "#ff8000",
      astounding: "#e268a8",
      magnificent: "#be8200",
      epic: "#a335ee",
      rare: "#0070ff",
      uncommon: "#1eff00",
      common: "#666666"
    }
  }
} as const;
