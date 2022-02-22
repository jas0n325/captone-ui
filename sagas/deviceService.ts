import { Container } from "inversify";
import { SagaIterator } from "redux-saga";
import { select, takeEvery } from "redux-saga/effects";

import { ILogEntryMessage, ILogger, LogLevel, LogManager } from "@aptos-scp/scp-component-logging";
import { TERMINAL_CLOSED } from "@aptos-scp/scp-component-store-selling-features";
import {
  DI_TYPES as DEVICE_DI_TYPES,
  IPaymentDeviceService,
  IScannerDeviceService
} from "@aptos-scp/scp-types-commerce-devices";

import { DEVICE_SERVICE, StandardAction, UPDATE_DEVICE_FIRMWARE } from "../actions";
import {
  DeviceServiceType,
  IDeviceUpdateRequestPayload,
  IPaymentDeviceFirmwareUpdate,
  IScannerUpdate,
  IUpdateDeviceFirmwareRequestPayload
} from "../actions/deviceService";
import {
  BusinessState,
  SettingsState,
  UiState,
  UI_MODE_BALANCE_INQUIRY_TENDER_SELECTION,
  UI_MODE_CHANGE_PASSWORD,
  UI_MODE_DISCOUNT_TYPE_SELECTION,
  UI_MODE_INFORMATION_TERMINAL,
  UI_MODE_ITEM_NOT_FOUND,
  UI_MODE_PRICE_CHANGE,
  UI_MODE_PRODUCT_DETAIL,
  UI_MODE_PRODUCT_SCREEN,
  UI_MODE_QUANTITY_CHANGE,
  UI_MODE_REASON_CODE,
  UI_MODE_SCO_POPUP,
  UI_MODE_STORE_OPERATION,
  UI_MODE_SUBSCRIPTION_TOKEN,
  UI_MODE_TENDERING,
  UI_MODE_THANKYOU_SCREEN,
  UI_MODE_WAITING_TO_CLEAR_TRANSACTION,
  UI_MODE_WAITING_TO_CLOSE
} from "../reducers/";
import { getAppSettingsState, getBusinessState, getUiState } from "../selectors/";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.deviceService");

// FIXME: Scanner should be disabled when it is not supported (ZSPFLD-1031)
function scannerAllowedInCurrentUi(logicalState: string, mode: string): boolean {
  const entryMessage = logger.traceEntry("scannerAllowedInUiMode", arguments);
  let scannerEnabled = false;

  const disabledStates: string[] = [TERMINAL_CLOSED];

  const disabledModes: string[] = [
    UI_MODE_ITEM_NOT_FOUND,
    UI_MODE_TENDERING,
    UI_MODE_WAITING_TO_CLEAR_TRANSACTION,
    UI_MODE_WAITING_TO_CLOSE,
    UI_MODE_DISCOUNT_TYPE_SELECTION,
    UI_MODE_QUANTITY_CHANGE,
    UI_MODE_PRICE_CHANGE,
    UI_MODE_PRODUCT_DETAIL,
    UI_MODE_PRODUCT_SCREEN,
    UI_MODE_REASON_CODE,
    UI_MODE_SCO_POPUP,
    UI_MODE_THANKYOU_SCREEN,
    UI_MODE_CHANGE_PASSWORD,
    UI_MODE_INFORMATION_TERMINAL,
    UI_MODE_STORE_OPERATION,
    UI_MODE_SUBSCRIPTION_TOKEN,
    UI_MODE_BALANCE_INQUIRY_TENDER_SELECTION
  ];

  // if mode is not in disabledModes or disabledStates, allow the scanner.
  if (disabledStates.indexOf(logicalState) === -1 && disabledModes.indexOf(mode) === -1) {
    scannerEnabled = true;
  }

  return logger.traceExit(entryMessage, scannerEnabled);
}

function* handleScannerUpdate(deviceServicePayload: IDeviceUpdateRequestPayload,
                              uiState: UiState, businessState: BusinessState): IterableIterator<{}> {
  const entryMessage: ILogEntryMessage = logger.traceEntry("handleScannerUpdate", deviceServicePayload, uiState,
      businessState);

  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer: Container = settings.diContainer;
  const scannerDeviceService: IScannerDeviceService =
      diContainer.get<IScannerDeviceService>(DEVICE_DI_TYPES.IScannerDeviceService);

  const { enabled, alertSuccess, deviceId }: IScannerUpdate = deviceServicePayload.data;

  // An undefined enabled will enable/disable based on scannerAllowedInUiMode
  if (enabled !== false && !businessState.inProgress && scannerAllowedInCurrentUi(uiState.logicalState, uiState.mode)) {
    uiState.scannerEnabled = true;
    scannerDeviceService.enable().catch((error) => { throw logger.throwing(error, entryMessage, LogLevel.WARN); });
  } else {
    uiState.scannerEnabled = false;
    scannerDeviceService.disable().catch((error) => { throw logger.throwing(error, entryMessage, LogLevel.WARN); });
  }

  if (alertSuccess || alertSuccess === false) {
    scannerDeviceService.alert(alertSuccess, deviceId).catch((error) => {
      throw logger.throwing(error, entryMessage, LogLevel.WARN);
    });
  }

  logger.traceExit(entryMessage);
}

function* handleFirmwareUpdate(deviceServicePayload: IUpdateDeviceFirmwareRequestPayload): IterableIterator<{}> {
  const entryMessage: ILogEntryMessage = logger.traceEntry("handleFirmwareUpdate", deviceServicePayload);

  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer: Container = settings.diContainer;
  const paymentDeviceService: IPaymentDeviceService =
      diContainer.get<IPaymentDeviceService>(DEVICE_DI_TYPES.IPaymentDeviceService);

  const paymentUpdate: IPaymentDeviceFirmwareUpdate = deviceServicePayload.data;

  if (paymentUpdate && paymentUpdate.deviceId) {
    paymentDeviceService.updateDeviceFirmware([paymentUpdate.deviceId]).catch((error) => {
      throw logger.throwing(error, entryMessage, LogLevel.WARN);
    });
  }

  logger.traceExit(entryMessage);
}

export function* resolveDeviceServiceEvent(action: StandardAction): IterableIterator<{}> {
  const entryMessage = logger.traceEntry("resolveDeviceServiceEvent", JSON.stringify(action));
  const deviceServicePayload: IDeviceUpdateRequestPayload = action.payload;

  const uiState: UiState = yield select(getUiState);
  logger.trace(() => `In resolveDeviceServiceEvent, uiState: ${JSON.stringify(uiState)}`);

  const businessState: UiState = yield select(getBusinessState);
  logger.trace(() => `In resolveDeviceServiceEvent, businessState: ${JSON.stringify(businessState)}`);

  if (deviceServicePayload.eventType === DeviceServiceType.ScannerUpdate) {
    logger.trace("In resolveDeviceServiceEvent, processing ScannerUpdate event");
    yield handleScannerUpdate(deviceServicePayload, uiState, businessState);
  } else {
    logger.debug(() => `Unsupported deviceService eventType: ${deviceServicePayload.eventType}`);
  }

  logger.traceExit(entryMessage);
}

export function* resolveFirmwareUpdateEvent(action: StandardAction): IterableIterator<{}> {
  const entryMessage = logger.traceEntry("resolveUpdateFirmwareEvent", JSON.stringify(action));
  const deviceServicePayload: IUpdateDeviceFirmwareRequestPayload = action.payload;

  const uiState: UiState = yield select(getUiState);
  logger.trace(() => `In resolveUpdateFirmwareEvent, uiState: ${JSON.stringify(uiState)}`);

  const businessState: UiState = yield select(getBusinessState);
  logger.trace(() => `In resolveUpdateFirmwareEvent, businessState: ${JSON.stringify(businessState)}`);

  if (deviceServicePayload.eventType === DeviceServiceType.PaymentDeviceFirmwareUpdate) {
    logger.trace("In resolveUpdateFirmwareEvent, processing PaymentUpdate event");
    yield handleFirmwareUpdate(deviceServicePayload);
  } else {
    logger.debug(() => `Unsupported deviceService eventType: ${deviceServicePayload.eventType}`);
  }

  logger.traceExit(entryMessage);
}

export function* watchDeviceServiceEvent(): SagaIterator {
  yield takeEvery(DEVICE_SERVICE.REQUEST, resolveDeviceServiceEvent);
  yield takeEvery(UPDATE_DEVICE_FIRMWARE.REQUEST, resolveFirmwareUpdateEvent);
}
