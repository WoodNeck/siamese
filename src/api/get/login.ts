import passport from "passport";

import { Register } from "../register";

const register: Register = ({ app, bot }) => {
  app.get("/auth/discord", passport.authenticate("discord"));
  app.get("/auth/discord/callback", passport.authenticate("discord", {
    failureRedirect: `${bot.env.WEB_URL_BASE}/fail`,
    session: true
  }), (_req, res) => {
    res.redirect(`${bot.env.WEB_URL_BASE}/siamese`);
  });
};

export default register;
