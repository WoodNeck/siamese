import { error } from "@siamese/log";
import { InteractionSender, type TextSender, type ThreadSender } from "@siamese/sender";
import { getRandom } from "@siamese/util";

import VSGameState from "./VSGameState";
import { ERROR, GAME } from "./const";

import type { GameContext } from "./GameContext";
import type { GamePlayer } from "./GamePlayer";
import type { ActionStopOptions, PlayerActionParams, PlayerFinalActionParams } from "./types";
import type { Bot } from "@siamese/core";
import type { ThreadChannel } from "discord.js";

interface VSGameLogicOptions {
  ctx: GameContext;
  randomizeFirstPlayer: boolean;
  maxWaitTime: number;
}

/**
 * 1:1 게임 로직
 */
abstract class VSGameLogic {
  public readonly bot: Bot;
  public players: GamePlayer[];
  public channel: ThreadChannel;
  public sender: ThreadSender;
  public currentPlayer: GamePlayer;
  public maxWaitTime: number;

  private _state: VSGameState;

  public constructor({ ctx, randomizeFirstPlayer, maxWaitTime }: VSGameLogicOptions) {
    this.bot = ctx.bot;
    this.players = ctx.players;
    this.channel = ctx.channel;
    this.sender = ctx.sender;
    this.currentPlayer = randomizeFirstPlayer
      ? getRandom(this.players)
      : this.players[0];
    this.maxWaitTime = maxWaitTime;

    this.players.forEach((player, index) => player.setIndex(index));
    this._state = VSGameState.PLAYING;
  }

  public abstract showCurrentBoard(): Promise<TextSender[]>;
  public abstract onPlayerAction(params: PlayerActionParams): Promise<void>;
  public abstract onPlayerFinalAction(params: PlayerFinalActionParams): Promise<void>;
  public abstract onPlayerAFK(): Promise<void>;
  /**
   * 게임이 종료되었는지 여부를 체크합니다
   * @returns `true` 게임이 종료되었을 경우
   */
  public abstract checkGameFinished(): boolean;
  public abstract showGameFinishMessage(): Promise<void>;
  public abstract showSurrenderMessage(): Promise<void>;
  public abstract showTimeoutMessage(): Promise<void>;

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
      while (this._state === VSGameState.PLAYING) {
        // 현재 보드 상태를 사용자에게 표시
        const boardMsgs = await this.showCurrentBoard();

        // 사용자 입력을 받음
        await this.listenPlayerActions(boardMsgs);

        // 게임 상태가 변경되어 게임이 종료되었는지 체크
        if (this._state !== VSGameState.PLAYING) break;

        // 게임 로직상 마지막 수로 인해 게임이 종료되었는지 체크
        const finished = this.checkGameFinished();
        if (finished) break;

        // 플레이어 변경
        this.updateCurrentPlayer();
      }

      if (this._state === VSGameState.SURRENDERED) {
        await this.showSurrenderMessage();
      } else if (this._state === VSGameState.TIMEOUT) {
        await this.showTimeoutMessage();
      } else {
        await this.showGameFinishMessage();
      }
    } catch (err) {
      await this._sendErrorMessage(err);
    } finally {
      await this.destroy();
    }
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
        if (interaction.customId === GAME.SYMBOL.GG) {
          const sender = new InteractionSender(interaction, false);

          await sender.editObject({ components: [] });
          this.finishGameBySurrender();
          collector.stop(GAME.SYMBOL.GG);
          return;
        }

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

    if (reason === GAME.SYMBOL.GG) return;

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

  public updateCurrentPlayer() {
    this.currentPlayer = this.players[1 - this.currentPlayer.index];
  }

  public finishGame() {
    this._state = VSGameState.FINISHED;
  }

  public finishGameByTimeout() {
    this._state = VSGameState.TIMEOUT;
  }

  public finishGameBySurrender() {
    this._state = VSGameState.SURRENDERED;
  }

  public getOpponentIndex() {
    return 1 - this.currentPlayer.index;
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

export default VSGameLogic;
