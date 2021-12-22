import { MessageEmbed } from "discord.js";

import Command from "~/core/Command";
import Conversation from "~/core/Conversation";
import * as COLOR from "~/const/color";
import * as PERMISSION from "~/const/permission";
import { DISCHARGE, FORCES } from "~/const/command/history";
import Discharge, { DischargeDocument } from "~/model/Discharge";

export default new Command({
  name: DISCHARGE.ADD.CMD,
  description: DISCHARGE.ADD.DESC,
  usage: DISCHARGE.ADD.USAGE,
  permissions: [PERMISSION.EMBED_LINKS],
  alias: DISCHARGE.ADD.ALIAS,
  execute: async ctx => {
    if (ctx.isSlashCommand()) return;

    const { bot, guild, content } = ctx;

    // No multiline is allowed
    const name = content.split("\n")[0];

    if (!name) {
      return await bot.replyError(ctx, DISCHARGE.ERROR.PROVIDE_NAME_TO_ADD);
    }
    if (name.length > DISCHARGE.ADD.NAME_MAX_LENGTH) {
      return await bot.replyError(ctx, DISCHARGE.ERROR.NAME_TOO_LONG(DISCHARGE.ADD.NAME_MAX_LENGTH));
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const prevInfo = await Discharge.findOne({
      guildID: guild.id,
      userName: name
    }).lean().exec() as DischargeDocument;

    if (prevInfo) {
      return await bot.replyError(ctx, DISCHARGE.ADD.NAME_ALREADY_EXISTS(name));
    }

    // Make new one, or update if user agreed
    const conversation = new Conversation(ctx);

    const joinDateDialogue = new MessageEmbed()
      .setTitle(DISCHARGE.ADD.DIALOGUE_JOIN_DATE_TITLE(name))
      .setDescription(DISCHARGE.ADD.DIALOGUE_JOIN_DATE_DESC)
      .setColor(COLOR.BOT)
      .setFooter(DISCHARGE.ADD.DIALOGUE_JOIN_DATE_EXAMPLE);
    conversation.add({
      content: joinDateDialogue,
      checker: message => {
        const date = new Date(message.content);
        return date instanceof Date && !isNaN(date.getTime());
      },
      errMsg: DISCHARGE.ERROR.JOIN_DATE_NOT_FORMATTED
    });

    const forcesDialogue = new MessageEmbed()
      .setTitle(DISCHARGE.ADD.DIALOGUE_FORCES_TITLE)
      .setDescription(DISCHARGE.ADD.DIALOGUE_FORCES_EXAMPLE())
      .setColor(COLOR.BOT);
    conversation.add({
      content: forcesDialogue,
      checker: message => FORCES.some(force => force === message.content),
      errMsg: DISCHARGE.ERROR.FORCES_NOT_LISTED
    });

    const result = await conversation.start(DISCHARGE.ADD.CONVERSATION_TIME).catch(() => void 0);
    if (!result) return;

    const joinDate = new Date(result[0]);
    joinDate.setHours(0, 0, 0, 0);

    const forceName = result[1];

    // Add new discharge info
    await Discharge.create({
      guildID: guild.id,
      userName: name,
      joinDate: joinDate.toISOString(),
      force: forceName
    });

    await bot.send(ctx, { content: DISCHARGE.ADD.SUCCESS(name) });
  }
});
