import { SlashCommandSubcommandBuilder  } from "@discordjs/builders";

import Command from "~/core/Command";
import { DISCHARGE } from "~/const/command/history";
import Discharge, { DischargeDocument } from "~/model/Discharge";

export default new Command({
  name: DISCHARGE.REMOVE.CMD,
  description: DISCHARGE.REMOVE.DESC,
  usage: DISCHARGE.REMOVE.USAGE,
  alias: DISCHARGE.REMOVE.ALIAS,
  slashData: new SlashCommandSubcommandBuilder()
    .setName(DISCHARGE.REMOVE.CMD)
    .setDescription(DISCHARGE.REMOVE.DESC)
    .addStringOption(option => option
      .setName(DISCHARGE.REMOVE.USAGE)
      .setDescription(DISCHARGE.REMOVE.DESC_OPTION)
      .setRequired(true)
    ) as SlashCommandSubcommandBuilder,
  execute: async ctx => {
    const { bot, guild } = ctx;
    const content = ctx.isSlashCommand()
      ? ctx.interaction.options.getString(DISCHARGE.REMOVE.USAGE, true)
      : ctx.content;

    // No multiline is allowed
    const name = content.split("\n")[0];

    if (!name) {
      return await bot.replyError(ctx, DISCHARGE.ERROR.PROVIDE_NAME_TO_REMOVE);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const prevInfo = await Discharge.findOne({
      guildID: guild.id,
      userName: name
    }).exec() as DischargeDocument;

    if (!prevInfo) {
      return await bot.replyError(ctx, DISCHARGE.ERROR.NOT_FOUND);
    }

    await prevInfo.remove();

    await bot.send(ctx, { content: DISCHARGE.REMOVE.SUCCESS(name) });
  }
});
