import Command from "~/core/Command";

import { INVITE } from "~/const/commands/bot";
import CommandContext from "~/types/CommandContext";

export default new Command({
  name: INVITE.CMD,
  description: INVITE.DESC,
  execute: async ({ bot, channel }: CommandContext) => {
    const botMention = bot.user.toString();

    const link = await bot.generateInvite({
      permissions: bot.permissions
    });
    await bot.send(channel, INVITE.MSG(botMention, link));
  }
});

