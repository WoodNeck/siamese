/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Express } from "express";

import * as URL from "../const/url";

import IconGroupModel, { IconGroupDocument } from "~/model/IconGroup";

export default (app: Express) => {
  /**
   * @query
   * id - directory id
   *
   * @return {Object} JSON object of directory info
   * id - directory id
   * name - directory name
   * guildId - guild id where it belongs
   * images - images directory has
   */
  app.get(URL.DIRECTORY, async (req, res) => {
    const directoryId = req.query.id;
    const iconGroup = (await IconGroupModel.findById(directoryId).lean()) as IconGroupDocument || {};

    res.json({
      name: iconGroup.name,
      id: iconGroup._id as string,
      guildID: iconGroup.guildID,
      authorID: iconGroup.authorID,
      createdTimestamp: (iconGroup._id.getTimestamp() as Date).getTime(),
      iconCount: 0
    });
  });
};
