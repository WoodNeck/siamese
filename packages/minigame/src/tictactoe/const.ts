import { ButtonStyle, User } from "discord.js";

export const TICTACTOE = {
  MARK: {
    [0]: "O",
    [1]: "X"
  } as Record<number, string>,
  STYLE: {
    [0]: ButtonStyle.Success,
    [1]: ButtonStyle.Danger
  } as Record<number, ButtonStyle>,
  TURN_HEADER: (user: User, playerIdx: number) => `${user}(${TICTACTOE.MARK[playerIdx]})의 차례다냥!`
};
