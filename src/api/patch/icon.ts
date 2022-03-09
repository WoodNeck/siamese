/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as URL from "../const/url";
import * as ERROR from "../const/error";
import { Register } from "../register";
import { hasPermission } from "../helper";
import PassportSession from "../type/PassportSession";

import IconModel, { IconDocument } from "~/model/Icon";
import { ICON } from "~/const/command/icon";

const register: Register = ({ app, bot }) => {
  /**
   * Change image name
   *
   * @query
   * id - icon.id
   * name - new image name
   *
   * @return
   * 200 - OK
   * 301 - File with same name exists
   * 400 - Invalid arguments
   * 401 - Unauthorized
   * 402 - DB update failed
   * 404 - File not exists
   */
  app.patch(URL.ICON, async (req, res) => {
    const user = (req.session as PassportSession).passport?.user;

    if (!user) {
      return res.status(404).send(ERROR.NOT_EXISTS("사용자"));
    }

    const { id: iconID, name } = req.body as { id?: string; name?: string };

    if (!iconID || !name) {
      return res.status(400).send("인자가 잘못되었습니다.");
    }

    const newName = name.trim();
    if (newName.length <= 0 || newName.length > ICON.NAME_MAX_LENGTH || /\s+/.test(newName)) {
      return res.status(400).send("인자가 잘못되었습니다.");
    }

    const icon = await IconModel.findById(iconID).lean() as IconDocument;

    if (!icon) {
      return res.status(404).send(ERROR.NOT_EXISTS("아이콘"));
    }

    const userHasPermission = await hasPermission(bot, user.id, icon.guildID);

    if (!userHasPermission) {
      return res.status(401).send(ERROR.UNAUTHORIZED);
    }

    const alreadyExists = await IconModel.exists({
      name: newName,
      guildID: icon.guildID,
      groupID: icon.groupID
    });

    if (alreadyExists) {
      return res.status(301).send("이미 동일한 이름의 파일이 존재합니다.");
    }

    await (IconModel.findByIdAndUpdate(iconID, {
      name: newName
    })).then(() => res.sendStatus(200))
      .catch(() => res.status(402).send("파일명 변경에 실패했습니다."));
  });
};

export default register;
