import Discord from "discord.js";

import Siamese from "~/Siamese";
import CommandContext from "~/type/CommandContext";
import * as EMOJI from "~/const/emoji";

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
    const { bot, channel, author } = this._ctx;

    return await bot.send(channel, this._content).then(async msg => {
      if (!msg) return false;

      const yesEmoji = EMOJI.GREEN_CHECK;
      const noEmoji = EMOJI.CROSS;

      const emojis = [yesEmoji, noEmoji];

      for (const emoji of emojis) {
        await msg.react(emoji);
      }

      const reactionCollector = msg.createReactionCollector(
        (reaction: Discord.MessageReaction, user: Discord.User) => emojis.some(emoji => reaction.emoji.name === emoji) && user.id === author.id,
        { time: this._maxWaitTime * 1000 }
      );

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
