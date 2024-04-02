import { error } from "@siamese/log";
import { InteractionSender, type TextSender, type ThreadSender } from "@siamese/sender";
import { shuffle } from "@siamese/util";

import { ERROR, GAME } from "./const";

import type { GameContext } from "./GameContext";
import type { GamePlayer } from "./GamePlayer";
import type { ActionStopOptions, PlayerActionParams, PlayerFinalActionParams } from "./types";
import type { Bot } from "@siamese/core";
import type { ThreadChannel } from "discord.js";

interface PartyGameLogicOptions {
  ctx: GameContext;
  shufflePlayers: boolean;
  maxWaitTime: number;
  maxRounds: number;
}

/**
 * 다수 인원이 참가하는 턴제 게임 로직
 */
abstract class PartyGameLogic {
  public readonly bot: Bot;
  public players: GamePlayer[];
  public channel: ThreadChannel;
  public sender: ThreadSender;
  public currentPlayer: GamePlayer;
  public maxWaitTime: number;
  public maxRounds: number;

  public constructor({ ctx, shufflePlayers, maxWaitTime, maxRounds }: PartyGameLogicOptions) {
    const players = shufflePlayers
      ? shuffle(ctx.players)
      : ctx.players;

    this.bot = ctx.bot;
    this.players = players;
    this.channel = ctx.channel;
    this.sender = ctx.sender;
    this.currentPlayer = this.players[0];
    this.maxWaitTime = maxWaitTime;
    this.maxRounds = maxRounds;

    this.players.forEach((player, index) => {
      player.setIndex(index);
    });
  }

  public abstract showCurrentBoard(): Promise<TextSender[]>;
  public abstract onPlayerAction(params: PlayerActionParams): Promise<void>;
  public abstract onPlayerFinalAction(params: PlayerFinalActionParams): Promise<void>;
  public abstract onPlayerAFK(): Promise<void>;
  public abstract isRoundFinished(): boolean;
  public abstract showRoundFinishMessage(): Promise<void>;
  public abstract showGameFinishMessage(): Promise<void>;
  public abstract updateCurrentPlayer(): void;

  public async destroy() {
    const threadChannel = this.channel;

    try {
      await threadChannel.setLocked(true);
      await threadChannel.setArchived(true);
    } catch (err) {
      error(new Error(`쓰레드 아카이브 중 에러: ${err}`));
    }
  }

  public async start() {
    try {
      await this.prepare();

      for (let roundIndex = 0; roundIndex < this.maxRounds; roundIndex++) {
        await this.beforeRound();
        await this.startRound();
        await this.afterRound();
      }

      await this.showGameFinishMessage();

      await this.cleanup();
    } catch (err) {
      await this._sendErrorMessage(err);
    } finally {
      await this.destroy();
    }
  }

  /**
   * 게임을 시작하기 전에 에셋을 로드하는 등의 동작을 합니다. 1회만 호출됩니다.
   */
  public async prepare(): Promise<void> {
    // TEMPLATE METHOD
  }

  /**
   * 게임이 전부 종료된 이후 에셋 릴리즈 등의 동작을 합니다. 1회만 호출됩니다.
   */
  public async cleanup(): Promise<void> {
    // TEMPLATE METHOD
  }

  /**
   * 각 라운드를 시작하기 전에 호출되는 메소드
   */
  public async beforeRound(): Promise<void> {
    // TEMPLATE METHOD
  }

  /**
   * 각 라운드가 종료된 후에 호출되는 메소드
   */
  public async afterRound(): Promise<void> {
    // TEMPLATE METHOD
  }

  public async startRound() {
    while (this.isRoundFinished()) {
      // 플레이어 변경
      this.updateCurrentPlayer();

      // 현재 보드 상태를 사용자에게 표시
      const boardMsgs = await this.showCurrentBoard();

      // 사용자 입력을 받음
      await this.listenPlayerActions(boardMsgs);
    }

    await this.showRoundFinishMessage();
  }

  public async listenPlayerActions(messages: TextSender[]): Promise<void> {
    const playerID = this.currentPlayer.user.id;
    const { reason, collected } = await this.sender.watchBtnClick({
      filter: interaction => {
        return !interaction.user.bot
          && !!messages.find(msg => msg.message.id === interaction.message.id);
      },
      maxWaitTime: this.maxWaitTime,
      onCollect: async ({ interaction, collector }) => {
        // 플레이어가 아닌 인터랙션 차단
        if (interaction.user.id !== playerID) {
          const errorSender = new InteractionSender(interaction, true);

          if (this.players.some(player => player.user.id === interaction.user.id)) {
            return await errorSender.replyError(GAME.NOT_YOUR_TURN);
          } else {
            return await errorSender.replyError(GAME.NOT_IN_GAME);
          }
        }

        const sender = new InteractionSender(interaction, false);
        return await this.onPlayerAction({
          id: interaction.customId,
          interaction,
          sender,
          messages,
          stop: (reason: string, {
            deleteButtons = true
          }: Partial<ActionStopOptions> = {}) => {
            if (deleteButtons) {
              sender.editObject({ components: [] }).catch(() => void 0);
            }

            collector.stop(reason);
          }
        });
      }
    });

    // 사용자 입력 처리
    if (reason === GAME.SYMBOL.NEXT_TURN) {
      const playerInteractions = collected.filter(interaction => interaction.user.id === playerID);
      const lastInteraction = playerInteractions.last()!;

      await this.onPlayerFinalAction({
        id: lastInteraction.customId,
        interaction: lastInteraction,
        messages,
        sender: new InteractionSender(lastInteraction, false)
      });
    } else {
      await this.onPlayerAFK();
    }
  }

  private async _sendErrorMessage(err: unknown) {
    try {
      await this.bot.logger.error(new Error(`게임 진행중 오류 발생: ${err}`));
      await this.sender.send(ERROR.UNKNOWN);
    } catch (err) {
      error(new Error(`오류 정보 전송중 에러 발생: ${err}`));
    }
  }
}

export default PartyGameLogic;
