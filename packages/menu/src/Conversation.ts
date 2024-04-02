import Discord from "discord.js";

import * as EMOJI from "~/const/emoji";
import * as ERROR from "~/const/error";
import CommandContext from "~/core/CommandContext";
import SlashCommandContext from "~/core/SlashCommandContext";

interface Dialogue {
  content: Discord.MessageEmbed;
  checker: (msg: Discord.Message, collector: Discord.MessageCollector) => boolean;
  errMsg: string;
}

enum END_REASON {
  VALID = "VALID",
  INVALID = "INVALID",
  NO_RESPONSE = "NO_RESPONSE"
}

// TODO: 이거 지워버리고 Modal로 변경, 그게 더 편함
class Conversation {
  private _ctx: CommandContext | SlashCommandContext;
  private _dialogues: Dialogue[];

  public constructor(ctx: CommandContext | SlashCommandContext) {
    this._ctx = ctx;
    this._dialogues = [];
  }

  public add(dialogue: Dialogue) {
    this._dialogues.push(dialogue);
  }

  public async start(maxTime: number): Promise<string[] | null> {
    const ctx = this._ctx;
    const { bot } = ctx;
    const responses: Discord.Message[] = [];
    const messagesSent: Discord.Message[] = [];

    const removeAllMessagesSent = async () => {
      for (const message of [...messagesSent, ...responses]) {
        await message.delete().catch(() => void 0);
      }
    };

    for (const dialogue of this._dialogues) {
      const message = await bot.send(ctx, {
        embeds: [dialogue.content],
        fetchReply: true
      }) as Discord.Message;

      if (!message) {
        if (!ctx.isSlashCommand()) {
          await ctx.msg.react(EMOJI.CROSS).catch(() => void 0);
        }
        await removeAllMessagesSent();
        return null;
      }
      messagesSent.push(message);

      const collector = ctx.channel.createMessageCollector({
        filter: (msg: Discord.Message) => msg.author.id === ctx.author.id,
        time: maxTime * 1000
      });

      const result = await new Promise<{ collected: Discord.Collection<string, Discord.Message>; reason: string }>(resolve => {
        collector.on("collect", msg => {
          // Check response is what we want
          if (!dialogue.checker(msg, collector)) {
            collector.stop(END_REASON.INVALID);
          } else {
            collector.stop(END_REASON.VALID);
          }
        });
        collector.on("end", (collected, reason) => {
          resolve({ collected, reason });
        });
      });

      switch (result.reason) {
        case END_REASON.VALID:
          break;
        // Response was invalid
        case END_REASON.INVALID:
          await bot.replyError(ctx, dialogue.errMsg);
          await removeAllMessagesSent();
          throw new Error(END_REASON.INVALID);
        // Opponent not responded
        case END_REASON.NO_RESPONSE:
        default:
          await bot.replyError(ctx, ERROR.CONVERSATION.NO_RESPONSE(maxTime));
          await removeAllMessagesSent();
          throw new Error(END_REASON.NO_RESPONSE);
      }

      responses.push(result.collected.first()!);
    }

    const responseContents = responses.map(response => response.content);

    await removeAllMessagesSent();
    return responseContents;
  }
}

export default Conversation;
