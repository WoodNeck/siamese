import { combineReducers } from "redux";
import user from "./user";
import guilds from "./guilds";
import hamburger from "./hamburger";
import icon from "./icon";

const rootReducer = combineReducers({
  user,
  guilds,
  hamburger,
  icon
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;
