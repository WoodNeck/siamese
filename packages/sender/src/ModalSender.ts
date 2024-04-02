
import InteractionSender from "./InteractionSender";

import type { SlashCommandContext } from "@siamese/core";
import type { ModalBuilder } from "@siamese/modal";

class ModalSender {
  public constructor(
    public readonly ctx: SlashCommandContext
  ) { }

  public send = async (modal: ModalBuilder, {
    maxWaitTime
  }: {
    maxWaitTime: number;
  }) => {
    const chatInteraction = this.ctx.interaction;

    // modal 전송 전에는 defer 불가
    if (chatInteraction.deferred) {
      throw new Error("모달 전송 전에 defer를 실행하였음");
    }

    try {
      await chatInteraction.showModal(modal.build());
    } catch (err) {
      throw new Error(`모달 전송 실패: ${err}`);
    }

    try {
      const submittedInteraction = await chatInteraction.awaitModalSubmit({
        filter: interaction => {
          if (interaction.customId !== modal.id) return false;

          return true;
        },
        time: maxWaitTime * 1000
      });

      return {
        sender: new InteractionSender(submittedInteraction, false),
        values: modal.inputs.map(input => {
          return submittedInteraction.fields.getTextInputValue(input.data.custom_id!);
        })
      };
    } catch {
      // 사용자가 취소함, 아무것도 하지 않음
    }
  };
}

export default ModalSender;
