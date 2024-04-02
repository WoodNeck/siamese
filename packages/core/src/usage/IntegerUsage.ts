import Usage, { type TextParseContext, type UsageOptions } from "./Usage";
import UsageType from "./UsageType";

import type { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";

export interface IntegerUsageOptions<OPTIONAL extends boolean = false> extends UsageOptions<OPTIONAL> {
  minValue: number;
  maxValue: number;
}

class IntegerUsage<OPTIONAL extends boolean = false> extends Usage<OPTIONAL> {
  public readonly type = UsageType.Integer;

  private _minValue?: number;
  private _maxValue?: number;

  public constructor(options: IntegerUsageOptions<OPTIONAL>) {
    super(options);

    this._minValue = options.minValue;
    this._maxValue = options.maxValue;
  }

  public build(slashBuilder: SlashCommandBuilder | SlashCommandSubcommandBuilder) {
    slashBuilder.addIntegerOption(option => {
      this._addOptionDefaults(option);

      if (this._minValue != null) {
        option.setMinValue(this._minValue);
      }

      if (this._maxValue != null) {
        option.setMaxValue(this._maxValue);
      }

      return option;
    });
  }

  public getTextValue({ index, args }: TextParseContext): number | null {
    const val = parseFloat(args[index]);
    if (isNaN(val)) return null;
    if (Math.floor(val) !== val) return null;

    return val;
  }

  public getInteractionValue(interaction: ChatInputCommandInteraction): OPTIONAL extends true ? number | null : number {
    return interaction.options.getInteger(this.name, !this.optional) as OPTIONAL extends true ? number | null : number;
  }
}

export default IntegerUsage;
