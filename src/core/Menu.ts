/* eslint-disable @typescript-eslint/no-unused-expressions */
import Discord, { ButtonInteraction, MessageActionRow, MessageButton, MessageButtonStyle } from "discord.js";

import * as COLOR from "~/const/color";
import * as EMOJI from "~/const/emoji";
import MenuStrategy from "~/core/menu/MenuStrategy";
import TextMenuStrategy from "~/core/menu/TextMenuStrategy";
import SlashMenuStrategy from "~/core/menu/SlashMenuStrategy";
import CommandContext from "~/core/CommandContext";
import SlashCommandContext from "~/core/SlashCommandContext";
import { clamp, getMinusCompensatedIndex } from "~/util/helper";

export interface MenuButton {
  id: string;
  emoji?: string;
  text?: string;
  url?: string;
  style?: MessageButtonStyle;
}

export type MenuCallback = (interaction: ButtonInteraction) => MENU_END_REASON;

export enum MENU_END_REASON {
  CONTINUE = "CONTINUE",
  END = "END",
  DELETE_ALL = "DELETE_ALL"
}

class Menu {
  // Options
  private _ctx: CommandContext | SlashCommandContext;
  private _maxWaitTime: number;
  private _defaultColor: `#${string}`;
  private _circular: boolean;
  private _addPageNumber: boolean;

  // Internal States
  private _pageIndex: number;
  private _pages: Discord.MessageEmbed[];
  private _buttons: MenuButton[];
  private _callbacks: Discord.Collection<string, MenuCallback>;
  private _strategy: MenuStrategy;

  public get index() { return this._pageIndex; }

  public constructor(ctx: CommandContext | SlashCommandContext, {
    maxWaitTime = 10 * 60, // 10 min
    defaultColor = COLOR.BOT,
    circular = true,
    addPageNumber = true,
    ephemeral = false
  }: Partial<{
    maxWaitTime: number;
    defaultColor: `#${string}`;
    circular: boolean;
    addPageNumber: boolean;
    ephemeral: boolean;
  }> = {}) {
    this._ctx = ctx;
    this._strategy = ctx.isSlashCommand()
      ? new SlashMenuStrategy(ephemeral)
      : new TextMenuStrategy();

    this._maxWaitTime = maxWaitTime;
    this._defaultColor = defaultColor;
    this._circular = circular;
    this._addPageNumber = addPageNumber;

    this._pageIndex = 0;
    this._pages = [];
    this._buttons = [];
    this._callbacks = new Discord.Collection();

    // Default menu
    this._addDefaultReactionCallback();
  }

  public setPages(pages: Discord.MessageEmbed[]) {
    pages.forEach((page, pageIdx) => {
      if (!page.color) {
        page.setColor(this._defaultColor);
      }

      if (this._addPageNumber) {
        if (!page.footer || page.footer.text === "") {
          page.setFooter(`${pageIdx + 1}/${pages.length}`);
        } else {
          page.setFooter(`${page.footer.text} • (${pageIdx + 1}/${pages.length})`, page.footer.iconURL);
        }
      }
    });

    this._pages = pages;
  }

  public updatePages(newPages: Discord.MessageEmbed[], removedPages: number[]) {
    const pages = this._pages;
    const currentIdx = this._pageIndex;
    const pagesBelowCurrent = removedPages.filter(idx => idx < currentIdx);

    this.setPages(newPages);
    this._pageIndex = clamp(currentIdx - pagesBelowCurrent.length, 0, pages.length - 1);

    if (newPages.length <= 0) {
      return this._deleteMessages();
    }

    this._changePage(newPages[this._pageIndex]);
  }

  // All reaction callbacks must return recital end reason
  // else recital will be end without listening additional reactions
  // reasons are defined in const
  public addReactionCallback(button: MenuButton, callback: MenuCallback, index?: number) {
    const buttons = this._buttons;
    const buttonIdx = index
      ? getMinusCompensatedIndex(index, buttons.length)
      : buttons.length;

    buttons.splice(buttonIdx, 0, button);

    this._callbacks.set(button.id, callback.bind(this));
  }

  public removeReactionCallback(button: MenuButton) {
    this._buttons.splice(this._buttons.findIndex(btn => btn.id === button.id), 1);
    this._callbacks.delete(button.id);
  }

  public async start() {
    const ctx = this._ctx;
    const pages = this._pages;
    const firstPage = this._pages[0];
    const firstPageObj = this._strategy.getPageAsObject(firstPage);

    if (pages.length > 1) {
      this._attachButtons(firstPageObj);
    }

    await this._strategy.sendMenuMessage(ctx, firstPageObj);

    if (pages.length <= 1) return;

    this._listenReaction();
  }

  public prev: MenuCallback = (interaction: ButtonInteraction) => {
    if (!this._circular && this._pageIndex === 0) return MENU_END_REASON.CONTINUE;

    const pages = this._pages;
    const pageCount = pages.length;

    const prevIndex = this._circular
      ? (pageCount + this._pageIndex - 1) % pageCount
      : this._pageIndex - 1;
    const prevPage = this._pages[prevIndex];

    this._changePage(prevPage, interaction);
    this._pageIndex = prevIndex;

    return MENU_END_REASON.CONTINUE;
  };

  public next: MenuCallback = (interaction: ButtonInteraction) => {
    if (!this._circular && this._pageIndex === this._pages.length - 1) return MENU_END_REASON.CONTINUE;

    const pages = this._pages;
    const pageCount = pages.length;

    const nextIndex = this._circular
      ? (this._pageIndex + 1) % pageCount
      : this._pageIndex + 1;
    const nextPage = this._pages[nextIndex];

    this._changePage(nextPage, interaction);
    this._pageIndex = nextIndex;

    return MENU_END_REASON.CONTINUE;
  };

  public delete = () => {
    return MENU_END_REASON.DELETE_ALL;
  };

  private _listenReaction() {
    const ctx = this._ctx;

    const interactionCollector = this._strategy.listenInteractions(ctx, this._callbacks, this._maxWaitTime * 1000);

    interactionCollector.on("collect", async (interaction: ButtonInteraction) => {
      const callback = this._callbacks.get(interaction.customId);
      if (!callback) return;

      const endReason = callback(interaction);

      if (endReason === MENU_END_REASON.CONTINUE) return;

      interactionCollector.stop(endReason);
    });

    interactionCollector.on("end", this._onEnd);
  }

  private _attachButtons(obj: Discord.MessageOptions) {
    const msgComponents: MessageActionRow[] = [];
    const buttons = this._buttons.map(button => {
      const messageBtn = new MessageButton();

      !button.url && messageBtn.setCustomId(button.id);
      messageBtn.setStyle(button.style ?? "SECONDARY");

      button.emoji && messageBtn.setEmoji(button.emoji);
      button.text && messageBtn.setLabel(button.text);
      button.url && messageBtn.setURL(button.url);

      return messageBtn;
    });
    const row = new MessageActionRow()
      .addComponents(...buttons);

    msgComponents.push(row);

    obj.components = msgComponents;
  }

  private async _removeBotReactions(interaction?: ButtonInteraction) {
    this._strategy.removeReactions(interaction);
  }

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

  private _addDefaultReactionCallback() {
    this.addReactionCallback({ id: "PREV", emoji: EMOJI.ARROW_LEFT, style: "SECONDARY" }, this.prev);
    this.addReactionCallback({ id: "NEXT", emoji: EMOJI.ARROW_RIGHT, style: "SECONDARY" }, this.next);
    this.addReactionCallback({ id: "DELETE", emoji: EMOJI.CROSS, style: "SECONDARY" }, this.delete);
  }

  private _changePage(page: Discord.MessageEmbed, btnInteraction?: ButtonInteraction) {
    const ctx = this._ctx;

    this._strategy.update({ embeds: [page] }, btnInteraction)
      .catch(err => {
        if (ctx.isSlashCommand()) {
          void ctx.bot.handleSlashError(ctx, err);
        } else {
          void ctx.bot.handleError(ctx, ctx.command, err);
        }
      });
  }

  private _deleteMessages() {
    const ctx = this._ctx;

    void this._strategy.deleteMessage(ctx);
  }
}

export default Menu;
