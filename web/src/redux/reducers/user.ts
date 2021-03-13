import { SET_USER } from "../actionTypes";
import { setUser } from "../actions";
import User from "~/api/type/User";

const defaultState: User | null = null;

type UserAction = ReturnType<typeof setUser>;

export default (state: User | null = defaultState, action: UserAction) => {
  switch (action.type) {
    case SET_USER: {
      return {
        ...action.payload
      };
    }
    default:
      return state;
  }
}
