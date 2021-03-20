import * as URL from "../const/url";
import * as ERROR from "../const/error";
import { hasPermission, isAdmin } from "../helper";
import { Register } from "../register";
import Guild from "../type/Guild";
import PassportSession from "../type/PassportSession";

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

    const getAllGuilds = user.guilds.map(async (guild): Promise<Guild> => {
      const hasBotGuild = Boolean(await bot.guilds.fetch(guild.id).catch(() => false));

      return {
        id: guild.id,
        iconURL: guild.iconURL,
        name: guild.name,
        hasSiamese: hasBotGuild,
        hasPermission: hasBotGuild && await hasPermission(bot, user.id, guild.id),
        isAdmin: hasBotGuild && await isAdmin(bot, user.id, guild.id)
      };
    });

    const guilds = await Promise.all(getAllGuilds) as Guild[];

    res.json(guilds);
  });
};

export default register;
