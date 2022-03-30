import Discord, { GuildMember, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import PhraseGen from "korean-random-words";

import { createGameChannel } from "./utils";

import Command from "~/core/Command";
import Cooldown from "~/core/Cooldown";
import * as COLOR from "~/const/color";
import * as EMOJI from "~/const/emoji";
import * as ERROR from "~/const/error";
import * as PERMISSION from "~/const/permission";
import { GAME, ONECARD } from "~/const/command/minigame";
import { groupBy, shuffle } from "~/util/helper";
import PlayingCards, { Card } from "~/core/game/PlayingCards";
import GameRoom from "~/core/game/GameRoom";

export default new Command({
  name: ONECARD.CMD,
  description: ONECARD.DESC,
  permissions: [
    PERMISSION.EMBED_LINKS,
    PERMISSION.CREATE_PUBLIC_THREADS,
    PERMISSION.SEND_MESSAGES_IN_THREADS,
    PERMISSION.MANAGE_THREADS
  ],
  cooldown: Cooldown.PER_USER(10),
  slashData: new SlashCommandBuilder()
    .setName(ONECARD.CMD)
    .setDescription(ONECARD.DESC),
  sendTyping: false,
  execute: async ctx => {
    const { bot, channel, author } = ctx;

    if (channel.isThread()) {
      return await bot.replyError(ctx, ERROR.CMD.ONLY_IN_TEXT_CHANNEL);
    }

    const id = new PhraseGen().generatePhrase();
    const game = new GameRoom(ctx, 2, 5);
    const threadChannel = await createGameChannel(ctx, ONECARD.CMD, [author], id);
    const canStart = await game.waitForPlayers(ONECARD.JOIN_MSG_TITLE(author), threadChannel);

    if (canStart) {
      const oneCard = new OneCardGame(threadChannel, game.players);
      void oneCard.start();
    }
  }
});

class OneCardGame {
  private _deck: PlayingCards;
  private _lastCard: Card;
  private _threadChannel: Discord.ThreadChannel;
  private _direction: number;
  private _attackSum: number;
  private _jumpMultiplier: number;
  private _currentSymbol: string;
  private _finished: boolean;
  private _players: Array<{
    user: GuildMember;
    interaction: Discord.MessageComponentInteraction;
    cards: Card[];
  }>;

  public constructor(threadChannel: Discord.ThreadChannel, players: GameRoom["players"]) {
    this._deck = new PlayingCards();
    this._lastCard = this._deck.draw(1)[0];
    this._threadChannel = threadChannel;
    this._players = shuffle(players).map(player => ({
      user: player.user,
      interaction: player.interaction!,
      cards: []
    }));
    this._direction = 1;
    this._jumpMultiplier = 0;
    this._attackSum = 0;
    this._finished = false;
    this._currentSymbol = this._lastCard.emoji;
  }

  public async start() {
    const players = this._players;
    const deck = this._deck;

    players.forEach(player => {
      player.cards.push(...deck.draw(ONECARD.INITIAL_CARD));
    });

    let turn = 0;

    do {
      await this._nextTurn(turn);

      const newTurn = this._getNewPlayerIndex(turn);
      this._jumpMultiplier = 0;

      turn = newTurn;
    } while (players.every(p => p.cards.length > 0) && !this._finished);

    const threadChannel = this._threadChannel;
    const lastCardEmbed = this._createCurrentCardEmbed();
    const winner = players.findIndex(player => player.cards.length <= 0);

    await threadChannel.send({
      content: GAME.WINNER_HEADER(players.map(player => player.user), winner),
      embeds: [lastCardEmbed]
    }).catch(() => void 0);
    await threadChannel.setLocked(true).catch(() => void 0);
    await threadChannel.setArchived(true).catch(() => void 0);
  }

  private async _nextTurn(playerIdx: number) {
    const players = this._players;
    const currentPlayer = players[playerIdx];

    const { cards } = currentPlayer;

    const sortedCards = [...cards].sort((a, b) => a.id - b.id).map(card => ({
      ...card,
      canplay: this._canPlay(card)
    }));
    const shouldSkip = sortedCards.every(card => !card.canplay);

    if (shouldSkip) {
      return await this._showPenaltyMsg(playerIdx, false);
    }

    return this._showChoiceButtons(playerIdx, sortedCards, false);
  }

  private async _showChoiceButtons(playerIdx: number, cards: Array<Card & { canplay: boolean }>, shouldShowSkip: boolean) {
    const players = this._players;
    const currentPlayer = players[playerIdx];
    const threadChannel = this._threadChannel;
    const { interaction: playerInteraction } = currentPlayer;

    const reply = playerInteraction.replied || playerInteraction.deferred
      ? playerInteraction.followUp.bind(playerInteraction)
      : playerInteraction.reply.bind(playerInteraction);

    const currentCardEmbed = this._createCurrentCardEmbed();

    await threadChannel.send({
      content: GAME.TURN_HEADER(currentPlayer.user),
      embeds: [currentCardEmbed]
    });
    const buttonGroups = this._createCardButtons(cards, shouldShowSkip);
    const choiceMsg = await reply({ components: buttonGroups, ephemeral: true, fetchReply: true });

    const collector = choiceMsg.createMessageComponentCollector({
      filter: interaction => interaction.user.id === currentPlayer.user.id,
      time: 60 * 60 * 1000
    }) as Discord.InteractionCollector<Discord.MessageComponentInteraction<Discord.CacheType>>;

    return new Promise<void>(resolve => {
      collector.on("collect", async interaction => {
        const id = interaction.customId;

        await interaction.deferUpdate().catch(() => void 0);

        if (id === GAME.SYMBOL.PENALTY) {
          await this._showPenaltyMsg(playerIdx, true);
        } else if (id !== GAME.SYMBOL.SKIP) {
          const selectedCard = cards.splice(cards.findIndex(card => card.id.toString() === id), 1)[0];

          this._play(selectedCard);

          const nextTurnIsMyTurn = this._getNewPlayerIndex(playerIdx) === playerIdx;
          const nextCards = [...cards]
            .sort((a, b) => a.id - b.id)
            .map(card => ({ ...card, canplay: nextTurnIsMyTurn ? false : card.index === selectedCard.index }));

          const isChangeCard = selectedCard.index === 6;
          const canPlayAnother = nextCards.some(card => card.canplay);

          if (isChangeCard) {
            await this._showChangeButtons(playerIdx);
          } else if (canPlayAnother) {
            await this._showChoiceButtons(playerIdx, nextCards, true);
          }
        }

        collector.stop(GAME.SYMBOL.NEXT_TURN);
      });

      collector.on("end", (_, reason) => {
        if (reason !== GAME.SYMBOL.NEXT_TURN) {
          this._finished = true;
        }

        resolve();
      });
    });
  }

  private async _showChangeButtons(playerIdx: number) {
    const players = this._players;
    const currentPlayer = players[playerIdx];
    const threadChannel = this._threadChannel;

    const currentCardEmbed = this._createCurrentCardEmbed();

    const buttonRow = new MessageActionRow();
    const symbolBtns = [
      EMOJI.CARD.SPADE,
      EMOJI.CARD.HEART,
      EMOJI.CARD.CLUB,
      EMOJI.CARD.DIAMOND
    ].map(emoji => {
      const button = new MessageButton();
      button.setStyle("PRIMARY");
      button.setEmoji(emoji);
      button.setCustomId(emoji);
      return button;
    });

    buttonRow.addComponents(...symbolBtns);

    const msg = await threadChannel.send({
      content: ONECARD.CHANGE_HEADER(currentPlayer.user),
      embeds: [currentCardEmbed],
      components: [buttonRow]
    });

    const collector = msg.createMessageComponentCollector({
      filter: interaction => interaction.user.id === currentPlayer.user.id,
      time: 60 * 60 * 1000
    });

    collector.on("collect", async interaction => {
      this._currentSymbol = interaction.customId;

      await interaction.deferUpdate().catch(() => void 0);

      collector.stop(GAME.SYMBOL.SELECT);
    });

    return new Promise<void>(resolve => {
      collector.on("end", (_, reason) => {
        if (reason !== GAME.SYMBOL.SELECT) {
          this._finished = true;
        }

        resolve();
      });
    });
  }

  private async _showPenaltyMsg(playerIdx: number, wasIntentional: boolean) {
    const threadChannel = this._threadChannel;
    const currentPlayer = this._players[playerIdx];
    const { cards, interaction: playerInteraction } = currentPlayer;
    const penalty = this._attackSum > 0
      ? this._attackSum
      : 1;
    cards.push(...this._deck.draw(penalty));

    this._attackSum = 0;

    const reply = playerInteraction.replied
      ? playerInteraction.followUp.bind(playerInteraction)
      : playerInteraction.reply.bind(playerInteraction);

    await threadChannel.send({
      content: wasIntentional
        ? ONECARD.TAKE_PENALTY(currentPlayer.user, penalty, cards.length)
        : ONECARD.CANT_PLAY_ANY_CARD(currentPlayer.user, penalty, cards.length)
    });

    const cardsAfterPenalty = [...cards].sort((a, b) => a.id - b.id).map(card => ({
      ...card,
      canplay: false
    }));
    const buttonGroups = this._createCardButtons(cardsAfterPenalty, false);

    await reply({ components: buttonGroups, ephemeral: true, fetchReply: true });
  }

  private _play(card: Card) {
    const isAttackCard = card.index < 2;

    this._lastCard = card;
    this._currentSymbol = card.emoji;
    this._deck.retrieve(card.id);

    if (isAttackCard) {
      const cardValue = card.index === 0
        ? 3
        : card.index === 1
          ? 2
          : 5;

      this._attackSum += cardValue;
    }

    const isJumpCard = card.index === 10;
    if (isJumpCard) {
      this._jumpMultiplier += 2;
    }

    const isChangeCard = card.index === 11;
    if (isChangeCard) {
      this._direction *= -1;
    }
  }

  private _canPlay(card: Card): boolean {
    const lastCard = this._lastCard;

    const wasAttackCard = this._attackSum > 0;
    const isJoker = card.index === -1;
    const hasSameSymbol = card.emoji === this._currentSymbol;

    if (wasAttackCard) {
      return isJoker || (hasSameSymbol && card.index <= lastCard.index);
    }

    const hasSameNumber = card.name === lastCard.name;
    const wasJoker = lastCard.index === -1;

    return hasSameNumber || hasSameSymbol || isJoker || wasJoker;
  }

  private _getNewPlayerIndex(currentTurn: number) {
    const playerCount = this._players.length;
    const jump = this._jumpMultiplier > 0 ? this._jumpMultiplier : 1;
    let newTurn = currentTurn + jump * this._direction;

    newTurn %= playerCount;

    if (newTurn < 0) {
      return playerCount + newTurn;
    } else {
      return newTurn;
    }
  }

  private _createCurrentCardEmbed() {
    const currentCardEmbed = new MessageEmbed();
    currentCardEmbed.setColor(COLOR.BOT);
    currentCardEmbed.setImage(this._lastCard.url);
    currentCardEmbed.setFooter({ text: ONECARD.CURRENT_SYMBOL(this._currentSymbol) });

    this._players.forEach(player => {
      currentCardEmbed.addField(player.user.displayName, ONECARD.CARD_LEFT(player.cards.length), true);
    });

    return currentCardEmbed;
  }

  private _createCardButtons(cards: Array<Card & { canplay: boolean }>, shouldShowSkip: boolean) {
    const cardsForButtons = [...cards];

    if (shouldShowSkip) {
      cardsForButtons.push({
        id: GAME.SYMBOL.SKIP as any,
        index: -1,
        url: "",
        name: ONECARD.SKIP_LABEL,
        emoji: EMOJI.SKIP,
        canplay: true
      });
    }

    if (this._attackSum > 0) {
      cardsForButtons.push({
        id: GAME.SYMBOL.PENALTY as any,
        index: -1,
        url: "",
        name: ONECARD.PENALTY_LABEL(this._attackSum),
        emoji: EMOJI.UP_TRIANGLE,
        canplay: true
      });
    }

    const buttonGroups = groupBy(cardsForButtons, 25).reduce((all, cardGroup) => {
      const rows = groupBy(cardGroup, 5).map(cardBy5 => {
        const row  = new MessageActionRow();
        const cardBtns = cardBy5.map(card => {
          const btn = new MessageButton();

          btn.setStyle("PRIMARY");
          btn.setLabel(card.name);
          btn.setEmoji(card.emoji);
          btn.setCustomId(card.id.toString());

          if (!card.canplay) {
            btn.setDisabled(true);
          }

          return btn;
        });

        row.addComponents(...cardBtns);
        return row;
      });

      return [...all, ...rows];
    }, []);

    return buttonGroups;
  }
}
