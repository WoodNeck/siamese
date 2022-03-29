import Discord, { MessageActionRow, MessageButton, MessageEmbed, ThreadChannel } from "discord.js";

import GameRoom from "../GameRoom";

import MahjongTile from "./MahjongTile";
import MahjongTiles from "./MahjongTiles";
import MahjongPlayer from "./MahjongPlayer";

import * as COLOR from "~/const/color";
import * as EMOJI from "~/const/emoji";
import { GAME, MAHJONG } from "~/const/command/minigame";
import { WIND, EMOJI as MAHJONG_EMOJI } from "~/const/mahjong";
import { BUTTON_STYLE } from "~/const/discord";
import { groupBy, shuffle, toEmoji } from "~/util/helper";

class MahjongGame {
  private _threadChannel: ThreadChannel;
  private _tiles: MahjongTiles;
  private _players: MahjongPlayer[];

  private _wind: number;
  private _round: {
    wind: number;
    turn: number;
    doraCount: number;
  };

  private _currentPlayerIdx: number;
  private _doras: MahjongTile[];
  private _uraDoras: MahjongTile[];
  private _kangTiles: MahjongTile[]; // 영상패

  private _timeoutFlag: boolean;

  public get wind() { return this._wind; }
  public get round() { return this._round; }
  public get tiles() { return this._tiles; }
  public get currentPlayer() { return this._players[this._currentPlayerIdx]; }

  public set wind(val: number) { this._wind = val; }

  public constructor(players: GameRoom["players"], threadChannel: Discord.ThreadChannel) {
    this._threadChannel = threadChannel;

    this._doras = [];
    this._uraDoras = [];
    this._kangTiles = [];

    this._players = shuffle(players).map((player, idx) => new MahjongPlayer(player, idx));
    this._currentPlayerIdx = 0;

    this._wind = WIND.EAST;
    this._round = {
      wind: -1,
      turn: 0,
      doraCount: 1
    };
    this._timeoutFlag = false;

    this.startNewRound(true);
  }

  public async start() {
    while (this._shouldContinueRound()) {
      await this.nextTurn();
    }

    if (this._timeoutFlag) {
      // TODO: TIMEOUT 메시지
    }
  }

  public startNewRound(changeWind: boolean) {
    const tiles = new MahjongTiles();

    this._doras = tiles.draw(5);
    this._uraDoras = tiles.draw(5);
    this._kangTiles = tiles.draw(4);

    this._round.turn = 0;
    this._round.doraCount = 1;

    if (changeWind) {
      this._round.wind += 1;
    }

    this._players.forEach(player => {
      player.reset();
      player.hands.add(tiles.draw(13).sort((a, b) => a.id - b.id));
    });

    this._tiles = tiles;
  }

  public async nextTurn() {
    const currentPlayer = this.currentPlayer;
    const newTile = this._tiles.draw(1)[0];

    currentPlayer.hands.add([newTile]);

    await this._showSummary();
    const handsMsg = await this._showHands();
    const discarded = await this._listenDiscard(handsMsg as Discord.Message);
    if (!discarded) return;
    await this._showDiscard();
    // 플레이어별 액션 메시지 전송
  }

  private async _showSummary() {
    const players = this._players;
    const threadChannel = this._threadChannel;
    const currentPlayer = this.currentPlayer;
    const embed = new MessageEmbed();

    players.forEach((player, idx) => {
      const discards = player.hands.discards.map(tile => tile.getEmoji()).join("") || EMOJI.ZERO_WIDTH_SPACE;

      embed.addField(MAHJONG.SUMMARY_FIELD_TITLE(player.user, player.playerIdx), discards, true);
      if (idx % 2) {
        embed.addField(EMOJI.ZERO_WIDTH_SPACE, EMOJI.ZERO_WIDTH_SPACE, true);
      }
    });
    embed.setColor(COLOR.BOT);

    embed.setFooter({
      text: MAHJONG.TILES_LEFT(this.tiles.left)
    });

    await threadChannel.send({
      content: GAME.TURN_HEADER(currentPlayer.user),
      embeds: [embed]
    });
  }

  private async _showHands() {
    const { interaction, hands } = this.currentPlayer;

    const tiles = hands.holding;
    const handEmojis = tiles.map(tile => tile.getEmoji());
    const rows = groupBy(tiles, 5).map(tileRow => {
      const row = new MessageActionRow();
      const btns = tileRow.map(tile => {
        const btn = new MessageButton();

        btn.setCustomId(tile.id.toString());
        btn.setStyle(BUTTON_STYLE.SECONDARY);
        btn.setEmoji(tile.getEmoji());

        return btn;
      });

      row.addComponents(...btns);
      return row;
    });

    const extraActionsRow = new MessageActionRow();

    hands.getKangableTiles().forEach(kangTiles => {
      const tile = kangTiles[0];
      const kangBtn = new MessageButton();
      kangBtn.setCustomId(MAHJONG.SYMBOL.KANG);
      kangBtn.setStyle(BUTTON_STYLE.PRIMARY);
      kangBtn.setLabel(MAHJONG.LABEL.KANG);
      kangBtn.setEmoji(tile.getEmoji());
      extraActionsRow.addComponents(kangBtn);
    });

    if (hands.isRiichiable()) {
      const riichiBtn = new MessageButton();
      riichiBtn.setCustomId(MAHJONG.SYMBOL.RIICHI);
      riichiBtn.setStyle(BUTTON_STYLE.PRIMARY);
      riichiBtn.setLabel(MAHJONG.LABEL.RIICHI);
      riichiBtn.setEmoji(toEmoji(MAHJONG_EMOJI.RIICHI[1].name, MAHJONG_EMOJI.RIICHI[1].id));
      extraActionsRow.addComponents(riichiBtn);
    }

    if (hands.isTsumoable(this)) {
      const tsumoBtn = new MessageButton();
      tsumoBtn.setCustomId(MAHJONG.SYMBOL.TSUMO);
      tsumoBtn.setStyle(BUTTON_STYLE.SUCCESS);
      tsumoBtn.setLabel(MAHJONG.LABEL.TSUMO);
      extraActionsRow.addComponents(tsumoBtn);
    }

    if (extraActionsRow.components.length > 0) {
      rows.push(extraActionsRow);
    }

    const msg = await interaction.followUp({
      content: handEmojis.join(""),
      components: rows,
      fetchReply: true,
      ephemeral: true
    });

    return msg;
  }

  private async _listenDiscard(msg: Discord.Message): Promise<boolean> {
    const currentPlayer = this.currentPlayer;
    const collector = msg.createMessageComponentCollector({
      filter: () => true,
      time: 600000 // 10 min
    });

    collector.on("collect", async interaction => {
      const tileID = parseFloat(interaction.customId);
      const tileIdx = currentPlayer.hands.holding.findIndex(tile => tile.id === tileID);

      currentPlayer.hands.play(tileIdx);
      await interaction.update({ components: [] });
      currentPlayer.interaction = interaction;
      collector.stop(MAHJONG.SYMBOL.DISCARD);
    });

    return new Promise(resolve => {
      collector.on("end", (_, reason) => {
        if (reason !== MAHJONG.SYMBOL.DISCARD) {
          this._timeoutFlag = true;
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  private async _showDiscard() {
    const threadChannel = this._threadChannel;
    const currentPlayer = this.currentPlayer;
    const embed = new MessageEmbed();

    const discards = currentPlayer.hands.discards;
    const lastDiscard = discards[discards.length - 1];

    embed.setFooter({
      text: MAHJONG.DISCARD_TITLE(currentPlayer.user),
      iconURL: currentPlayer.user.displayAvatarURL()
    });
    embed.setColor(COLOR.BOT);

    await threadChannel.send({
      content: lastDiscard.getEmoji(),
      embeds: [embed]
    });
  }

  private _shouldContinueRound() {
    return this._tiles.left > 0 && !this._timeoutFlag;
  }
}

export default MahjongGame;
