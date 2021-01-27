import Discord from "discord.js";

import * as COLOR from "~/const/color";
import * as EMOJI from "~/const/emoji";
import CommandContext from "~/type/CommandContext";

enum END_TYPE {
  IGNORE = "IGNORE",
  CONTINUE = "CONTINUE",
  DELETE_ALL_MESSAGES = "DELETE_ALL_MESSAGES",
  REMOVE_ONLY_REACTIONS = "REMOVE_ONLY_REACTIONS"
}

class Menu {
  public static END_TYPE = END_TYPE;

  // Options
  private _ctx: CommandContext;
  private _menuMsg: Discord.Message | null;
  private _maxWaitTime: number;
  private _defaultColor: string;
  private _circular: boolean;

  // Internal States
  private _pageIndex: number;
  private _pages: Array<Discord.MessageEmbed | string>;
  private _emojis: string[];
  private _callbacks: Discord.Collection<string, () => END_TYPE>;

  public constructor(ctx: CommandContext, options: {
    maxWaitTime: number;
    defaultColor?: string;
    circular?: boolean;
  }) {
    this._ctx = ctx;
    this._menuMsg = null;

    const {
      maxWaitTime,
      defaultColor = COLOR.BOT,
      circular = true
    } = options;

    this._maxWaitTime = maxWaitTime;
    this._defaultColor = defaultColor;
    this._circular = circular;

    this._pageIndex = 0;
    this._pages = [];
    this._emojis = [];
    this._callbacks = new Discord.Collection();

    // Default menu
    this.addReactionCallback(EMOJI.ARROW_LEFT, this.prev);
    this.addReactionCallback(EMOJI.ARROW_RIGHT, this.next);
    this.addReactionCallback(EMOJI.CROSS, () => END_TYPE.DELETE_ALL_MESSAGES);
  }

  public setPages(pages: Array<Discord.MessageEmbed | string>) {
    pages.forEach((page, pageIdx) => {
      if (page instanceof Discord.MessageEmbed) {
        if (!page.color) {
          page.setColor(this._defaultColor);
        }
        if (!page.footer) {
          page.setFooter(`${pageIdx + 1}/${pages.length}`);
        }
      }
    });

    this._pages = pages;
  }

  // All reaction callbacks must return recital end reason
  // else recital will be end without listening additional reactions
  // reasons are defined in const
  public addReactionCallback(emoji: string, callback: () => END_TYPE, index?: number) {
    const indexInRange = index !== undefined
			&& typeof index === "number"
			&& Math.floor(index) < this._emojis.length;

    if (indexInRange) {
      this._emojis.splice(Math.floor(index!), 0, emoji);
    } else {
      this._emojis.push(emoji);
    }
    this._callbacks.set(emoji, callback.bind(this));
  }

  public removeReactionCallback(emoji) {
    this._emojis.splice(this._emojis.indexOf(emoji), 1);
    this._callbacks.delete(emoji);
  }

  public async start() {
    const { bot, channel } = this._ctx;
    const firstPage = this._pages[0];

    const menuMsg = await bot.send(channel, firstPage);

    if (!menuMsg) return;

    this._menuMsg = menuMsg;

    if (this._pages.length <= 1) return;

    for (const emoji of this._emojis) {
      await menuMsg.react(emoji)
        .catch(() => {
          // Recital message deleted, how fast
          if (menuMsg.deleted) return;

          // Retry one more time, without order assurance
          menuMsg.react(emoji).catch(() => void 0);
        });
    }

    this._listenReaction();
  }

  public prev = () => {
    // Message could been deleted
    if (!this._menuMsg || this._menuMsg.deleted) return END_TYPE.IGNORE;
    if (!this._circular && this._pageIndex === 0) return END_TYPE.CONTINUE;

    const pages = this._pages;
    const currentPage = pages[this._pageIndex];
    const pageCount = pages.length;

    const prevIndex = this._circular ? (pageCount + this._pageIndex - 1) % pageCount : this._pageIndex - 1;
    const prevPage = this._pages[prevIndex];
    this._changePage(prevPage, currentPage);
    this._pageIndex = prevIndex;

    return END_TYPE.CONTINUE;
  };

  public next = () => {
    // Message could been deleted
    if (!this._menuMsg || this._menuMsg.deleted) return END_TYPE.IGNORE;
    if (!this._circular && this._pageIndex === this._pages.length - 1) return END_TYPE.CONTINUE;

    const pages = this._pages;
    const currentPage = pages[this._pageIndex];
    const pageCount = pages.length;

    const nextIndex = this._circular ? (this._pageIndex + 1) % pageCount : this._pageIndex + 1;
    const nextPage = this._pages[nextIndex];
    this._changePage(nextPage, currentPage);
    this._pageIndex = nextIndex;

    return END_TYPE.CONTINUE;
  };

  public delete = () => {
    const bot = this._ctx.bot;
    const cmdMsg = this._ctx.msg;
    const menuMsg = this._menuMsg;

    if (cmdMsg && !cmdMsg.deleted) {
      cmdMsg.delete().catch(async err => {
        await bot.logger.error(err, cmdMsg);
      });
    }
    if (menuMsg && !menuMsg.deleted) {
      menuMsg.delete().catch(async err => {
        await bot.logger.error(err, menuMsg);
      });
    }

    return END_TYPE.DELETE_ALL_MESSAGES;
  };

  private _listenReaction() {
    if (!this._menuMsg) return;

    const reactionCollector = this._menuMsg.createReactionCollector(
      (reaction: Discord.MessageReaction, user: Discord.User) => this._callbacks.has(reaction.emoji.name) && user.id === this._ctx.author.id,
      { time: this._maxWaitTime * 1000 }
    );
    reactionCollector.on("collect", async reaction => {
      await this._onCollect(reaction, reactionCollector);
    });
    reactionCollector.on("end", this._onEnd);
  }

  private _onCollect = async (reaction: Discord.MessageReaction, collector: Discord.ReactionCollector) => {
    await reaction.users.remove(this._ctx.author).catch(() => void 0);
    const callback = this._callbacks.get(reaction.emoji.name);
    if (!callback) return;

    const endReason = callback();
    collector.stop(endReason as string);
  };

  private _onEnd = async (collection: Discord.Collection<string, Discord.MessageReaction>, reason: END_TYPE) => {
    switch (reason) {
      case END_TYPE.CONTINUE:
        // Start listening another reaction
        this._listenReaction();
        break;
      case END_TYPE.DELETE_ALL_MESSAGES:
        this.delete();
        break;
      case END_TYPE.IGNORE:
        // Ignore it, can be used when a message is removed already
        break;
      // By timeout
      case END_TYPE.REMOVE_ONLY_REACTIONS:
      default:
        // Removing bot reactions indicates that
        // bot won't listen to reactions anymore
        await this._removeBotReactions();
    }
  };

  private _changePage(page: Discord.MessageEmbed | string, prevPage: Discord.MessageEmbed | string) {
    const msg = this._menuMsg;

    if (!msg) return;

    if (page instanceof Discord.MessageEmbed) {
      if (!page.color) page.setColor(this._defaultColor);
      msg.edit("", page).catch(() => void 0);
    } else if (prevPage instanceof Discord.MessageEmbed) {
      msg.edit(page, { embed: {} }).catch(() => void 0);
    } else {
      msg.edit(page).catch(() => void 0);
    }
  }

  private async _removeBotReactions() {
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
}

export default Menu;
