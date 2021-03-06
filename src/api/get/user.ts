import { Express } from "express";

import * as URL from "../const/url";
import PassportSession from "../type/PassportSession";

export default (app: Express) => {
  /**
   * @return {Object} user info
   * empty object if user not exists
   */
  app.get(URL.USER, async (req, res) => {
    const user = (req.session as PassportSession).passport?.user ?? {};

    res.json(user);
  });
};


