import { range } from "~/util/helper";

export const TILE_TYPE = {
  MAN: 0,
  PIN: 1,
  SOU: 2,
  KAZE: 3,
  SANGEN: 4
} as const;

export const WIND = {
  EAST: 0,
  SOUTH: 1,
  WEST: 2,
  NORTH: 3
} as const;

export const BODY_TYPE = {
  ORDERED: 0,
  SAME: 1,
  KANG: 2
} as const;

export const DATA = {
  MAN: range(9).map(index => ({ type: TILE_TYPE.MAN, index })),
  PIN: range(9).map(index => ({ type: TILE_TYPE.PIN, index })),
  SOU: range(9).map(index => ({ type: TILE_TYPE.SOU, index })),
  KAZE: range(4).map(index => ({ type: TILE_TYPE.KAZE, index })),
  SANGEN: range(3).map(index => ({ type: TILE_TYPE.SANGEN, index }))
} as const;

export const EMOJI = {
  [TILE_TYPE.MAN]: [
    { name: "man1", id: "957691326986596454" },
    { name: "man2", id: "957691327217303624" },
    { name: "man3", id: "957691327028531231" },
    { name: "man4", id: "957691327296983040" },
    { name: "man5", id: "957691327355695154" },
    { name: "man6", id: "957691327401828392" },
    { name: "man7", id: "957691327305351189" },
    { name: "man8", id: "957691328341356604" },
    { name: "man9", id: "957691327544426587" }
  ],
  [TILE_TYPE.PIN]: [
    { name: "pin1", id: "957691328039354448" },
    { name: "pin2", id: "957691328005820446" },
    { name: "pin3", id: "957691327494098984" },
    { name: "pin4", id: "957691327544438784" },
    { name: "pin5", id: "957691327812878367" },
    { name: "pin6", id: "957691327443791923" },
    { name: "pin7", id: "957691328051937360" },
    { name: "pin8", id: "957691327569608714" },
    { name: "pin9", id: "957691328324599819" }
  ],
  [TILE_TYPE.SOU]: [
    { name: "sou1", id: "957691327678652436" },
    { name: "sou2", id: "957691327791906826" },
    { name: "sou3", id: "957691327573803099" },
    { name: "sou4", id: "957691327401828422" },
    { name: "sou5", id: "957691327544442930" },
    { name: "sou6", id: "957691328060342272" },
    { name: "sou7", id: "957691327225663550" },
    { name: "sou8", id: "957691327536050226" },
    { name: "sou9", id: "957691328043569222" }
  ],
  [TILE_TYPE.KAZE]: [
    { name: "ton", id: "957691327557025802" },
    { name: "nan", id: "957691327712211055" },
    { name: "sha", id: "957691327565410404" },
    { name: "pei", id: "957691327565398036" }
  ],
  [TILE_TYPE.SANGEN]: [
    { name: "haku", id: "957691327145992233" },
    { name: "hatsu", id: "957691327145967617" },
    { name: "chun", id: "957691327112433694" }
  ],
  DORA: {
    [TILE_TYPE.MAN]: { name: "man5dora", id: "957691327187923015" },
    [TILE_TYPE.PIN]: { name: "pin5dora", id: "957691327825453147" },
    [TILE_TYPE.SOU]: { name: "sou5dora", id: "957691328295211028" }
  },
  BACK: { name: "tile", id: "957691326932062239" }
} as const;

export const EMOJI_ROTATED = {
  [TILE_TYPE.MAN]: [
    { name: "man1_rot", id: "957863441308209192" },
    { name: "man2_rot", id: "957863441245294632" },
    { name: "man3_rot", id: "957863441085906944" },
    { name: "man4_rot", id: "957863441341759558" },
    { name: "man5_rot", id: "957863441098502164" },
    { name: "man6_rot", id: "957863441173983242" },
    { name: "man7_rot", id: "957863441228509194" },
    { name: "man8_rot", id: "957863441211731998" },
    { name: "man9_rot", id: "957863441270472754" }
  ],
  [TILE_TYPE.PIN]: [
    { name: "pin1_rot", id: "957863441522122762" },
    { name: "pin2_rot", id: "957863441329160254" },
    { name: "pin3_rot", id: "957863441601794048" },
    { name: "pin4_rot", id: "957863441606013018" },
    { name: "pin5_rot", id: "957863442012844102" },
    { name: "pin6_rot", id: "957863441517916180" },
    { name: "pin7_rot", id: "957863441899610142" },
    { name: "pin8_rot", id: "957863441324974151" },
    { name: "pin9_rot", id: "957863442402930749" }
  ],
  [TILE_TYPE.SOU]: [
    { name: "sou1_rot", id: "957863441295609966" },
    { name: "sou2_rot", id: "957863441312403456" },
    { name: "sou3_rot", id: "957863441371136072" },
    { name: "sou4_rot", id: "957863441270448169" },
    { name: "sou5_rot", id: "957863441459200020" },
    { name: "sou6_rot", id: "957863441530503228" },
    { name: "sou7_rot", id: "957863441576628224" },
    { name: "sou8_rot", id: "957863441698279424" },
    { name: "sou9_rot", id: "957863441450811422" }
  ],
  [TILE_TYPE.KAZE]: [
    { name: "ton_rot", id: "957863441526312990" },
    { name: "nan_rot", id: "957863441178193970" },
    { name: "sha_rot", id: "957863441241083924" },
    { name: "pei_rot", id: "957863441161388083" }
  ],
  [TILE_TYPE.SANGEN]: [
    { name: "haku_rot", id: "957863441043968000" },
    { name: "hatsu_rot", id: "957863440733573181" },
    { name: "chun_rot", id: "957863440700035073" }
  ],
  DORA: {
    [TILE_TYPE.MAN]: { name: "man5dora_rot", id: "957863440855220255" },
    [TILE_TYPE.PIN]: { name: "pin5dora_rot", id: "957863441358524468" },
    [TILE_TYPE.SOU]: { name: "sou5dora_rot", id: "957863441660526663" }
  }
} as const;

export const EMOJI_GRAYSCALE = {
  [TILE_TYPE.MAN]: [
    { name: "man1_gs", id: "957865725173841961" },
    { name: "man2_gs", id: "957865725316440076" },
    { name: "man3_gs", id: "957865725714903121" },
    { name: "man4_gs", id: "957865725584883722" },
    { name: "man5_gs", id: "957865725442265109" },
    { name: "man6_gs", id: "957865725350010923" },
    { name: "man7_gs", id: "957865725580693534" },
    { name: "man8_gs", id: "957865725601669120" },
    { name: "man9_gs", id: "957865725815578644" }
  ],
  [TILE_TYPE.PIN]: [
    { name: "pin1_gs", id: "957865725802991666" },
    { name: "pin2_gs", id: "957865725542957057" },
    { name: "pin3_gs", id: "957865725895278592" },
    { name: "pin4_gs", id: "957865726104973312" },
    { name: "pin5_gs", id: "957865725991731220" },
    { name: "pin6_gs", id: "957865725538754581" },
    { name: "pin7_gs", id: "957865726146928680" },
    { name: "pin8_gs", id: "957865725924614194" },
    { name: "pin9_gs", id: "957865726281146449" }
  ],
  [TILE_TYPE.SOU]: [
    { name: "sou1_gs", id: "957865726193053717" },
    { name: "sou2_gs", id: "957865725798785084" },
    { name: "sou3_gs", id: "957865725651988511" },
    { name: "sou4_gs", id: "957865725555531838" },
    { name: "sou5_gs", id: "957865726121766982" },
    { name: "sou6_gs", id: "957865726264352838" },
    { name: "sou7_gs", id: "957865725857501254" },
    { name: "sou8_gs", id: "957865725928833035" },
    { name: "sou9_gs", id: "957865725903638539" }
  ],
  [TILE_TYPE.KAZE]: [
    { name: "ton_gs", id: "957865725899456512" },
    { name: "nan_gs", id: "957865725563899944" },
    { name: "sha_gs", id: "957865725790396506" },
    { name: "pei_gs", id: "957865725572288572" }
  ],
  [TILE_TYPE.SANGEN]: [
    { name: "haku_gs", id: "957865725282889829" },
    { name: "hatsu_gs", id: "957865725429698591" },
    { name: "chun_gs", id: "957865725857521674" }
  ],
  DORA: {
    [TILE_TYPE.MAN]: { name: "man5dora_gs", id: "957865725639417866" },
    [TILE_TYPE.PIN]: { name: "pin5dora_gs", id: "957865726113357844" },
    [TILE_TYPE.SOU]: { name: "sou5dora_gs", id: "957865725849112636" }
  }
} as const;

export const YAKU = {
  MENZEN_TSUMO: "멘젠쯔모",
  RIICHI: "리치",
  ONE_SHOT: "일발",
  SEVEN_PAIRS: "치또이쯔",
  PINGHU: "핑후",
  ONE_PEKO: "이페코",
  YAKUHAI: "역패",
  TANGYAO: "탕야오",
  LINSHANG: "영상개화",
  CHANGKANG: "창깡",
  HAITEI_MOON: "해저로월",
  HAITEI_FISH: "하저로어",
  THREE_COLOR_STRAIGHT: "삼색동순",
  STRAIGHT: "일기통관",
  CHANTA: "찬타",
  TOITOI: "또이또이",
  THREE_CLOSED: "삼암각",
  THREE_COLOR_TRIPLET: "삼색동각",
  LITTLE_THREE_DRAGON: "소삼원",
  HONNODU: "혼노두",
  THREE_QUADS: "삼공자",
  TWO_PEKO: "량페코",
  JUN_CHANTA: "준찬타",
  HALF_FLUSH: "혼일색",
  FLUSH: "청일색",
  FOUR_CLOSED: "사암각",
  THIRTEEN_ORPHANS: "국사무쌍",
  NINE_GATES: "구련보등",
  ALL_GREENS: "녹일색",
  ALL_WORDS: "자일색",
  ALL_TERMINALS: "청노두",
  BIG_THREE_DRAGON: "대삼원",
  LITTLE_FOUR_WINDS: "소사희",
  BIG_FOUR_WINDS: "대사희",
  FOUR_QUADS: "사공자"
} as const;
