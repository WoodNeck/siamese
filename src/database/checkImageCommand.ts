/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Message, MessageEmbed, TextChannel } from "discord.js";

import * as COLOR from "~/const/color";
import Icon, { IconDocument } from "~/model/Icon";
import IconGroup, { IconGroupDocument } from "~/model/IconGroup";
import Siamese from "~/Siamese";

export default async (bot: Siamese, msg: Message) => {
  if (!msg.guild || !msg.content) return;

  const guildID = msg.guild.id;
  const msgSplitted = msg.content.split(/ +/);
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

  await bot.send(
    msg.channel as TextChannel,
    new MessageEmbed()
      .setImage(icon.url)
      .setColor(COLOR.BOT)
  );
};
