import Discord from "discord.js";

import Siamese from "~/Siamese";
import Command from "~/core/Command";
import Context from "~/type/Context";

class SlashCommandContext implements Context {
  public readonly bot: Siamese;
  public readonly command: Command;
  public readonly interaction: Discord.CommandInteraction;
  public readonly author: Discord.GuildMember;
  public readonly guild: Discord.Guild;
  public readonly channel: Discord.TextChannel;

  public constructor(ctx: {
    bot: Siamese;
    command: Command;
    interaction: Discord.CommandInteraction;
    author: Discord.GuildMember;
    guild: Discord.Guild;
    channel: Discord.TextChannel;
  }) {
    Object.keys(ctx).forEach(key => {
      this[key] = ctx[key];
    });
  }

  public isSlashCommand(): this is SlashCommandContext {
    return true;
  }
}

export default SlashCommandContext;
