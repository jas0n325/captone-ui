import { EventEmitter, EventSubscription } from "fbemitter";
import { Container } from "inversify";
import { Channel, EventChannel, eventChannel, SagaIterator } from "redux-saga";
import { call, put, select, take, takeEvery } from "redux-saga/effects";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { DI_TYPES as CORE_DI_TYPES, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import { CollectedDataKey } from "@aptos-scp/scp-component-store-selling-features";
import {
  EventResponseTypes,
  IAuthorizationResponse,
  IScanDataNotification
} from "@aptos-scp/scp-types-commerce-devices";

import {
  balanceInquiry,
  BUSINESS_OPERATION,
  DataEventType,
  DATA_EVENT,
  deviceService,
  DeviceServiceType,
  IDataEventRequestPayload,
  StandardAction,
  TERMINAL_SETTINGS_INITIALIZED_ACTION
} from "../actions";
import { SettingsState } from "../reducers";
import { getAppSettingsState } from "../selectors";


const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.deviceNotification");

/**
 * The createScannerDeviceNotificationListener creates an event channel that listens on the deviceNotificationEmitter,
 * and received ScanData events.  It then creates and puts a dataEvent action that will get the data identified and
 * processed.
 *
 * @return {Channel<IDataEventRequestPayload>}
 */
function createScannerDeviceNotificationListener(diContainer: Container): EventChannel<IDataEventRequestPayload> {
  return eventChannel((emit: (input: IDataEventRequestPayload) => void): () => void => {
    const deviceNotificationEmitter: EventEmitter = diContainer.get<EventEmitter>(
        CORE_DI_TYPES.DeviceNotificationEmitter);

    const scanDataListener = (scanDataNotification: IScanDataNotification): void => {
      // tslint:disable-next-line:max-line-length
      logger.trace(`In event channel scan data listener, received scanDataNotification ${JSON.stringify(scanDataNotification)}`);
      const dataEventPayload: IDataEventRequestPayload = {
        eventType: DataEventType.ScanData,
        data: {
          encoding: scanDataNotification.encoding,
          data: scanDataNotification.data,
          deviceId: scanDataNotification.deviceId
        }
      };
      emit(dataEventPayload);
    };

    const eventSubscription: EventSubscription =
        deviceNotificationEmitter.addListener(EventResponseTypes.Scan, scanDataListener);

    return () => {
      eventSubscription.remove();
    };
  });
}

function findInputByInputKey(inputKey: string, inputs: UiInput[]): UiInput {
  return inputs && inputs.find(
      (input: UiInput): boolean => input.inputKey === inputKey
  );
}

function findInputByInputSource(source: string, inputs: UiInput[]): UiInput {
  return inputs && inputs.find(
    (input: UiInput): boolean => input.inputSource === source
  );
}

function* handleBusinessOperationSuccess(action: StandardAction): SagaIterator {
  const deviceIdInput = findInputByInputKey("deviceId", action.payload.inputs);
  yield put(deviceService.request(DeviceServiceType.ScannerUpdate, {
    enabled: true,
    alertSuccess: findInputByInputSource("barcode", action.payload.inputs) ? true : undefined,
    deviceId: deviceIdInput ? deviceIdInput.inputValue : undefined
  }));
  if (action.payload.nonContextualData &&
        (action.payload.nonContextualData.has(CollectedDataKey.BalanceInquiryResponse)) )  {
    const balanceInquiryResponse: IAuthorizationResponse =
        action.payload.nonContextualData.get(CollectedDataKey.BalanceInquiryResponse);
    yield put(balanceInquiry.success(balanceInquiryResponse));
  }
}

function* handleBusinessOperationFail(action: StandardAction): SagaIterator {
  const deviceIdInput = findInputByInputKey("deviceId", action.payload.inputs);
  yield put(deviceService.request(DeviceServiceType.ScannerUpdate, {
    enabled: true,
    alertSuccess: findInputByInputSource("barcode", action.payload.inputs) ? false : undefined,
    deviceId: deviceIdInput ? deviceIdInput.inputValue : undefined
  }));
}

export function* handleDataEventSuccess(action: StandardAction): SagaIterator {
  logger.traceEntry("handleDataEventSuccess");
  if (action.payload.eventType === DataEventType.ScanData ||
      action.payload.eventType === DataEventType.KeyListenerData) {
    yield put(deviceService.request(DeviceServiceType.ScannerUpdate, {
      enabled: action.payload.businessProcessStarted ? false : true
    }));
  }
}

export function* handleDataEventFailure(action: StandardAction): SagaIterator {
  logger.traceEntry("handleDataEventFailure");
  const deviceIdInput = findInputByInputKey("deviceId", action.payload.inputs);
  if (action.payload.eventType === DataEventType.ScanData ||
      action.payload.eventType === DataEventType.KeyListenerData) {
    yield put(deviceService.request(DeviceServiceType.ScannerUpdate, {
      alertSuccess: false,
      deviceId: deviceIdInput ? deviceIdInput.inputValue : undefined
    }));
  }
}

let channel: Channel<IDataEventRequestPayload>;

function* watchOnDeviceNotifications(): SagaIterator {
  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer: Container = settings.diContainer;

  if (channel) {
    channel.close();
  }
  channel = yield call(createScannerDeviceNotificationListener, diContainer);

  //noinspection InfiniteLoopJS
  while (true) {
    const payload: IDataEventRequestPayload = yield take(channel);
    logger.trace(`In watchOnDeviceNotifications, received payload from channel: ${JSON.stringify(payload)}`);
    yield put({ type: DATA_EVENT.REQUEST, payload });
  }
}

export function* startWatchOnDeviceNotifications(): SagaIterator {
  // We need the diContainer to have been initialized in initComponents, before we can register the listener.
  // This coordinates that sequencing.
  yield takeEvery(TERMINAL_SETTINGS_INITIALIZED_ACTION, watchOnDeviceNotifications);
}

export function* watchEventsForDevice(): SagaIterator {
  yield takeEvery(BUSINESS_OPERATION.SUCCESS, handleBusinessOperationSuccess);
  yield takeEvery(BUSINESS_OPERATION.FAILURE, handleBusinessOperationFail);

  yield takeEvery(DATA_EVENT.FAILURE, handleDataEventFailure);
  yield takeEvery(DATA_EVENT.SUCCESS, handleDataEventSuccess);
}
