import { EventSubscription } from "fbemitter";
import { Container } from "inversify";
import { Channel, EventChannel, eventChannel } from "redux-saga";
import { call, put, select, take, takeEvery } from "redux-saga/effects";

import { DI_TYPES as FEATURES_DI_TYPES } from "@aptos-scp/scp-component-store-selling-features";
import { TransactionService as TransactionPostingService } from "@aptos-scp/scp-component-transaction";

import {
  PendingTransactionCountPayload,
  TERMINAL_SETTINGS_INITIALIZED_ACTION,
  UPDATE_PENDING_TRX_COUNT } from "../actions";
import { SettingsState } from "../reducers";
import { getAppSettingsState } from "../selectors";


function createPendingTransactionCountListener(diContainer: Container): EventChannel<PendingTransactionCountPayload> {
  return eventChannel((emit: (input: PendingTransactionCountPayload) => void): () => void => {
    const transactionPostingService: TransactionPostingService =
        diContainer.get<TransactionPostingService>(FEATURES_DI_TYPES.TransactionPostingService);

    const updatePendingTransactionCountListener = (numPendingTransactions: number): void => {
      emit({
        pendingTransactionCount: numPendingTransactions
      });
    };

    const eventSubscription: EventSubscription =
        transactionPostingService.addPendingListener(updatePendingTransactionCountListener);

    return () => {
      eventSubscription.remove();
    };
  });
}

let channel: Channel<PendingTransactionCountPayload>;

function* watchOnPendingTransactionNotifications(): IterableIterator<{}> {
  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer: Container = settings.diContainer;

  if (channel) {
    channel.close();
  }
  channel = yield call(createPendingTransactionCountListener, diContainer);

  //noinspection InfiniteLoopJS
  while (true) {
    const payload = yield take(channel);
    yield put({ type: UPDATE_PENDING_TRX_COUNT.SUCCESS, payload });
  }
}

export function* startWatchOnPendingTransactionNotifications(): IterableIterator<{}> {
  // We need the diContainer to have been initialized in initComponents, before we can register the listener.
  // This coordinates that sequencing.
  yield takeEvery(TERMINAL_SETTINGS_INITIALIZED_ACTION, watchOnPendingTransactionNotifications);
}
