import Usage, { type TextParseContext, type UsageOptions } from "./Usage";
import UsageType from "./UsageType";

import type { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";

export interface StringUsageOptions<OPTIONAL extends boolean = false> extends UsageOptions<OPTIONAL> {
  choices?: Array<{ name: string; value: string; }>;
  minLength?: number;
  maxLength?: number;
  autocomplete?: boolean;
}

class StringUsage<OPTIONAL extends boolean = false> extends Usage<OPTIONAL> {
  public readonly type = UsageType.String;

  private _choices: StringUsageOptions["choices"];
  private _minLength: StringUsageOptions["minLength"];
  private _maxLength: StringUsageOptions["maxLength"];
  private _autocomplete: StringUsageOptions["autocomplete"];

  public constructor(options: StringUsageOptions<OPTIONAL>) {
    super(options);

    this._choices = options.choices;
    this._minLength = options.minLength;
    this._maxLength = options.maxLength;
    this._autocomplete = options.autocomplete;
  }

  public build(slashBuilder: SlashCommandBuilder | SlashCommandSubcommandBuilder) {
    slashBuilder.addStringOption(option => {
      this._addOptionDefaults(option);

      if (this._minLength != null) {
        option.setMinLength(this._minLength);
      }

      if (this._maxLength != null) {
        option.setMaxLength(this._maxLength);
      }

      if (this._choices != null) {
        option.addChoices(...this._choices);
      }

      if (this._autocomplete != null) {
        option.setAutocomplete(this._autocomplete);
      }

      return option;
    });
  }

  public getTextValue({ index, isTypeLast, args }: TextParseContext): string | null {
    return isTypeLast
      ? args.slice(index).join(" ") || null
      : args[index] ?? null;
  }

  public getInteractionValue(interaction: ChatInputCommandInteraction): OPTIONAL extends true ? string | null : string {
    return interaction.options.getString(this.name, !this.optional) as OPTIONAL extends true ? string | null : string;
  }
}

export default StringUsage;
