import Discord, { MessageActionRow, MessageButton, MessageEmbed, ThreadChannel } from "discord.js";

import GameRoom from "../GameRoom";

import MahjongTile from "./MahjongTile";
import MahjongTiles from "./MahjongTiles";
import MahjongPlayer from "./MahjongPlayer";

import * as COLOR from "~/const/color";
import * as EMOJI from "~/const/emoji";
import { GAME, MAHJONG } from "~/const/command/minigame";
import { WIND, EMOJI as MAHJONG_EMOJI, KANG_TYPE } from "~/const/mahjong";
import { BUTTON_STYLE, MAX_INTERACTION_DURATION } from "~/const/discord";
import { groupBy, shuffle, toEmoji } from "~/util/helper";

class MahjongGame {
  private _threadChannel: ThreadChannel;
  private _tiles: MahjongTiles;
  private _players: MahjongPlayer[];

  private _wind: number;
  private _round: {
    wind: number;
    windRepeat: number;
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
      windRepeat: 0,
      turn: 0,
      doraCount: 1
    };
    this._timeoutFlag = false;

    this.startNewRound(true);
  }

  public async start() {
    let roundResult = true;
    while (roundResult) {
      roundResult = await this.runRound();
    }

    if (this._timeoutFlag) {
      return await this._showTimeoutMessage();
    }

    // TODO: 최종 순위 표시
  }

  public async destroy() {
    const threadChannel = this._threadChannel;

    await threadChannel.setLocked(true).catch(() => void 0);
    await threadChannel.setArchived(true).catch(() => void 0);
  }

  public async runRound(): Promise<boolean> {
    let turnResult = true;
    while (this._shouldContinueRound() && turnResult) {
      turnResult = await this.nextTurn();
    }

    if (this._timeoutFlag || this._round.wind > WIND.NORTH) {
      return false;
    } else {
      return true;
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
      this._round.windRepeat = 0;
    } else {
      this._round.windRepeat += 1;
    }

    this._players.forEach(player => {
      player.reset();
      player.hands.add(tiles.draw(13).sort((a, b) => a.id - b.id));
    });

    this._tiles = tiles;
  }

  public async nextTurn(): Promise<boolean> {
    const currentPlayer = this.currentPlayer;
    const newTile = currentPlayer.hands.prevTurnKang !== KANG_TYPE.NONE
      ? this._drawKangTile()
      : this._tiles.draw(1)[0];

    currentPlayer.hands.add([newTile]);
    currentPlayer.onTurnStart();

    await this._showSummary();
    const handsMsg = await this._showHands();
    const reconnected = await this._showReconnect();
    if (!reconnected) return false;

    const discardInfo = await this._listenDiscard(handsMsg as Discord.Message);
    if (!discardInfo) return false;

    if (discardInfo.tsumo) {
      await this._showRoundResult(true);
      this.startNewRound(!currentPlayer.isParent());
      return false;
    } else {
      await this._showDiscard(discardInfo);
      // TODO: 플레이어별 액션 메시지 전송
      // TODO: 현재 플레이어 인덱스 업데이트 & 턴 정보 업데이트
      return true;
    }
  }

  private async _showSummary() {
    const players = this._players;
    const threadChannel = this._threadChannel;
    const currentPlayer = this.currentPlayer;
    const embed = new MessageEmbed();

    embed.setTitle(MAHJONG.ROUND_FORMAT(this._round.wind, this._round.windRepeat));
    embed.addField(MAHJONG.DORA_INDICATOR_TITLE, this._doras.map((tile, idx) => {
      if ((idx + 1) <= this._round.doraCount) return tile.getEmoji();
      else return toEmoji(MAHJONG_EMOJI.BACK.name, MAHJONG_EMOJI.BACK.id);
    }).join(""), false);

    players.forEach((player, idx) => {
      const riichi = player.isRiichi ? MAHJONG.RIICHI_BAR : null;
      const point = `${MAHJONG.POINT(player.point)}`;
      const discards = player.hands.discards.map(tile => tile.getEmoji()).join("") || EMOJI.ZERO_WIDTH_SPACE;

      const desc = [[riichi, point].filter(val => !!val).join(" / "), discards].join("\n");

      embed.addField(MAHJONG.SUMMARY_FIELD_TITLE(player.user, player.playerIdx), desc, true);
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
    const currentPlayer = this.currentPlayer;
    const { interaction, hands } = currentPlayer;

    const tiles = hands.holding;
    const handEmojis = tiles.map(tile => tile.getEmoji());
    const rows = this._getHandButtons(currentPlayer);

    const msg = await interaction.followUp({
      content: handEmojis.join(""),
      components: rows,
      fetchReply: true,
      ephemeral: true
    });

    return msg;
  }

  private async _showReconnect(): Promise<boolean> {
    const currentPlayer = this.currentPlayer;
    const threadChannel = this._threadChannel;
    const { interaction } = currentPlayer;

    if (Date.now() - interaction.createdTimestamp >= MAX_INTERACTION_DURATION) {
      const row = new MessageActionRow();
      const btn = new MessageButton();
      btn.setLabel(GAME.RECONNECT_LABEL);
      btn.setStyle(BUTTON_STYLE.SUCCESS);
      btn.setCustomId(GAME.SYMBOL.RECONNECT);
      row.addComponents(btn);

      const reconnectMsg = await threadChannel.send({
        content: GAME.RECONNECT_TITLE(currentPlayer.user),
        components: [row]
      });

      const collector = reconnectMsg.createMessageComponentCollector({
        filter: action => action.user.id === currentPlayer.user.id,
        time: 10 * 60 * 1000
      });

      collector.on("collect", async action => {
        await action.update({ components: [] });
        currentPlayer.interaction = action;
        collector.stop(GAME.SYMBOL.RECONNECT);
      });

      return new Promise<boolean>(resolve => {
        collector.on("end", (_, reason) => {
          if (reason === GAME.SYMBOL.RECONNECT) {
            resolve(true);
          } else {
            this._timeoutFlag = true;
            resolve(false);
          }
        });
      });
    }

    return true;
  }

  private async _listenDiscard(msg: Discord.Message): Promise<{
    kang: boolean;
    riichi: boolean;
    tsumo: boolean;
  } | null> {
    const currentPlayer = this.currentPlayer;
    const collector = msg.createMessageComponentCollector({
      filter: () => true,
      time: 600000 // 10 min
    });

    collector.on("collect", async interaction => {
      currentPlayer.interaction = interaction;

      if (interaction.customId === MAHJONG.SYMBOL.RIICHI) {
        return await this._updateRiichiTiles(interaction);
      }

      await interaction.update({ components: [] });

      if (interaction.customId.startsWith(MAHJONG.SYMBOL.KANG)) {
        const tileID = parseFloat(interaction.customId.slice(MAHJONG.SYMBOL.KANG.length));

        currentPlayer.hands.playKang(tileID);

        return collector.stop(MAHJONG.SYMBOL.KANG);
      } else if (interaction.customId === MAHJONG.SYMBOL.TSUMO) {
        return collector.stop(MAHJONG.SYMBOL.TSUMO);
      }

      const tileID = parseFloat(interaction.customId);
      const tileIdx = currentPlayer.hands.holding.findIndex(tile => tile.id === tileID);

      if (currentPlayer.riichiFlag) {
        currentPlayer.riichiTurn = currentPlayer.currentTurn;
      }

      currentPlayer.hands.play(tileIdx);

      collector.stop(MAHJONG.SYMBOL.DISCARD);
    });

    return new Promise(resolve => {
      collector.on("end", (_, reason) => {
        if (
          reason === MAHJONG.SYMBOL.DISCARD
          || reason === MAHJONG.SYMBOL.KANG
          || reason === MAHJONG.SYMBOL.TSUMO
        ) {
          resolve({
            kang: reason === MAHJONG.SYMBOL.KANG,
            riichi: currentPlayer.riichiTurn === currentPlayer.currentTurn,
            tsumo: reason === MAHJONG.SYMBOL.TSUMO
          });
        } else {
          this._timeoutFlag = true;
          resolve(null);
        }
      });
    });
  }

  private async _updateRiichiTiles(interaction: Discord.MessageComponentInteraction) {
    const currentPlayer = this.currentPlayer;

    currentPlayer.riichiFlag = !currentPlayer.riichiFlag;

    const rows = this._getHandButtons(currentPlayer);

    return await interaction.update({ components: rows });
  }

  private async _showDiscard({ riichi }: {
    kang: boolean;
    riichi: boolean;
  }) {
    const threadChannel = this._threadChannel;
    const currentPlayer = this.currentPlayer;
    const embed = new MessageEmbed();

    const discards = currentPlayer.hands.discards;
    const lastDiscard = discards[discards.length - 1];

    embed.setAuthor({
      name: riichi
        ? MAHJONG.RIICHI_TITLE(currentPlayer.user)
        : MAHJONG.DISCARD_TITLE(currentPlayer.user),
      iconURL: currentPlayer.user.displayAvatarURL()
    });

    if (riichi) {
      embed.setDescription(MAHJONG.RIICHI_BAR_LONG);
    }

    embed.setColor(COLOR.BOT);

    await threadChannel.send({
      content: lastDiscard.getEmoji(),
      embeds: [embed]
    });
  }

  private async _showRoundResult(isTsumo: boolean) {
    const threadChannel = this._threadChannel;
    const currentPlayer = this.currentPlayer;
    const embed = new MessageEmbed();
    const scoreInfo = currentPlayer.hands.scoreInfo!;

    const { head, body, lastTile } = scoreInfo.dragon;
    const last = lastTile.tile;
    const lastTileID = lastTile.tile.id;
    const dragon = [
      head.map(tiles => tiles.filter(tile => tile.id !== lastTileID).map(tile => tile.getEmoji()).join("")).join(""),
      body.map(({ tiles }) => tiles.filter(tile => tile.id !== lastTileID).map(tile => tile.getEmoji()).join("")).join(""),
      EMOJI.TAB_SPACE,
      last.getEmoji()
    ].join("");

    const totalScore = scoreInfo.scores.reduce((total, { score }) => total + score, 0);

    embed.setTitle(isTsumo ? MAHJONG.TSUMO_TITLE(currentPlayer.user, last) : MAHJONG.RON_TITLE(currentPlayer.user, last));
    embed.setDescription(MAHJONG.SCORE_FORMAT(totalScore));

    // TODO: 플레이어별 점수 증감 표시 (diff 이용)

    embed.addField(MAHJONG.YAKU_TITLE, scoreInfo.scores.map(({ yaku, score }) => `${EMOJI.MIDDLE_DOT} ${yaku.yakuName} - ${MAHJONG.SCORE_FORMAT(score)}`).join("\n"));
    embed.setColor(COLOR.BOT);

    await threadChannel.send({
      content: dragon,
      embeds: [embed]
    });
  }

  private async _showTimeoutMessage() {
    const threadChannel = this._threadChannel;

    await threadChannel.send({
      content: GAME.END_BY_TIME
    }).catch(() => void 0);

    await this.destroy();
  }

  private _shouldContinueRound() {
    return this._tiles.left > 0;
  }

  private _getHandButtons(player: MahjongPlayer) {
    const hands = player.hands;
    const tiles = hands.holding;
    const riichiDiscardables = hands.riichiDiscardables;
    const rows = groupBy(tiles, 5).map((tileRow, rowIdx) => {
      const row = new MessageActionRow();
      const btns = tileRow.map((tile, colIdx) => {
        const tileIdx = 5 * rowIdx + colIdx;
        const isLastTile = tileIdx === tiles.length - 1;
        const btn = new MessageButton();

        btn.setCustomId(tile.id.toString());
        btn.setStyle(BUTTON_STYLE.SECONDARY);
        btn.setEmoji(tile.getEmoji());

        if (player.isRiichi && !isLastTile) {
          btn.setDisabled(true);
        } else if (player.riichiFlag && !riichiDiscardables.has(tile)) {
          btn.setDisabled(true);
        }

        return btn;
      });

      row.addComponents(...btns);
      return row;
    });

    const extraActionsRow = new MessageActionRow();

    hands.getKangableTiles().forEach(kangTiles => {
      const tile = kangTiles[0];
      const kangBtn = new MessageButton();
      kangBtn.setCustomId(`${MAHJONG.SYMBOL.KANG}${tile.id}`);
      kangBtn.setStyle(BUTTON_STYLE.PRIMARY);
      kangBtn.setLabel(MAHJONG.LABEL.KANG);
      kangBtn.setEmoji(tile.getEmoji());
      extraActionsRow.addComponents(kangBtn);
    });

    if (!player.isRiichi && hands.isRiichiable()) {
      const riichiBtn = new MessageButton();
      riichiBtn.setCustomId(MAHJONG.SYMBOL.RIICHI);
      riichiBtn.setStyle(BUTTON_STYLE.PRIMARY);
      riichiBtn.setLabel(MAHJONG.LABEL.RIICHI);
      if (player.riichiFlag) {
        riichiBtn.setEmoji(toEmoji(MAHJONG_EMOJI.RIICHI[1].name, MAHJONG_EMOJI.RIICHI[1].id));
      }
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

    return rows;
  }

  private _drawKangTile() {
    this._round.doraCount += 1;

    return this._kangTiles.splice(0, 1)[0];
  }
}

export default MahjongGame;
