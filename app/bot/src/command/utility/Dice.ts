import { Command, CommandContext } from "@siamese/core";

import { DICE } from "./const";

class Dice extends Command {
  public override define() {
    return {
      data: DICE,
      sendTyping: false
    };
  }

  public override async execute({ sender, getUser, getParams }: CommandContext) {
    const [diceNumOption] = getParams<typeof DICE.USAGE>();
    const diceNum = diceNumOption ?? DICE.DEFAULT;

    if (diceNum > DICE.MAX || diceNum < DICE.MIN) {
      await sender.replyError(DICE.ARG_INCORRECT(DICE.MIN, DICE.MAX));
      return;
    }

    const diceResult = Math.floor(Math.random() * (diceNum)) + 1;

    await sender.send(DICE.MSG(getUser(), diceResult, diceNum));
  }
}

export default Dice;

