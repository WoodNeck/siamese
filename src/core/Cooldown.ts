import Discord from "discord.js";

class Cooldown {
  private constructor(
    private _type: "guild" | "channel" | "author",
    public duration: number
  ) {}

  public static PER_GUILD(seconds: number) { return new Cooldown("guild", seconds); }
  public static PER_CHANNEL(seconds: number) { return new Cooldown("channel", seconds); }
  public static PER_USER(seconds: number) { return new Cooldown("author", seconds); }

  public getKey(msg: Discord.Message, cmdName: string) {
    switch (this._type) {
      case "guild":
        return (msg.guild && `${msg.guild.id}${cmdName}`) || "";
      case "channel":
        return (msg.channel && `${msg.channel.id}${cmdName}`) || "";
      case "author":
        return (msg.author && `${msg.author.id}${cmdName}`) || "";
    }
  }
}

export default Cooldown;
