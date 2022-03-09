import { MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "~/core/Command";
import { SHOW } from "~/const/command/icon";
import * as COLOR from "~/const/color";
import * as EMOJI from "~/const/emoji";
import * as ERROR from "~/const/error";
import * as PERMISSION from "~/const/permission";
import Icon, { IconDocument } from "~/model/Icon";
import IconGroup, { IconGroupDocument } from "~/model/IconGroup";
import checkActiveRole from "~/util/checkActiveRole";

export default new Command({
  name: SHOW.CMD,
  description: SHOW.DESC,
  alias: SHOW.ALIAS,
  permissions: [PERMISSION.EMBED_LINKS],
  slashData: new SlashCommandBuilder()
    .setName(SHOW.CMD)
    .setDescription(SHOW.SLASH_DESC)
    .addStringOption(option => option
      .setName(SHOW.USAGE)
      .setDescription(SHOW.DESC_OPTION)
      .setRequired(true)
    ) as SlashCommandBuilder,
  execute: async ctx => {
    const { bot, channel, author, guild } = ctx;
    const content = ctx.isSlashCommand()
      ? ctx.interaction.options.getString(SHOW.USAGE, true)
      : ctx.content;

    if (!content) {
      return await bot.replyError(ctx, ERROR.SEARCH.EMPTY_CONTENT);
    }

    // Config check
    const hasAdminPermission = !!channel.permissionsFor(author)?.has(PERMISSION.ADMINISTRATOR.flag);
    const hasActiveRole = await checkActiveRole({ guild, author, hasAdminPermission });
    if (!hasActiveRole) {
      if (ctx.isSlashCommand()) {
        return await ctx.interaction.reply({ content: ERROR.CMD.ONLY_ACTIVE_ROLES, ephemeral: true });
      } else {
        return await ctx.msg.react(EMOJI.CROSS).catch(() => void 0);
      }
    }

    const iconPrefix = bot.env.BOT_ICON_PREFIX;
    const guildID = guild.id;
    const msgSplitted = content.split(/ +/);
    const groupName = msgSplitted.length > 1 ? msgSplitted[0] : null;
    const iconName = msgSplitted.length > 1 ? msgSplitted[1] : msgSplitted[0];

    let icon: IconDocument | null = null;

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

      if (group) {
        icon = await Icon.findOne({
          name: iconName,
          guildID,
          groupID: group._id as string
        }).lean().exec() as IconDocument;
      }
    }

    if (!icon) {
      return await bot.replyError(ctx, ERROR.ICON.NOT_FOUND(content));
    }

    const embed = new MessageEmbed({
      footer: {
        text: `${iconPrefix}${groupName ? `${groupName} ` : ""}${icon.name} - ${bot.getDisplayName(guild, author.user)}`,
        iconURL: author.displayAvatarURL()
      }
    }).setImage(icon.url).setColor(COLOR.BOT);

    await bot.send(ctx, { embeds: [embed] });
  }
});
