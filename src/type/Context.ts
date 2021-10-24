import Discord from "discord.js";

import Siamese from "~/Siamese";
import SlashCommandContext from "~/core/SlashCommandContext";

interface Context {
  bot: Siamese;
  author: Discord.GuildMember;
  guild: Discord.Guild;
  channel: Discord.TextChannel;
  isSlashCommand(): this is SlashCommandContext;
}

export default Context;
