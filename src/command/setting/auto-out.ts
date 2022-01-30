import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "~/core/Command";
import { AUTO_OUT } from "~/const/command/setting";
import * as PERMISSION from "~/const/permission";
import GuildConfig, { GuildConfigDocument } from "~/model/GuildConfig";

export default new Command({
  name: AUTO_OUT.CMD,
  description: AUTO_OUT.DESC,
  permissions: [PERMISSION.EMBED_LINKS],
  alias: AUTO_OUT.ALIAS,
  adminOnly: true,
  sendTyping: false,
  slashData: new SlashCommandBuilder()
    .setName(AUTO_OUT.CMD)
    .setDescription(AUTO_OUT.DESC),
  execute: async ctx => {
    const { bot, guild } = ctx;

    let guildConfig = await GuildConfig.findOne({ guildID: guild.id }) as GuildConfigDocument;

    if (guildConfig) {
      guildConfig.voiceAutoOut = !guildConfig.voiceAutoOut;

      await guildConfig.save();
    } else {
      guildConfig = await GuildConfig.create({
        guildID: guild.id,
        voiceAutoOut: false
      });
    }

    await bot.send(ctx, { content: guildConfig.voiceAutoOut ? AUTO_OUT.SET : AUTO_OUT.UNSET });
  }
});
