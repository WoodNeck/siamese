import { MessageEmbed } from "discord.js";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import Menu from "~/core/Menu";
import * as PERMISSION from "~/const/permission";
import { LIST } from "~/const/command/icon";

export default new Command({
  name: LIST.CMD,
  description: LIST.DESC,
  permissions: [PERMISSION.EMBED_LINKS],
  cooldown: Cooldown.PER_CHANNEL(5),
  execute: async ctx => {
    // const { bot, guild, msg } = ctx;
    // const db = bot.database!;

    // /* eslint-disable @typescript-eslint/naming-convention */
    // const result = await db.query({
    //   KeyConditionExpression: "guildID = :guildID",
    //   ExpressionAttributeValues: {
    //     ":guildID": { "S": guild.id }
    //   },
    //   TableName: dischargeParams.TableName
    // }).promise();
    // /* eslint-enable */

    // if (!result.Count || result.Count <= 0) {
    //   return await bot.replyError(msg, DISCHARGE.ERROR.EMPTY_RESULT);
    // }

    // const infos = result.Items!.map(info => ({
    //   name: info.userName.S!,
    //   joinDate: new Date(info.joinDate.S!)
    // }));
    // const pages: MessageEmbed[] = [];
    // const totalPages = Math.floor((result.Count - 1) / DISCHARGE.LIST.ENTRY_PER_PAGE) + 1;

    // for (const i of [...Array(totalPages).keys()]) {
    //   const infosDesc = infos.slice(i * DISCHARGE.LIST.ENTRY_PER_PAGE, (i + 1) * DISCHARGE.LIST.ENTRY_PER_PAGE)
    //     .map(info => DISCHARGE.LIST.ENTRY(info))
    //     .join("\n");
    //   pages.push(new MessageEmbed().setDescription(infosDesc));
    // }

    // const menu = new Menu(ctx, { maxWaitTime: DISCHARGE.LIST.RECITAL_TIME });
    // menu.setPages(pages);

    // await menu.start();
  }
});
