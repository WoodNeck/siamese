import type { Precondition } from "./Precondition";
import type { CommandContext } from "..";
import type { ChatInputCommandInteraction, Message } from "discord.js";

export type TextMessageChecker = (msg: Message) => boolean;
export type SlashInteractionChecker = (interaction: ChatInputCommandInteraction) => boolean;

const createPrecondition = ({
  text: checkText,
  slash: checkSlash,
  onFail
}: {
  text: TextMessageChecker,
  slash: SlashInteractionChecker,
  onFail?: (ctx: CommandContext) => void
}): Precondition => {
  return {
    checkTextMessage: (msg: Message) => {
      return checkText(msg);
    },
    checkSlashInteraction: (interaction: ChatInputCommandInteraction) => {
      return checkSlash(interaction);
    },
    onFail: async (ctx: CommandContext) => {
      if (!onFail) return;

      return onFail(ctx);
    }
  };
};

export default createPrecondition;
