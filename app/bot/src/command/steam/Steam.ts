import { Command } from "@siamese/core";

import { STEAM } from "./const";
import SteamLibrary from "./sub/Library";
import SteamPlayers from "./sub/Players";
import SteamProfile from "./sub/Profile";
import SteamRandom from "./sub/Random";
import SteamTopGames from "./sub/TopGames";

class Steam extends Command {
  public override define() {
    return {
      data: STEAM,
      executable: false,
      subcommands: [
        new SteamProfile(),
        new SteamLibrary(),
        new SteamRandom(),
        new SteamPlayers(),
        new SteamTopGames()
      ]
    };
  }

  public override async execute() {
    // DO_NOTHING
  }
}

export default Steam;
