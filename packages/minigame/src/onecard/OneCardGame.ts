import { COLOR } from "@siamese/color";
import { EmbedBuilder } from "@siamese/embed";
import { EMOJI } from "@siamese/emoji";
import { env } from "@siamese/env";

import PartyGameLogic from "../PartyGameLogic";

import OneCardCanvas from "./OneCardCanvas";
import OneCardPlayer from "./OneCardPlayer";
import PlayingCard, { CardSymbol, CARD_EMOJI } from "./PlayingCard";
import PlayingCardDeck from "./PlayingCardDeck";
import { ONECARD } from "./const";

import type { GameContext } from "../GameContext";
import type { PlayerActionParams, PlayerFinalActionParams } from "../types";
import type { TextSender } from "@siamese/sender";

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

  public override async showCurrentBoard(): Promise<TextSender[]> {
    const sender = this.sender;
    const board = await this._canvas.draw(this);

    const boardMsg = await sender.sendObject({
      files: [{
        name: "board.gif",
        attachment: board
      }]
    });

    return [boardMsg];
  }

  public override async onPlayerAction(params: PlayerActionParams): Promise<void> {

  }

  public override async onPlayerFinalAction(params: PlayerFinalActionParams): Promise<void> {

  }

  public override async onPlayerAFK(): Promise<void> {

  }

  public override isRoundFinished(): boolean {
    const hasWinner = this.players.some(player => player.cards.length <= 0);

    if (hasWinner) return false;

    const playersLeft = this.players.filter(player => {
      return !player.defeated;
    });

    return playersLeft.length < 2;
  }

  public override async showRoundFinishMessage(): Promise<void> {

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

  public override updateCurrentPlayer(): void {

  }

  public getMaxCardCount() {
    const players = this.players;
    const totalCardCount = 54; // Fixed, 13 * 4 + 2
    const maxCardPerPlayer = Math.floor(totalCardCount / players.length);
    const maximumCardCount = Math.min(maxCardPerPlayer + 1, 20);

    return maximumCardCount;
  }

  private async _nextTurn() {
    await this._showBoard();

    const connected = await this._showReconnectMessage();
    if (!connected) return;

    await this._listenPlayerAction();
  }

  private async _showBoard() {
    const threadChannel = this._threadChannel;
    const board = await this._canvas.draw(this);

    await threadChannel.send({
      files: [{
        name: "board.gif",
        attachment: board
      }]
    });
  }

  private async _showReconnectMessage(): Promise<boolean> {
    const currentPlayer = this._currentPlayer;
    const threadChannel = this._threadChannel;
    const reconnector = this._reconnector;

    if (!reconnector.shouldReconnect(currentPlayer)) return true;

    const connected = await reconnector.run(threadChannel, [currentPlayer]);

    if (!connected) {
      this._timeoutFlag = true;
    }

    return connected;
  }

  private async _listenPlayerAction(): Promise<void> {
    const currentPlayer = this._currentPlayer;
    const playerBtns = this._getPlayerButtons(currentPlayer);

    const playerInteraction = currentPlayer.interaction;
    const send = playerInteraction.replied || playerInteraction.deferred
      ? playerInteraction.followUp.bind(playerInteraction)
      : playerInteraction.reply.bind(playerInteraction);

    const choiceMsg = await send({
      content: ONECARD.TURN_HEADER(currentPlayer.user),
      components: playerBtns,
      ephemeral: true,
      fetchReply: true
    }) as Discord.Message;

    const collector = choiceMsg.createMessageComponentCollector({
      time: 60 * 1000 // 1 min
    });

    return new Promise<void>(resolve => {
      collector.on("collect", async interaction => {
        await interaction.update({ components: [] }).catch(() => void 0);

        currentPlayer.interaction = interaction;

        const id = interaction.customId;

        if (id !== GAME.SYMBOL.SKIP) {
          const cardID = parseFloat(id);
          const cards = currentPlayer.cards;
          const selectedCard = cards.splice(cards.findIndex(card => card.id === cardID), 1)[0];

          await this._play(selectedCard);
          collector.stop(GAME.SYMBOL.NEXT_TURN);
        } else {
          collector.stop();
        }
      });

      collector.on("end", async (_, reason) => {
        if (reason === GAME.SYMBOL.NEXT_TURN) {
          resolve();
        } else {
          // Apply penalty also for the timeout
          await this._applyPenalty();
          resolve();
        }
      });
    });
  }

  private async _applyPenalty() {
    const currentPlayer = this._currentPlayer;
    const penalty = this._getCurrentPanelty();
    const maxCardCount = this.getMaxCardCount();

    if (currentPlayer.canAddCards(penalty, maxCardCount)) {
      currentPlayer.addCards(...this._deck.draw(penalty));
    } else {
      currentPlayer.defeat(this._deck);
    }

    // Reset attack card sum
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
    const currentPlayer = this._currentPlayer;
    const symbols = [
      CardSymbol.SPADE,
      CardSymbol.HEART,
      CardSymbol.DIAMOND,
      CardSymbol.CLUB
    ];
    const symbolBtns = symbols.map(symbol => {
      const btn = new MessageButton();

      btn.setCustomId(symbol.toString());
      btn.setEmoji(CARD_EMOJI[symbol]);
      btn.setStyle(BUTTON_STYLE.SECONDARY);

      return btn;
    });
    const buttonRow = new MessageActionRow().addComponents(...symbolBtns);

    const choiceMsg = await currentPlayer.interaction.followUp({
      content: ONECARD.CHANGE_HEADER(currentPlayer.user),
      components: [buttonRow],
      ephemeral: true,
      fetchReply: true
    }) as Discord.Message;

    const collector = choiceMsg.createMessageComponentCollector({
      time: 60 * 1000 // 1 min
    });

    return new Promise<void>(resolve => {
      collector.on("collect", async interaction => {
        await interaction.update({ components: [] }).catch(() => void 0);

        currentPlayer.interaction = interaction;

        collector.stop();
      });

      collector.on("end", async collected => {
        const interaction = collected.first();
        const selected = interaction
          ? parseFloat(interaction.customId)
          : getRandom(symbols);

        this._symbolChange = {
          from: lastCard.symbol,
          to: selected
        };

        resolve();
      });
    });
  }

  private _passTurnToNextPlayer(isJump: boolean) {
    const currentPlayer = this._currentPlayer;
    const playersLeft = this._players.filter(player => !player.defeated);
    const players = currentPlayer.defeated
      ? [...playersLeft, currentPlayer].sort((a, b) => a.playerIndex - b.playerIndex)
      : playersLeft;

    const absIndexIncrease = isJump ? 2 : 1;
    const indexDiff = this._isRightDirection ? absIndexIncrease : -absIndexIncrease;
    const currentIndex = players.findIndex(player => player === currentPlayer);
    const playerCount = players.length;
    const nextPlayerIdx = (currentIndex + indexDiff) >= 0
      ? (currentIndex + indexDiff) % playerCount
      : currentIndex + indexDiff + playerCount;

    this._currentPlayer = players[nextPlayerIdx];
  }

  private _getPlayerButtons(player: OneCardPlayer) {
    const cardBtns = player.cards.map(card => {
      const btn = new MessageButton();

      btn.setCustomId(card.id.toString());
      btn.setStyle(BUTTON_STYLE.SECONDARY);
      btn.setEmoji(card.getEmoji());
      btn.setLabel(card.getName());

      if (!this._canPlay(card)) {
        btn.setDisabled(true);
      }

      return btn;
    });

    const penalty = this._getCurrentPanelty();
    const skipBtn = new MessageButton();
    skipBtn.setCustomId(GAME.SYMBOL.SKIP);
    skipBtn.setStyle(BUTTON_STYLE.DANGER);
    skipBtn.setEmoji(EMOJI.BOMB);
    skipBtn.setLabel(ONECARD.LABEL.SKIP(penalty));

    const rows = groupBy([...cardBtns, skipBtn], 5).map(btns => {
      return new MessageActionRow().addComponents(...btns);
    });

    return rows;
  }

  private _canPlay(card: PlayingCard) {
    const lastCard = this._lastCard;

    const wasAttackCard = this._attackSum > 0;
    const isJoker = card.symbol === CardSymbol.JOKER;
    const wasJoker = lastCard.symbol === CardSymbol.JOKER;
    const hasSameSymbol = card.symbol === this._getCurrentSymbol();
    const hasSameNumber = card.index === lastCard.index;

    if (wasAttackCard) {
      return isJoker || hasSameNumber || (hasSameSymbol && card.index <= lastCard.index);
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

export { OneCardGame };
