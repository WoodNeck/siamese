import { randomUUID } from "crypto";

import { ButtonBuilder as DiscordButtonBuilder, ButtonStyle } from "discord.js";

export interface ButtonOptions {
  label?: string | null;
  id?: string;
  disabled?: boolean;
  url?: string | null;
  emoji?: string | null;
  style?: ButtonStyle;
}

class Button {
  public readonly id: string;
  public readonly label: string | null;
  public readonly disabled: boolean;
  public readonly emoji: string | null;
  public readonly url: string | null;
  public readonly style: ButtonStyle;

  public constructor({
    id = randomUUID(),
    label = null,
    disabled = false,
    url = null,
    emoji = null,
    style = ButtonStyle.Secondary
  }: ButtonOptions) {
    this.id = id;
    this.label = label;
    this.disabled = disabled;
    this.url = url;
    this.emoji = emoji;
    this.style = style;
  }

  public build() {
    if (!this.label && !this.emoji) {
      throw new Error("빈 버튼을 생성하고자 했음");
    }

    const builder = new DiscordButtonBuilder({
      disabled: this.disabled,
      style: this.style
    });

    if (this.label) {
      builder.setLabel(this.label);
    }

    if (this.emoji) {
      builder.setEmoji(this.emoji);
    }

    if (this.url) {
      builder.setURL(this.url);
    } else {
      // URL이 없을때만 설정
      builder.setCustomId(this.id);
    }

    return builder;
  }
}

export default Button;
