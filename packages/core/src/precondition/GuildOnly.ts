
import { ERROR } from "../const/message";

import createPrecondition from "./createPrecondition";

const GuildOnly = createPrecondition({
  text: msg => {
    return msg.inGuild();
  },
  slash: interaction => {
    return interaction.inGuild();
  },
  onFail: async ctx => {
    await ctx.sender.replyError(ERROR.GUILD_ONLY_CMD);
  }
});

export default GuildOnly;
