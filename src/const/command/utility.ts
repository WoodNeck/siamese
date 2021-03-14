import Josa from "josa-js";

import { dedent } from "~/util/helper";
import { block, code, strong } from "~/util/markdown";
import * as EMOJI from "~/const/emoji";

export const DICE = {
  CMD: "주사위",
  DESC: "n면짜리 주사위를 굴린다냥! (기본값: 100)",
  USAGE: "[n]",
  MIN: 2,
  MAX: 10000,
  DEFAULT: 100,
  MSG: (userName: string, num: number, maxNum: number) => {
    // Korean josa for number 0-9
    const josa = ["이", "이", "가", "이", "가", "가", "이", "이", "이", "가"];
    const numStr = num.toString();
    return `${userName}냥이 주사위를 굴려 🎲${strong(numStr)}${josa[num % 10]} 나왔다냥! (1-${maxNum})`;
  },
  ARG_INCORRECT: (min: number, max: number) => `${min}에서 ${max}사이의 숫자를 달라냥!`
};

export const CHOOSE = {
  CMD: "골라줘",
  DESC: "받은 항목들 중 하나를 임의로 골라준다냥!",
  USAGE: "항목1 항목2 [항목3...]",
  ARG_NOT_SUFFICIENT: (prefix: string) => dedent`
    고를 수 있는 항목을 충분히 달라냥!
    ${block(`> ${prefix}${CHOOSE.CMD} 샴 먼치킨 아비시니안 페르시안 메인쿤`)}`
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
  MENTION_NEEDED: (prefix: string, botName: string) => dedent`
    명령어 대상을 ${code("@멘션")}해서 사용하는 명령어다냥!
    ${block(`> ${prefix}${AVATAR.CMD} @${botName}`)}`,
  MENTION_ONLY_ONE: "한 명의 유저만 멘션해달라냥!"
};

export const TRANSLATE = {
  CMD: "번역",
  DESC: "문장을 번역한다냥!",
  USAGE: "[언어] 문장",
  ALIAS: ["번역해줘"],
  DEFAULT_LANG: "한국어",
  LANGS: {
    "아프리칸스어": "af",
    "알바니아어": "sq",
    "암하라어": "am",
    "아랍어": "ar",
    "아르메니아어": "hy",
    "아제르바이잔어": "az",
    "바스크어": "eu",
    "벨라루스어": "be",
    "벵골어": "bn",
    "보스니아어": "bs",
    "불가리아어": "bg",
    "카탈로니아어": "ca",
    "세부아노": "ceb",
    "체와어": "ny",
    "중국어": "zh-cn",
    "중국어 간체": "zh-cn",
    "중국어 번체": "zh-tw",
    "코르시카어": "co",
    "크로아티아어": "hr",
    "체코어": "cs",
    "덴마크어": "da",
    "네덜란드어": "nl",
    "영어": "en",
    "에스페란토어": "eo",
    "에스토니아어": "et",
    "타갈로그어": "tl",
    "핀란드어": "fi",
    "프랑스어": "fr",
    "프리지아어": "fy",
    "갈리시아어": "gl",
    "조지아어": "ka",
    "독일어": "de",
    "그리스어": "el",
    "구자라트어": "gu",
    "아이티크리올어": "ht",
    "하우사어": "ha",
    "하와이어": "haw",
    "히브리어": "iw",
    "힌디어": "hi",
    "몽어": "hmn",
    "헝가리어": "hu",
    "아이슬란드어": "is",
    "이그보어": "ig",
    "인도네시아어": "id",
    "아일랜드어": "ga",
    "이탈리아어": "it",
    "일본어": "ja",
    "자바어": "jw",
    "칸나다어": "kn",
    "카자흐어": "kk",
    "크메르어": "km",
    "한국어": "ko",
    "쿠르드어": "ku",
    "키르기스어": "ky",
    "라오어": "lo",
    "라틴어": "la",
    "라트비아어": "lv",
    "리투아니아어": "lt",
    "룩셈부르크어": "lb",
    "마케도니아어": "mk",
    "말라가시어": "mg",
    "말레이어": "ms",
    "말라얄람어": "ml",
    "몰타어": "mt",
    "마오리어": "mi",
    "마라티어": "mr",
    "몽골어": "mn",
    "미얀마어": "my",
    "네팔어": "ne",
    "노르웨이어": "no",
    "파슈토어": "ps",
    "페르시아어": "fa",
    "폴란드어": "pl",
    "포르투갈어": "pt",
    "펀자브어": "pa",
    "루마니아어": "ro",
    "러시아어": "ru",
    "사모아어": "sm",
    "스코틀랜드게일어": "gd",
    "세르비아어": "sr",
    "세소토어": "st",
    "쇼나어": "sn",
    "신디어": "sd",
    "신할라어": "si",
    "슬로바키아어": "sk",
    "슬로베니아어": "sl",
    "소말리아어": "so",
    "스페인어": "es",
    "순다어": "su",
    "스와힐리어": "sw",
    "스웨덴어": "sv",
    "타지크어": "tg",
    "타밀어": "ta",
    "텔루구어": "te",
    "태국어": "th",
    "터키어": "tr",
    "우크라이나어": "uk",
    "우르두어": "ur",
    "우즈베크어": "uz",
    "베트남어": "vi",
    "웨일즈어": "cy",
    "코사어": "xh",
    "이디시어": "yi",
    "요루바어": "yo",
    "줄루어": "zu"
  },
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
};
