import { EventEmitter, EventSubscription } from "fbemitter";
import { Container } from "inversify";
import { Channel, EventChannel, eventChannel, SagaIterator } from "redux-saga";
import { call, put, select, take, takeEvery } from "redux-saga/effects";
import _ from "lodash";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import {
  DeviceIdentity,
  DI_TYPES as CORE_DI_TYPES,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  DOMAIN_NOTIFICATION_EVENT,
  RESET_AUTHORIZATION_TIMER_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import {
  EventResponseTypes,
  IAuthorizationResponse
} from "@aptos-scp/scp-types-commerce-devices";

import {
  businessOperation,
  DataEventType,
  DATA_EVENT,
  IDataEventRequestPayload,
  TERMINAL_SETTINGS_INITIALIZED_ACTION
} from "../actions";
import { SettingsState } from "../reducers";
import { getAppSettingsState } from "../selectors";


const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.paymentNotification");

/**
 * The createPaymentDeviceNotificationListener creates an event channel that listens on the deviceNotificationEmitter,
 * and received AuthData events.  It then creates and puts a dataEvent action that will get the data identified and
 * processed.
 *
 * @return {Channel<IDataEventRequestPayload>}
 */
function createPaymentDeviceNotificationListener(diContainer: Container): EventChannel<IDataEventRequestPayload> {
    return eventChannel((emit: (input: IDataEventRequestPayload) => void): () => void => {
      const deviceNotificationEmitter: EventEmitter = diContainer.get<EventEmitter>(
          CORE_DI_TYPES.DeviceNotificationEmitter);

      const authDataListener = (authDataNotification: IAuthorizationResponse): void => {
        // tslint:disable-next-line:max-line-length
        logger.trace(`In event channel payment data listener, received authDataNotification ${JSON.stringify(authDataNotification)}`);
        const dataEventPayload: IDataEventRequestPayload = {
          eventType: DataEventType.PaymentData,
          data: {
            data: _.cloneDeep(authDataNotification)
          }
        };
        emit(dataEventPayload);
      };

      const eventSubscription: EventSubscription =
          deviceNotificationEmitter.addListener(EventResponseTypes.TenderAuthorization, authDataListener);

      return () => {
        eventSubscription.remove();
      };
    });
  }

function createStoredValueReversalCompletedListener(diContainer: Container): EventChannel<{}> {
  return eventChannel((emit: (input: string) => void): () => void => {
    const deviceNotificationEmitter: EventEmitter = diContainer.get<EventEmitter>(
        CORE_DI_TYPES.DeviceNotificationEmitter);

    const reversalCompletedListener = (eventType: string): void => {
      emit(eventType);
    };

    const reversalCompletedSubscription: EventSubscription =
        deviceNotificationEmitter.addListener(EventResponseTypes.ReversalCompleted, reversalCompletedListener);

    return () => {
      reversalCompletedSubscription.remove();
    };
  });
}

function createResetAuthorizationTimerListener(diContainer: Container): EventChannel<{}> {
  return eventChannel((emit: (input: {}) => void): () => void => {
    const deviceNotificationEmitter: EventEmitter = diContainer.get<EventEmitter>(
        CORE_DI_TYPES.DeviceNotificationEmitter);

    const resetAuthTimerListener = (): void => {
      emit({ });
    };

    const resetTimerEventSubscription: EventSubscription =
        deviceNotificationEmitter.addListener(EventResponseTypes.ResetAuthorizationTimer, resetAuthTimerListener);

    return () => {
      resetTimerEventSubscription.remove();
    };
  });
}

export function* startWatchOnPaymentNotifications(): SagaIterator {
    // We need the diContainer to have been initialized in initComponents, before we can register the listener.
    // This coordinates that sequencing.
    yield takeEvery(TERMINAL_SETTINGS_INITIALIZED_ACTION, watchOnPaymentNotifications);
    yield takeEvery(TERMINAL_SETTINGS_INITIALIZED_ACTION, watchResetAuthTimerNotifications);
    yield takeEvery(TERMINAL_SETTINGS_INITIALIZED_ACTION, watchStoredValueReversalNotifications);
  }

let resetAuthTimerChannel: Channel<{}>;

function* watchResetAuthTimerNotifications(): SagaIterator {
  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer: Container = settings.diContainer;

  if (resetAuthTimerChannel) {
    resetAuthTimerChannel.close();
  }
  resetAuthTimerChannel = yield call(createResetAuthorizationTimerListener, diContainer);

  //noinspection InfiniteLoopJS
  while (true) {
    yield take(resetAuthTimerChannel);
    const settingsState: SettingsState = yield select(getAppSettingsState);
    const deviceIdentity: DeviceIdentity = settingsState.deviceIdentity;
    yield put(businessOperation.request(deviceIdentity, RESET_AUTHORIZATION_TIMER_EVENT,[]));
  }
}

let reversalCompletedChannel: Channel<string>;

function* watchStoredValueReversalNotifications(): SagaIterator {
  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer: Container = settings.diContainer;

  if (reversalCompletedChannel) {
    reversalCompletedChannel.close();
  }
  reversalCompletedChannel = yield call(createStoredValueReversalCompletedListener, diContainer);

  //noinspection InfiniteLoopJS
  while (true) {
    const eventType: string = yield take(reversalCompletedChannel);
    const uiInputs: UiInput[] = [new UiInput(UiInputKey.DOMAIN_NOTIFICATION_EVENT_TYPE, eventType)];
    const settingsState: SettingsState = yield select(getAppSettingsState);
    const deviceIdentity: DeviceIdentity = settingsState.deviceIdentity;
    yield put(businessOperation.request(deviceIdentity, DOMAIN_NOTIFICATION_EVENT, uiInputs));
  }
}

let channel: Channel<IDataEventRequestPayload>;

function* watchOnPaymentNotifications(): SagaIterator {
  const settings: SettingsState = yield select(getAppSettingsState);
    const diContainer: Container = settings.diContainer;

    if (channel) {
      channel.close();
    }
    channel = yield call(createPaymentDeviceNotificationListener, diContainer);

    //noinspection InfiniteLoopJS
    while (true) {
      const payload: IDataEventRequestPayload = yield take(channel);
      logger.trace(`In watchOnDeviceNotifications, received payload from channel: ${JSON.stringify(payload)}`);
      yield put({type: DATA_EVENT.REQUEST, payload});
    }
  }
