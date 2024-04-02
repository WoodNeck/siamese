import { BaseGuildTextChannel } from "discord.js";

import { ERROR } from "../const/message";

import createPrecondition from "./createPrecondition";

const NSFWOnly = createPrecondition({
  text: msg => {
    if (!msg.inGuild()) return false;
    if ((msg.channel as BaseGuildTextChannel).nsfw == null) return false;

    return (msg.channel as BaseGuildTextChannel).nsfw;
  },
  slash: () => {
    // 슬래시 커맨드는 생성시 API를 통해 제약을 자체적으로 추가 가능
    return true;
  },
  onFail: async ctx => {
    await ctx.sender.replyError(ERROR.NSFW_ONLY_CMD);
  }
});

export default NSFWOnly;
