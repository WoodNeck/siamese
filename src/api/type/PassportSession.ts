import { Session } from "express-session";

interface PassportSession extends Session {
  passport?: {
    user: {
      id: string;
    };
  };
}

export default PassportSession;
