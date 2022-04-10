import { GuildMember } from "discord.js";
import Josa from "josa-js";

import * as COLOR from "~/const/color";
import * as EMOJI from "~/const/emoji";
import { BUTTON_STYLE } from "~/const/discord";
import { EMOJI as MAHJONG_EMOJI, TILE_TYPE } from "~/const/mahjong";
import MahjongTile from "~/core/game/mahjong/MahjongTile";
import PlayingCard, { CardSymbol, CARD_EMOJI } from "~/core/game/PlayingCard";
import { range, toEmoji } from "~/util/helper";

export const GAME = {
  THREAD_NAME: (gameName: string, id: string) => `${EMOJI.JOYSTICK} ${gameName} (ID ${id})`,
  START_MSG: (gameName: string) => `${EMOJI.JOYSTICK} ${gameName} 게임을 생성한다냥!`,
  READY: (initiator: GuildMember) => `${initiator.toString()}냥, 게임이 준비됐다냥!`,
  SURRENDER: "항복하기",
  NOT_YOUR_TURN: "상대방의 턴이다냥!",
  NOT_IN_GAME: "게임 참가자가 아니다냥!",
  END_BY_TIME: `${EMOJI.STOPWATCH} 플레이어가 반응하지 않아 게임을 끝낸다냥!`,
  END_BY_SURRENDER: (player: GuildMember) => `${EMOJI.WHITE_FLAG} ${Josa.r(player.displayName, "이/가")} 항복했다냥!`,
  WINNER_HEADER: (players: GuildMember[], winner: number) => winner >= 0
    ? `${EMOJI.TROPHY} ${players[winner].displayName}의 승리다냥!`
    : "무승부다냥!",
  PLAYER_HEADER_LABEL: "플레이어",
  JOIN_BTN_LABEL: "참가하기",
  JOIN_PLAYERS_LIST: (players: Array<{ user: GuildMember }>, maxPlayer: number) => `참가자 목록 (${players.length}명 / 최대 ${maxPlayer}명)\n${players.map(player => `${EMOJI.MIDDLE_DOT} ${player.user.displayName}`).join("\n")}`,
  JOIN_FOOTER: (minPlayer: number) => `준비됐으면 시작 버튼을 눌러달라냥! 최소 ${minPlayer}명부터 시작 가능하다냥!`,
  LEAVE_BTN_LABEL: "참가취소",
  GAME_HEADER_LABEL: "게임",
  START_BTN_LABEL: "시작",
  CANCEL_BTN_LABEL: "취소",
  CANCELED: "게임을 취소했다냥!",
  INITIATING_GAME: "게임을 시작한다냥!",
  TURN_HEADER: (player: GuildMember) => `${player.toString()}의 차례다냥!`,
  RECONNECT_TITLE: (players: GuildMember[]) => `${players.map(player => player.toString()).join(", ")}냥, 게임을 계속하려면 재접속이 필요하다냥! 아래 버튼을 눌러달라냥!`,
  RECONNECT_LABEL: "재접속하기",
  RECONNECT_LIST_TITLE: "재접속이 필요한 플레이어들",
  RECONNECT_COMPLETE: "게임을 재개한다냥!",
  SYMBOL: {
    PLAYER: "PLAYER",
    JOIN: "JOIN",
    LEAVE: "LEAVE",
    GAME: "GAME",
    START: "START",
    CANCEL: "CANCEL",
    NEXT_TURN: "NEXT_TURN",
    SKIP: "SKIP",
    SELECT: "SELECT",
    PENALTY: "PENALTY",
    GG: "GG",
    RECONNECT: "RECONNECT"
  }
};

export const OTHELLO = {
  CMD: "오셀로",
  DESC: "상대방을 지정해서 오셀로 게임을 한다냥!",
  USAGE: "@대전상대",
  ALIAS: ["리버시"],
  USAGE_SLASH: "대전상대",
  DESC_SLASH: "대전상대를 지정한다냥!",
  JOIN_MSG_TITLE: (author: GuildMember) => `${EMOJI.CIRCLE.BLUE} ${author.displayName}의 오셀로`,
  TURN_HEADER: (user: GuildMember, playerIdx: number) => `${user.toString()}(${OTHELLO.DISC[playerIdx]})의 차례다냥!`,
  FIELD_TITLE: (players: GuildMember[]) => `${EMOJI.JOYSTICK} ${players[0].displayName}(${OTHELLO.DISC[0]}) VS ${players[1].displayName}(${OTHELLO.DISC[1]})`,
  FIELD_DESC: (players: GuildMember[], whiteCount: number, blackCount: number) => `${OTHELLO.DISC[0]} ${players[0].displayName}: ${whiteCount}\n${OTHELLO.DISC[1]} ${players[1].displayName}: ${blackCount}`,
  DIRECTIONS: [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ],
  DISC: [EMOJI.SMALL_ORANGE_DIAMOND, EMOJI.SMALL_BLUE_DIAMOND],
  DISC_ACTIVE: [
    EMOJI.CIRCLE.ORAGNE,
    EMOJI.CIRCLE.BLUE,
    EMOJI.LARGE_ORANGE_DIAMOND,
    EMOJI.LARGE_BLUE_DIAMOND
  ],
  CANDIDATE_MARKERS: [
    ...range(10).map(val => `${val}${EMOJI.KEYCAP}`),
    ...EMOJI.LETTER
  ]
} as const;

export const YACHT = {
  CMD: "요트",
  DESC: "상대방을 지정해서 요트(Yacht) 게임을 한다냥!",
  USAGE: "@대전상대",
  ALIAS: ["얏찌", "야추"],
  USAGE_SLASH: "대전상대",
  DESC_SLASH: "대전상대를 지정한다냥!",
  JOIN_MSG_TITLE: (author: GuildMember) => `${EMOJI.DICE} ${author.displayName}의 요트`,
  TURN_HEADER: (user: GuildMember) => `${user.toString()}의 차례다냥! 주사위 버튼을 누르면 잠글 수 있다냥!`,
  ALL_LOCKED: "모든 주사위가 잠겨있다냥!",
  NAMES: [
    "Aces",
    "Deuces",
    "Threes",
    "Fours",
    "Fives",
    "Sixes",
    "Choice",
    "Quads",
    "F.House",
    "S.Straight",
    "L.Straight",
    "Yacht"
  ],
  SYMBOL: {
    ROLL: "ROLL",
    EYE: "EYE",
    NEXT_TURN: "NEXT_TURN",
    GG: "GG"
  },
  LABEL: {
    ROLL: (rerollLeft: number) => `주사위 굴리기 (남은 횟수: ${rerollLeft})`
  }
};

export const CONNECT4 = {
  CMD: "사목",
  DESC: "상대방을 지정해서 사목(Connect 4, Four-in-a-Row) 게임을 한다냥!",
  USAGE: "@대전상대",
  ALIAS: ["4목"],
  USAGE_SLASH: "대전상대",
  DESC_SLASH: "대전상대를 지정한다냥!",
  JOIN_MSG_TITLE: (author: GuildMember) => `${EMOJI.CIRCLE.RED} ${author.displayName}의 사목`,
  DIRECTIONS: [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ],
  CIRCLE: {
    [0]: EMOJI.CIRCLE.RED,
    [1]: EMOJI.CIRCLE.YELLOW,
    [2]: EMOJI.HEART.RED,
    [3]: EMOJI.HEART.YELLOW,
    [-1]: EMOJI.CIRCLE.BLACK
  },
  COLOR: {
    [0]: COLOR.RED,
    [1]: COLOR.YELLOW,
    [-1]: COLOR.BLACK
  },
  TURN_HEADER: (user: GuildMember, playerIdx: number) => `${user.toString()}(${CONNECT4.CIRCLE[playerIdx]})의 차례다냥!`
};


export const TICTACTOE = {
  CMD: "틱택토",
  DESC: "상대방을 지정해서 틱택토 게임을 한다냥!",
  USAGE: "@대전상대",
  USAGE_SLASH: "대전상대",
  DESC_SLASH: "대전상대를 지정한다냥!",
  JOIN_MSG_TITLE: (author: GuildMember) => `${EMOJI.OK} ${author.displayName}의 틱택토`,
  MARK: {
    [0]: "O",
    [1]: "X"
  },
  STYLE: {
    [0]: BUTTON_STYLE.PRIMARY,
    [1]: BUTTON_STYLE.DANGER
  },
  TURN_HEADER: (user: GuildMember, playerIdx: number) => `${user.toString()}(${TICTACTOE.MARK[playerIdx]})의 차례다냥!`
};

export const ONECARD = {
  CMD: "원카드",
  DESC: "원카드 게임을 한다냥!",
  JOIN_MSG_TITLE: (author: GuildMember) => `${EMOJI.JOKER} ${author.displayName}의 원카드`,
  TAKE_PENALTY: (user: GuildMember, added: number, cardCount: number) => `${user.toString()}가 카드를 ${added}장 추가하고 턴을 넘긴다냥 (현재 카드 수: ${cardCount})`,
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
  ].join("\n"),
  INITIAL_CARD: 5,
  CARD_LEFT: (count: number) => `남은 카드 수: ${count}`,
  TURN_HEADER: (player: GuildMember) => `${player.toString()}냥, 낼 카드를 선택해달라냥!`,
  CHANGE_HEADER: (player: GuildMember) => `${player.toString()}냥, 바꿀 무늬를 선택해달라냥!`,
  WINNER_HEADER: (winner: GuildMember, lastCard: PlayingCard) => `${EMOJI.TROPHY} ${winner.displayName}의 승리다냥! (${lastCard.getEmoji()}${lastCard.getName()})`,
  LABEL: {
    DEFEATED: "파산",
    SKIP: (count: number) => `${count}장 먹기`
  }
} as const;

export const LADDER = {
  CMD: "사다리",
  DESC: "사다리 게임을 한다냥!",
  USAGE: "당첨1 당첨2 당첨3...",
  SLASH_USAGE: "당첨항목들",
  USAGE_DESC: "당첨 항목들을 띄어쓰기로 구분해서 달라냥!",
  ALIAS: ["사다리게임", "사다리타기"],
  JOIN_MSG_TITLE: (author: GuildMember) => `${EMOJI.LADDER} ${author.displayName}의 사다리게임`,
  ARG_NOT_IN_RANGE: "고를 수 있는 당첨항목이 너무 적거나 많다냥! 2~9개 사이의 당첨항목을 달라냥!",
  NUMBER_URL: [
    "https://discord.com/assets/68546f5fc3b2166f42cf90b7e23c5ae9.svg",
    "https://discord.com/assets/eb29ce5fcf54bc3b23ff77039a4ecf3c.svg",
    "https://discord.com/assets/67f896405747f26f63f09e0cb048d358.svg",
    "https://discord.com/assets/09fe8a2882cac4cdb4712ab9622d3fe1.svg",
    "https://discord.com/assets/5575865e2cb3d50ea051b09d7e1d2550.svg",
    "https://discord.com/assets/f8b3e0e54d99d2b2962a2e474b2110e4.svg",
    "https://discord.com/assets/c5ef2ff553f9cecd81add57e79aaf81d.svg",
    "https://discord.com/assets/71de2e3efd19455f1c63b9bd00329ec5.svg",
    "https://discord.com/assets/488cb48b4a6952b728df8bbe99fdbb20.svg"
  ],
  SHOW_RESULT: "전체 결과 보기",
  RESULT_SENT_ALREADY: "그 결과는 이미 표시했다냥!"
} as const;

export const MAHJONG = {
  CMD: "마작",
  DESC: "리치마작을 플레이한다냥!",
  JOIN_MSG_TITLE: (author: GuildMember) => `${EMOJI.MAHJONG} ${author.displayName}의 작탁`,
  PLAYER_FIELD_TITLE: (user: GuildMember, wind: number, postfix: string = "") => {
    const windEmoji = MAHJONG_EMOJI[TILE_TYPE.KAZE][wind];
    return `${toEmoji(windEmoji.name, windEmoji.id)}${user.displayName}${postfix}`;
  },
  PLAYER_FIELD_OVERFLOW_TITLE: (user: GuildMember, wind: number) => {
    const windEmoji = MAHJONG_EMOJI[TILE_TYPE.KAZE][wind];
    return `${toEmoji(windEmoji.name, windEmoji.id)}${user.displayName}의 버림패 (계속)`;
  },
  TILES_LEFT: (count: number) => `남은 패 수: ${count}`,
  DISCARD_TITLE: (user: GuildMember) => `${user.displayName}의 타패다냥!`,
  RIICHI_TITLE: (user: GuildMember) => `${user.displayName}의 리치냥!`,
  CHI_TITLE: (user: GuildMember) => `${user.displayName}의 치다냥!`,
  PONG_TITLE: (user: GuildMember) => `${user.displayName}의 퐁이다냥!`,
  KANG_TITLE: (user: GuildMember) => `${user.displayName}의 깡이다냥!`,
  TSUMO_TITLE: (user: GuildMember, lastTile: MahjongTile) => `${lastTile.getEmoji()} ${user.displayName}의 쯔모다냥!`,
  RON_TITLE: (user: GuildMember, lastTile: MahjongTile) => `${lastTile.getEmoji()} ${user.displayName}의 론이다냥!`,
  NAGASHI_MANGWAN_TITLE: (user: GuildMember) => `${user.displayName}의 유국만관이다냥!`,
  SCORE_FORMAT: (score: number, subscore: number) => `${score}판 ${subscore}부`,
  FINAL_RANK_TITLE: `${EMOJI.TROPHY} 최종 순위다냥!`,
  WAITING_OTHER_PLAYER: "다른 플레이어를 기다리는 중이다냥...",
  YAKU_TITLE: "역",
  DORA_INDICATOR_TITLE: "도라표시패",
  ROUND_FORMAT: (wind: number, roundWind: number, windRepeat: number) => {
    const windEmojiData = MAHJONG_EMOJI[TILE_TYPE.KAZE][wind];
    const windEmoji = toEmoji(windEmojiData.name, windEmojiData.id);

    return `${windEmoji} 동${roundWind + 1}국${windRepeat > 0 ? ` ${windRepeat}본장` : ""}`;
  },
  RESULT_FOOTER: `${EMOJI.STOPWATCH} 10초 뒤 다음 게임을 시작한다냥!`,
  END_ROUND_TITLE: "유국이다냥!",
  END_BY_KANG_TITLE: "유국이다냥! (사깡산료)",
  RIICHI_BAR: [
    MAHJONG_EMOJI.RIICHI[0],
    MAHJONG_EMOJI.RIICHI[1],
    MAHJONG_EMOJI.RIICHI[0]
  ].map(emoji => toEmoji(emoji.name, emoji.id)).join(""),
  RIICHI_BAR_LONG: [
    MAHJONG_EMOJI.RIICHI[0],
    MAHJONG_EMOJI.RIICHI[0],
    MAHJONG_EMOJI.RIICHI[1],
    MAHJONG_EMOJI.RIICHI[0],
    MAHJONG_EMOJI.RIICHI[0]
  ].map(emoji => toEmoji(emoji.name, emoji.id)).join(""),
  POINT: (point: number) => `${point}점`,
  TENPAI_TITLE: "현재 대기패",
  LABEL: {
    CHI: "치",
    PON: "퐁",
    KANG: "깡",
    RIICHI: "리치",
    TSUMO: "쯔모",
    RON: "론",
    TENPAI: "텐파이",
    NO_TENPAI: "노텐",
    SKIP: "스킵",
    FURITEN: "후리텐"
  },
  SYMBOL: {
    CHI: "CHI",
    PON: "PON",
    KANG: "KANG",
    RIICHI: "RIICHI",
    TSUMO: "TSUMO",
    RON: "RON",
    DISCARD: "DISCARD",
    SKIP: "SKIP"
  }
} as const;
