import Discord from "discord.js";

import type { MENU_END_REASON } from "./const";
import type { CommandContext } from "@siamese/core";

export type ReactionMenuCallback = () => MENU_END_REASON;

export interface ReactionMenuOptions {
  ctx: CommandContext;
  /**
   * 메뉴가 종료되기까지의 대기 시간, 초 단위
   * @default 9.5 * 60 // 9분 30초
   */
  maxWaitTime?: number;
  /**
   * 페이지에 색상이 포함되지 않았을 경우에 배정할 색상
   * @default COLOR.BOT
   */
  defaultColor?: `#${string}`;
  /**
   * 페이지 순환을 활성화
   * - 첫번째 페이지에서 prev시 마지막 페이지로 이동
   * - 마지막 페이지에서 next시 첫번째 페이지로 이동
   */
  circular?: boolean;
  /**
   * Footer에 페이지 번호를 붙일지 여부
   */
  addPageNumber?: boolean;
}

class ReactionMenu {
  // Options
  private _ctx: CommandContext;
  private _maxWaitTime: number;
  private _circular: boolean;
  private _addPageNumber: boolean;

  // Internal States
  private _menuMsg: Discord.Message;
  private _pageIndex: number;
  private _pages: string[];
  private _emojis: string[];
  private _callbacks: Discord.Collection<string, ReactionMenuCallback>;
  private _strategy: MenuStrategy;

  public constructor(ctx: CommandContext, {
    maxWaitTime = 10 * 60, // 10 min
    circular = true,
    addPageNumber = true
  }: Partial<{
    maxWaitTime: number;
    circular: boolean;
    addPageNumber: boolean;
  }> = {}) {
    this._ctx = ctx;
    this._strategy = ctx.isSlashCommand()
      ? new SlashMenuStrategy(false)
      : new TextMenuStrategy();

    this._maxWaitTime = maxWaitTime;
    this._circular = circular;
    this._addPageNumber = addPageNumber;

    this._pageIndex = 0;
    this._pages = [];
    this._emojis = [];
    this._callbacks = new Discord.Collection();

    // Default menu
    this._addDefaultReactionCallback();
  }

  public setPages(pages: string[]) {
    if (this._addPageNumber) {
      pages = pages.map((page, pageIdx) => {
        return `${page} (${pageIdx + 1}/${pages.length})`;
      });
    }

    this._pages = pages;
  }

  // All reaction callbacks must return recital end reason
  // else recital will be end without listening additional reactions
  // reasons are defined in const
  public addReactionCallback(emoji: string, callback: ReactionMenuCallback, index?: number) {
    const emojis = this._emojis;
    const buttonIdx = index
      ? getMinusCompensatedIndex(index, emojis.length)
      : emojis.length;

    emojis.splice(buttonIdx, 0, emoji);

    this._callbacks.set(emoji, callback.bind(this));
  }

  public removeReactionCallback(emoji: string) {
    const emojis = this._emojis;
    const callbackIdx = emojis.findIndex(emj => emj === emoji);

    if (callbackIdx >= 0) {
      emojis.splice(callbackIdx, 1);
      this._callbacks.delete(emoji);
    }
  }

  public async start() {
    const ctx = this._ctx;
    const pages = this._pages;
    const firstPage = this._pages[0];
    const firstPageObj = this._strategy.getPageAsObject(firstPage);

    const menuMsg = await this._strategy.sendMenuMessage(ctx, firstPageObj);

    if (pages.length <= 1) return;

    if (menuMsg) {
      this._menuMsg = menuMsg;

      await this._attachReactions();
      this._listenReaction();
    }
  }

  public prev: ReactionMenuCallback = () => {
    if (!this._circular && this._pageIndex === 0) return MENU_END_REASON.CONTINUE;

    const pages = this._pages;
    const pageCount = pages.length;

    const prevIndex = this._circular
      ? (pageCount + this._pageIndex - 1) % pageCount
      : this._pageIndex - 1;
    const prevPage = this._pages[prevIndex];

    this._changePage(prevPage);
    this._pageIndex = prevIndex;

    return MENU_END_REASON.CONTINUE;
  };

  public next: ReactionMenuCallback = () => {
    if (!this._circular && this._pageIndex === this._pages.length - 1) return MENU_END_REASON.CONTINUE;

    const pages = this._pages;
    const pageCount = pages.length;

    const nextIndex = this._circular
      ? (this._pageIndex + 1) % pageCount
      : this._pageIndex + 1;
    const nextPage = this._pages[nextIndex];

    this._changePage(nextPage);
    this._pageIndex = nextIndex;

    return MENU_END_REASON.CONTINUE;
  };

  public delete: ReactionMenuCallback = () => {
    return MENU_END_REASON.DELETE_ALL;
  };

  private _listenReaction() {
    const reactionCollector = this._menuMsg.createReactionCollector({
      filter: (reaction: Discord.MessageReaction, user: Discord.User) => this._callbacks.has(reaction.emoji.name!) && user.id === this._ctx.author.id,
      time: this._maxWaitTime * 1000
    });

    reactionCollector.on("collect", async reaction => {
      await this._onCollect(reaction, reactionCollector);
    });

    reactionCollector.on("end", this._onEnd);
  }

  private async _attachReactions() {
    const menuMsg = this._menuMsg;

    for (const emoji of this._emojis) {
      await menuMsg.react(emoji)
        .catch(() => {
          // Retry one more time, without order assurance
          menuMsg.react(emoji).catch(() => void 0);
        });
    }
  }

  private async _removeBotReactions() {
    const bot = this._ctx.bot;
    const msg = this._menuMsg;

    if (!msg) return;

    const reactions = msg.reactions.cache;

    for (const [, reaction] of reactions) {
      if (reaction.users.cache.has(bot.user.id)) {
        await reaction.users.remove(bot.user)
          .catch(async () => {
            // Try one more time
            await reaction.users.remove().catch(() => void 0);
          });
      }
    }
  }

  private _addDefaultReactionCallback() {
    this.addReactionCallback(EMOJI.ARROW_LEFT, this.prev);
    this.addReactionCallback(EMOJI.ARROW_RIGHT, this.next);
    this.addReactionCallback(EMOJI.CROSS, () => MENU_END_REASON.DELETE_ALL);
  }

  private _changePage(page: string) {
    const ctx = this._ctx;

    this._strategy.update({ content: page })
      .catch(err => {
        if (ctx.isSlashCommand()) {
          void ctx.bot.handleSlashError(ctx, err);
        } else {
          void ctx.bot.handleError(ctx, ctx.command, err);
        }
      });
  }

  private _onCollect = async (reaction: Discord.MessageReaction, collector: Discord.ReactionCollector) => {
    await reaction.users.remove(this._ctx.author).catch(() => void 0);
    const callback = this._callbacks.get(reaction.emoji.name!) as ReactionMenuCallback;
    if (!callback) return;

    const endReason = callback();

    if (endReason === MENU_END_REASON.CONTINUE) return;

    collector.stop(endReason);
  };

  private _onEnd = async (_, reason: MENU_END_REASON) => {
    switch (reason) {
      case MENU_END_REASON.DELETE_ALL:
        this._deleteMessages();
        break;
      // By timeout
      case MENU_END_REASON.END:
      default:
        // Removing bot reactions indicates that
        // bot won't listen to reactions anymore
        await this._removeBotReactions();
    }
  };

  private _deleteMessages() {
    const ctx = this._ctx;

    void this._strategy.deleteMessage(ctx);
  }
}

export default ReactionMenu;
