/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as URL from "../const/url";
import Icon from "../type/Icon";
import { Register } from "../register";

import IconModel, { IconDocument } from "~/model/Icon";

const register: Register = ({ app, bot }) => {
  /**
   * @query
   * guildID - guild.id
   * groupID - group.id
   *
   * @return {Array} "default"(dirId is 0) images
   */
  app.get(URL.ICONS, async (req, res) => {
    const guildID = req.query.guildID as string;
    const groupID = req.query.groupID as string ?? "0";

    const icons: Icon[] = (await IconModel.find({
      guildID, groupID
    }).lean() as IconDocument[]).map(icon => ({
      id: icon._id as string,
      name: icon.name,
      url: icon.url,
      guildID: icon.guildID,
      authorID: icon.authorID,
      groupID: icon.groupID,
      createdTimestamp: (icon._id.getTimestamp() as Date).getTime()
    }));

    const getDetailedInfo = icons.map(icon => new Promise<void>(async resolve => {
      const guild = bot.guilds.cache.get(guildID);
      if (guild) {
        const member = await guild.members.fetch(icon.authorID)
          .catch(() => null);

        if (member) {
          icon.author = {
            id: member.id,
            username: member.displayName,
            tag: member.user.tag,
            avatarURL: member.user.displayAvatarURL()
          };
        }
      }

      resolve();
    }));

    await Promise.all(getDetailedInfo);

    res.json(icons);
  });
};

export default register;
