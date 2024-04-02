import Discord from "discord.js";

import Siamese from "~/Siamese";
import * as EMOJI from "~/const/emoji";
import CommandContext from "~/core/CommandContext";

// TODO: 이거 지워버리고 Modal로 변경
class Prompt {
  private _ctx: CommandContext;
  private _content: Parameters<Siamese["send"]>[1];
  private _maxWaitTime: number;

  public constructor(ctx: CommandContext, content: Prompt["_content"], options: Partial<{
    maxWaitTime: number;
  }> = {}) {
    this._ctx = ctx;
    this._content = content;

    const {
      maxWaitTime = 30
    } = options;

    this._maxWaitTime = maxWaitTime;
  }

  public async start(): Promise<boolean> {
    const ctx = this._ctx;
    const { bot, author } = ctx;

    return await bot.send(ctx, this._content).then(async msg => {
      if (!msg) return false;

      const yesEmoji = EMOJI.GREEN_CHECK;
      const noEmoji = EMOJI.CROSS;

      const emojis = [yesEmoji, noEmoji];

      for (const emoji of emojis) {
        await msg.react(emoji);
      }

      const reactionCollector = msg.createReactionCollector({
        filter: (reaction: Discord.MessageReaction, user: Discord.User) => emojis.some(emoji => reaction.emoji.name === emoji) && user.id === author.id,
        time: this._maxWaitTime * 1000
      });

      return new Promise(resolve => {
        reactionCollector.on("collect", () => {
          reactionCollector.stop();
        });

        reactionCollector.on("end", async collected => {
          // Delete msg, it could been deleted already
          await msg.delete().catch(() => void 0);

          const reaction = collected.first();
          // No reaction is resolved false
          resolve(Boolean(reaction) && reaction!.emoji.name === yesEmoji);
        });
      });
    });
  }
}

export default Prompt;
