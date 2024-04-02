import type UsageType from "./UsageType";
import type { ApplicationCommandOptionBase, ChatInputCommandInteraction, Message, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";

export interface UsageOptions<OPTIONAL extends boolean = false> {
  name: string;
  description: string;
  /**
   * @default false
   */
  optional?: OPTIONAL;
}

export interface TextParseContext {
  /**
   * 전체 옵션 내에서의 인덱스
   */
  index: number;
  /**
   * 동일 타입 내에서의 인덱스
   */
  typeIndex: number;
  /**
   * 전체 옵션 내에서 마지막 항목인지
   */
  isLast: boolean;
  /**
   * 동일 타입 내에서 마지막 항목인지
   */
  isTypeLast: boolean;
  msg: Message;
  content: string;
  args: string[];
}

abstract class Usage<OPTIONAL extends boolean = false> {
  public abstract type: UsageType;
  public readonly name: string;
  public readonly description: string;
  public readonly optional: boolean;

  public constructor({
    name,
    description,
    optional
  }: UsageOptions<OPTIONAL>) {
    this.name = name;
    this.description = description;
    this.optional = optional ?? false;
  }

  public abstract build(slashBuilder: SlashCommandBuilder | SlashCommandSubcommandBuilder): void;
  public abstract getTextValue(ctx: TextParseContext): unknown;
  public abstract getInteractionValue(interaction: ChatInputCommandInteraction): unknown;

  public toString() {
    return this.optional
      ? `[${this.name}]`
      : this.name;
  }

  protected _addOptionDefaults(option: ApplicationCommandOptionBase) {
    option.setName(this.name)
      .setDescription(this.description)
      .setRequired(!this.optional);
  }
}

export default Usage;
