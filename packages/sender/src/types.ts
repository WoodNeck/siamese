import type InteractionSender from "./InteractionSender";
import type { MessageSender } from "./MessageSender";
import type { Button } from "@siamese/button";
import type { ButtonInteraction, Collection, CollectorFilter } from "discord.js";

export interface ButtonCollectOptions {
  filter: CollectorFilter<[ButtonInteraction]>;
  maxWaitTime: number;
}

export interface ButtonSendResult {
  button: Button;
  message: MessageSender
  interaction: ButtonInteraction;
  sender: InteractionSender;
  collected: Collection<string, ButtonInteraction>;
}
