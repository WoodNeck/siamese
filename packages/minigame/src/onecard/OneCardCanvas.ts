import path from "path";

import { Canvas, createCanvas, Image, loadImage } from "@napi-rs/canvas";
import { range } from "@siamese/util";
import GIFEncoder from "gif-encoder-2";

import { OneCardGame } from "./OneCardGame";
import { CardSymbol } from "./PlayingCard";

class OneCardCanvas {
  private static _instance: OneCardCanvas | null = null;

  private _bgCanvas: Canvas;
  private _bgCtx: ReturnType<Canvas["getContext"]>;
  private _fgCanvas: Canvas;
  private _fgCtx: ReturnType<Canvas["getContext"]>;
  private _assetDir: string;
  private _board!: Image;
  private _cardBack!: Image;
  private _numbers!: Image;
  private _bomb!: Image;
  private _turnBorder!: Image;
  private _symbols!: Image;
  private _arrow!: Image;
  private _arrowDown!: Image;
  private _arrowUp!: Image;

  private constructor(assetDir: string) {
    this._bgCanvas = createCanvas(320, 200);
    this._bgCtx = this._bgCanvas.getContext("2d");

    this._fgCanvas = createCanvas(320, 200);
    this._fgCtx = this._fgCanvas.getContext("2d");

    this._assetDir = assetDir;

    this._bgCtx.antialias = "none";
    this._fgCtx.antialias = "none";
  }

  public static async getInstance(assetDir: string) {
    if (OneCardCanvas._instance) {
      return OneCardCanvas._instance;
    } else {
      const instance = new OneCardCanvas(assetDir);
      await instance._init();

      this._instance = instance;

      return instance;
    }
  }

  public async draw(game: OneCardGame) {
    const encoder = new GIFEncoder(320, 200, "octree", true, 24);
    const frames = range(24);
    const bgCanvas = this._bgCanvas;
    const ctx = this._fgCtx;
    const canvas = this._fgCanvas;
    const back = this._cardBack;
    const turnBorder = this._turnBorder;
    const assetDir = this._assetDir;
    const players = game.players;
    const currentPlayer = game.currentPlayer;
    const lastCard = game.lastCard;
    const cardImage = await loadImage(path.resolve(assetDir, `${lastCard.id}.png`));

    await this._drawBackgroundLayer(game, cardImage);

    encoder.setDelay(100);
    encoder.start();

    frames.forEach(frameIdx => {
      ctx["clearRect"](0, 0, canvas.width, canvas.height);
      ctx.drawImage(bgCanvas, 0, 0, bgCanvas.width, bgCanvas.height);

      players.forEach((player, idx) => {
        if (player !== currentPlayer) return;

        const x = 20 + 2 * back.width;
        const y = 13 + 46 * idx;
        const size = turnBorder.height;
        const frameX = size * frameIdx;

        ctx.drawImage(turnBorder, frameX, 0, size, size, x, y, size, size);
      });

      if (lastCard.canAnimate()) {
        const cardX = 15 + back.width;
        const cardY = canvas.height / 2 - back.height / 2;
        const cardFrameIdx = frameIdx % 8;
        const frameX = back.width * cardFrameIdx;

        ctx.drawImage(cardImage, frameX, 0, back.width, back.height, cardX, cardY, back.width, back.height);
      }

      encoder.addFrame(ctx);
    });

    encoder.finish();

    return encoder.out.getData();
  }

  private async _drawBackgroundLayer(game: OneCardGame, cardImage: Image) {
    const ctx = this._bgCtx;
    const board = this._board;
    const back = this._cardBack;
    const players = game.players;

    ctx.drawImage(board, 0, 0, board.width, board.height);

    // Card size is 90 * 126
    ctx.drawImage(back, 15, board.height / 2 - back.height / 2, back.width, back.height);

    // Draw last card
    ctx.drawImage(cardImage, 0, 0, back.width, back.height, 15 + back.width, board.height / 2 - back.height / 2, back.width, back.height);

    // Draw players
    const playerX = 22 + 2 * back.width;
    const maxCard = game.getMaxCardCount();

    players.forEach((player, idx) => {
      const x = playerX;
      const y = 15 + 46 * idx;
      const avatar = player.avatar;
      const numberX = x + 42;
      const numberY = y + 9;

      ctx.drawImage(avatar, 0, 0, avatar.width, avatar.height, x, y, 32, 32);

      if (player.defeated) {
        this._drawX(numberX, numberY, 59, 14);
      } else {
        this._drawNumber(player.cards.length, numberX, numberY);
        this._drawSlash(numberX + 27, numberY, 5, 14);
        this._drawNumber(maxCard, numberX + 37, numberY);
      }

      if (idx !== players.length - 1) {
        // Draw turn direction arrow
        const flipY = game.isRightDirection;
        this._drawTurnDirection(!flipY, numberX + 19, y + 31);
      }
    });

    // Draw Attack Sum
    if (game.attackSum > 0) {
      const attackX = 15 + back.width - 34;
      const attackY = board.height / 2 - back.height / 2 - 30;

      this._drawAttackSum(game.attackSum, attackX, attackY);
    }

    // Draw Symbol Change
    if (game.symbolChange) {
      const { from, to } = game.symbolChange;
      const symbolBaseX = 15 + back.width;
      const symbolY = board.height / 2 + back.height / 2;

      this._drawSymbol(from, symbolBaseX - 48, symbolY);
      this._drawArrow(symbolBaseX - 8, symbolY + 8);
      this._drawSymbol(to, symbolBaseX + 16, symbolY);
    }
  }

  private _drawSlash(x: number, y: number, width: number, height: number) {
    const ctx = this._bgCtx;

    ctx["save"]();
    ctx["lineWidth"] = 3;
    ctx["strokeStyle"] = "#3b324a";
    ctx["beginPath"]();
    ctx["moveTo"](x + width, y);
    ctx["lineTo"](x, y + height);
    ctx["stroke"]();
    ctx["restore"]();
  }

  private _drawX(x: number, y: number, width: number, height: number) {
    const ctx = this._bgCtx;

    ctx["save"]();
    ctx["lineWidth"] = 3;
    ctx["strokeStyle"] = "#3b324a";
    ctx["beginPath"]();
    ctx["moveTo"](x + width, y);
    ctx["lineTo"](x, y + height);
    ctx["stroke"]();
    ctx["moveTo"](x, y);
    ctx["lineTo"](x + width, y + height);
    ctx["stroke"]();
    ctx["restore"]();
  }

  private _drawNumber(count: number, x: number, y: number) {
    const ctx = this._bgCtx;
    const numbers = this._numbers;

    const ten = Math.floor(count / 10);
    const one = count - ten * 10;

    const width = 0.2 * numbers.width;
    const height = 0.5 * numbers.height;

    ctx.drawImage(numbers, ...this._getNumberCoords(ten), width, height, x, y, width, height);
    ctx.drawImage(numbers, ...this._getNumberCoords(one), width, height, x + width + 2, y, width, height);
  }

  private _drawAttackSum(sum: number, x: number, y: number) {
    const ctx = this._bgCtx;
    const bomb = this._bomb;

    ctx.drawImage(bomb, x, y, bomb.width, bomb.height);
    this._drawNumber(sum, x + 34, y + 9);
  }

  private _drawSymbol(symbol: CardSymbol, x: number, y: number) {
    const ctx = this._bgCtx;
    const symbols = this._symbols;

    const width = 0.25 * symbols.width;
    const height = symbols.height;

    ctx.drawImage(symbols, symbol * width, 0, width, height, x, y, width, height);
  }

  private _drawArrow(x: number, y: number) {
    const ctx = this._bgCtx;
    const arrow = this._arrow;

    ctx.drawImage(arrow, x, y, arrow.width, arrow.height);
  }

  private _drawTurnDirection(flipY: boolean, x: number, y: number) {
    const ctx = this._bgCtx;
    const arrow = flipY
      ? this._arrowUp
      : this._arrowDown;

    ctx.drawImage(arrow, x, y, arrow.width, arrow.height);
  }

  private _getNumberCoords(num: number): [number, number] {
    const numbers = this._numbers;
    const u = 0.2 * (num % 5);
    const v = num > 4
      ? 0.5
      : 0;

    const x = u * numbers.width;
    const y = v * numbers.height;

    return [x, y];
  }

  private async _init() {
    const assetDir = this._assetDir;

    this._board = await loadImage(path.resolve(assetDir, "board.png"));
    this._cardBack = await loadImage(path.resolve(assetDir, "back.png"));
    this._numbers = await loadImage(path.resolve(assetDir, "numbers.png"));
    this._turnBorder = await loadImage(path.resolve(assetDir, "border.png"));
    this._bomb = await loadImage(path.resolve(assetDir, "bomb.png"));
    this._symbols = await loadImage(path.resolve(assetDir, "symbol.png"));
    this._arrow = await loadImage(path.resolve(assetDir, "arrow.png"));
    this._arrowDown = await loadImage(path.resolve(assetDir, "arrow-down.png"));
    this._arrowUp = await loadImage(path.resolve(assetDir, "arrow-up.png"));
  }
}

export default OneCardCanvas;
