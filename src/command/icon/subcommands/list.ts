import { MessageEmbed } from "discord.js";
import { SlashCommandSubcommandBuilder  } from "@discordjs/builders";

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
  slashData: new SlashCommandSubcommandBuilder()
    .setName(LIST.CMD)
    .setDescription(LIST.DESC)
    .addStringOption(option => option
      .setName(LIST.USAGE)
      .setDescription(LIST.USAGE_DESC)
      .setRequired(false)
    ) as SlashCommandSubcommandBuilder,
  execute: async ctx => {
    const { bot, guild } = ctx;

    const groupName = ctx.isSlashCommand()
      ? ctx.interaction.options.getString(LIST.USAGE, false)
      : ctx.content;

    let groupID = "0";
    if (groupName) {
      const group = await IconGroup.findOne({
        name: groupName,
        guildID: guild.id
      }).lean().exec() as IconGroupDocument;

      if (!group) {
        return await bot.replyError(ctx, LIST.ERROR.NO_GROUP);
      }

      groupID = group._id as string;
    }

    const groups: Array<{ name: string; type: string }> = groupName
      ? []
      : (await IconGroup.find({ guildID: guild.id }).lean().exec() as IconGroupDocument[])
        .map(dir => ({
          name: dir.name,
          type: LIST.TYPE.GROUP
        }));

    const icons: Array<{ name: string; type: string }> = (await Icon.find({
      guildID: guild.id,
      groupID
    }).exec() as IconDocument[]).map(icon => ({
      name: icon.name,
      type: LIST.TYPE.ICON
    }));

    const items = [...groups, ...icons];
    if (items.length <= 0) {
      await bot.replyError(ctx, ERROR.CMD.NOT_FOUND(LIST.ITEMS_NAME));
    }

    const pageCnt = Math.ceil(items.length / LIST.ITEM_PER_PAGE);
    const menu = new Menu(ctx);
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
