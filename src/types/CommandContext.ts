import Discord from "discord.js";
import Siamese from "~/Siamese";

interface CommandContext {
  bot: Siamese;
  msg: Discord.Message;
  content: string;
  author: Discord.GuildMember;
  guild: Discord.Guild;
  channel: Discord.TextChannel;
  args: string[];
}

export default CommandContext;
