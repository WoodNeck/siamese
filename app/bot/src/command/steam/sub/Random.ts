import { COLOR } from "@siamese/color";
import { CommandContext, Cooldown, SubCommand } from "@siamese/core";
import { EmbedBuilder } from "@siamese/embed";
import { getOwningGames, getUserID } from "@siamese/steam";
import { getRandom } from "@siamese/util";
import { stripIndents } from "common-tags";

import { RANDOM, STEAM } from "../const";

class SteamRandom extends SubCommand {
  public override define() {
    return {
      data: RANDOM,
      deferReply: true,
      preconditions: [
        new Cooldown(1)
      ]
    };
  }

  public override async execute({ sender, getParams }: CommandContext) {
    const [searchText] = getParams<typeof RANDOM.USAGE>();

    if (!searchText) {
      await sender.replyError(STEAM.ERROR.EMPTY_USER_ID);
      return;
    }

    const userID = await getUserID(searchText);
    if (!userID) {
      await sender.replyError(STEAM.ERROR.USER_NOT_FOUND);
      return;
    }

    const owningGames = await getOwningGames(userID);
    if (!owningGames || owningGames.length <= 0) {
      await sender.replyError(STEAM.ERROR.EMPTY_GAMES);
      return;
    }

    const randomGame = getRandom(owningGames);
    const embed = new EmbedBuilder({
      author: {
        name: randomGame.name,
        iconURL: STEAM.GAME_IMG_URL(randomGame.appid, randomGame.img_icon_url)
      },
      description: stripIndents`
        ${STEAM.PLAYTIME(randomGame.playtime_forever)}
        - ${STEAM.STORE_URL(randomGame.appid)}
      `,
      thumbnail: STEAM.GAME_THUMB_URL(randomGame.appid),
      color: COLOR.BOT
    });

    await sender.send(embed);
  }
}

export default SteamRandom;
