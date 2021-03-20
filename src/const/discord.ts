import type Discord from "discord.js";

export const MESSAGE_MAX_LENGTH = 1950;

export const FOOTER_MAX_LENGTH = 2048;

export const DISCORD_ERROR_CODE = {
  MISSING_PERMISSION: 50013
};

export const ACTIVITY: {
  [key: string]: Discord.ActivityType;
} = {
  PLAYING: "PLAYING",
  STREAMING: "STREAMING",
  LISTENING: "LISTENING",
  WATCHING: "WATCHING"
};

export const MSG_RETRIEVE_MAXIMUM = 100;
