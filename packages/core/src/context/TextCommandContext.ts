import { TextSender } from "@siamese/sender";
import { type Message, User, TextChannel } from "discord.js";

import Usage, { type TextParseContext } from "../usage/Usage";

import CommandContext from "./CommandContext";

import type Bot from "../Bot";
import type Command from "../Command";
import type { UsageOptionType } from "../usage/UsageOptionType";
import type UsageType from "../usage/UsageType";

class TextCommandContext extends CommandContext {
  public sender: TextSender;

  private _contentOffset: number;

  public constructor(
    public readonly bot: Bot,
    public readonly command: Command,
    public readonly msg: Message,
    contentOffset: number
  ) {
    super(bot, command);

    this.sender = new TextSender(msg);
    this._contentOffset = contentOffset;
  }

  public getBotName = (): string => {
    const client = this.bot.client;

    const botName = this.msg.inGuild()
      ? this._getDisplayNameInGuild(this.msg.guild, client.user)
      : client.user.displayName;

    return botName;
  };

  public getUser = (): User => {
    return this.msg.author;
  };

  public getChannel = async () => {
    return this.msg.channel;
  };

  public getGuildID = () => {
    return this.msg.inGuild()
      ? this.msg.guildId
      : null;
  };

  public getGuild = () => {
    return this.msg.guild;
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  public getParams = <T extends Usage[]>(): UsageOptionType<T> => {
    const msg = this.msg;
    const content = msg.content.slice(this._contentOffset);
    const args = this._parseArgs(content);

    const usages = this.command.usage;
    const usageByType = usages.reduce((sorted, usage) => {
      if (sorted[usage.type]) {
        sorted[usage.type].list.push(usage);
        return sorted;
      } else {
        return {
          ...sorted,
          [usage.type]: {
            ref: 0,
            list: [usage]
          }
        };
      }
    }, {} as Record<UsageType, { ref: number, list: Usage[] }>);

    return usages.map((usage, index) => {
      const sameTyped = usageByType[usage.type];
      const typeIndex = sameTyped.ref;

      sameTyped.ref += 1;

      return usage.getTextValue({
        index,
        typeIndex,
        isLast: index === usages.length - 1,
        isTypeLast: typeIndex === sameTyped.list.length - 1,
        msg,
        content,
        args
      } satisfies TextParseContext);
    }) as UsageOptionType<T>;
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  public inGuild = (): boolean => {
    return this.msg.inGuild();
  };

  public inNSFWChannel = (): boolean => {
    if (this.msg.inGuild()) {
      const channel = this.msg.channel;

      return !!(channel as TextChannel).nsfw;
    } else {
      // 보수적으로 접근
      return false;
    }
  };

  private _parseArgs(content: string) {
    const args: string[] = [];
    let lastIdx = 0;
    let idx = 0;

    while (idx < content.length) {
      const char = content[idx];

      if (char === " ") {
        // Split args by blank space;
        // Exclude multiple blanks
        if (lastIdx !== idx) {
          args.push(content.substring(lastIdx, idx));
        }

        idx += 1;
        lastIdx = idx;
      } else if (char === "\"" && lastIdx === idx) {
        // Bundle args bound in double quotes
        // Exclude quotes only separated by blank space
        const endIdx = content.indexOf("\" ", idx + 1);
        if (endIdx > 0) {
          args.push(content.substring(idx + 1, endIdx));
          lastIdx = endIdx + 2;
          idx = lastIdx;
        } else if (content.endsWith("\"")) {
          // Case of all remaining string is bound in double quote
          args.push(content.substring(idx + 1, content.length - 1));
          lastIdx = content.length;
          idx = lastIdx;
          break;
        } else {
          idx += 1;
        }
      } else {
        idx += 1;
      }
    }

    // Append last arg
    if (lastIdx < content.length) {
      args.push(content.substring(lastIdx, content.length));
    }

    // For blank arg, add double quotes for it as Discord won't accept blank message
    return args.map(arg => arg === " " ? `"${arg}"` : arg);
  }
}

export default TextCommandContext;
