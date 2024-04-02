import { EMOJI } from "@siamese/emoji";
import Josa from "josa-js";

import type { User } from "discord.js";

export const ERROR = {
  MENTION_NO_BOT: "봇은 멘션할 수 없다냥!",
  MENTION_NO_SELF: "자기 자신은 멘션할 수 없다냥!",
  FAILED_TO_CREATE_THREAD: "쓰레드 채널을 생성하는데 실패했다냥!",
  ALREADY_JOINED: "이미 게임에 참가해있다냥!",
  ROOM_FULL: "참가 가능한 인원 수를 초과했다냥!",
  NOT_JOINED: "게임에 참가해있지 않다냥!",
  INITIATOR_CANT_LEAVE: "게임 주최자는 취소할 수 없다냥!",
  ONLY_FOR_INITIATOR: "게임 주최자만 할 수 있다냥!",
  MISSING_PLAYERS: "게임을 시작하기 위한 최소 인원수에 도달하지 못했다냥!",
  UNKNOWN: `${EMOJI.CROSS} 게임 진행중 에러가 발생했다냥! 에러가 계속 발생할 경우 개발서버에 문의해달라냥!`
};

export const GAME = {
  THREAD_NAME: (gameName: string, id: string) => `${EMOJI.JOYSTICK} ${gameName} (ID ${id})`,
  START_MSG: (gameName: string) => `${EMOJI.JOYSTICK} ${gameName} 게임을 생성한다냥!`,
  READY: (initiator: User) => `${initiator.toString()}냥, 게임이 준비됐다냥!`,
  SURRENDER: "항복하기",
  NOT_YOUR_TURN: "상대방의 턴이다냥!",
  NOT_IN_GAME: "게임 참가자가 아니다냥!",
  END_BY_TIME: `${EMOJI.STOPWATCH} 플레이어가 반응하지 않아 게임을 끝낸다냥!`,
  END_BY_SURRENDER: (player: User) => `${EMOJI.WHITE_FLAG} ${Josa.r(player.displayName, "이/가")} 항복했다냥!`,
  WINNER_HEADER: (players: User[], winner: number) => winner >= 0
    ? `${EMOJI.TROPHY} ${players[winner].displayName}의 승리다냥!`
    : "무승부다냥!",
  PLAYER_HEADER_LABEL: "플레이어",
  JOIN_BTN_LABEL: "참가하기",
  JOIN_PLAYERS_LIST: (players: Array<{ user: User }>, maxPlayer: number) => `참가자 목록 (${players.length}명 / 최대 ${maxPlayer}명)\n${players.map(player => `${EMOJI.MIDDLE_DOT} ${player.user.displayName}`).join("\n")}`,
  JOIN_FOOTER: (minPlayer: number) => `준비됐으면 시작 버튼을 눌러달라냥! 최소 ${minPlayer}명부터 시작 가능하다냥!`,
  LEAVE_BTN_LABEL: "참가취소",
  GAME_HEADER_LABEL: "게임",
  START_BTN_LABEL: "시작",
  CANCEL_BTN_LABEL: "취소",
  CANCELED: "게임을 취소했다냥!",
  INITIATING_GAME: "게임을 시작한다냥!",
  TURN_HEADER: (player: User) => `${player.toString()}의 차례다냥!`,
  RECONNECT_TITLE: (players: User[]) => `${players.map(player => player.toString()).join(", ")}냥, 게임을 계속하려면 재접속이 필요하다냥! 아래 버튼을 눌러달라냥!`,
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
