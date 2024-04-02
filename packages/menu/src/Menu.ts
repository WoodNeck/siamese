import { COLOR } from "@siamese/color";
import { EMOJI } from "@siamese/emoji";
import * as Discord from "discord.js";

import { MENU_DEFAULT_BTN_ID, MENU_END_REASON } from "./const";
import { getMinusCompensatedIndex } from "./utils";

import type { CommandContext } from "@siamese/core";
import type { EmbedBuilder } from "@siamese/embed";
import type { InteractionSender, MessageSender } from "@siamese/sender";

export type MenuCallback = (sender: InteractionSender) => Promise<MENU_END_REASON>;
export interface MenuButton {
  id: string;
  callback: MenuCallback;
  emoji?: string;
  text?: string;
  url?: string;
  style?: Discord.ButtonStyle;
}

export interface MenuOptions {
  ctx: CommandContext;
  /**
   * 메뉴 연속 호출 등으로 ctx의 메시지 전송기를 사용할 수 없는 경우 오버라이드
   */
  senderOverride?: MessageSender;
  /**
   * 메시지를 개인만 볼 수 있게 할지 여부
   */
  ephemeral?: boolean;
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

export interface MenuPage {
  content?: string;
  embed?: EmbedBuilder;
}

class Menu {
  // 옵션
  private _ctx: MenuOptions["ctx"];
  private _senderOverride: MenuOptions["senderOverride"];
  private _ephemeral: NonNullable<MenuOptions["ephemeral"]>;
  private _maxWaitTime: NonNullable<MenuOptions["maxWaitTime"]>;
  private _defaultColor: NonNullable<MenuOptions["defaultColor"]>;
  private _circular: NonNullable<MenuOptions["circular"]>;
  private _addPageNumber: NonNullable<MenuOptions["addPageNumber"]>;

  // 내부 상태
  private _pages: MenuPage[];
  private _buttons: MenuButton[];
  private _pageIndex: number;

  public constructor({
    ctx,
    senderOverride,
    ephemeral = false,
    maxWaitTime = 9.5 * 60,
    defaultColor = COLOR.BOT,
    circular = true,
    addPageNumber = true
  }: MenuOptions) {
    this._ctx = ctx;
    this._senderOverride = senderOverride;
    this._ephemeral = ephemeral;
    this._maxWaitTime = maxWaitTime;
    this._defaultColor = defaultColor;
    this._circular = circular;
    this._addPageNumber = addPageNumber;

    this._pageIndex = 0;
    this._pages = [];
    this._buttons = [];

    this._addDefaultButtons();
  }

  public async start(): Promise<void> {
    if (this._pages.length <= 0) {
      throw new Error("빈 메뉴를 시작하려고 시도함");
    }

    if (this._buttons.length <= 0) {
      throw new Error("메뉴에 버튼이 하나도 없음");
    }

    const firstPage = this._pages[0];
    const sender = this._senderOverride ?? this._ctx.sender;

    if (this._pages.length > 1) {
      const buttons = this._getButtons();

      const msg = await sender.sendObject({
        embeds: firstPage.embed && [firstPage.embed.build()],
        content: firstPage.content,
        components: buttons,
        ephemeral: this._ephemeral
      });

      await this._listenReaction(msg);
    } else {
      // 메시지 전송 후 바로 종료
      await sender.sendObject({
        embeds: firstPage.embed && [firstPage.embed.build()],
        ephemeral: this._ephemeral
      });
    }
  }

  public getCurrentPageIndex() {
    return this._pageIndex;
  }

  public setContentPages(pages: string[]) {
    this._pages = pages.map(content => ({ content }));
  }

  public setEmbedPages(pages: EmbedBuilder[]) {
    pages.forEach((page, pageIdx) => {
      if (!page.color) {
        page.setColor(this._defaultColor);
      }

      if (this._addPageNumber) {
        if (!page.footer || page.footer.text === "") {
          page.setFooter({ text: `${pageIdx + 1}/${pages.length}` });
        } else {
          page.setFooter({ text: `${page.footer.text} • (${pageIdx + 1}/${pages.length})`, iconURL: page.footer.iconURL });
        }
      }
    });

    this._pages = pages.map(embed => ({ embed }));
  }

  public addButton(button: MenuButton, index?: number) {
    const buttons = this._buttons;
    const buttonIdx = index
      ? getMinusCompensatedIndex(index, buttons.length)
      : buttons.length;

    buttons.splice(buttonIdx, 0, button);
  }

  public prev: MenuCallback = async sender => {
    if (!this._circular && this._pageIndex === 0) return MENU_END_REASON.CONTINUE;

    const pages = this._pages;
    const pageCount = pages.length;

    const prevIndex = this._circular
      ? (pageCount + this._pageIndex - 1) % pageCount
      : this._pageIndex - 1;
    const prevPage = this._pages[prevIndex];

    await this._changePage(prevPage, sender);
    this._pageIndex = prevIndex;

    return MENU_END_REASON.CONTINUE;
  };

  public next: MenuCallback = async sender => {
    if (!this._circular && this._pageIndex === this._pages.length - 1) return MENU_END_REASON.CONTINUE;

    const pages = this._pages;
    const pageCount = pages.length;

    const nextIndex = this._circular
      ? (this._pageIndex + 1) % pageCount
      : this._pageIndex + 1;
    const nextPage = this._pages[nextIndex];

    await this._changePage(nextPage, sender);
    this._pageIndex = nextIndex;

    return MENU_END_REASON.CONTINUE;
  };

  public delete = async () => {
    return MENU_END_REASON.DELETE_ALL;
  };

  private async _listenReaction(msg: MessageSender) {
    const ctx = this._ctx;

    const { sender, reason } = await msg.watchBtnClick({
      maxWaitTime: this._maxWaitTime,
      filter: interaction => {
        return interaction.user.id === ctx.getUser().id;
      },
      onCollect: async ({
        interaction,
        collector,
        sender
      }) => {
        const clicked = this._buttons.find(btn => btn.id === interaction.customId);
        if (!clicked) return;

        const callback = clicked.callback;
        const endReason = await callback(sender);

        if (endReason === MENU_END_REASON.CONTINUE) return;

        collector.stop(endReason);
      }
    });

    switch (reason) {
      case MENU_END_REASON.DELETE_ALL:
        await this._deleteMessages(sender);
        break;
      // By timeout
      case MENU_END_REASON.END:
      default:
        // Removing bot reactions indicates that
        // bot won't listen to reactions anymore
        await this._removeBotReactions(sender);
    }
  }

  private async _changePage(page: MenuPage, sender: MessageSender) {
    try {
      await sender.editObject({
        content: page.content,
        embeds: page.embed && [page.embed.build()]
      });
    } catch (err) {
      const logger = this._ctx.bot.logger;

      logger.error(new Error(`메뉴 페이지 변경 불가 ${err}`));
    }
  }

  private _getButtons() {
    const msgComponents: Discord.ActionRowBuilder<Discord.ButtonBuilder>[] = [];

    const buttons = this._buttons.map(button => {
      const messageBtn = new Discord.ButtonBuilder();

      messageBtn.setStyle(button.style ?? Discord.ButtonStyle.Secondary);

      !button.url && messageBtn.setCustomId(button.id);
      button.emoji && messageBtn.setEmoji(button.emoji);
      button.text && messageBtn.setLabel(button.text);
      button.url && messageBtn.setURL(button.url);

      return messageBtn;
    });

    const row = new Discord.ActionRowBuilder<Discord.ButtonBuilder>()
      .addComponents(...buttons);

    msgComponents.push(row);

    return msgComponents;
  }

  private _addDefaultButtons() {
    this.addButton({
      id: MENU_DEFAULT_BTN_ID.PREV,
      emoji: EMOJI.ARROW_LEFT,
      style: Discord.ButtonStyle.Secondary,
      callback: this.prev
    });
    this.addButton({
      id: MENU_DEFAULT_BTN_ID.NEXT,
      emoji: EMOJI.ARROW_RIGHT,
      style: Discord.ButtonStyle.Secondary,
      callback: this.next
    });
    this.addButton({
      id: MENU_DEFAULT_BTN_ID.DELETE,
      emoji: EMOJI.CROSS,
      style: Discord.ButtonStyle.Secondary,
      callback: this.delete
    });
  }

  private async _deleteMessages(menuSender: MessageSender) {
    const origSender = this._senderOverride ?? this._ctx.sender;

    await Promise.all([
      origSender.delete(),
      menuSender.delete()
    ]).catch(() => {
      // 지우지 못해도 상관없음
      // DO_NOTHING
    });
  }

  private async _removeBotReactions(menuSender: MessageSender) {
    try {
      await menuSender.editObject({
        components: []
      });
    } catch (err) {
      const logger = this._ctx.bot.logger;

      logger.error(err as Error);
    }
  }
}

export default Menu;
