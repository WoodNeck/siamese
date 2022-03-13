import { range } from "~/util/helper";
import * as EMOJI from "~/const/emoji";
import { block } from "~/util/markdown";

interface TextBoardOptions {
  paddingLeft: number;
  paddingRight: number;
}

class TextBoard {
  private _entries: Array<string | {
    label: string;
    values: string[];
  }>;

  private _footer: string | null;
  private _options: TextBoardOptions;

  public constructor(options: TextBoardOptions) {
    this._entries = [];
    this._options = options;
    this._footer = null;
  }

  public addSeparator(): this {
    this._entries.push("separator");
    return this;
  }

  public add(label: string, values: string[]): this {
    this._entries.push({ label, values });
    return this;
  }

  public addFooter(text: string): this {
    this._footer = text;
    return this;
  }

  public draw() {
    const entries = this._entries;
    const { paddingLeft, paddingRight } = this._options;
    const nonStringEntries = this._entries
      .filter(entry => typeof entry !== "string") as Array<{ label: string; values: any[] }>;

    const colCount = nonStringEntries
      .reduce((max, { values }) => {
        return Math.max(max, values.length);
      }, 0);
    const maxLabelLength = nonStringEntries
      .reduce((max, { label }) => {
        return Math.max(max, label.length);
      }, 0);
    const maxColLengths = range(colCount).map(colIdx => {
      return nonStringEntries
        .reduce((max, { values }) => {
          if (!values[colIdx]) return max;
          return Math.max(max, values[colIdx].length);
        }, 0);
    });

    // max line width, without first / last letter ("┌", "┐")
    const maxLineWidth = maxLabelLength
      + maxColLengths.reduce((total, val) => total + val, 0) + colCount
      + (paddingLeft + paddingRight) * (1 + colCount);
    const line = "─".repeat(maxLineWidth);
    const space = EMOJI.FIGURE_SPACE;
    const table = entries.map(entry => {
      if (typeof entry === "string") {
        return `│${line}│`;
      } else {
        const { label, values } = entry;
        const paddedLabel = `${space.repeat(paddingLeft + maxLabelLength - label.length)}${label}${space.repeat(paddingRight)}`;
        const paddedValues = values.map((val, colIdx) => {
          const maxColLength = maxColLengths[colIdx];
          return `${space.repeat(paddingLeft + maxColLength - val.length)}${val}${space.repeat(paddingRight)}`;
        });

        return `│${[paddedLabel, ...paddedValues].join("│")}│`;
      }
    }).join("\n");
    const footer = this._footer;

    return `${block(`┌${line}┐\n${table}\n└${line}┘`)}${footer ? `\n${footer}` : ""}`;
  }
}

export default TextBoard;
