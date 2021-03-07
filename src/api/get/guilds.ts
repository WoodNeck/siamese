import Discord from "discord.js";

import * as URL from "../const/url";
import * as ERROR from "../const/error";
import { hasPermission } from "../helper";
import { Register } from "../register";
import Guild from "../type/Guild";
import PassportSession from "../type/PassportSession";

import * as DISCORD from "~/const/discord";

const register: Register = ({ app, bot }) => {
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

    const getAllGuilds = bot.guilds.cache
      .filter(guild => !!guild.members.cache.has(user.id))
      .map(async (guild: Discord.Guild) => ({
        id: guild.id,
        iconURL: guild.icon ? DISCORD.URL.GUILD_ICON(guild.id, guild.icon) : null,
        name: guild.name,
        hasPermission: await hasPermission(bot, user.id, guild.id)
      }));

    const guilds = await Promise.all(getAllGuilds) as Guild[];

    res.json(guilds);
  });
};

export default register;
