/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/naming-convention */
import path from "path";

import { TextChannel } from "discord.js";

import * as URL from "../const/url";
import * as ERROR from "../const/error";
import { hasPermission } from "../helper";
import PassportSession from "../type/PassportSession";
import { Register } from "../register";

import IconModel from "~/model/Icon";
import IconGroupModel, { IconGroupDocument } from "~/model/IconGroup";
import { ICON } from "~/const/command/icon";

const register: Register = ({ app, bot }) => {
  /**
   * Add new icon
   *
   * @query
   * guildID - guild.id
   * icons
   * groupID(optional) - directory.id
   *
   * @return
   * 200 - OK
   * 301 - File with same name exists
   * 400 - Invalid arguments
   * 401 - Unauthorized
   * 402 - DB update failed
   * 404 - Directory not exists
   */
  app.post(URL.ICONS, async (req, res) => {
    const user = (req.session as PassportSession).passport?.user;

    if (!user) {
      return res.status(404).send(ERROR.NOT_EXISTS("사용자"));
    }

    let icons = req.files && req.files["icons[]"] as Array<{ name: string; tempFilePath: string }>;
    const { guildID, groupID } = req.body as {
      guildID?: string;
      groupID?: string;
    };

    if (!guildID || !icons) {
      return res.status(400).send(ERROR.INVALID_ARGUMENTS);
    }

    if (!Array.isArray(icons)) {
      icons = [icons];
    }

    // FIXME:
    // if (!hasPermission(bot, user.id, guildID)) {
    //   return res.status(401).send(ERROR.UNAUTHORIZED);
    // }

    // Find icon group first if id exists
    const iconGroup: { _id: string } = groupID
      ? await IconGroupModel.findById(groupID).lean() as Required<IconGroupDocument>
      : { _id: "0" };

    if (!iconGroup) {
      return res.status(404).send(ERROR.NOT_EXISTS("디렉토리"));
    }

    // Upload icon to icons channel
    const iconChannel = await bot.channels.fetch(bot.env.ICON_CHANNEL_ID) as TextChannel;

    const filesMsg = await iconChannel.send({
      files: icons.map(icon => ({ attachment: icon.tempFilePath, name: icon.name }))
    }).catch(e => { void bot.logger.error(e).catch(() => void 0); });

    if (!filesMsg) {
      return res.status(500).send(ERROR.FAILED_TO_CREATE("아이콘"));
    }

    const images = [...filesMsg.attachments.values()];

    const createIcons = icons.map(async (icon, iconIndex) => {
      const iconName = path.parse(icon.name).name.substr(0, ICON.NAME_MAX_LENGTH);

      let nameCandidate = iconName;
      let duplicateNum = 2;

      while (await IconModel.exists({
        name: nameCandidate,
        guildID,
        groupID: iconGroup._id
      })) {
        nameCandidate = `${iconName.substr(0, ICON.NAME_MAX_LENGTH - (duplicateNum.toString().length + 2))}(${duplicateNum})`;
        duplicateNum++;
      }

      return await IconModel.create({
        name: nameCandidate,
        url: images[iconIndex].url,
        guildID,
        groupID: iconGroup._id,
        authorID: user.id
      });
    });

    await Promise.all(createIcons);

    res.sendStatus(200);
  });
};

export default register;
