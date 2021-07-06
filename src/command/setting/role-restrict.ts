import Add from "./role-restrict/add";
import List from "./role-restrict/list";
import Remove from "./role-restrict/remove";

import Command from "~/core/Command";
import { ROLE_RESTRICT } from "~/const/command/setting";
import * as PERMISSION from "~/const/permission";

export default new Command({
  name: ROLE_RESTRICT.CMD,
  description: ROLE_RESTRICT.DESC,
  permissions: [PERMISSION.EMBED_LINKS],
  subcommands: [
    Add,
    List,
    Remove
  ]
});
