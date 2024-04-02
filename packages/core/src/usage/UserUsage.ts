import Usage, { type TextParseContext, type UsageOptions } from "./Usage";
import UsageType from "./UsageType";

import type { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder, User } from "discord.js";

export interface UserUsageOptions<OPTIONAL extends boolean = false> extends UsageOptions<OPTIONAL> {

}

class UserUsage<OPTIONAL extends boolean = false> extends Usage<OPTIONAL> {
  public readonly type = UsageType.User;

  public constructor(options: UserUsageOptions<OPTIONAL>) {
    super(options);
  }

  public build(slashBuilder: SlashCommandBuilder | SlashCommandSubcommandBuilder) {
    slashBuilder.addUserOption(option => {
      this._addOptionDefaults(option);

      return option;
    });
  }

  public getTextValue({ msg, index }: TextParseContext): User | null {
    return msg.mentions.users.at(index) ?? null;
  }

  public getInteractionValue(interaction: ChatInputCommandInteraction): OPTIONAL extends true ? User | null : User {
    return interaction.options.getUser(this.name, !this.optional) as OPTIONAL extends true ? User | null : User;
  }

  public toString() {
    return this.optional
      ? `[@${this.name}]`
      : `@${this.name}`;
  }
}

export default UserUsage;
