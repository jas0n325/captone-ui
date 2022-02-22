import { EventEmitter, EventSubscription } from "fbemitter";
import { Container } from "inversify";
import { Channel, eventChannel, SagaIterator } from "redux-saga";
import { call, put, select, take, takeEvery } from "redux-saga/effects";

import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { DeviceIdentity, DI_TYPES as CORE_DI_TYPES, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  FISCAL_PRINTER_QUERY_STATUS,
  FISCAL_PRINTER_STATUS_OFFLINE,
  FISCAL_RECEIPT_STATUS_EVENT,
  FISCAL_REPORT_STATUS,
  FISCAL_SYNC_DATE_STATUS,
  FISCAL_SYNC_DATA_STATUS,
  FISCAL_SYNC_DEPT_STATUS,
  FISCAL_SYNC_LOGO_STATUS,
  FISCAL_SYNC_RECEIPT_FOOTER_STATUS,
  FISCAL_SYNC_RECEIPT_HEADER_STATUS,
  FISCAL_SYNC_VAT_STATUS,
  FISCAL_SYNC_ROUNDING_STATUS,
  ReceiptStatus,
  ReceiptType,
  RECEIPT_STATUS_EVENT,
  RECORD_CASH_DRAWER_STATUS_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import {
  EventResponseTypes,
  FiscalRequestType,
  IDeviceStatus,
  IFiscalStatus,
  IPrinterStatus,
  PrinterResult,
  StatusCode
} from "@aptos-scp/scp-types-commerce-devices";

import {
  businessOperation,
  DEVICE_STATUS,
  setSelectedPrinterSerialNumber,
  TERMINAL_SETTINGS_INITIALIZED_ACTION
} from "../actions";
import { isPrinterReadyToSyncData } from "../components/common/utilities";
import { SettingsState } from "../reducers";
import { getAppSettingsState } from "../selectors";


const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.deviceStatusNotification");

function convertPrinterResultToReceiptStatus(code: PrinterResult): ReceiptStatus {
  return code === PrinterResult.SUCCESS ? ReceiptStatus.Sent : ReceiptStatus.Error;
}

function buildPrinterStatusUiInput(params: IPrinterStatus): UiInput[] {
  const uiInputs: UiInput[] = [];
  const { resultCode, printerId } = params;
  if (resultCode) {
    uiInputs.push(new UiInput("printerStatus", convertPrinterResultToReceiptStatus(resultCode)));
  }
  if (printerId) {
    uiInputs.push(new UiInput(UiInputKey.PRINTER, printerId));
    uiInputs.push(new UiInput(UiInputKey.RECEIPT_TYPE, ReceiptType.Print));
  }
  return uiInputs;
}

function convertFiscalResultToReceiptStatus(code: StatusCode, reqType?: string): ReceiptStatus {
  if (reqType !== FiscalRequestType.QueryPrinterStatus) {
    return code === StatusCode.Success ? ReceiptStatus.Sent : ReceiptStatus.Error;
  } else {
    return code === StatusCode.Success ? ReceiptStatus.Success : ReceiptStatus.Error;
  }
}

function buildFiscalStatusUiInput(params: IFiscalStatus): UiInput[] {
  const uiInputs: UiInput[] = [];
  const { statusCode, printerId, fiscalCode, fiscalStatus,
    fiscalYReceiptNumber, fiscalReceiptAmount,
    fiscalReceiptDate, fiscalReceiptTime, zReportNumber,  responseCode, printerSerialNumber, fiscalId } = params;
  if (statusCode) {
    uiInputs.push(new UiInput("printerStatus", convertFiscalResultToReceiptStatus(statusCode)));
  }
  if (printerId) {
    uiInputs.push(new UiInput(UiInputKey.PRINTER, printerId));
    uiInputs.push(new UiInput(UiInputKey.RECEIPT_TYPE, ReceiptType.Print));
  }
  if (fiscalCode) {
    uiInputs.push(new UiInput(UiInputKey.FISCAL_CODE, fiscalCode));
  }
  if (responseCode) {
    uiInputs.push(new UiInput(UiInputKey.RESPONSE_CODE, responseCode));
  }
  if (fiscalStatus) {
    uiInputs.push(new UiInput(UiInputKey.FISCAL_STATUS, fiscalStatus));
  }
  if (fiscalYReceiptNumber) {
    uiInputs.push(new UiInput(UiInputKey.FISCAL_Y_RFECEIPT_NUMBER, fiscalYReceiptNumber));
  }
  if (fiscalReceiptAmount) {
    uiInputs.push(new UiInput(UiInputKey.FISCAL_RFECEIPT_AMOUNT, fiscalReceiptAmount));
  }
  if (fiscalReceiptDate) {
    uiInputs.push(new UiInput(UiInputKey.FISCAL_RFECEIPT_DATE, fiscalReceiptDate));
  }
  if (fiscalReceiptTime) {
    uiInputs.push(new UiInput(UiInputKey.FISCAL_RFECEIPT_TIME, fiscalReceiptTime));
  }
  if (zReportNumber) {
    uiInputs.push(new UiInput(UiInputKey.Z_REPORT_NUMBER, zReportNumber));
  }
  if (printerSerialNumber) {
    uiInputs.push(new UiInput(UiInputKey.PRINTER_SERIAL_NUMBER, printerSerialNumber));
  }
  if (fiscalId) {
    uiInputs.push(new UiInput(UiInputKey.FISCAL_ID, fiscalId));
  }
  return uiInputs;
}

function buildFiscalReportStatusUiInput(params: IFiscalStatus): UiInput[] {
  const uiInputs: UiInput[] = [];
  const { statusCode, printerId, zReportNumber, dailyAmount, reportType,
    printerSerialNumber, fiscalYReceiptNumber, fiscalId } = params;
  if (statusCode) {
    uiInputs.push(new UiInput("printerStatus", convertFiscalResultToReceiptStatus(statusCode)));
  }
  if (printerId) {
    uiInputs.push(new UiInput(UiInputKey.PRINTER, printerId));
    uiInputs.push(new UiInput("zReportNumber", zReportNumber));
    uiInputs.push(new UiInput("dailyAmount", dailyAmount));
    uiInputs.push(new UiInput("reportType", reportType));
  }
  if (printerSerialNumber) {
    uiInputs.push(new UiInput(UiInputKey.PRINTER_SERIAL_NUMBER, printerSerialNumber));
  }
  if (fiscalYReceiptNumber) {
    uiInputs.push(new UiInput(UiInputKey.FISCAL_Y_RFECEIPT_NUMBER, fiscalYReceiptNumber));
  }
  if (fiscalId) {
    uiInputs.push(new UiInput(UiInputKey.FISCAL_ID, fiscalId));
  }
  return uiInputs;
}

function buildFiscalSyncStatusUiInput(params: IFiscalStatus, reqType?: string): UiInput[] {
  const uiInputs: UiInput[] = [];
  const { statusCode, printerId, requestData, syncType, requestType } = params;
  if (statusCode) {
    uiInputs.push(new UiInput("printerStatus", convertFiscalResultToReceiptStatus(statusCode, reqType)));
  }
  if (printerId) {
    uiInputs.push(new UiInput(UiInputKey.PRINTER, printerId));
    uiInputs.push(new UiInput(UiInputKey.REQUEST_DATA, requestData));
    uiInputs.push(new UiInput(UiInputKey.SYNC_TYPE, syncType));
    uiInputs.push(new UiInput(UiInputKey.REQUEST_TYPE, requestType));
  }
  return uiInputs;
}

/**
 * The createPaymentDeviceStatusNotificationListener creates an event channel that listens on the
 * deviceNotificationEmitter,and received Payment Status events.
 * processed.
 *
 * @return {Channel<IDeviceStatus>}
 */
function* createDeviceStatusNotificationListener(diContainer: Container): IterableIterator<{}> {
  return eventChannel((emit: (input: IDeviceStatus) => void): () => void => {
    const deviceNotificationEmitter: EventEmitter = diContainer.get<EventEmitter>(
        CORE_DI_TYPES.DeviceNotificationEmitter);

    const statusListener = (statusNotification: IDeviceStatus): void => {
      // tslint:disable-next-line:max-line-length
      logger.trace(`In event channel device status data listener, received statusNotification ${JSON.stringify(statusNotification)}`);
      emit(statusNotification);
    };

    const eventSubscription: EventSubscription =
        deviceNotificationEmitter.addListener(EventResponseTypes.DeviceStatus, statusListener);

    return () => {
      eventSubscription.remove();
    };
  });
}

export function* startWatchOnDeviceStatusNotifications(): SagaIterator {
  // We need the diContainer to have been initialized in initComponents, before we can register the listener.
  // This coordinates that sequencing.
  yield takeEvery(TERMINAL_SETTINGS_INITIALIZED_ACTION, watchOnDeviceStatusNotifications);
}

let channel: Channel<IDeviceStatus>;

// tslint:disable-next-line: cyclomatic-complexity
function* watchOnDeviceStatusNotifications(): SagaIterator {
  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer: Container = settings.diContainer;
  if (channel) {
    channel.close();
  }
  channel = yield call(createDeviceStatusNotificationListener, diContainer);
  //noinspection InfiniteLoopJS
  while (true) {
    const payload: IDeviceStatus = yield take(channel);
    logger.trace(`In watchOnDeviceStatusNotifications, received payload from channel: ${JSON.stringify(payload)}`);

    if (payload.printerStatus) {
      const settingsState: SettingsState = yield select(getAppSettingsState);
      const deviceIdentity: DeviceIdentity = settingsState.deviceIdentity;
      const uiInputs: UiInput[] = buildPrinterStatusUiInput(payload.printerStatus);
      yield put(businessOperation.request(deviceIdentity, RECEIPT_STATUS_EVENT, uiInputs));
    } else if (payload.cashDrawerStatus) {
      const settingsState: SettingsState = yield select(getAppSettingsState);
      const deviceIdentity: DeviceIdentity = settingsState.deviceIdentity;
      const uiInputs: UiInput[] = [
        new UiInput(UiInputKey.CASH_DRAWER_STATUS, payload.cashDrawerStatus)
      ];
      yield put(businessOperation.request(deviceIdentity, RECORD_CASH_DRAWER_STATUS_EVENT, uiInputs));
    } else if (payload.fiscalStatus && payload.fiscalStatus.requestType === FiscalRequestType.SendData) {
      const settingsState: SettingsState = yield select(getAppSettingsState);
      const deviceIdentity: DeviceIdentity = settingsState.deviceIdentity;
      const uiInputs: UiInput[] = buildFiscalStatusUiInput(payload.fiscalStatus);
      yield put(setSelectedPrinterSerialNumber.request(payload.fiscalStatus.printerSerialNumber));
      yield put(businessOperation.request(deviceIdentity, FISCAL_RECEIPT_STATUS_EVENT, uiInputs));
    } else if (payload.fiscalStatus && payload.fiscalStatus.requestType === FiscalRequestType.Report) {
      const uiInputs: UiInput[] = buildFiscalReportStatusUiInput(payload.fiscalStatus);
      const settingsState: SettingsState = yield select(getAppSettingsState);
      const deviceIdentity: DeviceIdentity = settingsState.deviceIdentity;
      yield put(businessOperation.request(deviceIdentity, FISCAL_REPORT_STATUS, uiInputs));
    } else if (payload.fiscalStatus && payload.fiscalStatus.requestType === FiscalRequestType.SyncVatIndex) {
      const uiInputs: UiInput[] = buildFiscalSyncStatusUiInput(payload.fiscalStatus);
      const settingsState: SettingsState = yield select(getAppSettingsState);
      const deviceIdentity: DeviceIdentity = settingsState.deviceIdentity;
      yield put(businessOperation.request(deviceIdentity, FISCAL_SYNC_VAT_STATUS, uiInputs));
    } else if (payload.fiscalStatus && payload.fiscalStatus.requestType === FiscalRequestType.SyncRoundingStatus) {
      const uiInputs: UiInput[] = buildFiscalSyncStatusUiInput(payload.fiscalStatus);
      const settingsState: SettingsState = yield select(getAppSettingsState);
      const deviceIdentity: DeviceIdentity = settingsState.deviceIdentity;
      yield put(businessOperation.request(deviceIdentity, FISCAL_SYNC_ROUNDING_STATUS, uiInputs));
    } else if (payload.fiscalStatus && payload.fiscalStatus.requestType === FiscalRequestType.SyncDepartmentTax) {
      const uiInputs: UiInput[] = buildFiscalSyncStatusUiInput(payload.fiscalStatus);
      const settingsState: SettingsState = yield select(getAppSettingsState);
      const deviceIdentity: DeviceIdentity = settingsState.deviceIdentity;
      yield put(businessOperation.request(deviceIdentity, FISCAL_SYNC_DEPT_STATUS, uiInputs));
    } else if (payload.fiscalStatus && payload.fiscalStatus.requestType === FiscalRequestType.SyncLogo) {
      const uiInputs: UiInput[] = buildFiscalSyncStatusUiInput(payload.fiscalStatus);
      const settingsState: SettingsState = yield select(getAppSettingsState);
      const deviceIdentity: DeviceIdentity = settingsState.deviceIdentity;
      yield put(businessOperation.request(deviceIdentity, FISCAL_SYNC_LOGO_STATUS, uiInputs));
    } else if (payload.fiscalStatus && payload.fiscalStatus.requestType === FiscalRequestType.SyncReceiptHeader) {
      const uiInputs: UiInput[] = buildFiscalSyncStatusUiInput(payload.fiscalStatus);
      const settingsState: SettingsState = yield select(getAppSettingsState);
      const deviceIdentity: DeviceIdentity = settingsState.deviceIdentity;
      yield put(businessOperation.request(deviceIdentity, FISCAL_SYNC_RECEIPT_HEADER_STATUS, uiInputs));
    } else if (payload.fiscalStatus && payload.fiscalStatus.requestType === FiscalRequestType.SyncReceiptFooter) {
      const uiInputs: UiInput[] = buildFiscalSyncStatusUiInput(payload.fiscalStatus);
      const settingsState: SettingsState = yield select(getAppSettingsState);
      const deviceIdentity: DeviceIdentity = settingsState.deviceIdentity;
      yield put(businessOperation.request(deviceIdentity, FISCAL_SYNC_RECEIPT_FOOTER_STATUS, uiInputs));
    } else if (payload.fiscalStatus && payload.fiscalStatus.requestType === FiscalRequestType.SyncDate) {
      const uiInputs: UiInput[] = buildFiscalSyncStatusUiInput(payload.fiscalStatus);
      const settingsState: SettingsState = yield select(getAppSettingsState);
      const deviceIdentity: DeviceIdentity = settingsState.deviceIdentity;
      yield put(businessOperation.request(deviceIdentity, FISCAL_SYNC_DATE_STATUS, uiInputs));
    } else if (payload.fiscalStatus && payload.fiscalStatus.requestType === FiscalRequestType.SyncFiscalData) {
      const uiInputs: UiInput[] = buildFiscalSyncStatusUiInput(payload.fiscalStatus);
      const settingsState: SettingsState = yield select(getAppSettingsState);
      const deviceIdentity: DeviceIdentity = settingsState.deviceIdentity;
      yield put(businessOperation.request(deviceIdentity, FISCAL_SYNC_DATA_STATUS, uiInputs));
    } else if (payload.fiscalStatus && payload.fiscalStatus.requestType === FiscalRequestType.QueryPrinterStatus) {
      const settingsState: SettingsState = yield select(getAppSettingsState);
      const deviceIdentity: DeviceIdentity = settingsState.deviceIdentity;
      const uiInputs: UiInput[] = buildFiscalSyncStatusUiInput(payload.fiscalStatus,
         FiscalRequestType.QueryPrinterStatus);
      if (isPrinterReadyToSyncData( payload.fiscalStatus)) {
        yield put(businessOperation.request(deviceIdentity, FISCAL_PRINTER_QUERY_STATUS, uiInputs));
      } else {
          yield put(businessOperation.request(deviceIdentity, FISCAL_PRINTER_STATUS_OFFLINE, uiInputs));
      }

    }
    yield put({ type: DEVICE_STATUS, payload });
  }
}

