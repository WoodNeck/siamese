import { ButtonBuilder } from "@siamese/button";
import { COLOR } from "@siamese/color";
import { EmbedBuilder } from "@siamese/embed";
import { EMOJI } from "@siamese/emoji";
import { env } from "@siamese/env";
import { InteractionSender, type MessageSender } from "@siamese/sender";
import { getRandom } from "@siamese/util";
import { ButtonStyle } from "discord.js";

import PartyGameLogic from "../PartyGameLogic";
import { GAME } from "../const";

import OneCardCanvas from "./OneCardCanvas";
import OneCardPlayer from "./OneCardPlayer";
import PlayingCard, { CardSymbol, CARD_EMOJI } from "./PlayingCard";
import PlayingCardDeck from "./PlayingCardDeck";
import { ONECARD } from "./const";

import type { GameContext } from "../GameContext";
import type { PartyPlayerActionParams, PartyPlayerFinalActionParams } from "../types";

class OneCardGame extends PartyGameLogic {
  public declare players: OneCardPlayer[];
  public declare currentPlayer: OneCardPlayer;

  private _deck: PlayingCardDeck;
  private _canvas!: OneCardCanvas;

  // Actions
  private _lastCard: PlayingCard;
  private _attackSum: number;
  private _isRightDirection: boolean;
  private _symbolChange: {
    from: CardSymbol;
    to: CardSymbol;
  } | null;

  public get lastCard() { return this._lastCard; }
  public get attackSum() { return this._attackSum; }
  public get isRightDirection() { return this._isRightDirection; }
  public get symbolChange() { return this._symbolChange; }

  public constructor(ctx: GameContext) {
    ctx.players = ctx.players.map(player => new OneCardPlayer(player));

    super({
      ctx,
      shufflePlayers: true,
      maxWaitTime: 60, // 1분
      maxRounds: 1
    });

    this._deck = new PlayingCardDeck();

    this._lastCard = this._deck.draw(1)[0];
    this._attackSum = 0;
    this._isRightDirection = true;
    this._symbolChange = null;
  }

  public override async prepare() {
    const players = this.players;
    const deck = this._deck;

    // 에셋 초기화
    this._canvas = await OneCardCanvas.getInstance(env.PLAYING_CARDS_DIR);
    await Promise.all(players.map(player => player.fetchAvatar()));

    players.forEach(player => {
      player.addCards(...deck.draw(ONECARD.INITIAL_CARD));
    });
  }

  public override async showCurrentBoard(): Promise<MessageSender> {
    const sender = this.sender;
    const board = await this._canvas.draw(this);

    // 현재 보드 표시
    await sender.sendObject({
      files: [{
        name: "board.gif",
        attachment: board
      }]
    });

    // 현재 손패 표시
    return await this._showCurrentHand();
  }

  public override async onPlayerAction({ stop, sender }: PartyPlayerActionParams): Promise<void> {
    const playerBtns = this._getPlayerButtons(this.currentPlayer, true);

    await sender.editObject({
      components: playerBtns.build()
    });

    stop(GAME.SYMBOL.NEXT_TURN, { deleteButtons: false });
  }

  public override async onPlayerFinalAction({ id }: PartyPlayerFinalActionParams): Promise<void> {
    if (id === GAME.SYMBOL.SKIP) {
      await this._applyPenalty();
    } else {
      const currentPlayer = this.currentPlayer;
      const cardID = parseFloat(id);
      const cards = currentPlayer.cards;
      const selectedCard = cards.splice(cards.findIndex(card => card.id === cardID), 1)[0];

      await this._play(selectedCard);
    }
  }

  public override async onPlayerAFK(): Promise<void> {
    // 스킵한걸로 처리
    await this._applyPenalty();
  }

  public override isRoundFinished(): boolean {
    const hasWinner = this.players.some(player => player.cards.length <= 0);
    if (hasWinner) return true;

    const playersLeft = this.players.filter(player => {
      return !player.defeated;
    });

    return playersLeft.length < 2;
  }

  public override async showRoundFinishMessage(): Promise<void> {
    // 단판임, DO_NOTHING
  }

  public override async showGameFinishMessage(): Promise<void> {
    const sender = this.sender;
    const playersSorted = this.players.toSorted((a, b) => {
      const aLen = a.defeated ? Infinity : a.cards.length;
      const bLen = b.defeated ? Infinity : b.cards.length;

      return aLen - bLen;
    });
    const winner = playersSorted[0];
    const embed = new EmbedBuilder();

    embed.setTitle(ONECARD.WINNER_HEADER(winner.user, this._lastCard));
    embed.setDescription(
      playersSorted.map((player, idx) => {
        return player.defeated
          ? `${idx + 1}${EMOJI.KEYCAP} ${player.user.displayName} - ${ONECARD.LABEL.DEFEATED}`
          : `${idx + 1}${EMOJI.KEYCAP} ${player.user.displayName} - ${ONECARD.CARD_LEFT(player.cards.length)}`;
      }).join("\n")
    );
    embed.setColor(COLOR.BOT);

    await sender.send(embed);
  }

  public override updateRoundFirstPlayer(): void {
    // DO_NOTHING
  }

  public getMaxCardCount() {
    const players = this.players;
    const totalCardCount = 54; // Fixed, 13 * 4 + 2
    const maxCardPerPlayer = Math.floor(totalCardCount / players.length);
    const maximumCardCount = Math.min(maxCardPerPlayer + 1, 20);

    return maximumCardCount;
  }

  private async _showCurrentHand() {
    const currentPlayer = this.currentPlayer;
    const playerBtns = this._getPlayerButtons(currentPlayer, false);

    const playerInteraction = currentPlayer.interaction!;
    const handSender = new InteractionSender(playerInteraction, true);

    const choiceMsg = await handSender.sendObject({
      content: ONECARD.TURN_HEADER(currentPlayer.user),
      components: playerBtns.build()
    });

    return choiceMsg;
  }

  private async _applyPenalty() {
    const currentPlayer = this.currentPlayer;
    const penalty = this._getCurrentPanelty();
    const maxCardCount = this.getMaxCardCount();

    if (currentPlayer.canAddCards(penalty, maxCardCount)) {
      currentPlayer.addCards(...this._deck.draw(penalty));
    } else {
      currentPlayer.defeat(this._deck);
    }

    // 공격량 합계를 초기화
    this._attackSum = 0;

    this._passTurnToNextPlayer(false);
  }

  private async _play(card: PlayingCard) {
    this._attackSum += this._getAttackCardValue(card);

    const isJumpCard = card.index === 10;
    const isDirChangeCard = card.index === 11;
    const isSymbolChangeCard = card.index === 6;

    if (isDirChangeCard) {
      this._isRightDirection = !this._isRightDirection;
    }

    if (isSymbolChangeCard) {
      await this._listenSymbolChange(card);
    } else {
      this._symbolChange = null;
    }

    this._deck.retrieve(this._lastCard);
    this._lastCard = card;

    this._passTurnToNextPlayer(isJumpCard);
  }

  private async _listenSymbolChange(lastCard: PlayingCard): Promise<void> {
    const currentPlayer = this.currentPlayer;
    const symbols = [
      CardSymbol.SPADE,
      CardSymbol.HEART,
      CardSymbol.DIAMOND,
      CardSymbol.CLUB
    ];

    const symbolBtns = new ButtonBuilder();
    symbols.forEach(symbol => {
      symbolBtns.addButton({
        id: symbol.toString(),
        emoji: CARD_EMOJI[symbol],
        style: ButtonStyle.Secondary
      });
    });

    const choiceSender = new InteractionSender(currentPlayer.interaction!, true);

    const choiceMsg = await choiceSender.sendObject({
      content: ONECARD.CHANGE_HEADER(currentPlayer.user),
      components: symbolBtns.build()
    });

    const { collected } = await choiceMsg.watchBtnClick({
      filter: () => true,
      maxWaitTime: 60, // 1분,
      onCollect: async ({ interaction, sender, collector }) => {
        await sender.editObject({ components: [] }).catch(() => void 0);
        currentPlayer.setInteraction(interaction);
        collector.stop();
      }
    });

    const interaction = collected.first();
    const selected = interaction
      ? parseFloat(interaction.customId)
      : getRandom(symbols); // AFK

    this._symbolChange = {
      from: lastCard.symbol,
      to: selected
    };
  }

  private _passTurnToNextPlayer(isJump: boolean) {
    const currentPlayer = this.currentPlayer;
    const playersLeft = this.players.filter(player => !player.defeated);
    const players = currentPlayer.defeated
      ? [...playersLeft, currentPlayer].sort((a, b) => a.index - b.index)
      : playersLeft;

    const absIndexIncrease = isJump ? 2 : 1;
    const indexDiff = this._isRightDirection ? absIndexIncrease : -absIndexIncrease;
    const currentIndex = players.findIndex(player => player === currentPlayer);
    const playerCount = players.length;
    const nextPlayerIdx = (currentIndex + indexDiff) >= 0
      ? (currentIndex + indexDiff) % playerCount
      : currentIndex + indexDiff + playerCount;

    this.currentPlayer = players[nextPlayerIdx];
  }

  private _getPlayerButtons(player: OneCardPlayer, disabled: boolean) {
    const buttons = new ButtonBuilder();

    player.cards.forEach(card => {
      buttons.addButton({
        id: card.id.toString(),
        style: ButtonStyle.Secondary,
        emoji: card.getEmoji(),
        label: card.getName(),
        disabled: disabled || !this._canPlay(card)
      });
    });

    const penalty = this._getCurrentPanelty();

    buttons.addButton({
      id: GAME.SYMBOL.SKIP,
      style: ButtonStyle.Danger,
      emoji: EMOJI.BOMB,
      label: ONECARD.LABEL.SKIP(penalty),
      disabled
    });

    return buttons;
  }

  private _canPlay(card: PlayingCard) {
    const lastCard = this._lastCard;

    const wasAttackCard = this._attackSum > 0;
    const isJoker = card.symbol === CardSymbol.JOKER;
    const wasJoker = lastCard.symbol === CardSymbol.JOKER;
    const hasSameSymbol = card.symbol === this._getCurrentSymbol();
    const hasSameNumber = card.index === lastCard.index;

    if (wasAttackCard) {
      if (wasJoker) {
        return isJoker;
      } else {
        return isJoker || hasSameNumber || (hasSameSymbol && card.index <= lastCard.index);
      }
    }

    return hasSameNumber || hasSameSymbol || isJoker || wasJoker;
  }

  private _getCurrentSymbol() {
    if (this._symbolChange) {
      return this._symbolChange.to;
    } else {
      return this._lastCard.symbol;
    }
  }

  private _getCurrentPanelty() {
    return this._attackSum > 0 ? this._attackSum : 1;
  }

  private _getAttackCardValue(card: PlayingCard) {
    // JOKER
    if (card.symbol === CardSymbol.JOKER) return 5;
    // A
    if (card.index === 0) return 3;
    // 2
    if (card.index === 1) return 2;

    return 0;
  }
}

export { OneCardGame, CARD_EMOJI, CardSymbol };
