import { APP_ACCESS_LOCK_ACTION } from "../actions";
import { RequestState } from "./reducers";

export enum ClientAccessError {
  InvalidSecret = "Invalid client secret",
  InvalidCredentials = "INVALID_CREDENTIALS: Invalid client credentials"
};

export interface AppAccessLockDetails {
  appLocked: boolean;
  accessError?: ClientAccessError;
}

export interface IAppAccessLockState extends RequestState, AppAccessLockDetails {
  showAppLockMessage?: boolean;
}

const INITIAL_STATE: IAppAccessLockState = {
  appLocked: false,
  showAppLockMessage: false
};

export default (state: IAppAccessLockState = INITIAL_STATE, action: any): IAppAccessLockState => {
  switch (action.type) {
    case APP_ACCESS_LOCK_ACTION.REQUEST:
      return state;
    case APP_ACCESS_LOCK_ACTION.SUCCESS:
      return Object.assign({}, state, action.payload);
    case APP_ACCESS_LOCK_ACTION.FAILURE:
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
};
