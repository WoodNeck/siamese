import express, { Express } from "express";
import session from "express-session";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";

import * as ERROR from "./const/error";
import { getGuildIcon, getUserAvatar } from "./helper";
import User from "./type/User";

import Siamese from "~/Siamese";

export default ({ app, bot }: { app: Express; bot: Siamese }) => {
  // CORS
  app.use((req, res, next) => {
    res.append("Access-Control-Allow-Origin", [bot.env.WEB_URL_BASE]);
    res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH");
    res.append("Access-Control-Allow-Headers", "Content-Type");
    res.append("Access-Control-Allow-Credentials", "true");
    next();
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(fileUpload({
    limits: { fileSize: 8 * 1024 * 1024 },
    useTempFiles : true,
    tempFileDir : "/tmp/"
  }));
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
    scope: ["identify", "guilds"]
  }, (accessToken, refreshToken, profile, cb) => {
    if (!profile || !profile.id) {
      cb(null, false, { message: ERROR.NOT_EXISTS("사용자") });
      return;
    }

    const user: User = {
      id: profile.id,
      username: profile.username,
      tag: `${profile.username}#${profile.discriminator}`,
      avatarURL: getUserAvatar(profile.id, profile.discriminator, profile.avatar!),
      guilds: profile.guilds!.map(guild => ({
        id: guild.id,
        name: guild.name,
        iconURL: getGuildIcon(guild.id, guild.icon!)
      }))
    };

    cb(null, user);
  }));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user as Express.User);
  });
};
