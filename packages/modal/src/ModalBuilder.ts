import { randomUUID } from "crypto";

import {
  ActionRowBuilder,
  ModalBuilder as DiscordModalBuilder, TextInputBuilder, TextInputStyle, type ModalActionRowComponentBuilder
} from "discord.js";

export interface ModalOptions {
  id?: string;
  title: string;
}

export interface ModalInputOptions {
  id?: string;
  label: string;
  /**
   * 디폴트 값
   */
  value?: string;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  optional?: boolean;
}

/**
 * 주의: 모달 사용시 `deferUpdate`를 이전에 사용했으면 안됨
 */
class ModalBuilder {
  public id: NonNullable<ModalOptions["id"]>;
  public title: ModalOptions["title"];
  public inputs: TextInputBuilder[];

  private _builder: DiscordModalBuilder;

  public constructor({
    id = randomUUID(),
    title
  }: ModalOptions) {
    this._builder = new DiscordModalBuilder();

    this.id = id;
    this.title = title;
    this.inputs = [];
  }

  public build() {
    const builder = this._builder;

    builder.setTitle(this.title);
    builder.setCustomId(this.id);

    builder.setComponents(
      this.inputs.map(input => {
        return new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(input);
      })
    );

    return builder;
  }

  public setID(id: NonNullable<ModalOptions["id"]>): this {
    this.id = id;
    return this;
  }

  public setTitle(title: ModalOptions["title"]): this {
    this.title = title;
    return this;
  }

  public addShortInput(options: ModalInputOptions) {
    const input = new TextInputBuilder()
      .setStyle(TextInputStyle.Short);

    this._addTextInput(input, options);
  }

  public addParagraphInput(options: ModalInputOptions) {
    const input = new TextInputBuilder()
      .setStyle(TextInputStyle.Paragraph);

    this._addTextInput(input, options);
  }

  private _addTextInput(
    builder: TextInputBuilder,
    {
      id = randomUUID(),
      label,
      value,
      placeholder,
      minLength,
      maxLength,
      optional = false
    }: ModalInputOptions
  ) {
    builder.setCustomId(id);
    builder.setLabel(label);
    builder.setRequired(!optional);

    if (value) {
      builder.setValue(value);
    }

    if (placeholder) {
      builder.setPlaceholder(placeholder);
    }

    if (minLength != null) {
      builder.setMinLength(minLength);
    }

    if (maxLength != null) {
      builder.setMaxLength(maxLength);
    }

    this.inputs.push(builder);
  }
}

export default ModalBuilder;
