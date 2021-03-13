import { combineReducers } from "redux";
import user from "./user";
import guilds from "./guilds";
import hamburger from "./hamburger";

const rootReducer = combineReducers({
  user,
  guilds,
  hamburger
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;
