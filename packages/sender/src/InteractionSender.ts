import { COLOR } from "@siamese/color";
import { EmbedBuilder } from "@siamese/embed";

import TextSender from "./TextSender";
import { DM_ERROR_FOOTER } from "./const";
import { sendDM, toMessageOptions } from "./utils";

import type { MessageSender } from "./MessageSender";
import type { ButtonInteraction, CollectorFilter, InteractionEditReplyOptions, InteractionReplyOptions, ChatInputCommandInteraction, InteractionCollector, ModalSubmitInteraction, MessageComponentInteraction, Collection } from "discord.js";

type RepliableInteraction = ChatInputCommandInteraction | ButtonInteraction | ModalSubmitInteraction;

class InteractionSender<T extends RepliableInteraction = RepliableInteraction> implements MessageSender {
  public readonly interaction: T;
  private _ephemeral: boolean;

  public constructor(initInteraction: T, ephemeral: boolean) {
    this.interaction = initInteraction;
    this._ephemeral = ephemeral;
  }

  public async send(msg: string | EmbedBuilder) {
    return this.sendObject(toMessageOptions(msg));
  }

  public async sendObject(options: InteractionReplyOptions) {
    const interaction = this.interaction;
    const hasEphemeralSet = interaction.ephemeral != null;

    const forceEphemeral = !!options.ephemeral;
    const ephemeral = hasEphemeralSet
      ? interaction.ephemeral as boolean
      : forceEphemeral || this._ephemeral;

    const sendOptions = {
      ...options,
      ephemeral
    };

    try {
      if (interaction.deferred || interaction.replied) {
        const msg = await interaction.followUp(sendOptions);
        return new TextSender(msg);
      } else {
        await interaction.reply(sendOptions);
        return this;
      }
    } catch (err) {
      throw new Error(`메시지 전송 실패: ${err}`);
    }
  }

  // 사실상 send와 동일
  public async reply(msg: string | EmbedBuilder) {
    return this.sendObject(toMessageOptions(msg));
  }

  // 사실상 sendObject와 동일
  public async replyObject(options: InteractionReplyOptions) {
    return this.sendObject(options);
  }

  public async replyError(errorMsg: string) {
    const user = this.interaction.user;
    const errorEmbed = new EmbedBuilder({
      description: errorMsg,
      color: COLOR.ERROR
    });

    try {
      await this.sendObject({
        embeds: [errorEmbed.build()],
        ephemeral: true
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

  public async editObject(options: Omit<InteractionEditReplyOptions, "content"> & { content?: string }) {
    const interaction = this.interaction;

    try {
      if (interaction.isButton()) {
        if (!interaction.replied) {
          await interaction.update(options);
        } else {
          await interaction.message.edit(options);
        }
      } else {
        await interaction.editReply(options);
      }
    } catch (err) {
      throw new Error(`메시지 수정 실패: ${err}`);
    }
  }

  public async delete() {
    const interaction = this.interaction;

    if (interaction.replied) {
      try {
        await interaction.deleteReply();
      } catch (err) {
        throw new Error(`메시지 삭제 실패: ${err}`);
      }
    } else {
      const msg = (interaction as MessageComponentInteraction).message;

      if (!msg) {
        throw new Error("삭제할 수 없는 인터랙션을 삭제하려고 함");
      }

      try {
        await msg.delete();
      } catch (err) {
        throw new Error(`메시지 삭제 실패: ${err}`);
      }
    }
  }

  public async sendThinking() {
    try {
      await this.interaction.deferReply({
        ephemeral: this._ephemeral
      });
    } catch (err) {
      throw new Error(`deferReply 실패: ${err}`);
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
    const channel = this.interaction.channel;
    if (!channel) {
      throw new Error("인터랙션에 채널이 존재하지 않아 컴포넌트 콜렉터를 생성할 수 없음");
    }

    const collector = channel.createMessageComponentCollector({
      filter: interaction => {
        if (!interaction.isButton()) return false;

        return filter(interaction);
      },
      time: maxWaitTime * 1000
    }) as InteractionCollector<ButtonInteraction>;

    collector.on("collect", interaction => {
      onCollect({
        sender: new InteractionSender(interaction, this._ephemeral),
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
          sender: lastInteraction
            ? new InteractionSender(lastInteraction, this._ephemeral)
            : this,
          collected,
          reason
        });
      });
    });
  }

  public waitTextResponse(maxWaitTime: number): Promise<string | null> {
    const channel = this.interaction.channel;
    if (!channel) {
      throw new Error("인터랙션에 채널이 존재하지 않아 컴포넌트 콜렉터를 생성할 수 없음");
    }

    const collector = channel.createMessageCollector({
      filter: msg => msg.author.id === this.interaction.user.id,
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

export default InteractionSender;
