import {
  ButtonInteraction,
  Collection,
  InteractionCollector,
  InteractionUpdateOptions,
  Message,
  MessageEditOptions,
  MessageEmbed,
  MessagePayload
} from "discord.js";

import CommandContext from "../CommandContext";
import { MenuCallback } from "../Menu";
import SlashCommandContext from "../SlashCommandContext";

interface MenuStrategy {
  getPageAsObject(page: string | MessageEmbed);
  sendMenuMessage(ctx: CommandContext | SlashCommandContext, options: MessageEditOptions | InteractionUpdateOptions): Promise<Message | void>;
  update(options: MessageEditOptions | MessagePayload, btnInteraction?: ButtonInteraction): Promise<void>;
  listenInteractions(ctx: CommandContext | SlashCommandContext, callbacks: Collection<string, MenuCallback>, maxWaitTime: number): InteractionCollector<ButtonInteraction>;
  deleteMessage(ctx: CommandContext | SlashCommandContext): Promise<void>;
  removeReactions(btnInteraction?: ButtonInteraction);
}

export default MenuStrategy;
