import * as Discord from "discord.js";

export const ERROR = {
  FAIL_TITLE: (error: Error) => `${error.name}: ${error.message}`,
  FAIL_PLACE: (channel: Discord.TextBasedChannel, guild: Discord.Guild | null) => `${guild?.name}(${guild?.id}):${(channel as Discord.TextChannel).name}(${channel.id})`,
  FAIL_CMD: (content: string) => `명령어: ${content}`,
  FAIL_DESC: (error: Error) => `${error.stack ? error.stack : ""}`
};
