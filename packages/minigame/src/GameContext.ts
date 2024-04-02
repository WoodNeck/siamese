import type { GamePlayer } from "./GamePlayer";
import type { Bot } from "@siamese/core";
import type { ThreadSender } from "@siamese/sender";
import type { ThreadChannel } from "discord.js";

interface GameContext {
  bot: Bot;
  players: GamePlayer[];
  channel: ThreadChannel,
  sender: ThreadSender
}

export type { GameContext };
