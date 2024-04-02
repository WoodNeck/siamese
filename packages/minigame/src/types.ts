import type { InteractionSender, TextSender } from "@siamese/sender";
import type { ButtonInteraction } from "discord.js";

export interface PlayerActionParams {
  id: string;
  interaction: ButtonInteraction;
  sender: InteractionSender;
  messages: TextSender[];
  stop: (reason: string, options?: Partial<ActionStopOptions>) => void;
}

export interface ActionStopOptions {
  deleteButtons: boolean;
}

export interface PlayerFinalActionParams {
  id: string;
  interaction: ButtonInteraction;
  sender: InteractionSender;
  messages: TextSender[];
}
