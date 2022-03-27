import { MessageButtonStyleResolvable } from "discord.js";

export const MESSAGE_MAX_LENGTH = 1950;

export const FOOTER_MAX_LENGTH = 2048;

export const DISCORD_ERROR_CODE = {
  MISSING_PERMISSION: 50013
};

export const ACTIVITY = {
  PLAYING: "PLAYING",
  STREAMING: "STREAMING",
  LISTENING: "LISTENING",
  WATCHING: "WATCHING"
} as const;

export const MSG_RETRIEVE_MAXIMUM = 100;

export const BUTTON_STYLE: Record<string, MessageButtonStyleResolvable> = {
  PRIMARY: "PRIMARY",
  SECONDARY: "SECONDARY",
  DANGER: "DANGER",
  LINK: "LINK",
  SUCCESS: "SUCCESS"
};
