import { Command } from "@siamese/core";

import { MTG } from "./const";
import MtgCard from "./sub/mtg/Card";
import MtgQuiz from "./sub/mtg/Quiz";
import MtgRandom from "./sub/mtg/Random";

class Mtg extends Command {
  public override define() {
    return {
      data: MTG,
      executable: false,
      subcommands: [
        new MtgCard(),
        new MtgQuiz(),
        new MtgRandom()
      ]
    };
  }

  public override async execute() {
    // DO_NOTHING
  }
}

export default Mtg;
