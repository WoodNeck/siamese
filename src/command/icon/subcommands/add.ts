import { MessageAttachment, MessageEmbed } from "discord.js";

import Command from "~/core/Command";
import Prompt from "~/core/Prompt";
import * as PERMISSION from "~/const/permission";
import { ICON, ADD } from "~/const/command/icon";
import Icon, { IconDocument } from "~/model/Icon";
import IconGroup, { IconGroupDocument } from "~/model/IconGroup";

export default new Command({
  name: ADD.CMD,
  description: ADD.DESC,
  usage: ADD.USAGE,
  permissions: [PERMISSION.EMBED_LINKS],
  alias: ADD.ALIAS,
  execute: async ctx => {
    const { bot, channel, guild, author, msg, args } = ctx;

    if (msg.attachments.size <= 0) {
		  return await bot.replyError(msg, ADD.ERROR.PROVIDE_IMAGES, ADD.TUTORIAL_URL);
    }

    if (args.length <= 0 || args.length > 2) {
      return await bot.replyError(msg, ADD.ERROR.PROVIDE_NAME_TO_ADD);
    }

    const groupName = args.length === 2 ? args[0] : null;
    const iconName = args.length === 2 ? args[1] : args[0];

    if (groupName && groupName.length > ICON.NAME_MAX_LENGTH) {
      return await bot.replyError(msg, ADD.ERROR.GROUP_NAME_TOO_LONG);
    }

    if (iconName.length > ICON.NAME_MAX_LENGTH) {
      return await bot.replyError(msg, ADD.ERROR.ICON_NAME_TOO_LONG);
    }

    let group: IconGroupDocument | null = null;

    if (groupName) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      group = await IconGroup.findOne({
        guildID: guild.id,
        name: groupName
      }).lean().exec() as IconGroupDocument;

      if (!group) {
        group = await IconGroup.create({
          guildID: guild.id,
          name: groupName,
          authorID: author.id
        }) as IconGroupDocument;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const prevInfo = await Icon.findOne({
      name: iconName,
      guildID: guild.id,
      groupID: group ? group.id as string : "0"
    }).exec() as IconDocument;
    const image = msg.attachments.first() as MessageAttachment;

    if (prevInfo) {
      const replaceMessage = new MessageEmbed()
        .setTitle(ADD.REPLACE_TITLE)
        .setImage(prevInfo.url);

      const replacePrompt = new Prompt(ctx, replaceMessage);
      const shouldReplace = await replacePrompt.start();

      if (shouldReplace) {
        prevInfo.url = image.url;
        prevInfo.authorID = author.id;
        await prevInfo.save();
      }
    } else {
      await Icon.create({
        name: iconName,
        url: image.url,
        guildID: guild.id,
        authorID: author.id,
        groupID: group ? group.id as string : "0"
      });
    }

    await bot.send(channel, ADD.SUCCESS(iconName));
  }
});
