
import { defineRequestType, RequestType, StandardAction } from "./actions";

export const APP_VERSION_BLOCKED_ACTION: RequestType = defineRequestType("APP_VERSION_BLOCKED_ACTION");

export const checkIfAppVersionIsBlocked = {
  request: (): StandardAction => {
    return {
      type: APP_VERSION_BLOCKED_ACTION.REQUEST,
      payload: {}
    };
  },
  success: (appVersionBlocked: boolean): StandardAction => {
    return {
      type: APP_VERSION_BLOCKED_ACTION.SUCCESS,
      payload: {
        appVersionBlocked
      }
    };
  }
};