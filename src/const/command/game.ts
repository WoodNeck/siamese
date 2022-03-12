import { GuildMember } from "discord.js";

import * as EMOJI from "~/const/emoji";
import { range } from "~/util/helper";

export const OTHELLO = {
  CMD: "오셀로",
  DESC: "오셀로 게임을 플레이한다냥! 대전할 상대를 지정하려면 @멘션으로 지정해달라냥!",
  USAGE: "@대전상대",
  ALIAS: ["리버시"],
  USAGE_SLASH: "대전상대",
  DESC_SLASH: "대전상대를 지정한다냥!",
  SLASH_MSG: "게임을 생성한다냥!",
  THREAD_NAME: (p1: string, p2: string, id: string) => `${EMOJI.JOYSTICK} 오셀로: ${p1} VS ${p2} (ID ${id})`,
  TURN_HEADER: (user: GuildMember, playerIdx: number) => `${user.toString()}(${playerIdx === 0 ? EMOJI.WHITE_DIAMOND : EMOJI.BLACK_DIAMOND})의 차례다냥!`,
  FINISHED_HEADER: (players: GuildMember[], winner: number) => winner >= 0
    ? `${EMOJI.TROPHY} ${players[winner].toString()}(${winner === 0 ? EMOJI.WHITE_DIAMOND : EMOJI.BLACK_DIAMOND})의 승리다냥!`
    : "무승부다냥!",
  FIELD_TITLE: (players: GuildMember[]) => `${EMOJI.JOYSTICK} ${players[0].displayName}(${EMOJI.WHITE_DIAMOND}) VS ${players[1].displayName}(${EMOJI.BLACK_DIAMOND})`,
  FIELD_DESC: (players: GuildMember[], whiteCount: number, blackCount: number) => `${EMOJI.WHITE_DIAMOND} ${players[0].displayName}: ${whiteCount}\n${EMOJI.BLACK_DIAMOND} ${players[1].displayName}: ${blackCount}`,
  DIRECTIONS: [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ],
  // Ⓐ ~ Ⓩ, ㉮ ~ ㉻
  CANDIDATE_MARKERS: [
    ...range(12).map(val => String.fromCharCode(9398 + val)),
    "ⓜ", // as ⓜ is changed to emoji in Discord
    ...range(13).map(val => String.fromCharCode(9411 + val)),
    ...range(14).map(val => String.fromCharCode(12910 + val))
  ],
  MSG: {
    NOT_YOUR_TURN: "상대방의 턴이다냥!",
    NOT_IN_GAME: "게임 참가자가 아니다냥!"
  }
} as const;
