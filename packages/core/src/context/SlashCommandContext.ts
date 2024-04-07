import { InteractionSender } from "@siamese/sender";
import { User, ChatInputCommandInteraction, TextChannel } from "discord.js";

import CommandContext from "./CommandContext";

import type Bot from "../Bot";
import type Command from "../Command";
import type Usage from "../usage/Usage";
import type { UsageOptionType } from "../usage/UsageOptionType";

class SlashCommandContext extends CommandContext {
  public sender: InteractionSender;

  public constructor(
    public readonly bot: Bot,
    public readonly command: Command,
    public readonly interaction: ChatInputCommandInteraction
  ) {
    super(bot, command);

    this.sender = new InteractionSender(interaction, command.ephemeral);
  }

  public getBotName = (): string => {
    const client = this.bot.client;

    const botName = this.interaction.inCachedGuild()
      ? this._getDisplayNameInGuild(this.interaction.guild, client.user)
      : client.user.displayName;

    return botName;
  };

  public getUser = (): User => {
    return this.interaction.user;
  };

  public getChannel = async () => {
    if (!this.interaction.channel) {
      return (await this.bot.client.channels.fetch(this.interaction.channelId))!;
    } else {
      return this.interaction.channel;
    }
  };

  public getGuildID = () => {
    return this.interaction.inGuild()
      ? this.interaction.guildId
      : null;
  };

  public getGuild = () => {
    return this.interaction.guild;
  };

  public getParams = <T extends Usage[]>(): UsageOptionType<T> => {
    return this.command.usage.map(usage => usage.getInteractionValue(this.interaction)) as UsageOptionType<T>;
  };

  public inGuild = (): boolean => {
    return this.interaction.inCachedGuild();
  };

  public inNSFWChannel = (): boolean => {
    if (this.interaction.inGuild()) {
      const channel = this.interaction.channel;
      if (!channel) return false;

      return !!(channel as TextChannel).nsfw;
    } else {
      // 보수적으로 접근
      return false;
    }
  };
}

export default SlashCommandContext;
