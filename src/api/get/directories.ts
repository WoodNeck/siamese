/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as URL from "../const/url";
import IconGroup from "../type/IconGroup";
import { Register } from "../register";

import IconModel from "~/model/Icon";
import IconGroupModel, { IconGroupDocument } from "~/model/IconGroup";

const register: Register = ({ app, bot }) => {
  /**
   * @query
   * id - guild.id
   *
   * @return {Array} JSON array of directories guild has.
   * id - directory id
   * name - directory name
   * guildID - guild id where it belongs
   */
  app.get(URL.DIRECTORIES, async (req, res) => {
    const guildID = req.query.id as string;
    const directories: IconGroup[] = (await IconGroupModel.find({
      guildID
    }).lean() as IconGroupDocument[]).map((iconGroup: IconGroupDocument) => ({
      name: iconGroup.name,
      id: iconGroup._id as string,
      guildID: iconGroup.guildID,
      authorID: iconGroup.authorID,
      createdTimestamp: (iconGroup._id.getTimestamp() as Date).getTime(),
      iconCount: 0
    }));

    const getDetailedInfo = directories.map(directory => new Promise<void>(async resolve => {
      const iconCount = await IconModel.countDocuments({
        groupID: directory.id
      }) as number;

      const guild = bot.guilds.cache.get(guildID);
      if (guild) {
        const member = await guild.members.fetch(directory.authorID)
          .catch(() => null);

        if (member) {
          directory.author = {
            id: member.id,
            username: member.displayName,
            tag: member.user.tag,
            avatarURL: member.user.displayAvatarURL()
          };
        }
      }

      directory.iconCount = iconCount;

      resolve();
    }));

    await Promise.all(getDetailedInfo);

    res.json(directories);
  });
};

export default register;
