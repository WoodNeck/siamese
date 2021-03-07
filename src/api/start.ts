/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import fs from "fs";
import https from "https";

import express from "express";
import "express-async-errors";

import setup from "./setup";
import * as GET from "./get";
import * as POST from "./post";
import * as PATCH from "./patch";
import * as DELETE from "./delete";

import Siamese from "~/Siamese";

const startRestServer = (bot: Siamese) => {
  const app = express();
  const ctx = { app, bot };

  setup(ctx);

  Object.values(GET).forEach(register => register(ctx));
  Object.values(POST).forEach(register => register(ctx));
  Object.values(PATCH).forEach(register => register(ctx));
  Object.values(DELETE).forEach(register => register(ctx));

  // /**
  //  * change images directory it belongs to
  //  *
  //  * @query
  //  * user - user.id
  //  * guild - guild.id
  //  * images - image id array to change directory
  //  * directory - directory.id to move images
  //  *
  //  * @return
  //  * 200 - Partially success, returns duplicated ones in json format
  //  * 301 - File with same name exists
  //  * 400 - Invalid arguments
  //  * 401 - Unauthorized
  //  * 402 - DB update failed
  //  * 404 - Directory not exists
  //  */
  // app.patch(REST.URL.IMAGES, async (req, res) => {
  //   const { guild: guildId, user: userId, images: imageIds, directory } = req.body;

  //   if (!guildId || !userId || !imageIds) {
  //     return res.status(400).send("인자가 잘못되었습니다.");
  //   }

  //   if (!hasPermission(bot, userId, guildId)) {
  //     return res.status(401).send("길드에 스탬프관리 권한이 없습니다.");
  //   }

  //   if (directory) {
  //     const targetDir = await IconGroup.findById(directory);
  //     if (!targetDir) {
  //       return res.status(404).send("디렉토리가 존재하지 않습니다.");
  //     }
  //   }

  //   const dirId = directory ? directory : 0;
  //   const images = await Promise.all(imageIds.map(id => Icon.findById(id).exec()))
  //     .catch(() => undefined);
  //   if (!images) {
  //     return res.status(402).send("이미지를 가져오는 중에 오류가 발생했습니다.");
  //   }
  //   if (images.some(image => !image)) {
  //     return res.status(404).send("이미지가 존재하지 않습니다.");
  //   }
  //   const names = images.map(image => image.name);
  //   const exists = await Promise.all(names.map(name => Icon.findOne({ name: name, dirId }).exec()))
  //     .catch(() => undefined);
  //   if (!images) {
  //     return res.status(402).send("이미지를 가져오는 중에 오류가 발생했습니다.");
  //   }

  //   Promise.all(
  //     images
  //       .filter((_, index) => !exists[index])
  //       .map(image => {
  //         image.dirId = dirId;
  //         return image.save();
  //       })
  //   ).then(() => {
  //     res.json(
  //       images.map((image, index) => ({
  //         new: image,
  //         prev: exists[index]
  //       })).filter((_, index) => Boolean(exists[index]))
  //     );
  //   }).catch(() => res.status(402).send("이미지를 옮기는데 실패했습니다."));
  // });

  if (bot.env.HTTPS_CERT && bot.env.HTTPS_KEY) {
    const privateKey  = fs.readFileSync(bot.env.HTTPS_KEY, "utf8");
    const certificate = fs.readFileSync(bot.env.HTTPS_CERT, "utf8");

    const httpsServer = https.createServer({
      key: privateKey,
      cert: certificate
    }, app);

    httpsServer.listen(4260);
    // eslint-disable-next-line no-console
    console.log("API server listening on port 4260!");
  } else {
    app.listen(4260, () => {
      // eslint-disable-next-line no-console
      console.log("API server listening on port 4260!");
    });
  }
};

export default startRestServer;
