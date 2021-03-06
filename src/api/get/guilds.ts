import { Express } from "express";

import * as URL from "../const/url";

import Siamese from "~/Siamese";

export default (app: Express, bot: Siamese) => {
  app.get(URL.LOGOUT, (req, res) => {
    req.logout();
    req.session.save(() => {
      res.redirect(`${bot.env.WEB_URL_BASE}/siamese`);
    });
  });
};
