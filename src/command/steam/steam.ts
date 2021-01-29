import Library from "./subcommands/library";
import Profile from "./subcommands/profile";
import Random from "./subcommands/random";
import Players from "./subcommands/players";
import TopGames from "./subcommands/top";

import Command from "~/core/Command";
import { STEAM } from "~/const/command/steam";

export default new Command({
  name: STEAM.CMD,
  subcommands: [
    Library,
    Profile,
    Random,
    Players,
    TopGames
  ]
});
