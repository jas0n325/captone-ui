import { EventEmitter, EventSubscription } from "fbemitter";
import { Container } from "inversify";
import { Channel, EventChannel, eventChannel } from "redux-saga";
import { call, put, select, take, takeEvery } from "redux-saga/effects";


import { ILocalizableMessage } from "@aptos-scp/scp-component-business-core";
import {
  DI_TYPES as CORE_DI_TYPES,
  IUserNotificationListener,
  PosBusinessError,
  USER_NOTIFICATION_EVENT_TYPE
} from "@aptos-scp/scp-component-store-selling-core";
import {
  SSF_USER_NOTIFICATION_ERROR_CODE,
  USER_NOTIFICATION_ERROR_EVENT_TYPE
} from "@aptos-scp/scp-component-store-selling-features";

import { IUserNotificationPayload, TERMINAL_SETTINGS_INITIALIZED_ACTION, USER_NOTIFICATION } from "../actions";
import { SettingsState } from "../reducers";
import { getAppSettingsState } from "../selectors";


function createUserNotificationListener(diContainer: Container): EventChannel<IUserNotificationPayload> {
  return eventChannel((emit: (input: IUserNotificationPayload) => void): () => void => {

    const uiNotificationEmitter: EventEmitter =
      diContainer.get<EventEmitter>(CORE_DI_TYPES.UiNotificationEmitter);

    // Define the function that will be called, when a notification is sent.
    const userNotificationListener: IUserNotificationListener = (message: ILocalizableMessage): void => {
      const payload: IUserNotificationPayload = { message };
      // This should emit an event on a redux-saga event channel, so that
      // it can be consumed and an appropriate action can be processed.
      emit(payload);
    };

    const errorNotificationListener: IUserNotificationListener = (message: ILocalizableMessage): void => {
      const payload: IUserNotificationPayload = { error: new PosBusinessError(message, message.defaultMessage,
        SSF_USER_NOTIFICATION_ERROR_CODE)};
      emit(payload);
    };

    const eventSubscription: EventSubscription = uiNotificationEmitter
      .addListener(USER_NOTIFICATION_EVENT_TYPE, userNotificationListener);
    const errorSubscription: EventSubscription = uiNotificationEmitter
      .addListener(USER_NOTIFICATION_ERROR_EVENT_TYPE, errorNotificationListener);

    return () => {
      eventSubscription.remove();
      errorSubscription.remove();
    };
  });
}

let channel: Channel<IUserNotificationPayload>;

function* watchOnUserNotification(): IterableIterator<{}> {
  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer: Container = settings.diContainer;

  if (channel) {
    channel.close();
  }
  channel = yield call(createUserNotificationListener, diContainer);

  //noinspection InfiniteLoopJS
  while (true) {
    const payload = yield take(channel);
    yield put({ type: USER_NOTIFICATION.REQUEST, payload });
  }
}

export function* startWatchOnUserNotification(): IterableIterator<{}> {
  // We need the diContainer to have been initialized in initComponents, before we can register the listener.
  // This coordinates that sequencing.
  yield takeEvery(TERMINAL_SETTINGS_INITIALIZED_ACTION, watchOnUserNotification);
}
