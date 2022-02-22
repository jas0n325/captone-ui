import {DataSyncStatus, PeerServiceInfo, DataSyncRole} from "@aptos-scp/scp-component-rn-datasync";

import { UPDATE_DATA_SYNC_STATUS } from "../actions";

export interface DataSyncState {
  status?: DataSyncStatus;
  role?: DataSyncRole;
  peerServices?: PeerServiceInfo[];
  error?: Error;
}

const INITIAL_STATE: DataSyncState = { };

export default (state: DataSyncState = INITIAL_STATE, action: any): DataSyncState => {
  if (action.type === UPDATE_DATA_SYNC_STATUS) {
    return Object.assign({}, state, action.payload);
  }
  return state;
};
