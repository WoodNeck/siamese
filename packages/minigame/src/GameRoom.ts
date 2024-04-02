import { ButtonBuilder } from "@siamese/button";
import { COLOR } from "@siamese/color";
import { EmbedBuilder } from "@siamese/embed";
import { ThreadSender } from "@siamese/sender";
import { isBetween } from "@siamese/util";
import { ButtonStyle, type ThreadChannel, type User } from "discord.js";

import { GamePlayer } from "./GamePlayer";
import { ERROR, GAME } from "./const";

import type { GameContext } from "./GameContext";
import type { Bot } from "@siamese/core";

class GameRoom {
  public readonly bot: Bot;
  public players: GamePlayer[];
  public channel: ThreadChannel;

  private _minPlayer: number;
  private _maxPlayer: number;

  public constructor(bot: Bot, threadChannel: ThreadChannel, players: User[], minPlayer: number, maxPlayer: number) {
    this.bot = bot;
    this.channel = threadChannel;
    this.players = players.map(user => new GamePlayer(user));
    this._minPlayer = minPlayer;
    this._maxPlayer = maxPlayer;
  }

  public getContext(): GameContext {
    return {
      bot: this.bot,
      players: this.players,
      channel: this.channel,
      sender: new ThreadSender(this.channel)
    };
  }

  public async waitForPlayers(gameName: string) {
    const channel = this.channel;
    const players = this.players;
    const minPlayer = this._minPlayer;
    const maxPlayer = this._maxPlayer;
    const initiator = players[0].user;

    if (players.length === maxPlayer) return true;

    const joinEmbed = new EmbedBuilder();
    joinEmbed.setTitle(gameName);
    joinEmbed.setDescription(GAME.JOIN_PLAYERS_LIST(players, maxPlayer));
    joinEmbed.setColor(COLOR.BOT);
    joinEmbed.setFooter({ text: GAME.JOIN_FOOTER(minPlayer) });

    const buttons = new ButtonBuilder();
    buttons.addButton({
      label: GAME.PLAYER_HEADER_LABEL,
      id: GAME.SYMBOL.PLAYER,
      style: ButtonStyle.Secondary,
      disabled: true
    });
    buttons.addButton({
      label: GAME.JOIN_BTN_LABEL,
      id: GAME.SYMBOL.JOIN,
      style: ButtonStyle.Primary
    });
    buttons.addButton({
      label: GAME.LEAVE_BTN_LABEL,
      id: GAME.SYMBOL.LEAVE,
      style: ButtonStyle.Secondary
    });

    buttons.addSeparator();

    buttons.addButton({
      label: GAME.GAME_HEADER_LABEL,
      id: GAME.SYMBOL.GAME,
      style: ButtonStyle.Secondary,
      disabled: true
    });
    buttons.addButton({
      label: GAME.START_BTN_LABEL,
      id: GAME.SYMBOL.START,
      style: ButtonStyle.Success
    });
    buttons.addButton({
      label: GAME.CANCEL_BTN_LABEL,
      id: GAME.SYMBOL.CANCEL,
      style: ButtonStyle.Danger
    });

    const threadSender = new ThreadSender(this.channel);
    const sender = await threadSender.sendObject({
      embeds: [joinEmbed.build()],
      components: buttons.build()
    });

    let maxPlayerAlertSent = false;
    const { reason } = await sender.watchBtnClick({
      filter: interaction => !interaction.user.bot,
      maxWaitTime: 15 * 60, // 15분
      async onCollect({ sender, interaction, collector }) {
        if (interaction.customId === GAME.SYMBOL.JOIN) {
          if (players.some(player => player.user.id === interaction.user.id)) {
            await sender.replyError(ERROR.ALREADY_JOINED);
          } else if (players.length >= maxPlayer) {
            await sender.replyError(ERROR.ROOM_FULL);
          } else {
            const newPlayer = new GamePlayer(interaction.user);
            newPlayer.setInteraction(interaction);
            players.push(newPlayer);
            joinEmbed.setDescription(GAME.JOIN_PLAYERS_LIST(players, maxPlayer));

            await sender.editObject({
              embeds: [joinEmbed.build()]
            });

            if (players.length === maxPlayer && !maxPlayerAlertSent) {
              maxPlayerAlertSent = true;
              await interaction.followUp({
                content: GAME.READY(initiator)
              });
            }
          }
        } else if (interaction.customId === GAME.SYMBOL.LEAVE) {
          if (!players.some(player => player.user.id === interaction.user.id)) {
            await sender.replyError(ERROR.NOT_JOINED);
          } else if (interaction.user.id === initiator.id) {
            await sender.replyError(ERROR.INITIATOR_CANT_LEAVE);
          } else {
            players.splice(players.findIndex(player => player.user.id === interaction.user.id), 1);
            joinEmbed.setDescription(GAME.JOIN_PLAYERS_LIST(players, maxPlayer));

            await interaction.update({
              embeds: [joinEmbed.build()]
            });
          }
        } else if (interaction.customId === GAME.SYMBOL.START) {
          if (interaction.user.id !== initiator.id) {
            await sender.replyError(ERROR.ONLY_FOR_INITIATOR);
          } else if (!isBetween(players.length, minPlayer, maxPlayer)) {
            await sender.replyError(ERROR.MISSING_PLAYERS);
          } else {
            // First one is always initiator
            players[0].interaction = interaction;
            await sender.editObject({ components: [] });
            collector.stop(GAME.SYMBOL.START);
          }
        } else if (interaction.customId === GAME.SYMBOL.CANCEL) {
          if (interaction.user.id !== initiator.id) {
            await sender.replyError(ERROR.ONLY_FOR_INITIATOR);
          } else {
            joinEmbed.setDescription(GAME.CANCELED);
            await interaction.update({
              embeds: [joinEmbed.build()],
              components: []
            });
            collector.stop(GAME.SYMBOL.CANCEL);
          }
        }
      }
    });

    if (reason === GAME.SYMBOL.CANCEL) {
      await channel.setLocked(true).catch(() => void 0);
      await channel.setArchived(true).catch(() => void 0);

      return false;
    }

    if (reason === GAME.SYMBOL.START) {
      await Promise.all(players.map(player => channel.members.add(player.user)));

      return true;
    }

    // AFK
    return false;
  }
}

export { GameRoom };
