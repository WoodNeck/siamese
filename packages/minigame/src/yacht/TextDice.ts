import { range } from "@siamese/util";

class TextDice {
  public constructor(public count: number) { }

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

    return {
      eyes: diceResult
    };
  }
}

export default TextDice;
