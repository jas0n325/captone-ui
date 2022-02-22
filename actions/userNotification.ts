import { ILocalizableMessage } from "@aptos-scp/scp-component-business-core";

import { defineRequestType, RequestType, StandardAction } from "./actions";


export const USER_NOTIFICATION: RequestType = defineRequestType("USER_NOTIFICATION");

export interface IUserNotificationPayload {
  message?: ILocalizableMessage;
  error?: Error;
}

// Note: This action is a little backwards from a normal action.  With a normal action, the request is from a UI
// component to a saga, and the saga replies with the success or failure.  In this action, the request is from a saga to
// the UI component, and the UI component replies with the success (or failure).
export const userNotification = {
  request: (message: ILocalizableMessage): StandardAction => {
    const payload: IUserNotificationPayload = {
      message
    };
    return {
      type: USER_NOTIFICATION.REQUEST,
      payload
    };
  },
  success: (): StandardAction => {
    // The message was displayed successfully, so clear it from the state.
    const payload: IUserNotificationPayload = {
      message: null,
      error: null
    };
    return {
      type: USER_NOTIFICATION.SUCCESS,
      payload
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: USER_NOTIFICATION.FAILURE,
      payload: {
        error
      }
    };
  }
};
