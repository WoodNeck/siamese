
import { SlashCommandSubcommandBuilder } from "discord.js";

import Command from "./Command";
import reorderUsage from "./usage/reorderUsage";

abstract class SubCommand extends Command {
  /**
   * 서브 명령어는 상위 명령어에서 자동으로 등록되므로 등록하지 않음
   */
  public override async register() {
    // DO NOTHING
  }

  public override async unregister() {
    // DO NOTHING
  }

  public registerSubSlash(): SlashCommandSubcommandBuilder {
    const builder = new SlashCommandSubcommandBuilder();

    builder.setName(this.name);
    builder.setDescription(this.description);

    // 재배열
    const usages = reorderUsage(this.usage);
    usages.forEach(usage => {
      usage.build(builder);
    });

    return builder;
  }

}

export default SubCommand;
