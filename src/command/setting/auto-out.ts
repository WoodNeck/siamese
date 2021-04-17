import Command from "~/core/Command";
import { AUTO_OUT } from "~/const/command/setting";
import * as PERMISSION from "~/const/permission";
import GuildConfig, { GuildConfigDocument } from "~/model/GuildConfig";

export default new Command({
  name: AUTO_OUT.CMD,
  description: AUTO_OUT.DESC,
  permissions: [PERMISSION.EMBED_LINKS],
  alias: AUTO_OUT.ALIAS,
  sendTyping: false,
  execute: async ({ bot, channel, guild }) => {
    const guildConfig = await GuildConfig.findOne({ guildID: guild.id }, undefined, { upsert: true }) as GuildConfigDocument;

    guildConfig.voiceAutoOut = !guildConfig.voiceAutoOut;

    await guildConfig.save();
    await bot.send(channel, guildConfig.voiceAutoOut ? AUTO_OUT.SET : AUTO_OUT.UNSET);
  }
});
