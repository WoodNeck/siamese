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

import Siamese from "~/Siamese";

const startRestServer = (bot: Siamese) => {
  const app = express();
  const ctx = { app, bot };

  setup(app, bot);

  Object.values(GET).forEach(register => register(ctx));
  Object.values(POST).forEach(register => register(ctx));
  Object.values(PATCH).forEach(register => register(ctx));

  // /**
  //  * @query
  //  * guild - guild.id
  //  * user - user.id
  //  * name - directory name
  //  *
  //  * @return
  //  * 200 - OK
  //  * 301 - Already exists
  //  * 400 - Invalid arguments
  //  * 401 - Unauthorized
  //  * 402 - DB update failed
  //  */
  // app.post(REST.URL.DIRECTORY, async (req, res) => {
  //   const { guild: guildId, user: userId, name } = req.body;

  //   if (!guildId || !userId || !name) {
  //     return res.status(400).send(REST.ERROR.INVALID_ARGUMENTS);
  //   }
  //   const dirName = name.trim();
  //   if (dirName.length <= 0 || dirName.length > 8) {
  //     return res.status(400).send(REST.ERROR.INVALID_ARGUMENTS);
  //   }

  //   if (!hasPermission(bot, userId, guildId)) {
  //     return res.status(401).send(REST.ERROR.UNAUTHORIZED);
  //   }

  //   const dirExists = await IconGroup.findOne({ name: dirName, guildId }).exec();
  //   if (dirExists) {
  //     return res.status(301).send(REST.ERROR.ALREADY_EXISTS("폴더"));
  //   }

  //   IconGroup.updateOne(
  //     { name: dirName, guildId, author: userId },
  //     {},
  //     { upsert: true },
  //   ).exec()
  //     .then(() => res.sendStatus(200))
  //     .catch(() => res.status(402).send(REST.ERROR.FAILED_TO_CREATE("폴더")));
  // });

  // /**
  //  * @query
  //  * guild - guild.id
  //  * user - user.id
  //  * directory - directory.id
  //  * name - new directory name
  //  *
  //  * @return
  //  * 200 - OK
  //  * 301 - Directory with same name exists
  //  * 400 - Invalid arguments
  //  * 401 - Unauthorized
  //  * 402 - DB update failed
  //  * 404 - Directory not exists
  //  */
  // app.patch(REST.URL.DIRECTORY, async (req, res) => {
  //   const { guild: guildId, user: userId, directory: directoryId, name } = req.body;

  //   if (!guildId || !userId || !name) {
  //     return res.status(400).send(REST.ERROR.INVALID_ARGUMENTS);
  //   }
  //   const newName = name.trim();
  //   if (newName.length <= 0 || newName.length > 8) {
  //     return res.status(400).send(REST.ERROR.INVALID_ARGUMENTS);
  //   }

  //   if (!hasPermission(bot, userId, guildId)) {
  //     return res.status(401).send(REST.ERROR.UNAUTHORIZED);
  //   }

  //   const dirExists = await IconGroup.findById(directoryId).exec();
  //   if (!dirExists) {
  //     return res.status(404).send(REST.ERROR.NOT_EXISTS("폴더"));
  //   }

  //   const alreadyExists = await IconGroup.findOne({ name: newName, guildId }).exec();
  //   if (alreadyExists) {
  //     return res.status(301).send(REST.ERROR.ALREADY_EXISTS("폴더"));
  //   }

  //   IconGroup.findByIdAndUpdate(directoryId, {
  //     name: newName
  //   }).exec()
  //     .then(() => res.sendStatus(200))
  //     .catch(() => res.status(402).send(REST.ERROR.FAILED_TO_CHANGE("폴더명")));
  // });

  // /**
  //  * @query
  //  * directory - directory.id
  //  * guild - guild.id
  //  * user - user.id
  //  *
  //  * @return
  //  * 200 - OK
  //  * 400 - Invalid arguments
  //  * 401 - Unauthorized
  //  * 402 - DB update failed
  //  * 404 - Directory not exists
  //  */
  // app.delete(REST.URL.DIRECTORY, async (req, res) => {
  //   const { directory: dirId, guild: guildId, user: userId } = req.body;

  //   if (!guildId || !userId || !dirId) {
  //     return res.status(400).send(REST.ERROR.INVALID_ARGUMENTS);
  //   }

  //   if (!hasPermission(bot, userId, guildId)) {
  //     return res.status(401).send(REST.ERROR.UNAUTHORIZED);
  //   }

  //   const directory = await IconGroup.findOne({
  //     _id: dirId,
  //     guildId
  //   }).exec();
  //   if (!directory) {
  //     return res.status(404).send(REST.ERROR.NOT_EXISTS("폴더"));
  //   }

  //   directory.remove()
  //     .then(() => res.sendStatus(200))
  //     .catch(() => res.status(402).send(REST.ERROR.FAILED_TO_REMOVE("폴더")));

  //   await Icon.deleteMany({
  //     dirId
  //   }).exec();
  // });

  // /**
  //  * @query
  //  * images - image id array to change directory
  //  * guild - guild.id
  //  * user - user.id
  //  *
  //  * @return
  //  * 200 - OK
  //  * 400 - Invalid arguments
  //  * 401 - Unauthorized
  //  * 402 - DB update failed
  //  * 404 - Directory not exists
  //  */
  // app.delete(REST.URL.IMAGES, async (req, res) => {
  //   const { images, guild: guildId, user: userId } = req.body;
  //   const imageIds = JSON.parse(images);

  //   if (!guildId || !userId || !imageIds) {
  //     return res.status(400).send(REST.ERROR.INVALID_ARGUMENTS);
  //   }

  //   if (!hasPermission(bot, userId, guildId)) {
  //     return res.status(401).send(REST.ERROR.UNAUTHORIZED);
  //   }

  //   Promise.all(imageIds.map(id => Icon.findByIdAndRemove(id).exec())).then(() => res.sendStatus(200))
  //     .catch(() => res.status(402).send(REST.ERROR.FAILED_TO_REMOVE("이미지")));
  // });

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

  // /**
  //  * Change image name
  //  *
  //  * @query
  //  * guild - guild.id
  //  * directory - directory.id
  //  * user - user.id
  //  * image - image.id
  //  * name - new image name
  //  *
  //  * @return
  //  * 200 - OK
  //  * 301 - File with same name exists
  //  * 400 - Invalid arguments
  //  * 401 - Unauthorized
  //  * 402 - DB update failed
  //  * 404 - File not exists
  //  */
  // app.patch(REST.URL.IMAGE, async (req, res) => {
  //   const { guild: guildId, directory: dirId, user: userId, image: imageId, name } = req.body;

  //   if (!guildId || !userId || !dirId || !imageId || !name) {
  //     return res.status(400).send("인자가 잘못되었습니다.");
  //   }
  //   const newName = name.trim();
  //   if (newName.length <= 0 || newName.length > 8) {
  //     return res.status(400).send("인자가 잘못되었습니다.");
  //   }

  //   if (!hasPermission(bot, userId, guildId)) {
  //     return res.status(401).send("길드에 스탬프관리 권한이 없습니다.");
  //   }

  //   const alreadyExists = await Icon.findOne({ name: newName, dirId, guildId }).exec();
  //   if (alreadyExists) {
  //     return res.status(301).send("이미 동일한 이름의 파일이 존재합니다.");
  //   }

  //   Icon.findByIdAndUpdate(imageId, {
  //     name: newName
  //   }).exec()
  //     .then(() => res.sendStatus(200))
  //     .catch(() => res.status(402).send("파일명 변경에 실패했습니다."));
  // });

  // /**
  //  * @query
  //  * image - image.id
  //  * guild - guild.id
  //  * user - user.id
  //  *
  //  * @return
  //  * 200 - OK
  //  * 400 - Invalid arguments
  //  * 401 - Unauthorized
  //  * 402 - DB update failed
  //  * 404 - Directory not exists
  //  */
  // app.delete(REST.URL.IMAGE, async (req, res) => {
  //   const { image: imgId, guild: guildId, user: userId } = req.body;

  //   if (!guildId || !userId || !imgId) {
  //     return res.status(400).send(REST.ERROR.INVALID_ARGUMENTS);
  //   }

  //   if (!hasPermission(bot, userId, guildId)) {
  //     return res.status(401).send(REST.ERROR.UNAUTHORIZED);
  //   }

  //   const image = await Icon.findOne({
  //     _id: imgId,
  //     guildId
  //   }).exec();
  //   if (!image) {
  //     return res.status(404).send(REST.ERROR.NOT_EXISTS("이미지"));
  //   }

  //   image.remove()
  //     .then(() => res.sendStatus(200))
  //     .catch(() => res.status(402).send(REST.ERROR.FAILED_TO_REMOVE("이미지")));
  // });

  if (bot.env.HTTPS_CERT && bot.env.HTTPS_KEY) {
    const privateKey  = fs.readFileSync(bot.env.HTTPS_KEY, "utf8");
    const certificate = fs.readFileSync(bot.env.HTTPS_CERT, "utf8");

    const httpsServer = https.createServer({
      key: privateKey,
      cert: certificate
    }, app);

    httpsServer.listen(4260);
    console.log("API server listening on port 4260!");
  } else {
    app.listen(4260, () => {
      console.log("API server listening on port 4260!");
    });
  }
};

export default startRestServer;
