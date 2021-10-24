/* eslint-disable @typescript-eslint/no-unused-expressions */
import Discord, { ButtonInteraction, MessageActionRow, MessageButton, MessageButtonStyle } from "discord.js";

import * as COLOR from "~/const/color";
import * as EMOJI from "~/const/emoji";
import CommandContext from "~/core/CommandContext";
import { clamp, getMinusCompensatedIndex } from "~/util/helper";

export enum END_TYPE {
  IGNORE = "IGNORE",
  CONTINUE = "CONTINUE",
  DELETE_ALL_MESSAGES = "DELETE_ALL_MESSAGES",
  REMOVE_ONLY_REACTIONS = "REMOVE_ONLY_REACTIONS"
}

interface MenuButton {
  id: string;
  emoji?: string;
  text?: string;
  url?: string;
  style: MessageButtonStyle;
}

class Menu {
  // Options
  private _ctx: CommandContext;
  private _menuMsg: Discord.Message | null;
  private _maxWaitTime: number;
  private _defaultColor: `#${string}`;
  private _circular: boolean;
  private _addPageNumber: boolean;

  // Internal States
  private _pageIndex: number;
  private _pages: Array<Discord.MessageEmbed | string>;
  private _buttons: MenuButton[];
  private _callbacks: Discord.Collection<string, (interaction: ButtonInteraction) => END_TYPE>;

  public get index() { return this._pageIndex; }

  public constructor(ctx: CommandContext, options: Partial<{
    maxWaitTime: number;
    defaultColor: `#${string}`;
    circular: boolean;
    addPageNumber: boolean;
  }> = {}) {
    this._ctx = ctx;
    this._menuMsg = null;

    const {
      maxWaitTime = 30,
      defaultColor = COLOR.BOT,
      circular = true,
      addPageNumber = true
    } = options;

    this._maxWaitTime = maxWaitTime;
    this._defaultColor = defaultColor;
    this._circular = circular;
    this._addPageNumber = addPageNumber;

    this._pageIndex = 0;
    this._pages = [];
    this._buttons = [];
    this._callbacks = new Discord.Collection();

    // Default menu
    this.addReactionCallback({ id: "PREV", emoji: EMOJI.ARROW_LEFT, style: "SECONDARY" }, this.prev);
    this.addReactionCallback({ id: "NEXT", emoji: EMOJI.ARROW_RIGHT, style: "SECONDARY" }, this.next);
    this.addReactionCallback({ id: "DELETE", emoji: EMOJI.CROSS, style: "SECONDARY" }, () => END_TYPE.DELETE_ALL_MESSAGES);
  }

  public setPages(pages: Array<Discord.MessageEmbed | string>) {
    pages.forEach((page, pageIdx) => {
      if (page instanceof Discord.MessageEmbed) {
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
      }
    });

    this._pages = pages;
  }

  public updatePages(newPages: Array<Discord.MessageEmbed | string>, removedPages: number[]) {
    const pages = this._pages;
    const currentIdx = this._pageIndex;
    const currentPage = pages[currentIdx];
    const pagesBelowCurrent = removedPages.filter(idx => idx < currentIdx);

    this.setPages(newPages);
    this._pageIndex = clamp(currentIdx - pagesBelowCurrent.length, 0, pages.length - 1);

    if (newPages.length <= 0 || !this._menuMsg || this._menuMsg.deleted) {
      return this.delete();
    }

    this._changePage(newPages[this._pageIndex], currentPage);
  }

  // All reaction callbacks must return recital end reason
  // else recital will be end without listening additional reactions
  // reasons are defined in const
  public addReactionCallback(button: MenuButton, callback: (interaction: ButtonInteraction) => END_TYPE, index?: number) {
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
    const { bot, channel } = this._ctx;
    const pages = this._pages;
    const firstPage = this._pages[0];
    const firstPageObj = typeof firstPage === "string"
      ? { content: firstPage }
      : { embeds: [firstPage] };
    const msgComponents: MessageActionRow[] = [];

    if (pages.length > 1) {
      const buttons = this._buttons.map(button => {
        const messageBtn = new MessageButton();

        !button.url && messageBtn.setCustomId(button.id);
        messageBtn.setStyle(button.style);

        button.emoji && messageBtn.setEmoji(button.emoji);
        button.text && messageBtn.setLabel(button.text);
        button.url && messageBtn.setURL(button.url);

        return messageBtn;
      });
      const row = new MessageActionRow()
        .addComponents(...buttons);

      msgComponents.push(row);
    }

    const menuMsg = await bot.send(channel, { ...firstPageObj, components: msgComponents });

    if (!menuMsg) return;

    this._menuMsg = menuMsg;

    if (pages.length <= 1) return;

    this._listenButtonClick();
  }

  public prev = (interaction: ButtonInteraction) => {
    // Message could been deleted
    if (!this._menuMsg || this._menuMsg.deleted) return END_TYPE.IGNORE;
    if (!this._circular && this._pageIndex === 0) return END_TYPE.CONTINUE;

    const pages = this._pages;
    const currentPage = pages[this._pageIndex];
    const pageCount = pages.length;

    const prevIndex = this._circular ? (pageCount + this._pageIndex - 1) % pageCount : this._pageIndex - 1;
    const prevPage = this._pages[prevIndex];
    this._changePage(prevPage, currentPage, interaction);
    this._pageIndex = prevIndex;

    return END_TYPE.CONTINUE;
  };

  public next = (interaction: ButtonInteraction) => {
    // Message could been deleted
    if (!this._menuMsg || this._menuMsg.deleted) return END_TYPE.IGNORE;
    if (!this._circular && this._pageIndex === this._pages.length - 1) return END_TYPE.CONTINUE;

    const pages = this._pages;
    const currentPage = pages[this._pageIndex];
    const pageCount = pages.length;

    const nextIndex = this._circular ? (this._pageIndex + 1) % pageCount : this._pageIndex + 1;
    const nextPage = this._pages[nextIndex];
    this._changePage(nextPage, currentPage, interaction);
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

  private _listenButtonClick() {
    if (!this._menuMsg) return;

    const interactionCollector = this._menuMsg.createMessageComponentCollector({
      filter: (interaction: ButtonInteraction) => {
        return this._callbacks.has(interaction.customId) && interaction.user.id === this._ctx.author.id;
      },
      time: this._maxWaitTime * 1000
    });
    interactionCollector.on("collect", async (interaction: ButtonInteraction) => {
      const callback = this._callbacks.get(interaction.customId);
      if (!callback) return;

      const endReason = callback(interaction);
      interactionCollector.stop(endReason as string);
    });
    interactionCollector.on("end", this._onEnd);
  }

  private _onEnd = async (collection: Discord.Collection<string, ButtonInteraction>, reason: END_TYPE) => {
    switch (reason) {
      case END_TYPE.CONTINUE:
        // Start listening another reaction
        this._listenButtonClick();
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
        await this._removeButtons();
    }
  };

  private _changePage(page: Discord.MessageEmbed | string, prevPage: Discord.MessageEmbed | string, interaction?: ButtonInteraction) {
    const msg = this._menuMsg;

    if (!msg || !msg.editable || msg.deleted) return;

    const update = interaction
      ? interaction.update.bind(interaction)
      : msg.edit.bind(msg);

    if (page instanceof Discord.MessageEmbed) {
      if (!page.color) page.setColor(this._defaultColor);

      update({ content: null, embeds: [page], components: msg.components });
    } else if (prevPage instanceof Discord.MessageEmbed) {
      update({ content: page, embeds: [], components: msg.components });
    } else {
      update({ content: page, components: msg.components });
    }
  }

  private async _removeButtons(interaction?: ButtonInteraction) {
    const msg = this._menuMsg;

    if (!msg || !msg.editable || msg.deleted) return;

    if (interaction) {
      await interaction.update({
        components: []
      });
    } else {
      await msg.edit({ components: [] });
    }
  }
}

export default Menu;
