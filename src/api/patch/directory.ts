import * as URL from "../const/url";
import * as ERROR from "../const/error";
import { Register } from "../register";
import { hasPermission } from "../helper";
import PassportSession from "../type/PassportSession";

import IconGroupModel, { IconGroupDocument } from "~/model/IconGroup";
import { ICON } from "~/const/command/icon";

const register: Register = ({ app, bot }) => {
  /**
   * @query
   * id - iconGroup.id
   * name - new icon group name
   *
   * @return
   * 200 - OK
   * 301 - Directory with same name exists
   * 400 - Invalid arguments
   * 401 - Unauthorized
   * 402 - DB update failed
   * 404 - Directory not exists
   */
  app.patch(URL.DIRECTORY, async (req, res) => {
    const user = (req.session as PassportSession).passport?.user;

    if (!user) {
      return res.status(404).send(ERROR.NOT_EXISTS("사용자"));
    }

    const { id: iconGroupID, name } = req.body as { id?: string; name?: string };

    if (!iconGroupID || !name) {
      return res.status(400).send("인자가 잘못되었습니다.");
    }

    const newName = name.trim();
    if (newName.length <= 0 || newName.length > ICON.NAME_MAX_LENGTH || /\s+/.test(newName)) {
      return res.status(400).send("인자가 잘못되었습니다.");
    }

    const iconGroup = await IconGroupModel.findById(iconGroupID).lean() as IconGroupDocument;

    if (!iconGroup) {
      return res.status(404).send(ERROR.NOT_EXISTS("폴더"));
    }

    const userHasPermission = await hasPermission(bot, user.id, iconGroup.guildID);

    if (!userHasPermission) {
      return res.status(401).send(ERROR.UNAUTHORIZED);
    }

    const alreadyExists = await IconGroupModel.exists({
      name: newName,
      guildID: iconGroup.guildID
    });

    if (alreadyExists) {
      return res.status(301).send("이미 동일한 이름의 폴더가 존재합니다.");
    }

    await (IconGroupModel.findByIdAndUpdate(iconGroupID, {
      name: newName
    })).then(() => res.sendStatus(200))
      .catch(() => res.status(402).send("폴더명 변경에 실패했습니다."));
  });
};

export default register;
