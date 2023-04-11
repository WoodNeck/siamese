import * as EMOJI from "~/const/emoji";

export const FFXIV = {
  CMD: "파판",
  DESC: "파이널 판타지 14 관련 정보들을 조회할 수 있는 명령어들이다냥!",
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

export const BLIZZARD = {
  TOKEN_ENDPOINT: "https://kr.battle.net/oauth/token"
} as const;

export const HEARTHSTONE = {
  CMD: "하스스톤",
  DESC: "하스스톤 관련 정보들을 조회할 수 있는 명령어들이다냥!",
  ALIAS: ["돌"],
  CARD: {
    CMD: "카드",
    DESC: "하스스톤 카드를 검색한다냥!",
    USAGE: "키워드",
    USAGE_DESC: "검색할 카드 이름이나 키워드를 달라냥!",
    ENDPOINT: "https://kr.api.blizzard.com/hearthstone/cards",
    DEFAULT_PARAMS: {
      locale: "ko_KR"
    },
    RARITY_COLOR: {
      [0]: "#9d9d9d",
      [1]: "#ffffff",
      [2]: "#1eff00",
      [3]: "#0070dd",
      [4]: "#a335ee",
      [5]: "#ff8000",
      [6]: "#e6cc80",
      [7]: "#e6cc80"
    }
  }
} as const;

export const MTG = {
  CMD: "매더개",
  DESC: "매직 더 개더링 관련 정보들을 검색한다냥!",
  ALIAS: ["매직", "매더게"],
  CARD: {
    CMD: "카드",
    DESC: "매직 더 개더링 카드를 검색한다냥!",
    USAGE: "이름",
    USAGE_DESC: "검색할 카드 이름을 달라냥!",
    FIELD: {
      COST: "마나 비용",
      TYPE: "유형",
      SET: "세트"
    }
  },
  RANDOM: {
    CMD: "랜덤",
    DESC: "무작위 매직 더 개더링 카드를 검색한다냥!"
  },
  QUIZ: {
    CMD: "퀴즈",
    DESC: "무작위 매직 더 개더링 카드를 제시할테니 이름을 맞춰보라냥!",
    MAX_TIME: 30,
    FOOTER: `이 카드의 이름을 ${EMOJI.ALARM}30초 안에 맞춰보라냥!`,
    QUERY_RES: "not:funny -t:conspiracy -t:scheme not:token",
    NO_TEXT: (name: string) => `${EMOJI.CROSS} 틀렸다냥! 정답은 **"${name}"** 이다냥!`,
    OK_TEXT: `${EMOJI.OK} 정답이다냥!`
  },
  EMOJI: {
    B: { name: "B_", id: "1070378700505370634" },
    G: { name: "G_", id: "1070378703177138197" },
    R: { name: "R_", id: "1070378705496576010" },
    U: { name: "U_", id: "1070378708000583722" },
    W: { name: "W_", id: "1070378709841883208" },
    0: { name: "0_", id: "1070389690215182376" },
    "½": { name: "__", id: "1070389692933083176" },
    1: { name: "1_", id: "1070389694795358208" },
    2: { name: "2_", id: "1070389697819459665" },
    3: { name: "3_", id: "1070389699446837388" },
    4: { name: "4_", id: "1070389702248636477" },
    5: { name: "5_", id: "1070389704027033620" },
    6: { name: "6_", id: "1070389707030151218" },
    7: { name: "7_", id: "1070389708770783454" },
    8: { name: "8_", id: "1070389712130408569" },
    9: { name: "9_", id: "1070389713829109770" },
    10: { name: "10", id: "1070389716534444145" },
    11: { name: "11", id: "1070389718342176828" },
    12: { name: "12", id: "1070389721102032967" },
    13: { name: "13", id: "1070389722855247953" },
    14: { name: "14", id: "1070389725640261662" },
    17: { name: "17", id: "1070389730690207885" },
    18: { name: "18", id: "1070389733949198338" },
    19: { name: "19", id: "1070389735954071702" },
    16: { name: "16", id: "1070389774499725343" },
    20: { name: "20", id: "1070389776001269780" },
    15: { name: "15", id: "1070389778769514596" },
    "∞": { name: "inf", id: "1070389914413310033" },
    100: { name: "100", id: "1070389917299003484" },
    1000000: { name: "1000000", id: "1070389918959943720" },
    X: { name: "X_", id: "1070390632234897458" },
    Y: { name: "Y_", id: "1070390635472883892" },
    Z: { name: "Z_", id: "1070390637033160744" },
    "2/B": { name: "2_B", id: "1070390747783778305" },
    "2/G": { name: "2_G", id: "1070390749818011678" },
    "2/R": { name: "2_R", id: "1070390752594628780" },
    "2/U": { name: "2_U", id: "1070390755450966157" },
    "2/W": { name: "2_W", id: "1070390757069950976" },
    Q: { name: "Q_", id: "1070390960321740921" },
    T: { name: "T_", id: "1070390963442290718" },
    TK: { name: "TK", id: "1070390965069692958" },
    A: { name: "A_", id: "1070390973793832981" },
    C: { name: "C_", id: "1070390976578863225" },
    CHAOS: { name: "CHAOS", id: "1070390978977988680" },
    E: { name: "E_", id: "1070390982597681302" },
    P: { name: "P_", id: "1070390984195723326" },
    PW: { name: "PW", id: "1070390986947170305" },
    "R/G/P": { name: "R_G_P", id: "1070392915316178965" },
    "R/P": { name: "R_P", id: "1070392918642270328" },
    "R/W": { name: "R_W", id: "1070392920550678568" },
    "R/W/P": { name: "R_W_P", id: "1070392924044529694" },
    "U/B": { name: "U_B", id: "1070392927647436800" },
    "U/B/P": { name: "U_B_P", id: "1070392929597804585" },
    "U/P": { name: "U_P", id: "1070392932907102299" },
    "U/R": { name: "U_R", id: "1070392934928764968" },
    "U/R/P": { name: "U_R_P", id: "1070392938414223380" },
    "W/B": { name: "W_B", id: "1070392941794836490" },
    "W/B/P": { name: "W_B_P", id: "1070392944382705775" },
    "W/P": { name: "W_P", id: "1070392946593112074" },
    "W/U": { name: "W_U", id: "1070392949482991637" },
    "W/U/P": { name: "W_U_P", id: "1070392951903101038" },
    "B/G": { name: "B_G", id: "1070392955677986876" },
    "B/G/P": { name: "B_G_P", id: "1070392957498298549" },
    "B/P": { name: "B_P", id: "1070392961612922991" },
    "B/R": { name: "B_R", id: "1070392967342338148" },
    "B/R/P": { name: "B_R_P", id: "1070392971175936033" },
    "G/P": { name: "G_P", id: "1070392973663162429" },
    "G/U": { name: "G_U", id: "1070392977224105994" },
    "G/U/P": { name: "G_U_P", id: "1070392981204512808" },
    "G/W": { name: "G_W", id: "1070392983431688202" },
    "G/W/P": { name: "G_W_P", id: "1070392986610974760" },
    "R/G": { name: "R_G", id: "1070392990033510400" },
    S: { name: "S_", id: "1070393087970508841" },
    HR: { name: "HR", id: "1070393092479406130" },
    HW: { name: "HW", id: "1070393094400397432" }
  }
} as const;
