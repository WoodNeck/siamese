import CommandContext from "./CommandContext";
import SlashCommandContext from "./SlashCommandContext";

class Cooldown {
  public static PER_GUILD(seconds: number) { return new Cooldown("guild", seconds); }
  public static PER_CHANNEL(seconds: number) { return new Cooldown("channel", seconds); }
  public static PER_USER(seconds: number) { return new Cooldown("author", seconds); }

  private constructor(
    private _type: "guild" | "channel" | "author",
    public duration: number
  ) {}

  public getKey(ctx: CommandContext | SlashCommandContext, cmdName: string) {
    const { guild, channel, author } = ctx;

    switch (this._type) {
      case "guild":
        return (guild && `${guild.id}${cmdName}`) || "";
      case "channel":
        return (channel && `${channel.id}${cmdName}`) || "";
      case "author":
        return (author && `${author.id}${cmdName}`) || "";
    }
  }
}

export default Cooldown;
