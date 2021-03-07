import * as URL from "../const/url";
import * as ERROR from "../const/error";
import * as DEFAULT from "../const/default";
import { hasPermission } from "../helper";
import PassportSession from "../type/PassportSession";
import { Register } from "../register";

import IconGroupModel from "~/model/IconGroup";

const register: Register = ({ app, bot }) => {
  /**
   * @query
   * guildID - guild.id
   *
   * @return
   * 200 - OK
   * 301 - Already exists
   * 400 - Invalid arguments
   * 401 - Unauthorized
   * 402 - DB update failed
   */
  app.post(URL.DIRECTORY, async (req, res) => {
    const user = (req.session as PassportSession).passport?.user;

    if (!user) {
      return res.status(404).send(ERROR.NOT_EXISTS("사용자"));
    }

    const { guildID } = req.body as { guildID?: string };

    if (!guildID) {
      return res.status(400).send(ERROR.INVALID_ARGUMENTS);
    }

    const userHasPermission = await hasPermission(bot, user.id, guildID);

    if (!userHasPermission) {
      return res.status(401).send(ERROR.UNAUTHORIZED);
    }

    let nameCandidate = DEFAULT.GROUP_NAME;
    let duplicateNum = 2;

    while (await IconGroupModel.exists({
      name: nameCandidate,
      guildID
    })) {
      nameCandidate = `${DEFAULT.GROUP_NAME}(${duplicateNum})`;
      duplicateNum++;
    }

    await IconGroupModel.create({
      name: nameCandidate,
      guildID,
      authorID: user.id
    });

    res.sendStatus(200);
  });
};

export default register;
