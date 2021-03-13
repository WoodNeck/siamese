import { RESET_USER, SET_USER } from "../actionTypes";
import { setUser, resetUser } from "../actions";
import User from "../../../../src/api/type/User";

const defaultState: User | null = null;

type UserAction =
  | ReturnType<typeof setUser>
  | ReturnType<typeof resetUser>;

export default (state: User | null = defaultState, action: UserAction) => {
  switch (action.type) {
    case SET_USER: {
      return {
        ...action.payload
      };
    }
    case RESET_USER: {
      return null;
    }
    default:
      return state;
  }
}
