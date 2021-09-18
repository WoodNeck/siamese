import Discord from "discord.js";

import Siamese from "~/Siamese";
import * as EMOJI from "~/const/emoji";
import * as ERROR from "~/const/error";

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

class Conversation {
  private _bot: Siamese;
  private _userMsg: Discord.Message;
  private _dialogues: Dialogue[];

  public constructor(bot: Siamese, userMsg: Discord.Message) {
    this._bot = bot;
    this._userMsg = userMsg;
    this._dialogues = [];
  }

  public add(dialogue: Dialogue) {
    this._dialogues.push(dialogue);
  }

  public async start(maxTime: number): Promise<string[]> {
    const bot = this._bot;
    const userMsg = this._userMsg;
    const responses: Discord.Message[] = [];
    const messagesSent: Discord.Message[] = [];

    const removeAllMessagesSent = async () => {
      for (const message of [...messagesSent, ...responses]) {
        if (!message.deleted) {
          await message.delete().catch(() => void 0);
        }
      }
    };

    for (const dialogue of this._dialogues) {
      const message = await bot.send(userMsg.channel as Discord.TextChannel, dialogue.content);

      if (!message) {
        await userMsg.react(EMOJI.CROSS).catch(() => void 0);
        await removeAllMessagesSent();
        throw new Error(ERROR.CMD.FAILED);
      }
      messagesSent.push(message);

      const collector = userMsg.channel.createMessageCollector({
        filter: (msg: Discord.Message) => msg.author.id === userMsg.author.id,
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
          await bot.replyError(userMsg, dialogue.errMsg);
          await removeAllMessagesSent();
          throw new Error(END_REASON.INVALID);
          // Opponent not responded
        case END_REASON.NO_RESPONSE:
        default:
          await bot.replyError(userMsg, ERROR.CONVERSATION.NO_RESPONSE(maxTime));
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
