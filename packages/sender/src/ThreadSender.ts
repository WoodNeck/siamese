import { EmbedBuilder } from "@siamese/embed";
import { ThreadChannel, type ButtonInteraction, type CollectorFilter, type InteractionCollector, type MessageCreateOptions, Collection } from "discord.js";

import TextSender from "./TextSender";
import { isValidOptions, toMessageOptions } from "./utils";

class ThreadSender {
  private _channel: ThreadChannel;

  public constructor(channel: ThreadChannel) {
    this._channel = channel;
  }

  public async send(msg: string | EmbedBuilder) {
    return this.sendObject(toMessageOptions(msg));
  }

  public async sendObject(options: MessageCreateOptions) {
    if (!isValidOptions(options)) {
      throw new Error(`빈 내용을 전송하려고 했음: ${options}`);
    }

    try {
      const msg = await this._channel.send(options);
      return new TextSender(msg);
    } catch (err) {
      throw new Error(`메시지 전송 실패: ${err}`);
    }
  }

  public async sendThinking() {
    try {
      await this._channel.sendTyping();
    } catch (err) {
      throw new Error(`sendTyping 실패: ${err}`);
    }
  }

  public async watchBtnClick({
    filter,
    maxWaitTime,
    onCollect
  }: {
    filter?: CollectorFilter<[ButtonInteraction]>;
    maxWaitTime: number;
    onCollect: (props: {
      interaction: ButtonInteraction;
      collector: InteractionCollector<ButtonInteraction>;
    }) => void;
  }): Promise<{
    collected: Collection<string, ButtonInteraction>;
    reason: string
  }> {
    const collector = this._channel.createMessageComponentCollector({
      filter: interaction => {
        if (interaction.user.bot) return false;
        if (!interaction.isButton()) return false;

        if (filter) {
          return filter(interaction);
        } else {
          return true;
        }
      },
      time: maxWaitTime * 1000
    }) as InteractionCollector<ButtonInteraction>;

    collector.on("collect", interaction => {
      onCollect({
        interaction,
        collector
      });
    });

    return new Promise(resolve => {
      collector.on("end", (collected, reason) => {
        resolve({
          collected,
          reason
        });
      });
    });
  }
}

export default ThreadSender;
