import { MessageEmbed } from "discord.js";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import Menu from "~/core/Menu";
import * as ERROR from "~/const/error";
import * as PERMISSION from "~/const/permission";
import { LIST } from "~/const/command/icon";
import IconGroup, { IconGroupDocument } from "~/model/IconGroup";
import Icon, { IconDocument } from "~/model/Icon";

export default new Command({
  name: LIST.CMD,
  description: LIST.DESC,
  permissions: [PERMISSION.EMBED_LINKS],
  cooldown: Cooldown.PER_CHANNEL(5),
  execute: async ctx => {
    const { bot, msg, args, guild } = ctx;

    const groupName = args[0];

    let groupID = "0";
    if (groupName) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const group = await IconGroup.findOne({
        name: groupName,
        guildID: guild.id
      }).lean().exec() as IconGroupDocument;

      if (!group) {
        return await bot.replyError(msg, LIST.ERROR.NO_GROUP);
      }

      groupID = group._id as string;
    }

    const groups: Array<{ name: string; type: string }> = groupName
      ? []
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      : (await IconGroup.find({ guildID: guild.id }).lean().exec() as IconGroupDocument[])
        .map(dir => ({
          name: dir.name,
          type: LIST.TYPE.GROUP
        }));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const icons: Array<{ name: string; type: string }> = (await Icon.find({
      guildID: guild.id,
      groupID
    }).exec() as IconDocument[]).map(icon => ({
      name: icon.name,
      type: LIST.TYPE.ICON
    }));

    const items = [...groups, ...icons];
    if (items.length <= 0) {
      await bot.replyError(msg, ERROR.CMD.NOT_FOUND("등록된 폴더랑 이미지"));
    }

    const pageCnt = Math.ceil(items.length / LIST.ITEM_PER_PAGE);
    const menu = new Menu(ctx, { maxWaitTime: LIST.RECITAL_TIME });
    const pages = [...Array(pageCnt).keys()].map((_, idx) => idx).map(pageIdx => {
      const imageStr = items
        .slice(pageIdx * LIST.ITEM_PER_PAGE, (pageIdx + 1) * LIST.ITEM_PER_PAGE)
        .map(item => `${LIST.EMOJI[item.type]} ${item.name}`)
        .join("\n");

      return new MessageEmbed().setDescription(imageStr);
    });

    menu.setPages(pages);
    await menu.start();
  }
});
