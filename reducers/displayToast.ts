import { DISPLAY_TOAST } from "../actions/displayToast";
import { RequestState } from "./reducers";


export interface DisplayToastState extends RequestState {
  toastMessage: string;
}

const INITIAL_STATE: DisplayToastState = {
  toastMessage: ""
};

export default (state: DisplayToastState = INITIAL_STATE, action: any): DisplayToastState => {
  switch (action.type) {
    case DISPLAY_TOAST.REQUEST:
      return Object.assign({}, state, {toastMessage: action.payload.toastMessage});
    case DISPLAY_TOAST.SUCCESS:
    case DISPLAY_TOAST.FAILURE:
      return Object.assign({}, INITIAL_STATE);
    default:
      return state;
  }
};
