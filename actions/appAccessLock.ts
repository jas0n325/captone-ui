import { AuthError } from "@aptos-scp/scp-component-rn-auth";
import { ClientAccessError } from "../reducers/appAccessLock";
import { defineRequestType, RequestType, StandardAction } from "./actions";

export const APP_ACCESS_LOCK_ACTION: RequestType = defineRequestType("APP_ACCESS_LOCK_ACTION");

export const updateAppAccessLock = {
  request: (authError: AuthError): StandardAction => {
    return {
      type: APP_ACCESS_LOCK_ACTION.REQUEST,
      payload: {
        authError
      }
    };
  },
  success: (appLocked: boolean, showAppLockMessage: boolean, accessError: ClientAccessError): StandardAction => {
    return {
      type: APP_ACCESS_LOCK_ACTION.SUCCESS,
      payload: {
        appLocked,
        showAppLockMessage,
        accessError
      }
    };
  }
};