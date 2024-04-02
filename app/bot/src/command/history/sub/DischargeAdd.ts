import { GuildTextOnly, SlashCommandContext, SubCommand } from "@siamese/core";
import { Discharge } from "@siamese/db";
import { ModalBuilder } from "@siamese/modal";
import { ModalSender } from "@siamese/sender";
import dayjs from "dayjs";

import { DISCHARGE, DISCHARGE_ADD, FORCES } from "../const";

class DischargeAdd extends SubCommand {
  public override define() {
    return {
      data: DISCHARGE_ADD,
      slashOnly: true,
      preconditions: [
        GuildTextOnly
      ]
    };
  }

  public override async execute({ ctx, sender: origSender, getGuildID }: SlashCommandContext) {
    const guildID = getGuildID();
    if (!guildID) {
      await origSender.replyError(DISCHARGE.ERROR.GUILD_NOT_FOUND);
      return;
    }

    // Modal 빌드
    const modal = new ModalBuilder({ title: DISCHARGE_ADD.MODAL_TITLE });
    modal.addShortInput({
      label: DISCHARGE_ADD.MODAL_NAME_TITLE,
      placeholder: DISCHARGE_ADD.MODAL_NAME_DESC,
      maxLength: DISCHARGE_ADD.NAME_MAX_LENGTH
    });
    modal.addShortInput({
      label: DISCHARGE_ADD.MODAL_JOIN_TITLE,
      placeholder: DISCHARGE_ADD.MODAL_JOIN_DESC,
      maxLength: 10
    });
    modal.addShortInput({
      label: DISCHARGE_ADD.MODAL_FORCE_TITLE,
      placeholder: DISCHARGE_ADD.MODAL_FORCE_DESC(),
      maxLength: 2
    });

    // Modal 전송
    const modalSender = new ModalSender(ctx);
    const response = await modalSender.send(modal, {
      maxWaitTime: DISCHARGE_ADD.CONVERSATION_TIME
    });

    if (!response) return;

    const { sender, values } = response;
    const [name, date, force] = values;

    if (!this._validateDate(date)) {
      await sender.replyError(DISCHARGE.ERROR.JOIN_DATE_NOT_FORMATTED);
      return;
    } else if (!this._validateForce(force)) {
      await sender.replyError(DISCHARGE.ERROR.FORCES_NOT_LISTED);
      return;
    }

    // 기존에 동일한 이름으로 등록된 정보 존재
    const prevInfo = await Discharge.find(name, guildID);
    if (prevInfo) {
      await sender.replyError(DISCHARGE_ADD.NAME_ALREADY_EXISTS(name));
      return;
    }

    const joinDate = dayjs(date).format("YYYY/MM/DD");

    await Discharge.add(name, guildID, joinDate, force);
    await sender.send(DISCHARGE_ADD.SUCCESS(name));
  }

  private _validateDate(date: string) {
    return DISCHARGE_ADD.DATE_REGEX.test(date)
      && !isNaN(dayjs(date).millisecond());
  }

  private _validateForce(force: string) {
    return FORCES.some(validForce => validForce === force);
  }
}

export default DischargeAdd;
