import { Session } from "express-session";

import User from "./User";

interface PassportSession extends Session {
  passport?: {
    user: User;
  };
}

export default PassportSession;
