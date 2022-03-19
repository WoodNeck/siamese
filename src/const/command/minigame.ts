import { GuildMember } from "discord.js";
import Josa from "josa-js";

import * as COLOR from "~/const/color";
import * as EMOJI from "~/const/emoji";
import { range } from "~/util/helper";

export const GAME = {
  THREAD_NAME: (gameName: string, p1: string, p2: string, id: string) => `${EMOJI.JOYSTICK} ${gameName}: ${p1} VS ${p2} (ID ${id})`,
  START_MSG: (gameName: string) => `${EMOJI.JOYSTICK} ${gameName} 게임을 생성한다냥!`,
  SURRENDER: "항복하기",
  NOT_YOUR_TURN: "상대방의 턴이다냥!",
  NOT_IN_GAME: "게임 참가자가 아니다냥!",
  END_BY_TIME: `${EMOJI.STOPWATCH} 제한시간이 종료되어 게임을 끝낸다냥!`,
  END_BY_SURRENDER: (player: GuildMember) => `${EMOJI.WHITE_FLAG} ${Josa.r(player.displayName, "이/가")} 항복했다냥!`,
  WINNER_HEADER: (players: GuildMember[], winner: number) => winner >= 0
    ? `${EMOJI.TROPHY} ${players[winner].displayName}의 승리다냥!`
    : "무승부다냥!"
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
