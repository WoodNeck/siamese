import { GuildMember } from "discord.js";
import Josa from "josa-js";

import * as EMOJI from "~/const/emoji";
import { range } from "~/util/helper";
import { strong } from "~/util/markdown";

export const GAME = {
  THREAD_NAME: (gameName: string, p1: string, p2: string, id: string) => `${EMOJI.JOYSTICK} ${gameName}: ${p1} VS ${p2} (ID ${id})`,
  START_MSG: (gameName: string) => `${EMOJI.JOYSTICK} ${gameName} 게임을 생성한다냥!`,
  SURRENDER: "항복하기",
  NOT_YOUR_TURN: "상대방의 턴이다냥!",
  NOT_IN_GAME: "게임 참가자가 아니다냥!",
  END_BY_TIME: `${EMOJI.STOPWATCH} 제한시간이 종료되어 게임을 끝낸다냥!`,
  END_BY_SURRENDER: (player: GuildMember) => `${EMOJI.WHITE_FLAG} ${Josa.r(player.displayName, "이/가")} 항복했다냥!`
};

export const OTHELLO = {
  CMD: "오셀로",
  DESC: "오셀로 게임을 플레이한다냥!",
  USAGE: "@대전상대",
  ALIAS: ["리버시"],
  USAGE_SLASH: "대전상대",
  DESC_SLASH: "대전상대를 지정한다냥!",
  SLASH_MSG: `${EMOJI.JOYSTICK} 오셀로 게임을 생성한다냥!`,
  THREAD_NAME: (p1: string, p2: string, id: string) => `${EMOJI.JOYSTICK} 오셀로: ${p1} VS ${p2} (ID ${id})`,
  TURN_HEADER: (user: GuildMember, playerIdx: number) => `${user.toString()}(${OTHELLO.DISC[playerIdx]})의 차례다냥!`,
  FINISHED_HEADER: (players: GuildMember[], winner: number) => winner >= 0
    ? `${EMOJI.TROPHY} ${players[winner].toString()}(${OTHELLO.DISC[winner]})의 승리다냥!`
    : "무승부다냥!",
  FIELD_TITLE: (players: GuildMember[]) => `${EMOJI.JOYSTICK} ${players[0].displayName}(${OTHELLO.DISC[0]}) VS ${players[1].displayName}(${OTHELLO.DISC[1]})`,
  FIELD_DESC: (players: GuildMember[], whiteCount: number, blackCount: number) => `${OTHELLO.DISC[0]} ${players[0].displayName}: ${whiteCount}\n${OTHELLO.DISC[1]} ${players[1].displayName}: ${blackCount}`,
  DIRECTIONS: [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ],
  DISC: [EMOJI.SMALL_ORANGE_DIAMOND, EMOJI.SMALL_BLUE_DIAMOND],
  DISC_ACTIVE: [
    EMOJI.ORANGE_CIRCLE,
    EMOJI.BLUE_CIRCLE,
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
  FINISHED_HEADER: (players: GuildMember[], winner: number) => winner >= 0
    ? `${EMOJI.TROPHY} ${players[winner].displayName}의 승리다냥!`
    : "무승부다냥!",
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

export const GUESS = {
  CMD: "단어추리",
  DESC: "채널 안에서 단어추리 게임을 플레이한다냥!",
  USAGE_SLASH: "단어",
  DESC_SLASH: "3글자 ~ 10글자 사이의 단어를 지정해달라냥!",
  DM_HELP_MSG_TITLE: `${EMOJI.PAW} 맞출 단어를 지정해달라냥!`,
  DM_HELP_MSG_DESC: `지금 여기서 ${strong("3")} ~ ${strong("10")} 글자 사이의 단어를 하나 말해달라냥!`,
  DM_HELP_MSG_FOOTER: "예) 먼치킨",
  ALREADY_ENABLED: "이 서버에선 이미 단어추리 게임을 플레이하고 있다냥!",
  RANGE_EXCEED: "단어는 3글자 ~ 10글자 사이여야 한다냥!",
  CH_START_GAME: (answer: string) => `이 채널에서 단어추리 게임을 시작한다냥! ${answer.length}글자짜리 단어를 맞춰보라냥!`,
  CH_ANSWER: "정답이다냥!",
  CH_NO_ANSWER: (answer: string) => `아무도 정답을 맞추지 못했다냥, 정답은 ${strong(answer)} 이었다냥!`,
  SYMBOL: {
    GAME_START: "GAME_START",
    GAME_OVER: "GAME_OVER"
  }
};
