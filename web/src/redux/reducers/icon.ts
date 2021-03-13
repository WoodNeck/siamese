import { SELECT_ALL_ICON, SET_ICONS, TOGGLE_ICON, UNSELECT_ALL_ICON } from "../actionTypes";
import { toggleIconChecked, setCheckedIcons, selectAllIcons, unselectAllIcons } from "../actions";

const defaultState: {
  [id: string]: {
    checked: boolean;
  };
} = {};

type IconAction =
  | ReturnType<typeof toggleIconChecked>
  | ReturnType<typeof setCheckedIcons>
  | ReturnType<typeof selectAllIcons>
  | ReturnType<typeof unselectAllIcons>;

export default (state = defaultState, action: IconAction) => {
  switch (action.type) {
    case TOGGLE_ICON: {
      const { id } = action.payload;

      return {
        ...state,
        [id]: {
          ...state[id],
          checked: state[id] ? !state[id].checked : true
        }
      };
    }
    case SET_ICONS: {
      const ids = action.payload;
      return ids.reduce((state, id) => ({
        ...state,
        [id]: { checked: false }
      }), {});
    }
    case SELECT_ALL_ICON: {
      return Object.keys(state).reduce((newState, id) => {
        return {
          ...newState,
          [id]: { checked: true }
        }
      }, state);
    }
    case UNSELECT_ALL_ICON: {
      return Object.keys(state).reduce((newState, id) => {
        return {
          ...newState,
          [id]: { checked: false }
        }
      }, state);
    }
    default:
      return state;
  }
}
