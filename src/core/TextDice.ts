import { range } from "~/util/helper";
import { block } from "~/util/markdown";
import * as EMOJI from "~/const/emoji";

class TextDice {
  public constructor(public count: number) {}

  public roll(prevEyes?: number[], locked?: boolean[]) {
    const diceCount = this.count;
    const fixedDices: number[] = [];

    const rollDice = () => Math.floor(Math.random() * 6) + 1;

    if (locked) {
      locked.forEach((lock, idx) => {
        if (lock) {
          fixedDices.push(prevEyes![idx]);
        }
      });
    }

    const diceResult = [
      ...fixedDices,
      ...range(diceCount - fixedDices.length).map(() => rollDice())
    ].sort((a, b) => a - b);

    const dices = diceResult.map(res => this._drawDice(res));
    const diceText = range(5).map(idx => {
      return dices.map(dice => dice[idx]).join(EMOJI.FIGURE_SPACE);
    }).join("\n");

    return {
      eyes: diceResult,
      text: block(diceText)
    };
  }

  private _drawDice(num: number) {
    // Width without first/last letter
    const diceWidth = 5;
    const cover = "─".repeat(diceWidth);
    const eye = "o";
    const space = EMOJI.FIGURE_SPACE;

    const nwAndSE = num > 1 ? eye : space;
    const neAndSW = num > 3 ? eye : space;
    const wAndE = num > 5 ? eye : space;
    const mid = num % 2 ? eye : space;

    const padding = space.repeat(1);

    return [
      `┌${cover}┐`,
      `│${padding}${nwAndSE}${padding}${neAndSW}${padding}│`,
      `│${padding}${wAndE}${mid}${wAndE}${padding}│`,
      `│${padding}${neAndSW}${padding}${nwAndSE}${padding}│`,
      `└${cover}┘`
    ];
  }
}

export default TextDice;
