import { CommandContext, GuildTextOnly, SubCommand } from "@siamese/core";
import { Discharge } from "@siamese/db";

import { DISCHARGE, DISCHARGE_REMOVE } from "../const";

class DischargeRemove extends SubCommand {
  public override define() {
    return {
      data: DISCHARGE_REMOVE,
      preconditions: [
        GuildTextOnly
      ]
    };
  }

  public override async execute({ sender, getParams, getGuildID }: CommandContext) {
    const [name] = getParams<typeof DISCHARGE_REMOVE.USAGE>();
    if (!name) {
      await sender.replyError(DISCHARGE_REMOVE.PROVIDE_NAME);
      return;
    }

    const guildID = getGuildID();
    if (!guildID) {
      await sender.replyError(DISCHARGE.ERROR.GUILD_NOT_FOUND);
      return;
    }

    const prevInfo = await Discharge.find(name, guildID);
    if (!prevInfo) {
      await sender.replyError(DISCHARGE.ERROR.NOT_FOUND);
      return;
    }

    await Discharge.remove(name, guildID);
    await sender.send(DISCHARGE_REMOVE.SUCCESS(name));
  }
}

export default DischargeRemove;
