import * as URL from "../const/url";
import * as ERROR from "../const/error";
import { hasPermission } from "../helper";
import PassportSession from "../type/PassportSession";
import { Register } from "../register";

import IconModel from "~/model/Icon";

const register: Register = ({ app, bot }) => {
  /**
   * @query
   * icons - icon.id[]
   * guildID - guild.id
   *
   * @return
   * 200 - OK
   * 400 - Invalid arguments
   * 401 - Unauthorized
   * 402 - DB update failed
   * 404 - Directory not exists
   */
  app.delete(URL.ICONS, async (req, res) => {
    const user = (req.session as PassportSession).passport?.user;

    if (!user) {
      return res.status(404).send(ERROR.NOT_EXISTS("사용자"));
    }

    const { icons, guildID } = req.body as { icons?: string[]; guildID?: string };

    if (!guildID || !icons) {
      return res.status(400).send(ERROR.INVALID_ARGUMENTS);
    }

    if (!hasPermission(bot, user.id, guildID)) {
      return res.status(401).send(ERROR.UNAUTHORIZED);
    }

    const removeAll = icons.map(async groupID => await IconModel.findByIdAndRemove(groupID));

    await Promise.all(removeAll);

    res.sendStatus(200);
  });
};

export default register;
