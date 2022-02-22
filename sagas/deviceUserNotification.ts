import { EventEmitter, EventSubscription } from "fbemitter";
import { Container } from "inversify";
import { Channel, eventChannel, SagaIterator } from "redux-saga";
import { call, put, select, take, takeEvery } from "redux-saga/effects";

import { ILocalizableMessage } from "@aptos-scp/scp-component-business-core";
import { DI_TYPES as CORE_DI_TYPES } from "@aptos-scp/scp-component-store-selling-core";
import { EventResponseTypes, IDeviceUserNotification } from "@aptos-scp/scp-types-commerce-devices";

import {
  IUserNotificationPayload,
  TERMINAL_SETTINGS_INITIALIZED_ACTION,
  USER_NOTIFICATION
} from "../actions";
import { SettingsState } from "../reducers";
import { getAppSettingsState } from "../selectors";


function convertDeviceUserToUserNotification(deviceUserNotify: IDeviceUserNotification): IUserNotificationPayload {
  const userNotify: IUserNotificationPayload = deviceUserNotify as IUserNotificationPayload;
  return userNotify;
}

/**
 * The createDeviceUserNotificationListener creates an event channel that listens on the
 * deviceNotificationEmitter,and received Payment Status events.
 * processed.
 *
 * @return {Channel<IDeviceUserNotification>}
 */
export function* createDeviceUserNotificationListener(diContainer: Container): IterableIterator<{}> {
  return eventChannel((emit: (input: IDeviceUserNotification) => void): () => void => {
    const deviceNotificationEmitter: EventEmitter = diContainer.get<EventEmitter>(
        CORE_DI_TYPES.DeviceNotificationEmitter);

    const listener = (message: ILocalizableMessage): void => {
      const payload: IDeviceUserNotification = { message };
      // This should emit an event on a redux-saga event channel, so that
      // it can be consumed and an appropriate action can be processed.
      emit(payload);
    };

    const eventSubscription: EventSubscription =
        deviceNotificationEmitter.addListener(EventResponseTypes.DeviceUserNotification, listener);

    return () => {
      eventSubscription.remove();
    };
  });
}

export function* startWatchOnDeviceUserNotifications(): SagaIterator {
  // We need the diContainer to have been initialized in initComponents, before we can register the listener.
  // This coordinates that sequencing.
  yield takeEvery(TERMINAL_SETTINGS_INITIALIZED_ACTION, watchOnDeviceUserNotifications);
}

let channel: Channel<IDeviceUserNotification>;

export function* watchOnDeviceUserNotifications(): SagaIterator {
  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer: Container = settings.diContainer;
  if (channel) {
    channel.close();
  }
  channel = yield call(createDeviceUserNotificationListener, diContainer);
  //noinspection InfiniteLoopJS
  while (true) {
    // todo: make a function that takes in DS object and converts to IUserNotificationPayload
    const payload: IDeviceUserNotification = yield take(channel);
    const convertedPayload: IUserNotificationPayload = convertDeviceUserToUserNotification(payload);
    yield put({type: USER_NOTIFICATION.REQUEST, payload: { message: convertedPayload.message }});
  }
}
