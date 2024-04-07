import { EMOJI } from "@siamese/emoji";

export enum TTS_LANG {
  KOR = "한국어",
  ENG = "영어",
  JPN = "일본어",
  CHN = "중국어",
  TWN = "대만어",
  SPN = "스페인어",
  KOR_AND_ENG = "한국어 + 영어"
}

export const TTS_FLAG: Record<TTS_LANG, string> = {
  [TTS_LANG.KOR]: EMOJI.FLAGS.KOR,
  [TTS_LANG.ENG]: EMOJI.FLAGS.USA,
  [TTS_LANG.JPN]: EMOJI.FLAGS.JPN,
  [TTS_LANG.CHN]: EMOJI.FLAGS.CHN,
  [TTS_LANG.TWN]: EMOJI.FLAGS.TWN,
  [TTS_LANG.SPN]: EMOJI.FLAGS.SPN,
  [TTS_LANG.KOR_AND_ENG]: EMOJI.FLAGS.KOR
};

export enum TTS_VOICE_TYPE {
  FEMALE = "여성 음색",
  MALE = "남성 음색",
  FEMALE_KID = "아동 음색 (여)",
  MALE_KID = "아동 음색 (남)"
}

export const TTS_VOICES = [
  {
    name: "아라",
    value: "nara",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "아라(상담원)",
    value: "nara_call",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "민영",
    value: "nminyoung",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "예진",
    value: "nyejin",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "미진",
    value: "mijin",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "진호",
    value: "jinho",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "클라라",
    value: "clara",
    lang: TTS_LANG.ENG,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "매트",
    value: "matt",
    lang: TTS_LANG.ENG,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "신지",
    value: "shinji",
    lang: TTS_LANG.JPN,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "메이메이",
    value: "meimei",
    lang: TTS_LANG.CHN,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "량량",
    value: "liangliang",
    lang: TTS_LANG.CHN,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "호세",
    value: "jose",
    lang: TTS_LANG.SPN,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "카르멘",
    value: "carmen",
    lang: TTS_LANG.SPN,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "민상",
    value: "nminsang",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "신우",
    value: "nsinu",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "하준",
    value: "nhajun",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE_KID
  },
  {
    name: "다인",
    value: "ndain",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE_KID
  },
  {
    name: "지윤",
    value: "njiyun",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "수진",
    value: "nsujin",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "진호",
    value: "njinho",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "지훈",
    value: "njihun",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "주안",
    value: "njooahn",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "성훈",
    value: "nseonghoon",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "지환",
    value: "njihwan",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "시윤",
    value: "nsiyoon",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "가람",
    value: "ngaram",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE_KID
  },
  {
    name: "토모코",
    value: "ntomoko",
    lang: TTS_LANG.JPN,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "나오미",
    value: "nnaomi",
    lang: TTS_LANG.JPN,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "나오미(기쁨)",
    value: "dnaomi_joyful",
    lang: TTS_LANG.JPN,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "나오미(뉴스)",
    value: "dnaomi_formal",
    lang: TTS_LANG.JPN,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "리코",
    value: "driko",
    lang: TTS_LANG.JPN,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "에리코",
    value: "deriko",
    lang: TTS_LANG.JPN,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "사유리",
    value: "nsayuri",
    lang: TTS_LANG.JPN,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "고은",
    value: "ngoeun",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "은영",
    value: "neunyoung",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "선경",
    value: "nsunkyung",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "유진",
    value: "nyujin",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "태진",
    value: "ntaejin",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "영일",
    value: "nyoungil",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "승표",
    value: "nseungpyo",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "원탁",
    value: "nwontak",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "아라(화남)",
    value: "dara_ang",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "선희",
    value: "nsunhee",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "민서",
    value: "nminseo",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "지원",
    value: "njiwon",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "보라",
    value: "nbora",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "종현",
    value: "njonghyun",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "준영",
    value: "njoonyoung",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "재욱",
    value: "njaewook",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "안나",
    value: "danna",
    lang: TTS_LANG.ENG,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "조이",
    value: "djoey",
    lang: TTS_LANG.ENG,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "하지메",
    value: "dhajime",
    lang: TTS_LANG.JPN,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "다이키",
    value: "ddaiki",
    lang: TTS_LANG.JPN,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "아유무",
    value: "dayumu",
    lang: TTS_LANG.JPN,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "미오",
    value: "dmio",
    lang: TTS_LANG.JPN,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "차화",
    value: "chiahua",
    lang: TTS_LANG.TWN,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "관린",
    value: "kuanlin",
    lang: TTS_LANG.TWN,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "혜리",
    value: "nes_c_hyeri",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "소현",
    value: "nes_c_sohyun",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "미경",
    value: "nes_c_mikyung",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "기효",
    value: "nes_c_kihyo",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "기서",
    value: "ntiffany",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "늘봄",
    value: "napple",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "드림",
    value: "njangj",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "봄달",
    value: "noyj",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "은서",
    value: "neunseo",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "희라",
    value: "nheera",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "영미",
    value: "nyoungmi",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "나래",
    value: "nnarae",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "예지",
    value: "nyeji",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "유나",
    value: "nyuna",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "경리",
    value: "nkyunglee",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "민정",
    value: "nminjeong",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "이현",
    value: "nihyun",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "래원",
    value: "nraewon",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "규원",
    value: "nkyuwon",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "기태",
    value: "nkitae",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "은우",
    value: "neunwoo",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "경태",
    value: "nkyungtae",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "우식",
    value: "nwoosik",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "아라(pro)",
    value: "vara",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "미경(pro)",
    value: "vmikyung",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "다인(pro)",
    value: "vdain",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "유나(pro)",
    value: "vyuna",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "혜리(pro)",
    value: "vhyeri",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "아라&안나",
    value: "dara-danna",
    lang: TTS_LANG.KOR_AND_ENG,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "신우&매트",
    value: "dsinu-matt",
    lang: TTS_LANG.KOR_AND_ENG,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "마녀 사비나",
    value: "nsabina",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "악마 마몬",
    value: "nmammon",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "야옹이",
    value: "nmeow",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE_KID
  },
  {
    name: "멍멍이",
    value: "nwoof",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE_KID
  },
  {
    name: "박리뷰",
    value: "nreview",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "정영화",
    value: "nyounghwa",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "최무비",
    value: "nmovie",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "상도",
    value: "nsangdo",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "샤샤",
    value: "nshasha",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "이안",
    value: "nian",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "동현",
    value: "ndonghyun",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "이안(pro)",
    value: "vian",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "동현(pro)",
    value: "vdonghyun",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "사유리",
    value: "dsayuri",
    lang: TTS_LANG.JPN,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "토모코",
    value: "dtomoko",
    lang: TTS_LANG.JPN,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "나오미",
    value: "dnaomi",
    lang: TTS_LANG.JPN,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "고은(pro)",
    value: "vgoeun",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.FEMALE
  },
  {
    name: "대성(pro)",
    value: "vdaeseong",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "경준",
    value: "ngyeongjun",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "대성",
    value: "ndaeseong",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  },
  {
    name: "종혁",
    value: "njonghyeok",
    lang: TTS_LANG.KOR,
    type: TTS_VOICE_TYPE.MALE
  }
] satisfies Array<{ name: string, value: string, lang: TTS_LANG, type: TTS_VOICE_TYPE }>;
