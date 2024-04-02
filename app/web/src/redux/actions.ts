import Guild from "~/api/type/Guild";
import User from "~/api/type/User";
import * as ACTION from "./actionTypes";

export const setUser = (user: User) => ({
  type: ACTION.SET_USER,
  payload: user
});

export const setGuilds = (guilds: Guild[]) => ({
  type: ACTION.SET_GUILDS,
  payload: guilds
});

export const toggleHamburger = () => ({
  type: ACTION.TOGGLE_HAMBURGER
});

export const toggleIconChecked = (id: string) => ({
  type: ACTION.TOGGLE_ICON,
  payload: { id }
});

export const setCheckedIcons = (ids: string[]) => ({
  type: ACTION.SET_ICONS,
  payload: ids
});

export const selectAllIcons = () => ({
  type: ACTION.SELECT_ALL_ICON
});

export const unselectAllIcons = () => ({
  type: ACTION.UNSELECT_ALL_ICON
});
