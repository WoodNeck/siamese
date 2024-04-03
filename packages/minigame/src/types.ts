import type { InteractionSender, TextSender } from "@siamese/sender";
import type { ButtonInteraction } from "discord.js";

export interface ActionStopOptions {
  deleteButtons: boolean;
}

export interface VSPlayerActionParams {
  id: string;
  interaction: ButtonInteraction;
  sender: InteractionSender;
  messages: TextSender[];
  stop: (reason: string, options?: Partial<ActionStopOptions>) => void;
}

export interface VSPlayerFinalActionParams {
  id: string;
  interaction: ButtonInteraction;
  sender: InteractionSender;
  messages: TextSender[];
}

export interface PartyPlayerActionParams {
  id: string;
  interaction: ButtonInteraction;
  sender: InteractionSender;
  stop: (reason: string, options?: Partial<ActionStopOptions>) => void;
}

export interface PartyPlayerFinalActionParams {
  id: string;
  interaction: ButtonInteraction;
  sender: InteractionSender;
}
