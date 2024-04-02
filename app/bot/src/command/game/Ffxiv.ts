import { Command } from "@siamese/core";

import { FFXIV } from "./const";
import FfxivItem from "./sub/ffxiv/Item";

class Ffxiv extends Command {
  public override define() {
    return {
      data: FFXIV,
      executable: false,
      subcommands: [
        new FfxivItem()
      ]
    };
  }

  public override async execute() {
    // DO_NOTHING
  }
}

export default Ffxiv;
