import Guild from "../../../src/api/type/Guild";
import User from "../../../src/api/type/User";
import * as ACTION from "./actionTypes";

export const setUser = (user: User) => ({
  type: ACTION.SET_USER,
  payload: user
});

export const resetUser = () => ({
  type: ACTION.RESET_USER
});

export const setGuilds = (guilds: Guild[]) => ({
  type: ACTION.SET_GUILDS,
  payload: guilds
});

export const toggleHamburger = () => ({
  type: ACTION.TOGGLE_HAMBURGER
});
