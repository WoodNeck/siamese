import Discord from "discord.js";

import Siamese from "~/Siamese";
import SlashCommandContext from "~/core/SlashCommandContext";
import Context from "~/type/Context";

class CommandContext implements Context {
  public readonly bot: Siamese;
  public readonly msg: Discord.Message;
  public readonly content: string;
  public readonly author: Discord.GuildMember;
  public readonly guild: Discord.Guild;
  public readonly channel: Discord.TextChannel;
  public readonly args: string[];

  public constructor(ctx: {
    bot: Siamese;
    msg: Discord.Message;
    content: string;
    author: Discord.GuildMember;
    guild: Discord.Guild;
    channel: Discord.TextChannel;
    args: string[];
  }) {
    Object.keys(ctx).forEach(key => {
      this[key] = ctx[key];
    });
  }

  public isSlashCommand(): this is SlashCommandContext {
    return false;
  }
}

export default CommandContext;
