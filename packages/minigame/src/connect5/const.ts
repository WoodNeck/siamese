import { COLOR } from "@siamese/color";
import { EMOJI } from "@siamese/emoji";

import type { User } from "discord.js";

export const CONNECT5 = {
  DIRECTIONS: [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ],
  DIR_INDEX_MAP: {
    [0]: 7,
    [1]: 1,
    [2]: 6,
    [3]: 3,
    [4]: -1,
    [5]: 2,
    [6]: 5,
    [7]: 0,
    [8]: 4
  } as Record<number, number>,
  PIECE: {
    [-1]: EMOJI.DOT,
    [0]: EMOJI.SMALL_ORANGE_DIAMOND,
    [1]: EMOJI.SMALL_BLUE_DIAMOND,
    [2]: EMOJI.LARGE_ORANGE_DIAMOND,
    [3]: EMOJI.LARGE_BLUE_DIAMOND
  } as Record<number, string>,
  CURSOR: {
    [-1]: EMOJI.ROUND_PUSH_PIN,
    [0]: EMOJI.CIRCLE.ORAGNE,
    [1]: EMOJI.CIRCLE.BLUE
  } as Record<number, string>,
  COLOR: {
    [-1]: COLOR.BLACK,
    [0]: COLOR.ORANGE,
    [1]: COLOR.BLUE
  } as Record<number, `#${string}`>,
  TURN_HEADER: (user: User, playerIdx: number) => `${user.toString()}(${CONNECT5.PIECE[playerIdx]})의 차례다냥!`
};
