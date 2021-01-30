import Command from "~/core/Command";
import { DISCHARGE } from "~/const/command/history";
import { params as dischargeParams } from "~/table/discharge";
import findOne from "~/database/findOne";
import removeOne from "~/database/removeOne";

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

    const prevInfo = await findOne(bot, dischargeParams.TableName, {
      guildID: { S: guild.id },
      userName: { S: name }
    });

    if (!prevInfo || !prevInfo.Item) {
      return await bot.replyError(msg, DISCHARGE.ERROR.NOT_FOUND);
    }

    await removeOne(bot, dischargeParams.TableName, {
      guildID: { S: guild.id },
      userName: { S: name }
    });

    await bot.send(channel, DISCHARGE.REMOVE.SUCCESS(name));
  }
});
