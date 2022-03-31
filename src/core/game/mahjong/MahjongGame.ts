import Discord, { MessageActionRow, MessageButton, MessageEmbed, ThreadChannel } from "discord.js";

import GameRoom from "../GameRoom";

import MahjongTile from "./MahjongTile";
import MahjongTiles from "./MahjongTiles";
import MahjongPlayer from "./MahjongPlayer";
import NagashiMangwan from "./yaku/NagashiMangwan";

import * as COLOR from "~/const/color";
import * as EMOJI from "~/const/emoji";
import { GAME, MAHJONG } from "~/const/command/minigame";
import { WIND, EMOJI as MAHJONG_EMOJI, KANG_TYPE, BODY_TYPE, SCORE } from "~/const/mahjong";
import { BUTTON_STYLE, MAX_INTERACTION_DURATION } from "~/const/discord";
import { groupBy, shuffle, toEmoji, waitFor } from "~/util/helper";
import { block } from "~/util/markdown";

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
  public get doras() { return this._doras; }
  public get uraDoras() { return this._uraDoras; }
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
      await waitFor(10000); // 다음 라운드까지 10초 대기
      return true;
    }
  }

  public startNewRound(changeWind: boolean) {
    const round = this._round;
    const tiles = new MahjongTiles();

    this._doras = tiles.draw(5);
    this._uraDoras = tiles.draw(5);
    this._kangTiles = tiles.draw(4);

    this._kangTiles.forEach(tile => {
      tile.isKangTile = true;
    });

    round.turn = 0;
    round.doraCount = 1;

    if (changeWind) {
      round.wind = (round.wind + 1) % 4;
      round.windRepeat = 0;
    } else {
      round.windRepeat += 1;
    }

    this._players.forEach(player => {
      player.reset();
      player.hands.add(tiles.draw(13).sort((a, b) => a.id - b.id));
    });

    this._currentPlayerIdx = (4 - round.wind) % 4;

    this._tiles = tiles;
  }

  public async nextTurn(): Promise<boolean> {
    const tiles = this._tiles;
    const currentPlayer = this.currentPlayer;
    const newTile = currentPlayer.hands.prevTurnKang !== KANG_TYPE.NONE
      ? this._drawKangTile()
      : tiles.draw(1)[0];

    currentPlayer.hands.add([newTile]);
    currentPlayer.onTurnStart();

    await this._showSummary();
    const handsMsg = await this._showHands();
    const reconnected = await this._showReconnect();
    if (!reconnected) return false;

    const discardInfo = await this._listenDiscard(handsMsg as Discord.Message);
    if (!discardInfo) return false;

    this._round.turn += 1;

    if (discardInfo.tsumo) {
      await this._showRoundResult(currentPlayer, true);
      return false;
    } else if (discardInfo.kang) {
      await this._showKang();
      return true;
    } else {
      await this._showDiscard(discardInfo);
      // TODO: 플레이어별 액션 메시지 전송
      // TODO: 현재 플레이어 인덱스 업데이트 & 턴 정보 업데이트
    }

    // 유국
    if (tiles.left <= 0) {
      await this._onRoundFinish();
      return false;
    }

    return true;
  }

  private async _showSummary() {
    const players = this._players;
    const threadChannel = this._threadChannel;
    const currentPlayer = this.currentPlayer;
    const round = this._round;
    const embed = new MessageEmbed();

    embed.setTitle(MAHJONG.ROUND_FORMAT(round.wind, round.windRepeat));
    embed.addField(MAHJONG.DORA_INDICATOR_TITLE, this._formatDoraTiles(this._doras), false);

    const additionalFields: Array<{ player: MahjongPlayer; desc: string }> = [];

    players.forEach((player, idx) => {
      const maxTiles = 37;
      const riichi = player.isRiichi ? MAHJONG.RIICHI_BAR : null;
      const point = `${MAHJONG.POINT(player.point)}`;
      const discards = player.hands.discards.map(tile => tile.getEmoji());
      const cries = player.hands.borrows.map(({ tiles }) => tiles.map(tile => tile.getEmoji()).join(" "));
      cries.push(...player.hands.kang.map(tiles => tiles.map(tile => tile.getEmoji()).join("")));

      const riichiTileCount = riichi ? 3 : 0;
      const cryTileCount = player.hands.borrows.reduce((total, { tiles }) => total + tiles.length, 0);

      if (riichiTileCount + cryTileCount + discards.length > maxTiles) {
        const overCount = riichiTileCount + cryTileCount + discards.length - maxTiles;
        const overDiscards = discards.splice(discards.length - overCount);

        additionalFields.push({ player, desc: overDiscards.join("") });
      }

      const desc = [[riichi, point].filter(val => !!val).join(" / "), discards.join("") || EMOJI.ZERO_WIDTH_SPACE];

      if (cries.length) {
        desc.splice(1, 0, cries.join(" "));
      }

      embed.addField(MAHJONG.PLAYER_FIELD_TITLE(player.user, player.getWind(round.wind)), desc.join("\n"), true);
      if (idx % 2) {
        embed.addField(EMOJI.ZERO_WIDTH_SPACE, EMOJI.ZERO_WIDTH_SPACE, true);
      }
    });

    additionalFields.forEach(({ player, desc }) => {
      embed.addField(MAHJONG.PLAYER_FIELD_OVERFLOW_TITLE(player.user, player.getWind(round.wind)), desc, false);
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

  private async _showKang() {
    const threadChannel = this._threadChannel;
    const currentPlayer = this.currentPlayer;
    const embed = new MessageEmbed();

    const hands = currentPlayer.hands;

    const kangBorrows = hands.borrows.filter(({ type }) => type === BODY_TYPE.KANG);
    const kangTiles = hands.prevTurnKang === KANG_TYPE.CLOSED
      ? hands.kang[hands.kang.length - 1]
      : kangBorrows[kangBorrows.length - 1].tiles;

    embed.setAuthor({
      name: MAHJONG.KANG_TITLE(currentPlayer.user),
      iconURL: currentPlayer.user.displayAvatarURL()
    });

    embed.setColor(COLOR.BOT);

    await threadChannel.send({
      content: kangTiles.map(tile => tile.getEmoji()).join(""),
      embeds: [embed]
    });
  }

  private async _showRoundResult(winner: MahjongPlayer, isTsumo: boolean) {
    const threadChannel = this._threadChannel;
    const players = this._players;
    const embed = new MessageEmbed();
    const scoreInfo = winner.hands.scoreInfo!;

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
    const subscore = scoreInfo.subscore;
    const roundWind = this._round.wind;
    const windRepeat = this._round.windRepeat;

    const { name: scoreName, score: baseScore } = this._getBaseScore(totalScore, subscore);

    embed.setTitle(isTsumo ? MAHJONG.TSUMO_TITLE(winner.user, last) : MAHJONG.RON_TITLE(winner.user, last));

    let winnerScore = 0;
    const scoreDiff = players.map(() => 0);

    if (isTsumo) {
      const tsumoBaseScore = winner.isParent(roundWind)
        ? 2 * baseScore
        : baseScore;

      players.forEach((player, playerIdx) => {
        if (player === winner) return;

        let basePointToDecrease = player.isParent(roundWind)
          ? tsumoBaseScore * 2
          : tsumoBaseScore;

        basePointToDecrease = Math.ceil(basePointToDecrease / 100) * 100;

        const riichiPoint = player.isRiichi ? 1000 : 0;
        const pointToDecrease = basePointToDecrease + windRepeat * 100 + riichiPoint;

        scoreDiff[playerIdx] = -pointToDecrease;
        winnerScore += pointToDecrease;
      });

      scoreDiff[winner.playerIdx] = winnerScore;
    } else {
      // TODO: 론
    }

    embed.setDescription([scoreName, MAHJONG.POINT(winnerScore)].join(" / "));

    const doras = [this._formatDoraTiles(this._doras)];

    if (winner.isRiichi) {
      doras.push(this._formatDoraTiles(this._uraDoras));
    }

    embed.addField(MAHJONG.DORA_INDICATOR_TITLE, doras.join(EMOJI.TAB_SPACE), false);

    players.forEach((player, idx) => {
      const prevScore = player.point;
      const pointDiff = scoreDiff[idx];
      const desc = this._formatPointDiff(pointDiff, prevScore);

      // 실제 포인트 증감
      player.point += pointDiff;

      embed.addField(MAHJONG.PLAYER_FIELD_TITLE(player.user, player.getWind(roundWind)), desc, true);
      if (idx % 2) {
        embed.addField(EMOJI.ZERO_WIDTH_SPACE, EMOJI.ZERO_WIDTH_SPACE, true);
      }
    });

    embed.addField(MAHJONG.YAKU_TITLE, scoreInfo.scores.map(({ yaku, score }) => `${EMOJI.MIDDLE_DOT} ${yaku.yakuName} - ${score}`).join("\n"));
    embed.setColor(COLOR.BOT);
    embed.setFooter({
      text: MAHJONG.RESULT_FOOTER
    });

    await threadChannel.send({
      content: dragon,
      embeds: [embed]
    });

    this.startNewRound(!winner.isParent(this._round.wind));
  }

  private async _showTimeoutMessage() {
    const threadChannel = this._threadChannel;

    await threadChannel.send({
      content: GAME.END_BY_TIME
    }).catch(() => void 0);

    await this.destroy();
  }

  private _getBaseScore(score: number, subscore: number): {
    name: string;
    score: number;
  } {
    // 만관 이상
    const isOver5 = score >= 5
      || (score === 4 && subscore >= 40)
      || (score === 3 && subscore >= 70);

    if (isOver5) {
      return this._getBaseScoreOverMangwan(Math.max(score, 5)); // 최소 만관
    }

    return {
      score: subscore * (2 ** (score + 2)),
      name: MAHJONG.SCORE_FORMAT(score, subscore)
    };
  }

  private _getBaseScoreOverMangwan(score: number): {
    name: string;
    score: number;
  } {
    if (score <= 5) {
      return {
        name: SCORE.MANGWAN,
        score: 2000
      };
    } else if (score <= 7) {
      return {
        name: SCORE.HANEMAN,
        score: 3000
      };
    } else if (score <= 10) {
      return {
        name: SCORE.BAIMAN,
        score: 4000
      };
    } else if (score <= 12) {
      return {
        name: SCORE.SANBAIMAN,
        score: 6000
      };
    } else {
      return {
        name: SCORE.YAKUMAN,
        score: 8000
      };
    }
  }

  // 유국
  private async _onRoundFinish() {
    const round = this._round;
    const players = this._players;

    // 나가시만관 체크
    const mangwanPlayer = players.find(player => NagashiMangwan.checkByHands(player.hands));

    if (mangwanPlayer) {
      mangwanPlayer.hands.scoreInfo = {
        dragon: {
          head: [],
          body: [],
          hands: mangwanPlayer.hands,
          tiles: mangwanPlayer.hands.tiles,
          lastTile: {
            tile: mangwanPlayer.hands.holding[mangwanPlayer.hands.holding.length - 1],
            isTsumo: true,
            isAdditiveKang: false
          }
        },
        scores: [
          { yaku: NagashiMangwan, score: 5 }
        ],
        subscore: 20
      };

      return await this._showRoundResult(mangwanPlayer, true);
    }

    const threadChannel = this._threadChannel;

    // 텐파이 체크
    const tenpais = players.map(player => player.hands.isTenpai());
    const tenpaiEmbed = new MessageEmbed();
    const parentIdx = players.findIndex(player => player.isParent(round.wind));

    tenpaiEmbed.setTitle(MAHJONG.END_ROUND_TITLE);
    tenpaiEmbed.setColor(COLOR.BOT);
    tenpaiEmbed.setFooter({
      text: MAHJONG.RESULT_FOOTER
    });

    const tenpaiCount = tenpais.filter(val => val).length;
    const tenpaiScore = tenpaiCount === 4 || tenpaiCount === 0
      ? 0
      : 3000;

    players.forEach((player, idx) => {
      const isTenpai = tenpais[idx];
      const tenpaiStr = isTenpai ? MAHJONG.LABEL.TENPAI : MAHJONG.LABEL.NO_TENPAI;
      const handsEmoji = player.hands.toEmoji();
      const prevScore = player.point;
      const pointDiff = isTenpai
        ? tenpaiScore / tenpaiCount
        : -tenpaiScore / (4 - tenpaiCount);

      player.point += pointDiff;

      tenpaiEmbed.addField(
        MAHJONG.PLAYER_FIELD_TITLE(player.user, player.getWind(round.wind), ` - ${tenpaiStr}`),
        [handsEmoji, this._formatPointDiff(pointDiff, prevScore)].join("\n"),
        false
      );
    });

    await threadChannel.send({
      embeds: [tenpaiEmbed]
    });

    this.startNewRound(!tenpais[parentIdx]);
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
      kangBtn.setCustomId(`${MAHJONG.SYMBOL.KANG}${tile.tileID}`);
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

  private _formatDoraTiles(tiles: MahjongTile[]) {
    return tiles.map((tile, idx) => {
      if ((idx + 1) <= this._round.doraCount) return tile.getEmoji();
      else return toEmoji(MAHJONG_EMOJI.BACK.name, MAHJONG_EMOJI.BACK.id);
    }).join("");
  }

  private _formatPointDiff(pointDiff: number, prevScore: number) {
    return pointDiff > 0
      ? block(`${prevScore}\n+ ${pointDiff}`, "diff")
      : pointDiff < 0
        ? block(`${prevScore}\n- ${Math.abs(pointDiff)}`, "diff")
        : block(`${prevScore}`);
  }
}

export default MahjongGame;
