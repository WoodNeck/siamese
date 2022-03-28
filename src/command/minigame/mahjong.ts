import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "~/core/Command";
import { MAHJONG } from "~/const/command/minigame";
import * as PERMISSION from "~/const/permission";

export default new Command({
  name: MAHJONG.CMD,
  description: MAHJONG.DESC,
  permissions: [
    PERMISSION.USE_EXTERNAL_EMOJIS,
    PERMISSION.EMBED_LINKS
  ],
  sendTyping: false,
  slashData: new SlashCommandBuilder()
    .setName(MAHJONG.CMD)
    .setDescription(MAHJONG.DESC),
  execute: async ctx => {

  }
});
