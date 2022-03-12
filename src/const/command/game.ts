import { GuildMember } from "discord.js";
import Josa from "josa-js";

import * as EMOJI from "~/const/emoji";
import { range } from "~/util/helper";

export const OTHELLO = {
  CMD: "오셀로",
  DESC: "오셀로 게임을 플레이한다냥! 대전할 상대를 지정하려면 @멘션으로 지정해달라냥!",
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
  MSG: {
    SURRENDER: "항복하기",
    NOT_YOUR_TURN: "상대방의 턴이다냥!",
    NOT_IN_GAME: "게임 참가자가 아니다냥!",
    END_BY_TIME: `${EMOJI.STOPWATCH} 제한시간이 종료되어 게임을 끝낸다냥!`,
    END_BY_SURRENDER: (player: GuildMember) => `${EMOJI.WHITE_FLAG} ${Josa.r(player.displayName, "이/가")} 항복했다냥!`
  },
  SYMBOL: {
    NEXT_TURN: "NEXT_TURN",
    GG: "GG"
  }
} as const;
