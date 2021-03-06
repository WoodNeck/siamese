import * as URL from "../const/url";
import { Register } from "../register";

const register: Register = ({ app, bot }) => {
  app.get(URL.LOGOUT, (req, res) => {
    req.logout();
    req.session.save(() => {
      res.redirect(`${bot.env.WEB_URL_BASE}/siamese`);
    });
  });
};

export default register;
