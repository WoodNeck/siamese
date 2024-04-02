import type { User } from "discord.js";

export const YACHT = {
  TURN_HEADER: (user: User) => `${user}의 차례다냥! 주사위 버튼을 누르면 잠글 수 있다냥!`,
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
    EYE: "EYE"
  },
  LABEL: {
    ROLL: (rerollLeft: number) => `주사위 굴리기 (남은 횟수: ${rerollLeft})`
  }
};
