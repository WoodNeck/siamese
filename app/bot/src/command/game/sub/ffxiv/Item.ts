import { CommandContext, Cooldown, SubCommand } from "@siamese/core";
import { EmbedBuilder } from "@siamese/embed";
import { EMOJI } from "@siamese/emoji";
import { searchItemEntries, type ItemEntry, searchItem } from "@siamese/ffxiv";
import { MENU_END_REASON, Menu } from "@siamese/menu";

import { FFXIV } from "../../const";

class FfxivItem extends SubCommand {
  public override define() {
    return {
      data: FFXIV.ITEM,
      deferReply: true,
      preconditions: [
        new Cooldown(5)
      ]
    };
  }

  public override async execute({ sender, ctx, getParams }: CommandContext) {
    const [searchText] = getParams<typeof FFXIV.ITEM.USAGE>();

    if (!searchText) {
      await sender.replyError(FFXIV.ITEM.EMPTY_CONTENT);
      return;
    }

    const entries = await searchItemEntries(searchText);
    if (entries.length <= 0) {
      await sender.replyError(FFXIV.ITEM.EMPTY_RESULT);
      return;
    }

    if (entries.length === 1) {
      await this._showItemInfo(ctx, entries[0]);
      return;
    }

    // Show select menu
    const pages = entries
      .filter(item => item.name)
      .map(item => {
        return new EmbedBuilder({
          author: {
            name: item.name,
            iconURL: item.icon
          },
          color: item.color
        });
      });

    const menu = new Menu({ ctx });
    menu.setEmbedPages(pages);
    menu.addButton({
      id: "CONFIRM",
      emoji: EMOJI.GREEN_CHECK,
      callback: async () => {
        const item = entries[menu.getCurrentPageIndex()];

        try {
          await this._showItemInfo(ctx, item);
        } catch (err) {
          ctx.bot.logger.error(new Error(`파판 아이템 커스텀 버튼 오류: ${err}`));
        }

        return MENU_END_REASON.DELETE_ALL;
      }
    }, 1);

    await menu.start();
  }

  private async _showItemInfo({ sender }: CommandContext, entry: ItemEntry) {
    const item = await searchItem(entry.url);
    if (!item) {
      await sender.send(FFXIV.ITEM.FAILED_TO_FETCH);
      return;
    }

    const embed = new EmbedBuilder({
      title: item.name,
      description: [item.type, item.description, item.condition].filter(val => !!val).join("\n"),
      url: item.url,
      thumbnail: item.icon,
      color: item.color
    });

    if (item.hasHQ) {
      embed.setFooter({
        text: FFXIV.ITEM.HQ_ITEM_FOOTER,
        iconURL: FFXIV.ITEM.HQ_ITEM_IMAGE
      });
    }

    item.stats?.forEach(stat => {
      embed.addField(stat.name, stat.value, true);
    });

    if (item.additional) {
      embed.addField(item.additional.title, item.additional.description, false);
    }

    item.viewbase.forEach(({ title, description }) => {
      embed.addField(title, description, false);
    });

    await sender.send(embed);
  }
}

export default FfxivItem;
