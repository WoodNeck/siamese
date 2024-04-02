import { Command } from "@siamese/core";

import { HEARTHSTONE } from "./const";
import HearthstoneCard from "./sub/hearthstone/Card";

class Hearthstone extends Command {
  public override define() {
    return {
      data: HEARTHSTONE,
      executable: false,
      subcommands: [
        new HearthstoneCard()
      ]
    };
  }

  public override async execute() {
    // DO_NOTHING
  }
}

export default Hearthstone;
