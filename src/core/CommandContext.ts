import Discord from "discord.js";

import Siamese from "~/Siamese";
import Command from "~/core/Command";
import SlashCommandContext from "~/core/SlashCommandContext";
import Context from "~/type/Context";

class CommandContext implements Context {
  public readonly bot: Siamese;
  public readonly command: Command;
  public readonly msg: Discord.Message;
  public readonly content: string;
  public readonly author: Discord.GuildMember;
  public readonly guild: Discord.Guild;
  public readonly channel: Discord.TextChannel;

  public constructor(ctx: {
    bot: Siamese;
    command: Command;
    msg: Discord.Message;
    content: string;
    author: Discord.GuildMember;
    guild: Discord.Guild;
    channel: Discord.TextChannel;
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
