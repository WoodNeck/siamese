import Command from "~/core/Command";
import { DISCHARGE } from "~/const/command/history";
import Discharge, { DischargeDocument } from "~/model/Discharge";

export default new Command({
  name: DISCHARGE.REMOVE.CMD,
  description: DISCHARGE.REMOVE.DESC,
  usage: DISCHARGE.REMOVE.USAGE,
  alias: DISCHARGE.REMOVE.ALIAS,
  execute: async ({ bot, channel, guild, msg, content }) => {
    // No multiline is allowed
    const name = content.split("\n")[0];

    if (!name) {
      return await bot.replyError(msg, DISCHARGE.ERROR.PROVIDE_NAME_TO_REMOVE);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const prevInfo = await Discharge.findOne({
      guildID: guild.id,
      userName: name
    }).exec() as DischargeDocument;

    if (!prevInfo) {
      return await bot.replyError(msg, DISCHARGE.ERROR.NOT_FOUND);
    }

    await prevInfo.remove();

    await bot.send(channel, DISCHARGE.REMOVE.SUCCESS(name));
  }
});
