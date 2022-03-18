import { ButtonInteraction, Collection, InteractionCollector, Message, MessageEditOptions, MessageEmbed, MessageOptions } from "discord.js";

import CommandContext from "../CommandContext";
import { MenuCallback } from "../Menu";
import SlashCommandContext from "../SlashCommandContext";

import MenuStrategy from "./MenuStrategy";

class TextMenuStrategy implements MenuStrategy {
  private _menuMessage: Message;

  public getPageAsObject(page: MessageEmbed | string) {
    if (typeof page === "string") {
      return {
        content: page
      };
    } else {
      return {
        embeds: [page]
      };
    }
  }

  public async sendMenuMessage(ctx: CommandContext, options: MessageOptions) {
    const { bot } = ctx;

    this._menuMessage = await bot.send(ctx, {
      ...options,
      fetchReply: true
    }) as Message;

    return this._menuMessage;
  }

  public async update(options: MessageEditOptions, btnInteraction?: ButtonInteraction) {
    if (btnInteraction) {
      await btnInteraction.update(options);
    } else {
      await this._menuMessage.edit(options);
    }
  }

  public listenInteractions(ctx: CommandContext | SlashCommandContext, callbacks: Collection<string, MenuCallback>, maxWaitTime: number) {
    const { author } = ctx as CommandContext;

    const interactionCollector = this._menuMessage.createMessageComponentCollector({
      filter: (btnInteraction: ButtonInteraction) => {
        return callbacks.has(btnInteraction.customId) && btnInteraction.user.id === author.id;
      },
      time: maxWaitTime
    });

    return interactionCollector as InteractionCollector<ButtonInteraction>;
  }

  public async deleteMessage(ctx: CommandContext) {
    const { msg: cmdMsg, bot } = ctx;
    const menuMsg = this._menuMessage;

    if (cmdMsg) {
      cmdMsg.delete().catch(async err => {
        await bot.logger.error(err, ctx);
      });
    }

    if (menuMsg) {
      menuMsg.delete().catch(async err => {
        await bot.logger.error(err, new CommandContext({ ...ctx, msg: menuMsg }));
      });
    }
  }

  public async removeReactions(btnInteraction?: ButtonInteraction) {
    if (btnInteraction) {
      await btnInteraction.editReply({ components: [] })
        .catch(() => void 0);
    } else {
      const menuMsg = this._menuMessage;
      if (menuMsg && menuMsg.editable) {
        await this._menuMessage.edit({ components: [] })
          .catch(() => void 0);
      }
    }
  }
}

export default TextMenuStrategy;
