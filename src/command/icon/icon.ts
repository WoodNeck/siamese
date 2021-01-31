import Add from "./subcommands/add";
import Remove from "./subcommands/remove";
import List from "./subcommands/list";

import Command from "~/core/Command";
import { ICON } from "~/const/command/icon";

export default new Command({
  name: ICON.CMD,
  subcommands: [
    Add, List, Remove
  ]
});
