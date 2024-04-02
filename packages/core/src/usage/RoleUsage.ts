import Usage, { type TextParseContext, type UsageOptions } from "./Usage";
import UsageType from "./UsageType";

import type { ChatInputCommandInteraction, Role, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";

export interface RoleUsageOptions<OPTIONAL extends boolean = false> extends UsageOptions<OPTIONAL> {

}

class RoleUsage<OPTIONAL extends boolean = false> extends Usage<OPTIONAL> {
  public readonly type = UsageType.User;

  public constructor(options: RoleUsageOptions<OPTIONAL>) {
    super(options);
  }

  public build(slashBuilder: SlashCommandBuilder | SlashCommandSubcommandBuilder) {
    slashBuilder.addRoleOption(option => {
      this._addOptionDefaults(option);

      return option;
    });
  }

  public getTextValue({ msg, index }: TextParseContext): Role | null {
    return msg.mentions.roles.at(index) ?? null;
  }

  public getInteractionValue(interaction: ChatInputCommandInteraction): OPTIONAL extends true ? Role | null : Role {
    return interaction.options.getRole(this.name, !this.optional) as OPTIONAL extends true ? Role | null : Role;
  }

  public toString() {
    return this.optional
      ? `[@${this.name}]`
      : `@${this.name}`;
  }
}

export default RoleUsage;
