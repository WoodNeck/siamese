import { UserUsage, type CommandOptions, PERMISSION } from "@siamese/core";
import { EMOJI } from "@siamese/emoji";
import { CARD_EMOJI, CardSymbol } from "@siamese/minigame";
import { User } from "discord.js";

import { CATEGORY } from "../../const/category";

export const MINIGAME_PERMISSIONS = [
  PERMISSION.CREATE_PUBLIC_THREADS,
  PERMISSION.SEND_MESSAGES_IN_THREADS,
  PERMISSION.MANAGE_THREADS
];

export const CONNECT4 = {
  CMD: "사목",
  DESC: "상대방을 지정해서 사목(Connect 4, Four-in-a-Row) 게임을 한다냥!",
  CATEGORY: CATEGORY.MINIGAME,
  USAGE: [
    new UserUsage({
      name: "대전상대",
      description: "대전상대를 지정한다냥!",
      optional: true
    })
  ],
  ALIASES: ["4목"],
  JOIN_MSG_TITLE: (author: User) => `${EMOJI.CIRCLE.RED} ${author.displayName}의 사목`
} satisfies CommandOptions;

export const CONNECT5 = {
  CMD: "오목",
  DESC: "상대방을 지정해서 오목을 한다냥!",
  CATEGORY: CATEGORY.MINIGAME,
  USAGE: [
    new UserUsage({
      name: "대전상대",
      description: "대전상대를 지정한다냥!",
      optional: true
    })
  ],
  JOIN_MSG_TITLE: (author: User) => `${EMOJI.CIRCLE.WHITE} ${author.displayName}의 오목`
} satisfies CommandOptions;

export const OTHELLO = {
  CMD: "오셀로",
  DESC: "상대방을 지정해서 오셀로 게임을 한다냥!",
  CATEGORY: CATEGORY.MINIGAME,
  USAGE: [
    new UserUsage({
      name: "대전상대",
      description: "대전상대를 지정한다냥!",
      optional: true
    })
  ],
  ALIASES: ["리버시"],
  JOIN_MSG_TITLE: (author: User) => `${EMOJI.CIRCLE.BLUE} ${author.displayName}의 오셀로`
} satisfies CommandOptions;

export const YACHT = {
  CMD: "요트",
  DESC: "상대방을 지정해서 요트(Yacht) 게임을 한다냥!",
  CATEGORY: CATEGORY.MINIGAME,
  USAGE: [
    new UserUsage({
      name: "대전상대",
      description: "대전상대를 지정한다냥!",
      optional: true
    })
  ],
  ALIASES: ["얏찌", "야추"],
  JOIN_MSG_TITLE: (author: User) => `${EMOJI.DICE} ${author.displayName}의 요트`
} satisfies CommandOptions;

export const TICTACTOE = {
  CMD: "틱택토",
  DESC: "상대방을 지정해서 틱택토 게임을 한다냥!",
  CATEGORY: CATEGORY.MINIGAME,
  USAGE: [
    new UserUsage({
      name: "대전상대",
      description: "대전상대를 지정한다냥!",
      optional: true
    })
  ],
  JOIN_MSG_TITLE: (author: User) => `${EMOJI.OK} ${author.displayName}의 틱택토`
} satisfies CommandOptions;

export const ONECARD = {
  CMD: "원카드",
  DESC: "원카드 게임을 한다냥!",
  CATEGORY: CATEGORY.MINIGAME,
  JOIN_MSG_TITLE: (author: User) => `${EMOJI.JOKER} ${author.displayName}의 원카드`,
  TAKE_PENALTY: (user: User, added: number, cardCount: number) => `${user}가 카드를 ${added}장 추가하고 턴을 넘긴다냥 (현재 카드 수: ${cardCount})`,
  HELP_TITLE: "원카드 도움말",
  HELP_DESC: [
    "들고 있는 카드를 가장 먼저 없애는 사람이 승리한다냥!",
    "자기 차례에는 같은 무늬나 같은 숫자의 카드만 낼 수 있다냥!",
    "자기 차례에 낼 카드가 없다면 카드를 한 장 추가해야 한다냥!"
  ].map(desc => `${EMOJI.MIDDLE_DOT} ${desc}`).join("\n"),
  HELP_SPECIAL_TITLE: "특수 카드들",
  HELP_SPECIAL_DESC: [
    `${CARD_EMOJI[CardSymbol.SPADE]} 숫자 7 - 원하는 무늬로 변경할 수 있다냥`,
    `${CARD_EMOJI[CardSymbol.SPADE]} J - 한 사람을 건너 뛴다냥`,
    `${CARD_EMOJI[CardSymbol.SPADE]} Q - 진행 방향을 반대로 변경한다냥`,
    `${CARD_EMOJI[CardSymbol.JOKER]} 숫자 2, A, Joker - 공격 카드, 상대방의 공격은 더 강한 카드로만 막을 수 있으며, 막을 카드가 없으면 여러 장의 카드를 받게 된다냥 (각각 2장, 3장, 5장 추가)`
  ].join("\n"),
  HELP_DEFEAT_TITLE: "파산 조건",
  HELP_DEFEAT_DESC: [
    "플레이어 수에 따라 다음 카드 개수 이상의 카드를 보유하게 되면 파산하며, 자동으로 패배한다냥",
    `${CARD_EMOJI[CardSymbol.DIAMOND]} 2명 - 20장`,
    `${CARD_EMOJI[CardSymbol.HEART]} 3명 - 19장`,
    `${CARD_EMOJI[CardSymbol.CLUB]} 4명 - 14장`
  ].join("\n")
} satisfies CommandOptions;

// export const LADDER = {
//   CMD: "사다리",
//   DESC: "사다리 게임을 한다냥!",
//   CATEGORY: CATEGORY.MINIGAME,
//   USAGE: "당첨1 당첨2 당첨3...",
//   SLASH_USAGE: "당첨항목들",
//   USAGE_DESC: "당첨 항목들을 띄어쓰기로 구분해서 달라냥!",
//   ALIAS: ["사다리게임", "사다리타기"],
//   JOIN_MSG_TITLE: (author: GuildMember) => `${EMOJI.LADDER} ${author.displayName}의 사다리게임`,
//   ARG_NOT_IN_RANGE: "고를 수 있는 당첨항목이 너무 적거나 많다냥! 2~9개 사이의 당첨항목을 달라냥!",
//   NUMBER_URL: [
//     "https://discord.com/assets/68546f5fc3b2166f42cf90b7e23c5ae9.svg",
//     "https://discord.com/assets/eb29ce5fcf54bc3b23ff77039a4ecf3c.svg",
//     "https://discord.com/assets/67f896405747f26f63f09e0cb048d358.svg",
//     "https://discord.com/assets/09fe8a2882cac4cdb4712ab9622d3fe1.svg",
//     "https://discord.com/assets/5575865e2cb3d50ea051b09d7e1d2550.svg",
//     "https://discord.com/assets/f8b3e0e54d99d2b2962a2e474b2110e4.svg",
//     "https://discord.com/assets/c5ef2ff553f9cecd81add57e79aaf81d.svg",
//     "https://discord.com/assets/71de2e3efd19455f1c63b9bd00329ec5.svg",
//     "https://discord.com/assets/488cb48b4a6952b728df8bbe99fdbb20.svg"
//   ],
//   SHOW_RESULT: "전체 결과 보기",
//   RESULT_SENT_ALREADY: "그 결과는 이미 표시했다냥!"
// } satisfies CommandOptions;

// export const MAHJONG = {
//   CMD: "마작",
//   DESC: "리치마작을 플레이한다냥!",
//   CATEGORY: CATEGORY.MINIGAME,
//   JOIN_MSG_TITLE: (author: GuildMember) => `${EMOJI.MAHJONG} ${author.displayName}의 작탁`,
//   PLAYER_FIELD_TITLE: (user: GuildMember, wind: number, postfix: string = "") => {
//     const windEmoji = MAHJONG_EMOJI[TILE_TYPE.KAZE][wind];
//     return `${toEmoji(windEmoji.name, windEmoji.id)}${user.displayName}${postfix}`;
//   },
//   PLAYER_FIELD_OVERFLOW_TITLE: (user: GuildMember, wind: number) => {
//     const windEmoji = MAHJONG_EMOJI[TILE_TYPE.KAZE][wind];
//     return `${toEmoji(windEmoji.name, windEmoji.id)}${user.displayName}의 버림패 (계속)`;
//   },
//   TILES_LEFT: (count: number) => `남은 패 수: ${count}`,
//   DISCARD_TITLE: (user: GuildMember) => `${user.displayName}의 타패다냥!`,
//   RIICHI_TITLE: (user: GuildMember) => `${user.displayName}의 리치냥!`,
//   CHI_TITLE: (user: GuildMember) => `${user.displayName}의 치다냥!`,
//   PONG_TITLE: (user: GuildMember) => `${user.displayName}의 퐁이다냥!`,
//   KANG_TITLE: (user: GuildMember) => `${user.displayName}의 깡이다냥!`,
//   TSUMO_TITLE: (user: GuildMember, lastTile: MahjongTile) => `${lastTile.getEmoji()} ${user.displayName}의 쯔모다냥!`,
//   RON_TITLE: (user: GuildMember, lastTile: MahjongTile) => `${lastTile.getEmoji()} ${user.displayName}의 론이다냥!`,
//   NAGASHI_MANGWAN_TITLE: (user: GuildMember) => `${user.displayName}의 유국만관이다냥!`,
//   SCORE_FORMAT: (score: number, subscore: number) => `${score}판 ${subscore}부`,
//   FINAL_RANK_TITLE: `${EMOJI.TROPHY} 최종 순위다냥!`,
//   WAITING_OTHER_PLAYER: "다른 플레이어를 기다리는 중이다냥...",
//   YAKU_TITLE: "역",
//   DORA_INDICATOR_TITLE: "도라표시패",
//   ROUND_FORMAT: (wind: number, roundWind: number, windRepeat: number) => {
//     const windEmojiData = MAHJONG_EMOJI[TILE_TYPE.KAZE][wind];
//     const windEmoji = toEmoji(windEmojiData.name, windEmojiData.id);

//     return `${windEmoji} 동${roundWind + 1}국${windRepeat > 0 ? ` ${windRepeat}본장` : ""}`;
//   },
//   RESULT_FOOTER: `${EMOJI.STOPWATCH} 10초 뒤 다음 게임을 시작한다냥!`,
//   END_ROUND_TITLE: "유국이다냥!",
//   END_BY_KANG_TITLE: "유국이다냥! (사깡산료)",
//   RIICHI_BAR: [
//     MAHJONG_EMOJI.RIICHI[0],
//     MAHJONG_EMOJI.RIICHI[1],
//     MAHJONG_EMOJI.RIICHI[0]
//   ].map(emoji => toEmoji(emoji.name, emoji.id)).join(""),
//   RIICHI_BAR_LONG: [
//     MAHJONG_EMOJI.RIICHI[0],
//     MAHJONG_EMOJI.RIICHI[0],
//     MAHJONG_EMOJI.RIICHI[1],
//     MAHJONG_EMOJI.RIICHI[0],
//     MAHJONG_EMOJI.RIICHI[0]
//   ].map(emoji => toEmoji(emoji.name, emoji.id)).join(""),
//   POINT: (point: number) => `${point}점`,
//   TENPAI_TITLE: "현재 대기패",
//   LABEL: {
//     CHI: "치",
//     PON: "퐁",
//     KANG: "깡",
//     RIICHI: "리치",
//     TSUMO: "쯔모",
//     RON: "론",
//     TENPAI: "텐파이",
//     NO_TENPAI: "노텐",
//     SKIP: "스킵",
//     FURITEN: "후리텐"
//   },
//   SYMBOL: {
//     CHI: "CHI",
//     PON: "PON",
//     KANG: "KANG",
//     RIICHI: "RIICHI",
//     TSUMO: "TSUMO",
//     RON: "RON",
//     DISCARD: "DISCARD",
//     SKIP: "SKIP"
//   }
// } satisfies CommandOptions;
