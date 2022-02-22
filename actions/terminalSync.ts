import { defineRequestType, RequestType, StandardAction } from "./actions";

export const SET_TERMINAL_STATE_SYNC_ENABLED: RequestType = defineRequestType("SET_TERMINAL_STATE_SYNC_ENABLED");

export const setTerminalStateSync = {
  request: (terminalStateSyncEnabled: boolean): StandardAction => {
    return {
      type: SET_TERMINAL_STATE_SYNC_ENABLED.REQUEST,
      payload: { terminalStateSyncEnabled }
    };
  }
};
