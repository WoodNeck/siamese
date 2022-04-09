import { MessageButtonStyleResolvable } from "discord.js";

export const MESSAGE_MAX_LENGTH = 1950;

export const FOOTER_MAX_LENGTH = 2048;

export const DISCORD_ERROR_CODE = {
  MISSING_ACCESS: 50001,
  MISSING_PERMISSION: 50013
};

export const ACTIVITY = {
  PLAYING: "PLAYING",
  STREAMING: "STREAMING",
  LISTENING: "LISTENING",
  WATCHING: "WATCHING"
} as const;

export const MSG_RETRIEVE_MAXIMUM = 100;
export const MAX_INTERACTION_DURATION = 900000 - 30000; // 15min - 30sec

export const BUTTON_STYLE = {
  PRIMARY: "PRIMARY",
  SECONDARY: "SECONDARY",
  DANGER: "DANGER",
  LINK: "LINK",
  SUCCESS: "SUCCESS"
} as const;
