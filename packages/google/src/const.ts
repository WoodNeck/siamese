export const IMAGE_SEARCH_PARAMS = (isSafeSearch: boolean) => {
  const commonParams = {
    // nfpr: disable auto query correction(ex: museuk -> museum)
    nfpr: "1"
  };

  // safe: enable safe searching
  const additionalParams = isSafeSearch
    ? {
      safe: "active"
    }
    : {
      hl: "ko",
      gl: "us"
    };

  return {
    ...commonParams,
    ...additionalParams
  };
};

export const FAKE_HEADER = {
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
};
export const SEARCH_URL = "https://www.google.com/search";
export const SEARCH_MAX_PAGE = 3;
export const SEARCH_PARAMS = (searchText: string, isNSFW: boolean) => {
  const commonParams = {
    q: searchText,
    hl: "ko",
    nfpr: "1"
  };

  return isNSFW
    ? {
      ...commonParams,
      gl: "us"
    }
    : {
      ...commonParams
    };
};

export const IMAGE_BLACKLIST = [
  /^https?:\/\/i.namu.wiki/
];

export const TRANSLATE_LANGS: Record<string, string> = {
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
  "중국어": "zh-CN",
  "중국어간체": "zh-CN",
  "중국어번체": "zh-TW",
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
};
