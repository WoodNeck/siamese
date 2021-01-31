import List from "./subcommands/list";

import Command from "~/core/Command";
import { ICON } from "~/const/command/icon";

export default new Command({
  name: ICON.CMD,
  subcommands: [
    List
  ]
});
