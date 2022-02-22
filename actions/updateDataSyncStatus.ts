import { DataSyncRole, DataSyncStatus, PeerServiceInfo } from "@aptos-scp/scp-component-rn-datasync";

export const UPDATE_DATA_SYNC_STATUS = "UPDATE_DATA_SYNC_STATUS";

export interface DataSyncStatusPayload {
  status: DataSyncStatus;
  role?: DataSyncRole;
  peerServices?: Readonly<PeerServiceInfo[]>;
  error?: Error;
}
