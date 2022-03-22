import Discord, { GuildMember, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";

import * as COLOR from "~/const/color";
import * as ERROR from "~/const/error";
import { GAME } from "~/const/command/minigame";
import { isBetween } from "~/util/helper";
import CommandContext from "~/core/CommandContext";
import SlashCommandContext from "~/core/SlashCommandContext";

class GameRoom {
  private _ctx: CommandContext | SlashCommandContext;
  private _minPlayer: number;
  private _maxPlayer: number;
  private _players: Array<{
    user: GuildMember;
    interaction: Discord.MessageComponentInteraction | null;
  }>;

  public get players() { return this._players; }

  public constructor(ctx: CommandContext | SlashCommandContext, minPlayer: number, maxPlayer: number) {
    this._ctx = ctx;
    this._players = [{
      user: ctx.author,
      interaction: null
    }];
    this._minPlayer = minPlayer;
    this._maxPlayer = maxPlayer;
  }

  public async waitForPlayers(gameName: string, threadChannel: Discord.ThreadChannel) {
    const ctx = this._ctx;
    const { author, guild } = ctx;
    const joinEmbed = new MessageEmbed();
    const players = this._players;
    const minPlayer = this._minPlayer;
    const maxPlayer = this._maxPlayer;

    joinEmbed.setTitle(gameName);
    joinEmbed.setDescription(GAME.JOIN_PLAYERS_LIST(players, maxPlayer));
    joinEmbed.setColor(COLOR.BOT);
    joinEmbed.setFooter({ text: GAME.JOIN_FOOTER(minPlayer) });

    const playerBtnHeader = new MessageButton();
    playerBtnHeader.setStyle("SECONDARY");
    playerBtnHeader.setLabel(GAME.PLAYER_HEADER_LABEL);
    playerBtnHeader.setCustomId(GAME.SYMBOL.PLAYER);
    playerBtnHeader.setDisabled(true);

    const joinBtn = new MessageButton();
    joinBtn.setStyle("PRIMARY");
    joinBtn.setLabel(GAME.JOIN_BTN_LABEL);
    joinBtn.setCustomId(GAME.SYMBOL.JOIN);

    const leaveBtn = new MessageButton();
    leaveBtn.setStyle("SECONDARY");
    leaveBtn.setLabel(GAME.LEAVE_BTN_LABEL);
    leaveBtn.setCustomId(GAME.SYMBOL.LEAVE);

    const controlBtnHeader = new MessageButton();
    controlBtnHeader.setStyle("SECONDARY");
    controlBtnHeader.setLabel(GAME.GAME_HEADER_LABEL);
    controlBtnHeader.setCustomId(GAME.SYMBOL.GAME);
    controlBtnHeader.setDisabled(true);

    const startBtn = new MessageButton();
    startBtn.setStyle("SUCCESS");
    startBtn.setLabel(GAME.START_BTN_LABEL);
    startBtn.setCustomId(GAME.SYMBOL.START);

    const cancelBtn = new MessageButton();
    cancelBtn.setStyle("DANGER");
    cancelBtn.setLabel(GAME.CANCEL_BTN_LABEL);
    cancelBtn.setCustomId(GAME.SYMBOL.CANCEL);

    const row = new MessageActionRow();
    row.addComponents(playerBtnHeader, joinBtn, leaveBtn);
    const row2 = new MessageActionRow();
    row2.addComponents(controlBtnHeader, startBtn, cancelBtn);

    const joinMsg = await threadChannel.send({
      embeds: [joinEmbed],
      components: [row, row2]
    });

    const collector = joinMsg.createMessageComponentCollector({
      filter: interaction => !interaction.user.bot,
      time: 60 * 60 * 1000
    });

    collector.on("collect", async interaction => {
      const user = guild.members.resolve(interaction.user.id)!;
      if (interaction.customId === GAME.SYMBOL.JOIN) {
        if (players.some(player => player.user.id === user.id)) {
          void interaction.reply({ content: ERROR.GAME.ALREADY_JOINED, ephemeral: true });
        } else if (players.length >= maxPlayer) {
          void interaction.reply({ content: ERROR.GAME.ROOM_FULL, ephemeral: true });
        } else {
          players.push({ user, interaction });
          joinEmbed.setDescription(GAME.JOIN_PLAYERS_LIST(players, maxPlayer));

          interaction.update({
            embeds: [joinEmbed]
          }).catch(() => void 0);
        }
      } else if (interaction.customId === GAME.SYMBOL.LEAVE) {
        if (!players.some(player => player.user.id === user.id)) {
          void interaction.reply({ content: ERROR.GAME.NOT_JOINED, ephemeral: true });
        } else if (user.id === author.id) {
          void interaction.reply({ content: ERROR.GAME.INITIATOR_CANT_LEAVE, ephemeral: true });
        } else {
          players.splice(players.findIndex(player => player.user.id === user.id), 1);
          joinEmbed.setDescription(GAME.JOIN_PLAYERS_LIST(players, maxPlayer));

          interaction.update({
            embeds: [joinEmbed]
          }).catch(() => void 0);
        }
      } else if (interaction.customId === GAME.SYMBOL.START) {
        if (user.id !== author.id) {
          void interaction.reply({ content: ERROR.GAME.ONLY_FOR_INITIATOR, ephemeral: true });
        } else if (!isBetween(players.length, minPlayer, maxPlayer)) {
          void interaction.reply({ content: ERROR.GAME.MISSING_PLAYERS, ephemeral: true });
        } else {
          // First one is always initiator
          players[0].interaction = interaction;
          await interaction.reply(GAME.INITIATING_GAME);
          collector.stop(GAME.SYMBOL.START);
        }
      } else if (interaction.customId === GAME.SYMBOL.CANCEL) {
        if (user.id !== author.id) {
          void interaction.reply({ content: ERROR.GAME.ONLY_FOR_INITIATOR, ephemeral: true });
        } else {
          joinEmbed.setDescription(GAME.CANCELED);
          interaction.update({
            embeds: [joinEmbed],
            components: []
          }).catch(() => void 0);
          collector.stop(GAME.SYMBOL.CANCEL);
        }
      }
    });

    return new Promise<boolean>(resolve => {
      collector.on("end", async (_, reason) => {
        if (reason === GAME.SYMBOL.CANCEL) return resolve(false);
        if (reason === GAME.SYMBOL.START) {

          await Promise.all(players.slice(1).map(player => threadChannel.members.add(player.user)));

          return resolve(true);
        }
        resolve(false); // AFK
      });
    });
  }
}

export default GameRoom;
