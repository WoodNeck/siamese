import * as URL from "../const/url";
import * as ERROR from "../const/error";
import { hasPermission } from "../helper";
import PassportSession from "../type/PassportSession";
import { Register } from "../register";

import IconGroupModel from "~/model/IconGroup";
import IconModel from "~/model/Icon";

const register: Register = ({ app, bot }) => {
  /**
   * @query
   * directories - directory.id[]
   * guildID - guild.id
   *
   * @return
   * 200 - OK
   * 400 - Invalid arguments
   * 401 - Unauthorized
   * 402 - DB update failed
   * 404 - Directory not exists
   */
  app.delete(URL.DIRECTORIES, async (req, res) => {
    const user = (req.session as PassportSession).passport?.user;

    if (!user) {
      return res.status(404).send(ERROR.NOT_EXISTS("사용자"));
    }

    const { directories, guildID } = req.body as { directories?: string[]; guildID?: string };

    if (!guildID || !directories) {
      return res.status(400).send(ERROR.INVALID_ARGUMENTS);
    }

    if (!hasPermission(bot, user.id, guildID)) {
      return res.status(401).send(ERROR.UNAUTHORIZED);
    }

    const removeAll = directories.map(async groupID => await IconGroupModel.findByIdAndRemove(groupID));

    await Promise.all(removeAll);

    // Remove all icons belong to these icon groups
    const removeAllIcons = directories.map(async groupID => await IconModel.deleteMany({ groupID }));

    await Promise.all(removeAllIcons);

    res.sendStatus(200);
  });
};

export default register;
