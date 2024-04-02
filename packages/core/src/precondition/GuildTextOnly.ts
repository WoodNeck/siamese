import { ChannelType } from "discord.js";

import { ERROR } from "../const/message";

import createPrecondition from "./createPrecondition";

const GuildTextOnly = createPrecondition({
  text: msg => {
    return msg.inGuild() && msg.channel.type === ChannelType.GuildText;
  },
  slash: interaction => {
    if (!interaction.inGuild()) return false;

    const channel = interaction.channel;
    return !!channel && channel.type === ChannelType.GuildText;
  },
  onFail: async ctx => {
    await ctx.sender.replyError(ERROR.GUILD_ONLY_CMD);
  }
});

export default GuildTextOnly;
