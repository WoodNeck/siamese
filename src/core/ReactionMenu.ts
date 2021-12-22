import Discord from "discord.js";

import Menu from "~/core/Menu";
import * as EMOJI from "~/const/emoji";

enum END_TYPE {
  IGNORE = "IGNORE",
  CONTINUE = "CONTINUE",
  DELETE_ALL_MESSAGES = "DELETE_ALL_MESSAGES",
  REMOVE_ONLY_REACTIONS = "REMOVE_ONLY_REACTIONS"
}

class ReactionMenu extends Menu {
  // All reaction callbacks must return recital end reason
  // else recital will be end without listening additional reactions
  // reasons are defined in const
  public addEmojiReactionCallback(emoji: string, callback: () => END_TYPE, index?: number) {
    super.addReactionCallback({
      id: emoji,
      emoji
    }, callback.bind(this), index);
  }

  public removeEmojiReactionCallback(emoji: string) {
    super.removeReactionCallback({ id: emoji, emoji });
  }

  protected _listenReaction() {
    if (!this._menuMsg) return;

    const reactionCollector = this._menuMsg.createReactionCollector({
      filter: (reaction: Discord.MessageReaction, user: Discord.User) => this._callbacks.has(reaction.emoji.name!) && user.id === this._ctx.author.id,
      time: this._maxWaitTime * 1000
    });
    reactionCollector.on("collect", async reaction => {
      await this._onCollect(reaction, reactionCollector);
    });
    reactionCollector.on("end", this._onEnd);
  }

  protected _attachButtons() {
    // DO NOTHING
  }

  protected async _attachBotReactions(msg: Discord.Message): Promise<void> {
    for (const button of this._buttons) {
      if (!button.emoji) continue;

      const emoji = button.emoji;

      await msg.react(emoji)
        .catch(() => {
          // Recital message deleted, how fast
          if (msg.deleted) return;

          // Retry one more time, without order assurance
          msg.react(emoji).catch(() => void 0);
        });
    }
  }

  protected async _removeBotReactions() {
    const bot = this._ctx.bot;
    const msg = this._menuMsg;

    if (msg && !msg.deleted) {
      const reactions = msg.reactions.cache;

      for (const [, reaction] of reactions) {
        if (reaction.users.cache.has(bot.user.id)) {
          await reaction.users.remove(bot.user)
            .catch(async () => {
              if (msg.deleted) return;
              // Try one more time
              await reaction.users.remove().catch(() => void 0);
            });
        }
      }
    }
  }

  protected _addDefaultReactionCallback() {
    this.addReactionCallback({ id: EMOJI.ARROW_LEFT, emoji: EMOJI.ARROW_LEFT }, this.prev);
    this.addReactionCallback({ id: EMOJI.ARROW_RIGHT, emoji: EMOJI.ARROW_RIGHT }, this.next);
    this.addReactionCallback({ id: EMOJI.CROSS, emoji: EMOJI.CROSS }, () => END_TYPE.DELETE_ALL_MESSAGES);
  }

  private _onCollect = async (reaction: Discord.MessageReaction, collector: Discord.ReactionCollector) => {
    await reaction.users.remove(this._ctx.author).catch(() => void 0);
    const callback = this._callbacks.get(reaction.emoji.name!) as () => END_TYPE;
    if (!callback) return;

    const endReason = callback();
    collector.stop(endReason as string);
  };
}

export default ReactionMenu;
