import { SET_GUILDS } from "../actionTypes";
import { setGuilds } from "../actions";
import Guild from "../../../../src/api/type/Guild";

const defaultState: Guild[] = [];

type GuildAction = ReturnType<typeof setGuilds>;

export default (state = defaultState, action: GuildAction) => {
  switch (action.type) {
    case SET_GUILDS: {
      return [
        ...action.payload
      ];
    }
    default:
      return state;
  }
}
