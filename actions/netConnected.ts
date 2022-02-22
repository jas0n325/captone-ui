import { defineRequestType, RequestType, StandardAction } from "./actions";

export const SET_NETWORK_CONNECTED: RequestType = defineRequestType("SET_NETWORK_CONNECTED");

/**
 * Action fired when app network status(online/offline) change.
 */

export const setNetworkConnected= {
  request: (isNetConnected: boolean): StandardAction => {
    return {
      type: SET_NETWORK_CONNECTED.REQUEST,
      payload: { isNetConnected }
    };
  }
};
