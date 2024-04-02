import { ActionRowBuilder, ButtonBuilder as DiscordButtonBuilder } from "discord.js";

import Button from "./Button";

import type { ButtonOptions } from "./Button";

class ButtonBuilder {
  // 분리자는 `null`로 표시
  private _buttons: Array<Button | null>;

  public constructor() {
    this._buttons = [];
  }

  public build() {
    const buttons = this._buttons;

    if (buttons.length <= 0) {
      throw new Error("빈 버튼 목록을 빌드하려고 시도");
    }

    const rows: ActionRowBuilder<DiscordButtonBuilder>[] = [];

    let row = new ActionRowBuilder<DiscordButtonBuilder>();
    rows.push(row);

    let buttonsInRow = 0;
    for (const button of buttons) {
      // 한 row에는 최대 5개의 버튼
      if (!button || buttonsInRow >= 5) {
        row = new ActionRowBuilder<DiscordButtonBuilder>();
        rows.push(row);
        buttonsInRow = 0;
      }

      if (button) {
        row.addComponents(button.build());
        buttonsInRow += 1;
      }
    }

    // 길이가 0인 줄은 제외
    return rows.filter(row => row.components.length > 0);
  }

  public addButton(option: ButtonOptions) {
    this._buttons.push(new Button(option));
  }

  public addSeparator() {
    this._buttons.push(null);
  }
}

export default ButtonBuilder;
