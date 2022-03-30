import { GuildMember } from "discord.js";
import Josa from "josa-js";

import * as COLOR from "~/const/color";
import * as EMOJI from "~/const/emoji";
import { EMOJI as MAHJONG_EMOJI, TILE_TYPE } from "~/const/mahjong";
import MahjongTile from "~/core/game/mahjong/MahjongTile";
import { range, toEmoji } from "~/util/helper";

export const GAME = {
  THREAD_NAME: (gameName: string, id: string) => `${EMOJI.JOYSTICK} ${gameName} (ID ${id})`,
  THREAD_1VS1_NAME: (gameName: string, p1: string, p2: string, id: string) => `${EMOJI.JOYSTICK} ${gameName}: ${p1} VS ${p2} (ID ${id})`,
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
  RECONNECT_TITLE: (player: GuildMember) => `${player.toString()}냥, 게임을 계속하려면 재접속이 필요하다냥! 아래 버튼을 눌러달라냥!`,
  RECONNECT_LABEL: "갱신하기",
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

export const CARD_SYMBOL = {
  [0]: "A",
  [10]: "J",
  [11]: "Q",
  [12]: "K",
  JOKER: "JOKER"
};

export const CARD_URL = {
  BASE: "https://cdn.discordapp.com/attachments/817765838001668116",
  SPADE: [
    "/955447542299131954/ace_of_spades.png",
    "/955447542504624149/2_of_spades.png",
    "/955447542735331368/3_of_spades.png",
    "/955447543108616202/4_of_spades.png",
    "/955447543477698600/5_of_spades.png",
    "/955447543695810570/6_of_spades.png",
    "/955447543905529917/7_of_spades.png",
    "/955447544127832105/8_of_spades.png",
    "/955447544337530890/9_of_spades.png",
    "/955447544564027452/10_of_spades.png",
    "/955447981245607966/jack_of_spades2.png",
    "/955447980956192808/queen_of_spades2.png",
    "/955447980599681054/king_of_spades2.png"
  ],
  HEART: [
    "/955448910007111680/ace_of_hearts.png",
    "/955448910195871764/2_of_hearts.png",
    "/955448910384595035/3_of_hearts.png",
    "/955448910560788510/4_of_hearts.png",
    "/955448910816620634/5_of_hearts.png",
    "/955448911022133330/6_of_hearts.png",
    "/955448911252836393/7_of_hearts.png",
    "/955448911521259590/8_of_hearts.png",
    "/955448911814864926/9_of_hearts.png",
    "/955449218363973632/10_of_hearts.png",
    "/955449218703699988/jack_of_hearts2.png",
    "/955449218124902460/queen_of_hearts2.png",
    "/955449217810305075/king_of_hearts2.png"
  ],
  DIAMOND: [
    "/955449542915022868/ace_of_diamonds.png",
    "/955449543237971998/2_of_diamonds.png",
    "/955449543489650688/3_of_diamonds.png",
    "/955449543934218300/4_of_diamonds.png",
    "/955449544169119764/5_of_diamonds.png",
    "/955449544475279390/6_of_diamonds.png",
    "/955449544827629658/7_of_diamonds.png",
    "/955449546853466142/8_of_diamonds.png",
    "/955449547184824380/9_of_diamonds.png",
    "/955449589668937799/10_of_diamonds.png",
    "/955449589882822686/jack_of_diamonds2.png",
    "/955449589471776798/queen_of_diamonds2.png",
    "/955449589266251796/king_of_diamonds2.png"
  ],
  CLUB: [
    "/955448208304259092/ace_of_clubs.png",
    "/955448208513966151/2_of_clubs.png",
    "/955448208774025226/3_of_clubs.png",
    "/955448209096982548/4_of_clubs.png",
    "/955448209327656991/5_of_clubs.png",
    "/955448209705152532/6_of_clubs.png",
    "/955448210036523008/7_of_clubs.png",
    "/955448210283958313/8_of_clubs.png",
    "/955448210648866836/9_of_clubs.png",
    "/955448208094547988/10_of_clubs.png",
    "/955448538886709319/jack_of_clubs2.png",
    "/955448538588909648/queen_of_clubs2.png",
    "/955448538203054100/king_of_clubs2.png"
  ],
  JOKER: [
    "/955457158491832420/black_joker.png",
    "/955457158827356180/red_joker.png"
  ]
};

export const OTHELLO = {
  CMD: "오셀로",
  DESC: "오셀로 게임을 플레이한다냥!",
  USAGE: "@대전상대",
  ALIAS: ["리버시"],
  USAGE_SLASH: "대전상대",
  DESC_SLASH: "대전상대를 지정한다냥!",
  THREAD_NAME: (p1: string, p2: string, id: string) => `${EMOJI.JOYSTICK} 오셀로: ${p1} VS ${p2} (ID ${id})`,
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
  ],
  SYMBOL: {
    NEXT_TURN: "NEXT_TURN",
    GG: "GG"
  }
} as const;

export const YACHT = {
  CMD: "요트",
  DESC: "요트(Yacht) 게임을 플레이한다냥!",
  USAGE: "@대전상대",
  ALIAS: ["얏찌", "야추"],
  USAGE_SLASH: "대전상대",
  DESC_SLASH: "대전상대를 지정한다냥!",
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
  DESC: "사목(Connect 4, Four-in-a-Row) 게임을 플레이한다냥!",
  USAGE: "@대전상대",
  ALIAS: ["4목"],
  USAGE_SLASH: "대전상대",
  DESC_SLASH: "대전상대를 지정한다냥!",
  DIRECTIONS: [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ],
  SYMBOL: {
    NEXT_TURN: "NEXT_TURN",
    GG: "GG"
  },
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
  DESC: "틱택토 게임을 플레이한다냥!",
  USAGE: "@대전상대",
  USAGE_SLASH: "대전상대",
  DESC_SLASH: "대전상대를 지정한다냥!",
  MARK: {
    [0]: EMOJI.OK,
    [1]: EMOJI.CROSS
  },
  TURN_HEADER: (user: GuildMember, playerIdx: number) => `${user.toString()}(${TICTACTOE.MARK[playerIdx]})의 차례다냥!`,
  SYMBOL: {
    NEXT_TURN: "NEXT_TURN"
  }
};

export const ONECARD = {
  CMD: "원카드",
  DESC: "원카드 게임을 플레이한다냥!",
  JOIN_MSG_TITLE: (author: GuildMember) => `${EMOJI.CARD.JOKER} ${author.displayName}의 원카드 게임`,
  CANT_PLAY_ANY_CARD: (user: GuildMember, added: number, cardCount: number) => `${user.toString()}의 차례지만 낼 수 있는 카드가 하나도 없다냥! 카드를 ${added}장 추가하고 턴을 넘긴다냥 (현재 카드 수: ${cardCount})`,
  TAKE_PENALTY: (user: GuildMember, added: number, cardCount: number) => `${user.toString()}가 카드를 ${added}장 추가하고 턴을 넘긴다냥 (현재 카드 수: ${cardCount})`,
  INITIAL_CARD: 7,
  CARD_LEFT: (count: number) => `남은 카드 수: ${count}`,
  CURRENT_SYMBOL: (symbol: string) => `현재 무늬: ${symbol}`,
  CHANGE_HEADER: (player: GuildMember) => `${player.toString()}냥, 바꿀 무늬를 선택해달라냥!`,
  SKIP_LABEL: "턴 넘기기",
  PENALTY_LABEL: (count: number) => `${count}장 먹기`
};

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
  SUMMARY_FIELD_TITLE: (user: GuildMember, idx: number) => {
    const windEmoji = MAHJONG_EMOJI[TILE_TYPE.KAZE][idx];
    return `${toEmoji(windEmoji.name, windEmoji.id)}${user.displayName}`;
  },
  TILES_LEFT: (count: number) => `남은 패 수: ${count}`,
  DISCARD_TITLE: (user: GuildMember) => `${user.displayName}의 타패다냥!`,
  RIICHI_TITLE: (user: GuildMember) => `${user.displayName}의 리치냥!`,
  KANG_TITLE: (user: GuildMember) => `${user.displayName}의 깡이다냥!`,
  TSUMO_TITLE: (user: GuildMember, lastTile: MahjongTile) => `${lastTile.getEmoji()} ${user.displayName}의 쯔모다냥!`,
  RON_TITLE: (user: GuildMember, lastTile: MahjongTile) => `${lastTile.getEmoji()} ${user.displayName}의 론이다냥!`,
  SCORE_FORMAT: (score: number) => `${score}판`,
  YAKU_TITLE: "역",
  DORA_INDICATOR_TITLE: "도라표시패",
  ROUND_FORMAT: (wind: number, windRepeat: number) => {
    const roundWind = MAHJONG_EMOJI[TILE_TYPE.KAZE][wind];
    const roundWindEmoji = toEmoji(roundWind.name, roundWind.id);

    return `${roundWindEmoji} 동장전 동${wind + 1}국${windRepeat > 0 ? ` ${windRepeat}본장` : ""}`;
  },
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
  LABEL: {
    KANG: "깡",
    RIICHI: "리치",
    TSUMO: "쯔모"
  },
  SYMBOL: {
    KANG: "KANG",
    RIICHI: "RIICHI",
    TSUMO: "TSUMO",
    DISCARD: "DISCARD"
  }
} as const;
