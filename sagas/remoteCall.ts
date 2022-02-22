import { EventEmitter, EventSubscription } from "fbemitter";
import { Container } from "inversify";
import { Channel, EventChannel, eventChannel } from "redux-saga";
import { call, put, select, take, takeEvery } from "redux-saga/effects";

import {
  DI_TYPES as CORE_DI_TYPES,
  IRemoteCallInfo,
  REMOTE_CALL_INFO_EVENT_TYPE
} from "@aptos-scp/scp-component-store-selling-core";

import { remoteCall, TERMINAL_SETTINGS_INITIALIZED_ACTION } from "../actions";
import { SettingsState } from "../reducers";
import { getAppSettingsState } from "../selectors";


function createRemoteCallListener(diContainer: Container): EventChannel<IRemoteCallInfo> {
  return eventChannel((emit: (input: IRemoteCallInfo) => void): () => void => {

    const uiNotificationEmitter: EventEmitter =
      diContainer.get<EventEmitter>(CORE_DI_TYPES.UiNotificationEmitter);

    // Define the function that will be called, when a notification is sent.
    const remoteCallListener = (processingRemoteCallInfo: IRemoteCallInfo): void => {
      // This should emit an event on a redux-saga event channel, so that
      // it can be consumed and an appropriate action can be processed.
      emit(processingRemoteCallInfo);
    };

    const eventSubscription: EventSubscription = uiNotificationEmitter
      .addListener(REMOTE_CALL_INFO_EVENT_TYPE, remoteCallListener);

    return () => {
      eventSubscription.remove();
    };
  });
}

let channel: Channel<IRemoteCallInfo>;

function* watchOnRemoteCall(): IterableIterator<{}> {
  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer: Container = settings.diContainer;

  if (channel) {
    channel.close();
  }
  channel = yield call(createRemoteCallListener, diContainer);

  //noinspection InfiniteLoopJS
  while (true) {
    const payload: IRemoteCallInfo = yield take(channel);
    yield put(remoteCall.success(payload.name, payload.isProcessing, payload.sequenceNumber));
  }
}

export function* startWatchOnRemoteCall(): IterableIterator<{}> {
  // We need the diContainer to have been initialized in initComponents, before we can register the listener.
  // This coordinates that sequencing.
  yield takeEvery(TERMINAL_SETTINGS_INITIALIZED_ACTION, watchOnRemoteCall);
}
