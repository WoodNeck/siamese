/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Message, MessageEmbed, TextChannel } from "discord.js";

import Siamese from "~/Siamese";
import * as EMOJI from "~/const/emoji";
import * as COLOR from "~/const/color";
import * as PERMISSION from "~/const/permission";
import Icon, { IconDocument } from "~/model/Icon";
import IconGroup, { IconGroupDocument } from "~/model/IconGroup";
import checkActiveRole from "~/util/checkActiveRole";

export default async (bot: Siamese, msg: Message) => {
  if (!msg.guild || !msg.content) return;

  // Config check
  const hasAdminPermission = !!(msg.channel as TextChannel).permissionsFor(msg.author)?.has(PERMISSION.ADMINISTRATOR.flag);
  const hasActiveRole = await checkActiveRole({ guild: msg.guild, author: msg.member!, hasAdminPermission });
  if (!hasActiveRole) {
    await msg.react(EMOJI.CROSS).catch(() => void 0);
    return;
  }

  const iconPrefix = bot.env.BOT_ICON_PREFIX;
  const guildID = msg.guild.id;
  const msgSplitted = msg.content.substr(iconPrefix.length).split(/ +/);
  const groupName = msgSplitted.length > 1 ? msgSplitted[0] : null;
  const iconName = msgSplitted.length > 1 ? msgSplitted[1] : msgSplitted[0];

  let icon: IconDocument;

  if (!groupName) {
    icon = await Icon.findOne({
      name: iconName,
      guildID,
      groupID: "0"
    }).lean().exec() as IconDocument;
  } else {
    const group = await IconGroup.findOne({
      name: groupName,
      guildID
    }).lean().exec() as IconGroupDocument;

    if (!group) return;

    icon = await Icon.findOne({
      name: iconName,
      guildID,
      groupID: group._id as string
    }).lean().exec() as IconDocument;
  }

  if (!icon) return;

  const permissions = (msg.channel as TextChannel).permissionsFor(bot.user);

  if (!permissions || !permissions.has(PERMISSION.SEND_MESSAGES.flag) || !permissions.has(PERMISSION.EMBED_LINKS.flag)) {
    return;
  }

  if (msg.deletable) {
    await msg.delete();
  }

  await bot.send(
    msg.channel as TextChannel,
    new MessageEmbed()
      .setAuthor(bot.getDisplayName(msg.guild, msg.author), msg.author.displayAvatarURL())
      .setImage(icon.url)
      .setColor(COLOR.BOT)
  );
};
