import Discord from "discord.js";
import { Express } from "express";

import * as URL from "../const/url";
import * as ERROR from "../const/error";
import PassportSession from "../type/PassportSession";

import Siamese from "~/Siamese";
import * as DISCORD from "~/const/discord";

export default (app: Express, bot: Siamese) => {
  /**
   * @return {Array} guilds - JSON array of guilds user is in
   * id - guild.id
   * iconURL - guild's png icon url
   * name - guild.name
   * hasPermission - Boolean value whether user have permission to manage file
   */
  app.get(URL.GUILDS, async (req, res) => {
    const user = (req.session as PassportSession).passport?.user;

    if (!user) {
      return res.status(404).send(ERROR.NOT_EXISTS("사용자"));
    }

    const guilds = bot.guilds.cache
      .filter(guild => !!guild.members.cache.has(user.id))
      .map((guild: Discord.Guild) => {
        const member = guild.members.fetch(user.id);

        return {
          id: guild.id,
          iconURL: guild.icon ? DISCORD.URL.GUILD_ICON(guild.id, guild.icon) : null,
          name: guild.name,
          // FIXME:
          hasPermission: true // checkPermission(member, guild)
        };
      });

    res.json(guilds);
  });
};
