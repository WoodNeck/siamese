import type CommandContext from "../context/CommandContext";
import type { ChatInputCommandInteraction, Message } from "discord.js";

export type TextMessageChecker = (msg: Message) => boolean;
export type SlashInteractionChecker = (interaction: ChatInputCommandInteraction) => boolean;

interface Precondition {
  /**
   * @returns {false} 조건을 만족하지 않을 경우
   */
  checkTextMessage(msg: Message): boolean;
  /**
   * @returns {false} 조건을 만족하지 않을 경우
   */
  checkSlashInteraction(interaction: ChatInputCommandInteraction): boolean;
  onFail(ctx: CommandContext): Promise<void>;
}

export type {
  Precondition
};
