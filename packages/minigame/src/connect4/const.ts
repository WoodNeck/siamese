import { COLOR } from "@siamese/color";
import { EMOJI } from "@siamese/emoji";

import type { User } from "discord.js";

export const CONNECT4 = {
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
  } as Record<number, string>,
  PIECE_COLOR: {
    [0]: COLOR.RED,
    [1]: COLOR.YELLOW,
    [-1]: COLOR.BLACK
  } as Record<number, `#${string}`>,
  TURN_HEADER: (user: User, playerIdx: number) => `${user}(${CONNECT4.CIRCLE[playerIdx]})의 차례다냥!`
};

