import Discord, { MessageActionRow, MessageButton, MessageEmbed, ThreadChannel } from "discord.js";

import GameRoom from "../GameRoom";

import MahjongTile from "./MahjongTile";
import MahjongTilePile from "./MahjongTilePile";
import MahjongTileSet from "./MahjongTileSet";
import MahjongPlayer from "./MahjongPlayer";
import MahjongSetParser from "./MahjongSetParser";
import MahjongHandsParser from "./MahjongHandsParser";
import MahjongPlayerAction from "./MahjongPlayerAction";
import MahjongScoreInfo from "./MahjongScoreInfo";
import NagashiMangwan from "./yaku/NagashiMangwan";

import * as COLOR from "~/const/color";
import * as EMOJI from "~/const/emoji";
import { GAME, MAHJONG } from "~/const/command/minigame";
import { WIND, EMOJI as MAHJONG_EMOJI, KANG_TYPE, BODY_TYPE, SCORE, YAKU, ACTION_TYPE } from "~/const/mahjong";
import { BUTTON_STYLE } from "~/const/discord";
import { groupBy, shuffle, toEmoji, waitFor } from "~/util/helper";
import { block } from "~/util/markdown";

class MahjongGame {
  private _threadChannel: ThreadChannel;
  private _tiles: MahjongTilePile;
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

  public constructor(players: GameRoom["players"], threadChannel: Discord.ThreadChannel) {
    this._threadChannel = threadChannel;

    this._doras = [];
    this._uraDoras = [];
    this._kangTiles = [];

    this._players = shuffle(players).map((player, idx) => new MahjongPlayer(player, this, idx));
    this._currentPlayerIdx = 0;

    this._wind = WIND.EAST;
    this._round = {
      wind: -1,
      windRepeat: 0,
      turn: -1,
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

    return await this._showFinalRank();
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
    const tiles = new MahjongTilePile();

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
      player.hands.init(tiles.draw(13));
    });

    this._currentPlayerIdx = (4 - round.wind) % 4;

    this._tiles = tiles;
  }

  public async nextTurn(): Promise<boolean> {
    const tiles = this._tiles;
    const currentPlayer = this.currentPlayer;

    if (currentPlayer.lastAction === ACTION_TYPE.KANG) {
      const kangTile = this._drawKangTile();
      kangTile && currentPlayer.hands.add(kangTile);
    } else if (currentPlayer.lastAction === ACTION_TYPE.DISCARD) {
      const newTile = tiles.draw(1)[0];
      newTile && currentPlayer.hands.add(newTile);
    }

    this._round.turn += 1;
    currentPlayer.onTurnStart(this._round.turn);

    await this._showSummary();

    if (currentPlayer.shouldReconnect()) {
      const reconnected = await this._showReconnect([currentPlayer]);
      if (!reconnected) return false;
    }

    const handsMsg = await this._showHands();
    const discardInfo = await this._listenDiscard(handsMsg as Discord.Message);

    currentPlayer.onTurnEnd();

    if (discardInfo.tsumo) {
      await this._showRoundResult(currentPlayer, currentPlayer.hands.handsInfo!.scoreInfo!);
      return false;
    } else if (discardInfo.kang) {
      currentPlayer.setAction(ACTION_TYPE.KANG);
      await this._showKang();
      const actionResult = await this._checkKangCounter();
      if (!actionResult) return false;

      if (this._shouldFinishGameByKang()) {
        await this._onRoundFinish();
        return false;
      }

      return true;
    } else {
      currentPlayer.setAction(ACTION_TYPE.DISCARD);
      const tileDiscarded = await this._showDiscard(discardInfo);
      const playerAction = await this._collectPlayerActions(tileDiscarded, {
        onlyRon: false,
        onlyThirteenOrphans: false
      });

      if (this._timeoutFlag) {
        return false;
      }

      if (!playerAction) {
        this._passTurnToNextPlayer();
      } else {
        const actionResult = await this._doPlayerAction(playerAction, tileDiscarded);
        if (!actionResult) return false;
      }
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

    embed.setTitle(MAHJONG.ROUND_FORMAT(this._wind, this._round.wind, round.windRepeat));
    embed.addField(MAHJONG.DORA_INDICATOR_TITLE, this._formatDoraTiles(this._doras), false);

    const additionalFields: Array<{ player: MahjongPlayer; desc: string }> = [];

    players.forEach((player, idx) => {
      const maxTiles = 37;
      const riichi = player.isRiichi ? MAHJONG.RIICHI_BAR : null;
      const point = `${MAHJONG.POINT(player.point)}`;
      const discards = player.hands.discards.map(tile => tile.getEmoji());
      const cries = player.hands.borrows.map(({ tiles }) => tiles.map(tile => tile.getEmoji()).join(" "));
      cries.push(...player.hands.kang.map(({ tiles }) => tiles.map(tile => tile.getEmoji()).join("")));

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

    const rows = this._getHandButtons(currentPlayer);

    const msg = await interaction.followUp({
      content: hands.toEmoji(),
      components: rows,
      fetchReply: true,
      ephemeral: true
    });

    return msg;
  }

  private async _showReconnect(players: MahjongPlayer[]): Promise<boolean> {
    const threadChannel = this._threadChannel;

    const row = new MessageActionRow();
    const btn = new MessageButton();
    btn.setLabel(GAME.RECONNECT_LABEL);
    btn.setStyle(BUTTON_STYLE.SUCCESS);
    btn.setCustomId(GAME.SYMBOL.RECONNECT);
    row.addComponents(btn);

    const playersLeft = [...players];
    const embed = new MessageEmbed();

    embed.setTitle(GAME.RECONNECT_LIST_TITLE);
    embed.setDescription(playersLeft.map(player => player.user.toString()).join("\n"));

    const reconnectMsg = await threadChannel.send({
      content: GAME.RECONNECT_TITLE(players.map(player => player.user)),
      embeds: [embed],
      components: [row]
    });

    const collector = reconnectMsg.createMessageComponentCollector({
      filter: action => playersLeft.findIndex(player => action.user.id === player.user.id) >= 0,
      time: 10 * 60 * 1000
    });

    collector.on("collect", async action => {
      const pressedPlayer = playersLeft.splice(playersLeft.findIndex(player => player.user.id === action.user.id), 1)[0];

      embed.setDescription(playersLeft.map(player => player.user.toString()).join("\n"));
      await action.update({
        embeds: [embed],
        components: playersLeft.length > 0
          ? [row]
          : []
      });
      pressedPlayer.interaction = action;

      if (playersLeft.length <= 0) {
        collector.stop(GAME.SYMBOL.RECONNECT);
      }
    });

    return new Promise<boolean>(resolve => {
      collector.on("end", async (_, reason) => {
        if (reason === GAME.SYMBOL.RECONNECT) {
          await threadChannel.send({
            content: GAME.RECONNECT_COMPLETE
          });
          resolve(true);
        } else {
          this._timeoutFlag = true;
          resolve(false);
        }
      });
    });
  }

  private async _listenDiscard(msg: Discord.Message): Promise<{
    kang: boolean;
    riichi: boolean;
    tsumo: boolean;
  }> {
    const currentPlayer = this.currentPlayer;
    const collector = msg.createMessageComponentCollector({
      filter: () => true,
      time: 300000 // 5 min
    });
    const roundTurn = this._round.turn;

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

      const discarded = currentPlayer.hands.play(tileIdx);

      if (currentPlayer.riichiFlag) {
        currentPlayer.doRiichi();
        discarded.isRiichiTile = true;
      }

      collector.stop(MAHJONG.SYMBOL.DISCARD);
    });

    return new Promise(resolve => {
      collector.on("end", (_, reason) => {
        if (
          reason !== MAHJONG.SYMBOL.DISCARD
          && reason !== MAHJONG.SYMBOL.KANG
          && reason !== MAHJONG.SYMBOL.TSUMO
        ) {
          // 쯔모기리
          currentPlayer.hands.play(currentPlayer.hands.holding.length - 1);
        }

        resolve({
          kang: reason === MAHJONG.SYMBOL.KANG,
          riichi: currentPlayer.riichiTurn === roundTurn,
          tsumo: reason === MAHJONG.SYMBOL.TSUMO
        });
      });
    });
  }

  private async _updateRiichiTiles(interaction: Discord.MessageComponentInteraction) {
    const currentPlayer = this.currentPlayer;

    currentPlayer.toggleRiichiFlag();

    const rows = this._getHandButtons(currentPlayer);

    return await interaction.update({ components: rows });
  }

  private async _showDiscard({ riichi }: {
    riichi: boolean;
  }): Promise<MahjongTile> {
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

    return lastDiscard;
  }

  private async _collectPlayerActions(lastTile: MahjongTile, opts: {
    onlyRon: boolean;
    onlyThirteenOrphans: boolean;
  }) {
    const playerActions = await this._getPlayerActions(lastTile, opts);

    if (playerActions.some(({ player }) => player.shouldReconnect())) {
      await this._showReconnect(playerActions.map(({ player }) => player));
      return null;
    }

    return await this._listenPlayerAction(playerActions);
  }

  private async _getPlayerActions(lastTile: MahjongTile, opts: {
    onlyRon: boolean;
    onlyThirteenOrphans: boolean;
  }): Promise<Array<{
      player: MahjongPlayer;
      actions: MahjongPlayerAction[];
    }>> {
    const players = this._players;
    const currentPlayerIdx = this._currentPlayerIdx;
    const otherPlayers = [...players];
    const handParser = new MahjongHandsParser();

    otherPlayers.splice(currentPlayerIdx, 1);

    const playerActions = otherPlayers.map(player => {
      const possibleActions: Array<{ tiles: MahjongTile[]; order: number; type: string; score?: MahjongScoreInfo }> = [];

      if (!player.isRiichi && !opts.onlyRon) {
        const setParser = new MahjongSetParser();
        const candidates = setParser.parseCandidates(player.hands);
        const canChi = player.playerIdx === (currentPlayerIdx + 1) % 4;
        const ordered = canChi
          ? candidates.ordered.filter(tiles => {
            const tile1 = tiles[0];
            const tile2 = tiles[1];

            if (tile1.type !== lastTile.type) return false;

            const indexDiff = Math.abs(tile1.index - tile2.index);

            if (indexDiff === 1) {
              const minIdx = Math.min(tile1.index, tile2.index);
              const maxIdx = Math.max(tile1.index, tile2.index);

              return lastTile.index === minIdx - 1 || lastTile.index === maxIdx + 1;
            } else {
              return Math.abs(lastTile.index - tile1.index) === Math.abs(lastTile.index - tile2.index);
            }
          }) : [];
        const same = candidates.same.filter(tiles => tiles[0].tileID === lastTile.tileID);
        const kang = candidates.kang.filter(tiles => tiles[0].tileID === lastTile.tileID);

        possibleActions.push(...ordered.map(tiles => ({ tiles, order: 5, type: MAHJONG.SYMBOL.CHI })));
        possibleActions.push(...same.map(tiles => ({ tiles, order: 4, type: MAHJONG.SYMBOL.PON })));
        possibleActions.push(...kang.map(tiles => ({ tiles, order: 4, type: MAHJONG.SYMBOL.KANG })));
      }

      // 론 체크
      if (player.hands.handsInfo?.tenpaiTiles.tiles.has(lastTile.tileID)) {
        const { holding, borrows, kang: closedKang } = player.hands;
        const ronScore = handParser.getScoreInfo([...holding, lastTile], borrows, closedKang, this, player, {
          tile: lastTile,
          isTsumo: false,
          isAdditiveKang: false
        });

        if (ronScore && (!opts.onlyThirteenOrphans || ronScore.scores.some(({ yaku }) => yaku.yakuName === YAKU.THIRTEEN_ORPHANS))) {
          const indexDiff = player.getIndexDiff(this.currentPlayer);
          possibleActions.push({ tiles: [], order: indexDiff, type: MAHJONG.SYMBOL.RON, score: ronScore });
        }
      }

      return {
        player,
        actions: possibleActions
      };
    }).filter(({ actions }) => actions.length > 0);

    return playerActions;
  }

  private async _listenPlayerAction(playerActions: Array<{
    player: MahjongPlayer;
    actions: MahjongPlayerAction[];
  }>): Promise<{
      player: MahjongPlayer;
      action: MahjongPlayerAction;
    } | null> {
    if (playerActions.length <= 0) return null;

    const actionPromises = playerActions.map(async ({ player, actions }) => {
      const skipBtn = new MessageButton();
      skipBtn.setLabel(MAHJONG.LABEL.SKIP);
      skipBtn.setStyle(BUTTON_STYLE.SECONDARY);
      skipBtn.setCustomId(MAHJONG.SYMBOL.SKIP);

      const actionBtns = actions.map((action, idx) => {
        const btn = new MessageButton();
        if (action.type === MAHJONG.SYMBOL.CHI) {
          const tiles = action.tiles;
          btn.setLabel(`${MAHJONG.LABEL[action.type]} (${tiles.map(tile => tile.getName()).join("-")})`);
        } else {
          btn.setLabel(MAHJONG.LABEL[action.type]);
        }
        btn.setStyle(action.type === MAHJONG.SYMBOL.RON ? BUTTON_STYLE.SUCCESS : BUTTON_STYLE.PRIMARY);
        btn.setCustomId(idx.toString());

        if (action.type === MAHJONG.SYMBOL.RON && player.hands.handsInfo?.tenpaiTiles.isFuriten) {
          btn.setLabel(`${MAHJONG.LABEL[action.type]}(${MAHJONG.LABEL.FURITEN})`);
          btn.setDisabled(true);
        }

        return btn;
      });

      actionBtns.push(skipBtn);

      const actionRows = groupBy(actionBtns, 5).map(btns => {
        const row = new MessageActionRow();
        row.addComponents(...btns);
        return row;
      });

      const actionMsg = await player.interaction.followUp({
        content: player.hands.toEmoji(),
        components: actionRows,
        fetchReply: true,
        ephemeral: true
      }) as Discord.Message;

      const collector = actionMsg.createMessageComponentCollector({
        filter: () => true,
        time: 180000 // 3 min
      });

      collector.on("collect", async () => {
        collector.stop();
      });

      return new Promise<{
        player: MahjongPlayer;
        action: {
          tiles: MahjongTile[];
          order: number;
          type: string;
          score?: MahjongScoreInfo;
        };
      } | null>(resolve => {
        collector.on("end", async collected => {
          const interaction = collected.first();

          if (!interaction) {
            return resolve(null);
          }

          await interaction.update({
            content: MAHJONG.WAITING_OTHER_PLAYER,
            components: []
          });
          player.interaction = interaction;

          if (interaction.customId === MAHJONG.SYMBOL.SKIP) {
            return resolve(null);
          }

          const action = actions[parseFloat(interaction.customId)];
          resolve({
            player,
            action
          });
        });
      });
    });

    const resolvedActions = (await Promise.all(actionPromises)).filter(val => !!val);

    if (resolvedActions.length <= 0) return null;

    resolvedActions.sort((a, b) => a!.action.order - b!.action.order);

    return resolvedActions[0];
  }

  private async _doPlayerAction(playerAction: {
    player: MahjongPlayer;
    action: {
      tiles: MahjongTile[];
      order: number;
      type: string;
      score?: MahjongScoreInfo;
    };
  }, tileDiscarded: MahjongTile): Promise<boolean> {
    const { player, action } = playerAction;

    if (action.type === MAHJONG.SYMBOL.RON) {
      await this._showRoundResult(player, action.score!);
      return false;
    }

    const tiles = action.tiles;
    const borrowed = tileDiscarded.borrow();

    const indexDiff = player.getIndexDiff(this.currentPlayer);
    tiles.splice(indexDiff - 1, 0, borrowed);

    const newSet = new MahjongTileSet({
      tiles,
      type: action.type === MAHJONG.SYMBOL.CHI
        ? BODY_TYPE.ORDERED
        : action.type === MAHJONG.SYMBOL.PON
          ? BODY_TYPE.SAME
          : BODY_TYPE.KANG,
      borrowed: true
    });

    if (action.type === MAHJONG.SYMBOL.CHI) {
      player.setAction(ACTION_TYPE.CHI);
    } else if (action.type === MAHJONG.SYMBOL.PON) {
      player.setAction(ACTION_TYPE.PON);
    } else if (action.type === MAHJONG.SYMBOL.KANG) {
      player.setAction(ACTION_TYPE.KANG);
    }

    player.hands.addBorrowedTileSet(newSet);

    await this._showPlayerAction(player, newSet);

    if (action.type === MAHJONG.SYMBOL.KANG && this._shouldFinishGameByKang()) {
      await this._onRoundFinish();
      return false;
    }

    this._currentPlayerIdx = player.playerIdx;
    this._round.turn += 4; // 일발 등 방지

    return true;
  }

  private async _showPlayerAction(player: MahjongPlayer, tileSet: MahjongTileSet) {
    const threadChannel = this._threadChannel;
    const embed = new MessageEmbed();
    const user = player.user;

    embed.setAuthor({
      name: tileSet.type === BODY_TYPE.ORDERED
        ? MAHJONG.CHI_TITLE(user)
        : tileSet.type === BODY_TYPE.SAME
          ? MAHJONG.PONG_TITLE(user)
          : MAHJONG.KANG_TITLE(user),
      iconURL: user.displayAvatarURL()
    });

    embed.setColor(COLOR.BOT);

    await threadChannel.send({
      content: tileSet.tiles.map(tile => tile.getEmoji()).join(""),
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
      ? hands.kang[hands.kang.length - 1].tiles
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

  /**
   * @returns 턴 계속 여부
   */
  private async _checkKangCounter() {
    const currentPlayer = this.currentPlayer;
    const currentPlayerHands = currentPlayer.hands;

    const lastKangSet = currentPlayerHands.prevTurnKang === KANG_TYPE.CLOSED
      ? currentPlayerHands.kang[currentPlayerHands.kang.length - 1]
      : currentPlayerHands.borrows[currentPlayerHands.borrows.length - 1];
    const opts = currentPlayerHands.prevTurnKang === KANG_TYPE.CLOSED
      ? { onlyRon: true, onlyThirteenOrphans: true }
      : { onlyRon: true, onlyThirteenOrphans: false };

    const kangTile = lastKangSet.tiles[0];

    const playerAction = await this._collectPlayerActions(kangTile, opts);

    if (this._timeoutFlag) {
      return false;
    }

    if (!playerAction) {
      return true;
    }

    await this._showRoundResult(playerAction.player, playerAction.action.score!);

    return false;
  }

  private async _showRoundResult(winner: MahjongPlayer, scoreInfo: MahjongScoreInfo) {
    const threadChannel = this._threadChannel;
    const players = this._players;
    const embed = new MessageEmbed();
    const isTsumo = scoreInfo.dragon.lastTile.isTsumo;

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
    const isNagashiMangwan = scoreInfo.scores.some(({ yaku }) => yaku.yakuName === YAKU.NAGASHI_MANGWAN);

    const { name: scoreName, score: baseScore } = this._getBaseScore(totalScore, subscore);

    embed.setTitle(
      isNagashiMangwan
        ? MAHJONG.NAGASHI_MANGWAN_TITLE(winner.user)
        : isTsumo
          ? MAHJONG.TSUMO_TITLE(winner.user, last)
          : MAHJONG.RON_TITLE(winner.user, last)
    );

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
      const score = winner.isParent(roundWind)
        ? baseScore * 6
        : baseScore * 4;

      players.forEach((player, playerIdx) => {
        if (player === winner) return;

        let basePointToDecrease = player.playerIdx === this._currentPlayerIdx
          ? score
          : 0;

        basePointToDecrease = Math.ceil(basePointToDecrease / 100) * 100;

        const riichiPoint = player.isRiichi ? 1000 : 0;
        const pointToDecrease = basePointToDecrease + windRepeat * 100 + riichiPoint;

        scoreDiff[playerIdx] = -pointToDecrease;
        winnerScore += pointToDecrease;
      });

      scoreDiff[winner.playerIdx] = winnerScore;
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
      player.setPoint(player.point + pointDiff);

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
      return await this._showRoundResult(mangwanPlayer, {
        dragon: {
          head: [],
          body: [],
          player: mangwanPlayer,
          cried: mangwanPlayer.hands.cried,
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
      });
    }

    const threadChannel = this._threadChannel;

    // 텐파이 체크
    const tenpais = players.map(player => player.hands.isTenpai());
    const tenpaiEmbed = new MessageEmbed();
    const parentIdx = players.findIndex(player => player.isParent(round.wind));

    const isKangFinish = this._shouldFinishGameByKang();

    tenpaiEmbed.setTitle(isKangFinish ? MAHJONG.END_BY_KANG_TITLE : MAHJONG.END_ROUND_TITLE);
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

      player.setPoint(player.point + pointDiff);

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

  private async _showFinalRank() {
    const threadChannel = this._threadChannel;
    const players = this._players;
    const playersDescendingByPoint = [...players].sort((a, b) => b.point - a.point);

    const embed = new MessageEmbed();

    embed.setTitle(MAHJONG.FINAL_RANK_TITLE);
    embed.setDescription(
      playersDescendingByPoint.map((player, idx) => {
        return `${idx + 1}${EMOJI.KEYCAP} ${player.user.displayName} / ${MAHJONG.POINT(player.point)}`;
      }).join("\n")
    );

    embed.setColor(COLOR.BOT);

    await threadChannel.send({
      embeds: [embed]
    });

    await threadChannel.setLocked(true).catch(() => void 0);
    await threadChannel.setArchived(true).catch(() => void 0);
  }

  private _shouldContinueRound() {
    return this._tiles.left > 0;
  }

  private _getHandButtons(player: MahjongPlayer) {
    const hands = player.hands;
    const tiles = hands.holding;
    const riichiDiscardables = hands.handsInfo?.riichiDiscardables;
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
        } else if (player.riichiFlag && !riichiDiscardables?.has(tile)) {
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

    const additiveKangCandidate = hands.getAdditiveKangTileSet();
    if (additiveKangCandidate) {
      const tile = additiveKangCandidate.tiles[0];
      const kangBtn = new MessageButton();
      kangBtn.setCustomId(`${MAHJONG.SYMBOL.KANG}${tile.tileID}`);
      kangBtn.setStyle(BUTTON_STYLE.PRIMARY);
      kangBtn.setLabel(MAHJONG.LABEL.KANG);
      kangBtn.setEmoji(tile.getEmoji());
      extraActionsRow.addComponents(kangBtn);
    }

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

    if (hands.isTsumoable()) {
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

  private _passTurnToNextPlayer() {
    this._currentPlayerIdx = (this._currentPlayerIdx + 1) % 4;
  }

  private _shouldFinishGameByKang() {
    const kangCount = this._round.doraCount - 1;
    if (kangCount > 4) return true;
    if (kangCount < 4) return false;

    // 한명이 4회 깡 했는지 여부 확인
    const kangCounts = this._players.map(player => {
      const hands = player.hands;
      const kangs = [...hands.kang, ...hands.borrows.filter(set => set.type === BODY_TYPE.KANG)];

      return kangs.length;
    });

    return kangCounts.every(count => count < 4);
  }
}

export default MahjongGame;
