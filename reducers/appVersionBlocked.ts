import { APP_VERSION_BLOCKED_ACTION } from "../actions";
import { RequestState } from "./reducers";

export interface IAppVersionBlockedState extends RequestState {
  appVersionBlocked?: boolean;
}

const INITIAL_STATE: IAppVersionBlockedState = {
  appVersionBlocked: false
};

export default (state: IAppVersionBlockedState = INITIAL_STATE, action: any): IAppVersionBlockedState => {
  switch (action.type) {
    case APP_VERSION_BLOCKED_ACTION.REQUEST:
      return state;
    case APP_VERSION_BLOCKED_ACTION.SUCCESS:
      return Object.assign({}, state, action.payload);
    case APP_VERSION_BLOCKED_ACTION.FAILURE:
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
};
