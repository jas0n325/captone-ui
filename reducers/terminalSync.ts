import { SET_TERMINAL_STATE_SYNC_ENABLED } from "../actions";
import { RequestState } from "./reducers";


export interface TerminalSyncState extends RequestState {
  terminalStateSyncEnabled: boolean;
}

const INITIAL_STATE: TerminalSyncState = {
  terminalStateSyncEnabled: true
};

export default (state: TerminalSyncState = INITIAL_STATE, action: any): TerminalSyncState => {
  switch (action.type) {
    case SET_TERMINAL_STATE_SYNC_ENABLED.REQUEST:
      return Object.assign({}, state, action.payload);
    case SET_TERMINAL_STATE_SYNC_ENABLED.SUCCESS:
    case SET_TERMINAL_STATE_SYNC_ENABLED.FAILURE:
    default:
      return state;
  }
};
