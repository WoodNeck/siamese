import { COLOR } from "@siamese/color";
import { EmbedBuilder } from "@siamese/embed";

import InteractionSender from "./InteractionSender";
import { DM_ERROR_FOOTER } from "./const";
import { isValidOptions, sendDM, toMessageOptions } from "./utils";

import type { MessageSender } from "./MessageSender";
import type { ButtonInteraction, Collection, CollectorFilter, InteractionCollector, Message, MessageCreateOptions, MessageEditOptions } from "discord.js";

class TextSender implements MessageSender {
  public readonly message: Message;

  public constructor(initMessage: Message) {
    this.message = initMessage;
  }

  public async send(msg: string | EmbedBuilder) {
    return this.sendObject(toMessageOptions(msg));
  }

  public async sendObject(options: MessageCreateOptions) {
    if (!isValidOptions(options)) {
      throw new Error(`빈 내용을 전송하려고 했음: ${options}`);
    }

    try {
      return new TextSender(await this.message.channel.send(options));
    } catch (err) {
      throw new Error(`메시지 전송 실패: ${err}`);
    }
  }

  public async reply(msg: string | EmbedBuilder) {
    return this.replyObject(toMessageOptions(msg));
  }

  public async replyObject(options: MessageCreateOptions) {
    return this.sendObject({
      ...options,
      reply: {
        messageReference: this.message,
        failIfNotExists: false
      }
    });
  }

  public async replyError(errorMsg: string) {
    const user = this.message.author;
    const errorEmbed = new EmbedBuilder({
      description: errorMsg,
      color: COLOR.ERROR
    });

    try {
      await this.replyObject({
        embeds: [errorEmbed.build()]
      });
    } catch {
      // 모종의 이유로 메시지를 전송할 수 없었을 경우 DM을 대신 전송
      errorEmbed.setFooter({
        text: DM_ERROR_FOOTER
      });

      return await sendDM(user, { embeds: [errorEmbed.build()] });
    }
  }

  public async edit(msg: string | EmbedBuilder) {
    return this.editObject(toMessageOptions(msg));
  }

  public async editObject(options: MessageEditOptions) {
    const msg = this.message;

    if (!msg.editable) return;

    try {
      await msg.edit(options);
    } catch (err) {
      throw new Error(`메시지 수정 실패: ${err}`);
    }
  }

  public async delete() {
    const msg = this.message;

    if (!msg.deletable) return;

    try {
      await msg.delete();
    } catch (err) {
      throw new Error(`메시지 삭제 실패: ${err}`);
    }
  }

  public async sendThinking() {
    try {
      await this.message.channel.sendTyping();
    } catch (err) {
      throw new Error(`sendTyping 실패: ${err}`);
    }
  }

  public watchBtnClick({
    filter,
    maxWaitTime,
    onCollect
  }: {
    filter: CollectorFilter<[ButtonInteraction]>;
    maxWaitTime: number;
    onCollect: (props: {
      sender: InteractionSender;
      interaction: ButtonInteraction;
      collector: InteractionCollector<ButtonInteraction>;
    }) => void;
  }) {
    const collector = this.message.createMessageComponentCollector({
      filter: interaction => {
        if (!interaction.isButton()) return false;

        return filter(interaction);
      },
      time: maxWaitTime * 1000
    }) as InteractionCollector<ButtonInteraction>;

    collector.on("collect", interaction => {
      onCollect({
        sender: new InteractionSender(interaction, false),
        interaction,
        collector
      });
    });

    return new Promise<{
      sender: MessageSender;
      collected: Collection<string, ButtonInteraction>;
      reason: string
    }>(resolve => {
      collector.on("end", (collected, reason) => {
        const lastInteraction = collected.last();

        resolve({
          sender: lastInteraction ? new InteractionSender(lastInteraction, false) : this,
          collected,
          reason
        });
      });
    });
  }

  public waitTextResponse(maxWaitTime: number): Promise<string | null> {
    const collector = this.message.channel.createMessageCollector({
      filter: msg => msg.author.id === this.message.author.id,
      time: maxWaitTime * 1000
    });

    collector.on("collect", () => {
      collector.stop();
    });

    return new Promise(resolve => {
      collector.on("end", async collected => {
        const msg = collected.first();

        if (msg) {
          resolve(msg.content);
        } else {
          resolve(null);
        }
      });
    });
  }
}

export default TextSender;
