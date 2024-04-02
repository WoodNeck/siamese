import { EmbedBuilder } from "@siamese/embed";

import type InteractionSender from "./InteractionSender";
import type { BaseMessageOptions, ButtonInteraction, Collection, CollectorFilter, InteractionCollector, MessageEditOptions } from "discord.js";

interface MessageSender {
  /**
   * 채널에 새로운 메시지를 보냅니다.
   * @throws {Error} 전송 실패시
   */
  send(msg: string | EmbedBuilder): Promise<MessageSender>;
  /**
   * 채널에 새로운 메시지를 보냅니다.
   * @throws {Error} 전송 실패시
   */
  sendObject(options: BaseMessageOptions): Promise<MessageSender>;
  /**
   * 원본 메시지를 보낸 사람에게 에러 메시지를 표시하여 답변합니다.
   * @throws {Error} 전송 실패시
   */
  replyError(errorMsg: string): Promise<void>;
  /**
   * 메시지에 답변하며 새로운 메시지를 보냅니다.
   * @throws {Error} 전송 실패시
   */
  reply(msg: string | EmbedBuilder): Promise<MessageSender>;
  /**
   * 메시지에 답변하며 새로운 메시지를 보냅니다.
   * @throws {Error} 전송 실패시
   */
  replyObject(options: BaseMessageOptions): Promise<MessageSender>;
  /**
   * 메시지를 업데이트합니다.
   * @throws {Error} 전송 실패시
   */
  edit(msg: string | EmbedBuilder): Promise<void>;
  /**
   * 메시지를 업데이트합니다.
   * @throws {Error} 전송 실패시
   */
  editObject(options: MessageEditOptions): Promise<void>;
  /**
   * 메시지를 제거합니다.
   * @throws {Error} 제거 실패시
   */
  delete(): Promise<void>;
  /**
   * 다음 메시지를 업데이트하기까지 길어질 경우
   * 이를 알려주기 위한 상태 정보를 전송합니다.
   * @throws {Error} 전송 실패시
   */
  sendThinking(): Promise<void>;
  /**
   * 메시지에서 버튼 클릭을 주어진 시간동안 감지합니다
   * @param options 옵션
   * @param options.filter 인터랙션 필터 함수
   * @param options.maxWaitTime 최대 대기 시간, 초 단위
   */
  watchBtnClick(options: {
    filter: CollectorFilter<[ButtonInteraction]>;
    maxWaitTime: number;
    onCollect: (props: {
      sender: InteractionSender;
      interaction: ButtonInteraction;
      collector: InteractionCollector<ButtonInteraction>;
    }) => void;
  }): Promise<{
    sender: MessageSender;
    collected: Collection<string, ButtonInteraction>;
    reason: string
  }>;
  /**
   * 주어진 시간동안 사용자의 응답을 1회 대기합니다.
   * @param {number} maxWaitTime 대기시간 (초)
   */
  waitTextResponse(maxWaitTime: number): Promise<string | null>;
}

export type { MessageSender };
