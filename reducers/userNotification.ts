import { ILocalizableMessage } from "@aptos-scp/scp-component-business-core";

import { USER_NOTIFICATION } from "../actions";
import { RequestState } from "./reducers";


export interface IUserNotificationState extends RequestState {
  message?: ILocalizableMessage;
  error?: Error;
}

const INITIAL_STATE: IUserNotificationState = {
};

export default (state: IUserNotificationState = INITIAL_STATE, action: any): IUserNotificationState => {
  switch (action.type) {
    case USER_NOTIFICATION.REQUEST:
      return Object.assign({}, state, action.payload);
    case USER_NOTIFICATION.SUCCESS:
      return Object.assign({}, state, action.payload);
    case USER_NOTIFICATION.FAILURE:
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
};
