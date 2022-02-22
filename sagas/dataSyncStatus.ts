import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import {
  DataSyncRole, DataSyncStatus,
  EventSubscription,
  MasterElectionPeerSynchronizerChange,
  PeerDiscoveryManager,
  PeerServiceInfo,
  Synchronizer,
  SynchronizerChange
} from "@aptos-scp/scp-component-rn-datasync";
import {
  DI_TYPES as FEATURES_DI_TYPES,
  IReplicationStatusService
} from "@aptos-scp/scp-component-store-selling-features";
import { Container } from "inversify";
import { Channel, EventChannel, eventChannel } from "redux-saga";
import { call, put, select, take, takeEvery } from "redux-saga/effects";


import { DI_TYPES } from "../../config";
import { DataSyncStatusPayload, TERMINAL_SETTINGS_INITIALIZED_ACTION, UPDATE_DATA_SYNC_STATUS } from "../actions";
import { SettingsState } from "../reducers";
import { getAppSettingsState } from "../selectors";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.datasyncstatus");

function mapSynchronizerStatus(change: SynchronizerChange): any {
  return {
    status: change.status,
    role: (change as MasterElectionPeerSynchronizerChange).role || DataSyncRole.master
  };
}

function createDataSyncStatusListener(diContainer: Container): EventChannel<Partial<Readonly<DataSyncStatusPayload>>> {
  return eventChannel((emit: (input: Partial<Readonly<DataSyncStatusPayload>>) => void): () => void => {
    const masterSynchronizer: Synchronizer = diContainer.get<Synchronizer>(DI_TYPES.MasterDataSynchronizer);
    const replicationStatusService: IReplicationStatusService
        = diContainer.get(FEATURES_DI_TYPES.IReplicationStatusService);

    const subscriptions: EventSubscription[] = [];
    let initialState: MasterElectionPeerSynchronizerChange = {
      status: DataSyncStatus.stopped,
      role: DataSyncRole.pending
    };

    if (masterSynchronizer) {
      initialState = mapSynchronizerStatus(masterSynchronizer.status);
      subscriptions.push(masterSynchronizer.addChangeListener((change: SynchronizerChange): void => {
        replicationStatusService.replicationListener({ status: change.status });
        emit(mapSynchronizerStatus(change));
        if (change.error) {
          logger.error(`Error during master data sync replication: ${change.error.message}`, change.error);
        }
      }));
    }

    const peerDiscoveryManager = diContainer.get<PeerDiscoveryManager>(DI_TYPES.PeerDiscoveryManager);
    if (peerDiscoveryManager) {
      subscriptions.push(peerDiscoveryManager.addPeerFoundListener((info: PeerServiceInfo) => {
        logger.info(`Found peer at host: ${info?.dnsServiceInfo?.host}`);
        logger.info(`Found ${peerDiscoveryManager.peers.length} peer(s) so far`);

        emit({ peerServices: peerDiscoveryManager.peers });
      }));
      subscriptions.push(peerDiscoveryManager.addPeerLostListener((info: PeerServiceInfo) => {
        logger.info(`Lost peer at host: ${info?.dnsServiceInfo?.host}`);
        logger.info(`Found ${peerDiscoveryManager.peers.length} peer(s) so far`);
        emit({ peerServices: peerDiscoveryManager.peers });
      }));
      subscriptions.push(peerDiscoveryManager.addErrorListener((err: Error) => {
        logger.info(`Error scanning/publishing peer(s): ${err.message}`);
        logger.info(`Found ${peerDiscoveryManager.peers.length} peer(s) so far`);
      }));
    }

    // emit initial state

    setImmediate(() => {
      emit(initialState);
    });

    return () => {
      subscriptions.forEach((s) => s());
    };
  });
}

let channel: Channel<DataSyncStatusPayload>;

export function* watchOnDataSyncStatusNotifications(): IterableIterator<{}> {
  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer: Container = settings.diContainer;

  if (channel) {
    channel.close();
  }

  channel = yield call(createDataSyncStatusListener, diContainer);

  //noinspection InfiniteLoopJS
  while (true) {
    const payload = yield take(channel);
    yield put({ type: UPDATE_DATA_SYNC_STATUS, payload });
  }
}

export function* startWatchOnDataSyncStatusNotifications(): IterableIterator<{}> {
  // We need the diContainer to have been initialized in initComponents, before we can register the listener.
  // This coordinates that sequencing.
  yield takeEvery(TERMINAL_SETTINGS_INITIALIZED_ACTION, watchOnDataSyncStatusNotifications);
}
