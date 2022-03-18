export const FFXIV = {
  CMD: "파판",
  DESC: "파이널 판지 14 관련 정보들을 조회할 수 있는 명령어들이다냥!",
  ITEM: {
    CMD: "아이템",
    DESC: "파이널 판타지 14 데이터베이스에서 아이템 정보를 검색한다냥!",
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
    }
  }
} as const;
