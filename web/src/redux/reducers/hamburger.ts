import { TOGGLE_HAMBURGER } from "../actionTypes";
import { toggleHamburger } from "../actions";

const defaultState = {
  open: false
};

type HamburgerAction = ReturnType<typeof toggleHamburger>;

export default (state = defaultState, action: HamburgerAction) => {
  switch (action.type) {
    case TOGGLE_HAMBURGER: {
      return {
        ...state,
        open: !state.open
      };
    }
    default:
      return state;
  }
}
