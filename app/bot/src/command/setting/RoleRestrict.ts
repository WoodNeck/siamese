import { Command } from "@siamese/core";

import { ROLE_RESTRICT } from "./const";
import RoleAdd from "./sub/RoleAdd";
import RoleList from "./sub/RoleList";
import RoleRemove from "./sub/RoleRemove";

class RoleRestrict extends Command {
  public override define() {
    return {
      data: ROLE_RESTRICT,
      executable: false,
      subcommands: [
        new RoleAdd(),
        new RoleList(),
        new RoleRemove()
      ]
    };
  }

  public override async execute() {
    // DO_NOTHING
  }
}

export default RoleRestrict;
