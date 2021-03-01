/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import fs from "fs";
import https from "https";

import Discord from "discord.js";
import express from "express";
import "express-async-errors";
import session from "express-session";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";

import { checkPermission, hasPermission } from "./helper";
import * as REST from "./constants";

import Siamese from "~/Siamese";
import IconGroup from "~/model/IconGroup";
import Icon from "~/model/Icon";
import * as DISCORD from "~/const/discord";

const startRestServer = (bot: Siamese) => {
  const app = express();

  // CORS
  app.use((req, res, next) => {
    res.append("Access-Control-Allow-Origin", [bot.env.WEB_URL_BASE]);
    res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH");
    res.append("Access-Control-Allow-Headers", "Content-Type");
    res.append("Access-Control-Allow-Credentials", "true");
    next();
  });

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  const sessionCookieConfig = (bot.env.HTTPS_CERT && bot.env.HTTPS_KEY)
    ? {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    } as const : undefined;

  app.use(session({
    secret: bot.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: sessionCookieConfig
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  // Authentication
  passport.use(new DiscordStrategy({
    clientID: bot.env.BOT_CLIENT_ID,
    clientSecret: bot.env.BOT_CLIENT_SECRET,
    callbackURL: `${bot.env.SERVER_DOMAIN}:4260/auth/discord/callback`,
    scope: ["identify"]
  }, async (accessToken, refreshToken, profile, cb) => {
    let error: Error | null = null;
    const user = await bot.users.fetch(profile.id)
      .catch(() => {
        error = new Error(REST.ERROR.NOT_EXISTS("사용자"));
        return undefined;
      });

    cb(error, user);
  }));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user as Express.User);
  });

  app.get("/auth/discord", passport.authenticate("discord"));
  app.get("/auth/discord/callback", passport.authenticate("discord", {
    failureRedirect: `${bot.env.WEB_URL_BASE}/fail`,
    session: true
  }), (req, res) => {
    res.redirect(`${bot.env.WEB_URL_BASE}/siamese`);
  });

  app.get(REST.URL.LOGOUT, (req, res) => {
    req.logout();
    req.session.save(() => {
      res.redirect(`${bot.env.WEB_URL_BASE}/siamese`);
    });
  });

  /**
   * @return {Object} user info
   * empty object if user not exists
   */
  app.get(REST.URL.USER, async (req, res) => {
    const user = (req.session as any).passport?.user ?? {};

    res.json(user);
  });

  /**
   * @return {Array} guilds - JSON array of guilds user is in
   * id - guild.id
   * iconURL - guild's png icon url
   * name - guild.name
   * hasPermission - Boolean value whether user have permission to manage file
   */
  app.get(REST.URL.GUILDS, async (req, res) => {
    const user: { id: string } = (req.session as any).passport?.user;

    if (!user) {
      return res.status(404).send(REST.ERROR.NOT_EXISTS("사용자"));
    }

    const guilds = bot.guilds.cache
      .filter(guild => !!guild.members.cache.has(user.id))
      .map((guild: Discord.Guild) => {
        const member = guild.members.fetch(user.id);

        return {
          id: guild.id,
          iconURL: guild.icon ? DISCORD.URL.GUILD_ICON(guild.id, guild.icon) : null,
          name: guild.name,
          // FIXME:
          hasPermission: true // checkPermission(member, guild)
        };
      });

    res.json(guilds);
  });

  /**
   * @query
   * id - guild.id
   *
   * @return {Array} JSON array of directories guild has.
   * id - directory id
   * name - directory name
   * guildID - guild id where it belongs
   */
  app.get(REST.URL.DIRECTORIES, async (req, res) => {
    const guildID = req.query.id;
    const directories = await IconGroup.find({
      guildID
    });

    res.json(directories);
  });

  // /**
  //  * @query
  //  * id - directory id
  //  *
  //  * @return {Object} JSON object of directory info
  //  * id - directory id
  //  * name - directory name
  //  * guildId - guild id where it belongs
  //  * images - images directory has
  //  */
  // app.get(REST.URL.DIRECTORY, async (req, res) => {
  //   const directoryId = req.query.id;
  //   const directory = await IconGroup.findById(directoryId) || {};
  //   const images = await Icon.find({
  //     dirId: directoryId
  //   }) || [];

  //   const dir = Object.assign({
  //     images
  //   }, directory._doc);

  //   res.json(dir);
  // });

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

  /**
   * @query
   * id - guild.id
   *
   * @return {Array} "default"(dirId is 0) images
   */
  app.get(REST.URL.ICONS, async (req, res) => {
    const guildID = req.query.id as string;

    const images = await Icon.find({
      guildID, groupID: "0"
    }).exec();

    res.json(images);
  });

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
  //  * Add new image
  //  *
  //  * @query
  //  * guild - guild.id
  //  * user - user.id
  //  * name - image.name
  //  * url - image.url
  //  * directory(optional) - directory.id
  //  *
  //  * @return
  //  * 200 - OK
  //  * 301 - File with same name exists
  //  * 400 - Invalid arguments
  //  * 401 - Unauthorized
  //  * 402 - DB update failed
  //  * 404 - Directory not exists
  //  */
  // app.post(REST.URL.IMAGE, async (req, res) => {
  //   const { guild: guildId, user: userId, name: imageName, url: imageUrl, directory } = req.body;

  //   if (!guildId || !userId || !imageName || !imageUrl) {
  //     return res.status(400).send(REST.ERROR.INVALID_ARGUMENTS);
  //   }

  //   const newName = imageName.trim();
  //   if (newName.length <= 0 || newName.length > 8) {
  //     return res.status(400).send(REST.ERROR.INVALID_ARGUMENTS);
  //   }

  //   if (!hasPermission(bot, userId, guildId)) {
  //     return res.status(401).send(REST.ERROR.UNAUTHORIZED);
  //   }

  //   const dirId = directory ? directory : 0;

  //   const alreadyExists = await Icon.findOne({ name: newName, dirId, guildId }).exec();
  //   if (alreadyExists) {
  //     return res.status(301).send(REST.ERROR.ALREADY_EXISTS("파일"));
  //   }

  //   if (dirId) {
  //     const dir = await IconGroup.findById(dirId).exec();
  //     if (!dir || dir.guildId !== guildId) {
  //       return res.status(404).send(REST.ERROR.NOT_EXISTS("디렉토리"));
  //     }
  //   }

  //   Icon.updateOne(
  //     { name: newName, url: imageUrl, guildId, author: userId, dirId },
  //     {},
  //     { upsert: true },
  //   ).exec()
  //     .then(() => res.sendStatus(200))
  //     .catch(() => res.status(402).send(REST.ERROR.FAILED_TO_CREATE("파일")));
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
