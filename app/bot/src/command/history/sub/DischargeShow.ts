import { CommandContext, GuildTextOnly, SubCommand } from "@siamese/core";

import Discharge from "../Discharge";
import { DISCHARGE_SHOW } from "../const";

class DischargeShow extends SubCommand {
  public override define() {
    return {
      data: DISCHARGE_SHOW,
      preconditions: [
        GuildTextOnly
      ]
    };
  }

  public override async execute(ctx: CommandContext) {
    return await Discharge.execute(ctx);
  }
}

export default DischargeShow;
