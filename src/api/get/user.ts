import * as URL from "../const/url";
import { Register } from "../register";
import PassportSession from "../type/PassportSession";

const register: Register = ({ app }) => {
  /**
   * @return {Object} user info
   * empty object if user not exists
   */
  app.get(URL.USER, async (req, res) => {
    const user = (req.session as PassportSession).passport?.user ?? {};

    res.json(user);
  });
};

export default register;

