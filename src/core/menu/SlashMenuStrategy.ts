import { ButtonInteraction, Collection, CommandInteraction, InteractionCollector, InteractionReplyOptions, MessageEmbed, MessagePayload } from "discord.js";

import { MenuCallback } from "../Menu";
import SlashCommandContext from "../SlashCommandContext";
import CommandContext from "../CommandContext";

import MenuStrategy from "./MenuStrategy";

class SlashMenuStrategy implements MenuStrategy {
  private _ephemeral: boolean;
  private _interaction: CommandInteraction;

  public constructor(ephemeral: boolean) {
    this._ephemeral = ephemeral;
  }

  public getPageAsObject(page: MessageEmbed | string) {
    if (typeof page === "string") {
      return {
        content: page,
        ephemeral: this._ephemeral
      };
    } else {
      return {
        embeds: [page],
        ephemeral: this._ephemeral
      };
    }
  }

  public async sendMenuMessage(ctx: SlashCommandContext, options: InteractionReplyOptions) {
    const { bot, interaction } = ctx;
    this._interaction = interaction;

    return await bot.send(ctx, {
      ...options,
      fetchReply: !this._ephemeral
    });
  }

  public async update(options: MessagePayload, btnInteraction?: ButtonInteraction) {
    if (btnInteraction) {
      await btnInteraction.update(options);
    } else {
      await this._interaction.editReply(options);
    }
  }

  public listenInteractions(ctx: CommandContext | SlashCommandContext, callbacks: Collection<string, MenuCallback>, maxWaitTime: number) {
    const { channel, interaction, author } = ctx as SlashCommandContext;

    const interactionCollector = channel.createMessageComponentCollector({
      filter: btnInteraction => {
        return btnInteraction.message.interaction?.id === interaction.id && callbacks.has(btnInteraction.customId) && btnInteraction.user.id === author.id;
      },
      time: maxWaitTime
    });

    return interactionCollector as InteractionCollector<ButtonInteraction>;
  }

  public async deleteMessage(ctx: SlashCommandContext) {
    const { interaction } = ctx;

    if (this._ephemeral) {
      // You cannot delete an ephemeral message
      await interaction.editReply({ components: [] });
    } else {
      await interaction.deleteReply();
    }
  }

  public async removeReactions(btnInteraction?: ButtonInteraction) {
    if (btnInteraction) {
      await btnInteraction.editReply({ components: [] });
    } else {
      await this._interaction.editReply({ components: [] });
    }
  }
}

export default SlashMenuStrategy;
