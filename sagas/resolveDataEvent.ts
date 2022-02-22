import { SagaIterator } from "redux-saga";
import { put, select, takeEvery } from "redux-saga/effects";

import { LocalizableMessage } from "@aptos-scp/scp-component-business-core";
import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import {
  IConfigurationManager,
  PosBusinessError,
  UiInput,
  UIINPUT_SOURCE_BARCODE,
  UIINPUT_SOURCE_KEYBOARD
} from "@aptos-scp/scp-component-store-selling-core";
import {
  APPLY_ITEM_EVENT,
  APPLY_TENDER_EVENT,
  ASSIGN_CUSTOMER_EVENT,
  BALANCE_INQUIRY_EVENT,
  DataEntryDiscriminator,
  DI_TYPES as FEATURE_DI_TYPES,
  emailAddressValidator,
  FIND_CUSTOMERS_EVENT,
  IN_MERCHANDISE_TRANSACTION,
  IN_MERCHANDISE_TRANSACTION_WAITING,
  IN_MERCHANDISE_TRANSACTION_WAITING_TO_CLOSE,
  IN_NO_SALE_TRANSACTION,
  IN_TENDER_CONTROL_TRANSACTION,
  IN_TENDER_CONTROL_TRANSACTION_WAITING,
  IN_TENDER_CONTROL_TRANSACTION_WAITING_TO_CLOSE,
  IN_TILL_CONTROL_TRANSACTION,
  NOT_IN_TRANSACTION,
  SEARCH_HISTORICAL_TRANSACTIONS_EVENT,
  SEARCH_POST_VOIDABLE_TRANSACTION_EVENT,
  SSF_ITEM_RETURN_CUST_INFO,
  SSF_MEMBER_NOT_ALLOWED_I18N_CODE,
  TENDER_AUTH_STATUS_EVENT,
  TenderAuthCategory,
  UiInputKey,
  VOID_LINE_EVENT
} from "@aptos-scp/scp-component-store-selling-features";
import {
  IDataEntryOptions
} from "@aptos-scp/scp-component-store-selling-features/lib/domain/model/configuration/IDataEntryRuleConfig";
import { BarcodeEncoding, IAuthorizationResponse } from "@aptos-scp/scp-types-commerce-devices";

import { UI_ERROR_CODE } from "../../config/ErrorCodes";
import {
  businessOperation,
  DATA_EVENT,
  dataEvent,
  DataEventType,
  getOrders,
  getPaidOutTransactions,
  getPrintersFromSearch,
  getSuspendedTransactions,
  getTransactions,
  IDataEventRequestPayload,
  IKeyedData,
  IKeyListenerData,
  IPaginationMetadata,
  IPaymentData,
  IScannerData,
  IUIData,
  productInquiry,
  recordEnteredReturnItem,
  StandardAction,
  userNotification,
  validateCashDrawer
} from "../actions";
import {
  isCustomerRequiredForReturns,
  isTransactionReferenceNumber
} from "../components/common/utilities/configurationUtils";
import {
  BusinessState,
  SettingsState,
  UI_MODE_ASSIGN_MEMBER_TO_TRANSACTION,
  UI_MODE_BALANCE_INQUIRY,
  UI_MODE_CHANGE_PASSWORD,
  UI_MODE_CUSTOMER_SEARCH_SCREEN,
  UI_MODE_GIFTCARD_ISSUE,
  UI_MODE_GIFT_CERTIFICATE_ISSUE,
  UI_MODE_INFORMATION_TERMINAL,
  UI_MODE_ORDER_REFERENCE_INQUIRY,
  UI_MODE_PAID_OPERATION,
  UI_MODE_PRODUCT_INQUIRY,
  UI_MODE_RECEIPT_PRINTER_CHOICE,
  UI_MODE_RETURN_WITH_TRANSACTION,
  UI_MODE_RETURN_WITH_TRANSACTION_TRANSACTION_SEARCH,
  UI_MODE_SEARCH_POST_VOIDABLE_TRANSACTION,
  UI_MODE_SEARCH_SUSPENDED_TRANSACTIONS,
  UI_MODE_STORE_OPERATION,
  UI_MODE_TENDERING,
  UI_MODE_TILL_OPERATION,
  UI_MODE_TRANSACTION_HISTORY,
  UI_MODE_VALUE_CERTIFICATE_SEARCH,
  UI_MODE_WAITING_FOR_INPUT,
  UiState
} from "../reducers/";
import { getAppSettingsState, getBusinessState, getUiState } from "../selectors/";


/*
 * The purpose of this saga is to disambiguate data that has been provided without an explicit action being taken. The
 * disambiguation resolves what action should be taken based on the data provided as well as the context in which it was
 * provided.
 *
 * This should not be used to process data where the action (or UI event type) is known in advance.
 */

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.resolveDataEvent");

const LOCAL_UI_MODE_NORMAL: string = "Normal";
const LOCAL_UI_MODE_TENDERING: string = "Tendering";
const LOCAL_UI_MODE_WAITING_FOR_INPUT: string = "WaitingForInput";
const LOCAL_UI_MODE_PRODUCT_INQUIRY: string = "ProductInquiry";
const LOCAL_UI_MODE_ORDER_REFERENCE_INQUIRY: string = "OrderReferenceInquiry";
const LOCAL_UI_MODE_BALANCE_INQUIRY: string = "BalanceInquiry";
const LOCAL_UI_MODE_TRANSACTION_HISTORY: string = "TransactionHistory";
const LOCAL_UI_MODE_GIFTCARD_ISSUE: string = "GiftCardIssue";
const LOCAL_UI_MODE_GIFT_CERTIFICATE_ISSUE: string = "GiftCertificateIssue";
const LOCAL_UI_MODE_SEARCH_SUSPENDED_TRANSACTIONS: string = "SearchSuspendedTransactions";
const LOCAL_UI_MODE_ASSIGN_MEMBER: string = "AssignMemberToTransaction";
const LOCAL_UI_MODE_SEARCH_POST_VOIDABLE_TRANSACTION: string = "SearchPostVoidableTransactions";
const LOCAL_UI_MODE_TILL_OPERATION = "TillOperation";
const LOCAL_UI_MODE_PAID_OPERATION = "PaidOperation";
const LOCAL_UI_MODE_RECEIPT_PRINTER_CHOICE: string = "ReceiptPrinterChoice";
const LOCAL_UI_MODE_RETURN_WITH_TRANSACTION_TRANSACTION_SEARCH: string = "LocalReturnWithTransactionTransactionSearch";
const LOCAL_UI_MODE_CUSTOMER_SEARCH_SCREEN: string = "CustomerSearchScreen";
const LOCAL_UI_MODE_VALUE_CERTIFICATE_SEARCH_SCREEN: string = "ValueCertificateSearchScreen";

// Note: This should all be configurable, not hard-coded like it is.

// tslint:disable-next-line: cyclomatic-complexity
function determineUiMode(uiState: UiState): string {
  let uiMode: string = "Unrecognized";

  if ((uiState.logicalState === NOT_IN_TRANSACTION) ||
      (uiState.logicalState === IN_MERCHANDISE_TRANSACTION) ||
      (uiState.logicalState === IN_MERCHANDISE_TRANSACTION_WAITING_TO_CLOSE) ||
      (uiState.logicalState === IN_TENDER_CONTROL_TRANSACTION_WAITING) ||
      (uiState.logicalState === IN_TENDER_CONTROL_TRANSACTION_WAITING_TO_CLOSE) ||
      (uiState.logicalState === IN_TENDER_CONTROL_TRANSACTION) ||
      (uiState.logicalState === IN_MERCHANDISE_TRANSACTION_WAITING)) {
    if (uiState.mode === UI_MODE_TENDERING) {
      uiMode = LOCAL_UI_MODE_TENDERING;
    } else if (uiState.mode === UI_MODE_PRODUCT_INQUIRY) {
      uiMode = LOCAL_UI_MODE_PRODUCT_INQUIRY;
    }else if (uiState.mode === UI_MODE_ORDER_REFERENCE_INQUIRY) {
      uiMode = LOCAL_UI_MODE_ORDER_REFERENCE_INQUIRY;
    } else if ( uiState.mode === UI_MODE_BALANCE_INQUIRY) {
      uiMode = LOCAL_UI_MODE_BALANCE_INQUIRY;
    } else if (uiState.mode === UI_MODE_TRANSACTION_HISTORY) {
      uiMode = LOCAL_UI_MODE_TRANSACTION_HISTORY;
    } else if (uiState.mode === UI_MODE_GIFTCARD_ISSUE) {
      uiMode = LOCAL_UI_MODE_GIFTCARD_ISSUE;
    } else if (uiState.mode === UI_MODE_GIFT_CERTIFICATE_ISSUE) {
      uiMode = LOCAL_UI_MODE_GIFT_CERTIFICATE_ISSUE;
    } else if (uiState.mode === UI_MODE_WAITING_FOR_INPUT) {
      uiMode = LOCAL_UI_MODE_WAITING_FOR_INPUT;
    } else if (uiState.mode === UI_MODE_SEARCH_SUSPENDED_TRANSACTIONS) {
      uiMode = LOCAL_UI_MODE_SEARCH_SUSPENDED_TRANSACTIONS;
    } else if (uiState.mode === UI_MODE_ASSIGN_MEMBER_TO_TRANSACTION) {
      uiMode = LOCAL_UI_MODE_ASSIGN_MEMBER;
    } else if (uiState.mode === UI_MODE_TILL_OPERATION) {
      uiMode = LOCAL_UI_MODE_TILL_OPERATION;
    } else if (uiState.mode === UI_MODE_SEARCH_POST_VOIDABLE_TRANSACTION) {
      uiMode = LOCAL_UI_MODE_SEARCH_POST_VOIDABLE_TRANSACTION;
    } else if (uiState.mode === UI_MODE_RECEIPT_PRINTER_CHOICE) {
      uiMode = LOCAL_UI_MODE_RECEIPT_PRINTER_CHOICE;
    } else if (uiState.mode === UI_MODE_RETURN_WITH_TRANSACTION_TRANSACTION_SEARCH) {
      uiMode = LOCAL_UI_MODE_RETURN_WITH_TRANSACTION_TRANSACTION_SEARCH;
    } else if (uiState.mode === UI_MODE_CUSTOMER_SEARCH_SCREEN) {
      uiMode = LOCAL_UI_MODE_CUSTOMER_SEARCH_SCREEN;
    } else if (uiState.mode === UI_MODE_PAID_OPERATION) {
      uiMode = LOCAL_UI_MODE_PAID_OPERATION;
    } else if (uiState.mode === UI_MODE_VALUE_CERTIFICATE_SEARCH) {
      uiMode = LOCAL_UI_MODE_VALUE_CERTIFICATE_SEARCH_SCREEN;
    } else if (uiState.mode !== UI_MODE_CHANGE_PASSWORD &&
          uiState.mode !== UI_MODE_STORE_OPERATION &&
          uiState.mode !== UI_MODE_INFORMATION_TERMINAL
      ) {
      uiMode = LOCAL_UI_MODE_NORMAL;
    }
  } else if (uiState.logicalState === IN_TILL_CONTROL_TRANSACTION || uiState.logicalState === IN_NO_SALE_TRANSACTION) {
    if (uiState.mode === UI_MODE_RECEIPT_PRINTER_CHOICE) {
      uiMode = LOCAL_UI_MODE_RECEIPT_PRINTER_CHOICE;
    }
  }

  return uiMode;
}

function* handleReturnWithTransaction(
  transformedInputs: { eventType: string, inputData: UiInput[] },
  dataEventPayload: IDataEventRequestPayload, isCustomerInTransaction: boolean,
  configurationManager: IConfigurationManager
): IterableIterator<{}> {
  if (isCustomerRequiredForReturns(configurationManager) && !isCustomerInTransaction) {
    yield put(userNotification.request(new LocalizableMessage(SSF_ITEM_RETURN_CUST_INFO)));
    yield put(dataEvent.failure(dataEventPayload, new Error("Customer required to proceed adding return items")));
  } else {
    if (transformedInputs.eventType === APPLY_ITEM_EVENT) {
      yield put(recordEnteredReturnItem.request(
        transformedInputs.inputData.find((input: UiInput) => input.inputKey === "itemKeyType").inputValue,
        transformedInputs.inputData.find((input: UiInput) => input.inputKey === "itemKey").inputValue,
        dataEventPayload
      ));
    }
  }
}

function* handleCustomerSearch(
  dataEventPayload: IDataEventRequestPayload,
  uiInputs: UiInput[],
  settingsState: SettingsState,
  data: string,
  encoding?: BarcodeEncoding
): IterableIterator<{}> {
  const dataEntryDiscriminator: DataEntryDiscriminator =
      yield settingsState.diContainer.get(FEATURE_DI_TYPES.IDataEntryDiscriminator);
  const dataEntryOptions: IDataEntryOptions = encoding ? {encoding} : undefined;
  const transformedInputs = dataEntryDiscriminator.typeAndTransformDataEntry(
    data, UIINPUT_SOURCE_BARCODE, dataEntryOptions);

  if (transformedInputs.eventType === FIND_CUSTOMERS_EVENT) {
    yield put(businessOperation.request(settingsState.deviceIdentity, transformedInputs.eventType,
        transformedInputs.inputData));
  } else {
    if (emailAddressValidator(data)) {
      uiInputs.push(new UiInput("emailAddress", data));
    } else {
      uiInputs.push(new UiInput(UiInputKey.ALTERNATE_KEY, data));
    }
    yield put(businessOperation.request(settingsState.deviceIdentity, FIND_CUSTOMERS_EVENT, uiInputs));
  }

  logger.debug(() => `In searchCustomerRequest: Calling performBusinessOperation with ${FIND_CUSTOMERS_EVENT} `, {
    metaData: new Map<string, any>([["uiInputs", uiInputs]])
  });

  yield put(dataEvent.success(dataEventPayload, true));
}

function determineScanFlag(uiState: UiState): boolean {
  return uiState && uiState.scannerEnabled;
}

function determineUnattendedFlag(businessState: BusinessState): boolean {
  return businessState && businessState.stateValues.get("UserSession.unattended");
}

function customerAddedToTransaction(businessState: BusinessState): boolean {
  return !!(businessState && businessState.stateValues.get("transaction.customer"));
}

function getPaginationMetadata(dataEventPayload: IDataEventRequestPayload): IPaginationMetadata {
  const limit = dataEventPayload.paginationMetadata ? dataEventPayload.paginationMetadata.limit : 20;
  const offset = dataEventPayload.paginationMetadata ? dataEventPayload.paginationMetadata.offset : 0;
  const totalCount = dataEventPayload.paginationMetadata ? dataEventPayload.paginationMetadata.totalCount : 0;

  return {limit, offset, totalCount};
}

// tslint:disable-next-line: cyclomatic-complexity
function* handleScannedData(uiMode: string,
                            dataEventPayload: IDataEventRequestPayload,
                            settingsState: SettingsState,
                            isUnattended: boolean,
                            isCustomerInTransaction: boolean): IterableIterator<{}> {

  const scannerData: IScannerData = dataEventPayload.data as IScannerData;
  const barcodeData: string = scannerData.data;
  const barcodeEncoding: BarcodeEncoding = scannerData.encoding as BarcodeEncoding;
  const scannerId: string = scannerData.deviceId;
  const uiInputs: UiInput[] = [];

  let dataEntryDiscriminator: DataEntryDiscriminator;
  let transformedInputs: {eventType: string, inputData: UiInput[]};

  switch (uiMode) {
    case LOCAL_UI_MODE_NORMAL:
      try {
        dataEntryDiscriminator = yield settingsState.diContainer.get(FEATURE_DI_TYPES.IDataEntryDiscriminator);
        transformedInputs = dataEntryDiscriminator.typeAndTransformDataEntry(
            barcodeData, UIINPUT_SOURCE_BARCODE, {encoding: barcodeEncoding});
        logger.trace(`handleScannedData, uiMode: [${uiMode}] `
            + `transformedInputs: [${JSON.stringify(transformedInputs)}]`);

        transformedInputs.inputData.push(new UiInput("deviceId", scannerId, "string", "scannerDevice"));
        if (isUnattended && transformedInputs.eventType === ASSIGN_CUSTOMER_EVENT) {
          yield put(dataEvent.failure(dataEventPayload,
              new PosBusinessError(new LocalizableMessage(SSF_MEMBER_NOT_ALLOWED_I18N_CODE), "", UI_ERROR_CODE)));
        } else if (transformedInputs.eventType === SEARCH_HISTORICAL_TRANSACTIONS_EVENT) {
          yield put(dataEvent.success(dataEventPayload, false));
        } else {
          const uiState: UiState = yield select(getUiState);

          if (uiState.mode === UI_MODE_RETURN_WITH_TRANSACTION) {
            yield handleReturnWithTransaction(transformedInputs, dataEventPayload, isCustomerInTransaction,
                settingsState.configurationManager);
          } else {
            yield put(businessOperation.request(
              settingsState.deviceIdentity,
              transformedInputs.eventType,
              transformedInputs.inputData
            ));

            yield put(dataEvent.success(dataEventPayload, true));
          }
        }
      } catch (error) {
        logger.warn(`handleScannedData could not identify scanned code. `
            + `uiMode: [${uiMode}], scannerData: [${JSON.stringify(scannerData)}]`);
        yield put(dataEvent.failure(dataEventPayload, new Error(`Unrecognized scancode`)));
      }
      break;
    case LOCAL_UI_MODE_RETURN_WITH_TRANSACTION_TRANSACTION_SEARCH:
      try {
        dataEntryDiscriminator = yield settingsState.diContainer.get(FEATURE_DI_TYPES.IDataEntryDiscriminator);
        transformedInputs = dataEntryDiscriminator.typeAndTransformDataEntry(
            barcodeData, UIINPUT_SOURCE_BARCODE, {encoding: barcodeEncoding});
        logger.trace(`handleScannedData, uiMode: [${uiMode}] transformedInputs: [${JSON.stringify(transformedInputs)}]`);
        if (transformedInputs.eventType !== SEARCH_HISTORICAL_TRANSACTIONS_EVENT) {
          transformedInputs.eventType = SEARCH_HISTORICAL_TRANSACTIONS_EVENT;
          transformedInputs.inputData = [];
          transformedInputs.inputData.push(new UiInput("referenceNumber", "0", "string", UIINPUT_SOURCE_BARCODE));
        }

        yield put(businessOperation.request(
            settingsState.deviceIdentity,
            transformedInputs.eventType,
            transformedInputs.inputData
        ));
        yield put(dataEvent.success(dataEventPayload, true));
      } catch (error) {
        logger.warn(`handleScannedData could not identify scanned code. `
            + `uiMode: [${uiMode}], scannerData: [${JSON.stringify(scannerData)}]`);
        yield put(dataEvent.failure(dataEventPayload, new Error(`Unrecognized scancode`)));
      }
      break;
    case LOCAL_UI_MODE_CUSTOMER_SEARCH_SCREEN:
      yield handleCustomerSearch(dataEventPayload, uiInputs, settingsState, barcodeData, barcodeEncoding);
      break;
    case LOCAL_UI_MODE_VALUE_CERTIFICATE_SEARCH_SCREEN:
      uiInputs.push(new UiInput(UiInputKey.VALUE_CERTIFICATE_NUMBER, barcodeData, "string", UIINPUT_SOURCE_BARCODE));
      uiInputs.push(new UiInput(UiInputKey.TENDER_AUTH_CATEGORY_NAME, TenderAuthCategory.StoredValueCertificateService));
      yield put(businessOperation.request(settingsState.deviceIdentity, APPLY_TENDER_EVENT, uiInputs));
      yield put(dataEvent.success(dataEventPayload, true));
      break;
    case LOCAL_UI_MODE_TRANSACTION_HISTORY:
      yield put(getTransactions.request(scannerData.data, DataEventType.ScanData));
      yield put(dataEvent.success(dataEventPayload, true));
      break;
    case LOCAL_UI_MODE_BALANCE_INQUIRY:
    case LOCAL_UI_MODE_GIFTCARD_ISSUE:
    case LOCAL_UI_MODE_GIFT_CERTIFICATE_ISSUE:
      //Intentionally empty. If the ui mode is gift card issue we want the data available in the component's prop
      break;
    case LOCAL_UI_MODE_TILL_OPERATION:
      yield put(validateCashDrawer.request(barcodeData, DataEventType.ScanData, UIINPUT_SOURCE_BARCODE));
      yield put(dataEvent.success(dataEventPayload, false));
      break;
    case LOCAL_UI_MODE_PAID_OPERATION:
      yield put(getPaidOutTransactions.request(barcodeData, DataEventType.ScanData));
      yield put(dataEvent.success(dataEventPayload, false));
      break;
    case LOCAL_UI_MODE_PRODUCT_INQUIRY:
      const {limit, offset} = getPaginationMetadata(dataEventPayload);
      try {
        dataEntryDiscriminator = yield settingsState.diContainer.get(FEATURE_DI_TYPES.IDataEntryDiscriminator);
        try {
          transformedInputs = dataEntryDiscriminator.typeAndTransformDataEntry(
              barcodeData, UIINPUT_SOURCE_BARCODE, {encoding: barcodeEncoding});
        } catch (error) {
          transformedInputs = {eventType: "", inputData: []};
        }
        logger.trace(`handleScannedData, uiMode: [${uiMode}] `
            + `transformedInputs: [${JSON.stringify(transformedInputs)}]`);

        transformedInputs.inputData.push(new UiInput(UiInputKey.SEARCH_TERM, barcodeData));
        transformedInputs.inputData.push(new UiInput(UiInputKey.API_LIMIT, limit));
        transformedInputs.inputData.push(new UiInput(UiInputKey.API_OFFSET, offset));

        yield put(productInquiry.request(settingsState.deviceIdentity, transformedInputs.inputData));
        yield put(dataEvent.success(dataEventPayload, false));
      } catch (error) {
        logger.warn(`handleScannedData could not identify scanned code. `
            + `uiMode: [${uiMode}], scannerData: [${JSON.stringify(scannerData)}]`);
        yield put(dataEvent.failure(dataEventPayload, new Error(`Unrecognized scancode`)));
      }
      break;
    case LOCAL_UI_MODE_ORDER_REFERENCE_INQUIRY:
      try {
        dataEntryDiscriminator = yield settingsState.diContainer.get(FEATURE_DI_TYPES.IDataEntryDiscriminator);
        try {
          transformedInputs = dataEntryDiscriminator.typeAndTransformDataEntry(
              barcodeData, UIINPUT_SOURCE_BARCODE, {encoding: barcodeEncoding});
        } catch (error) {
          transformedInputs = {eventType: "", inputData: []};
        }
        logger.trace(`handleScannedData, uiMode: [${uiMode}] `
            + `transformedInputs: [${JSON.stringify(transformedInputs)}]`);

        transformedInputs.inputData.push(new UiInput(UiInputKey.ORDER_REFERENCE_ID, barcodeData));

        yield put(getOrders.request(settingsState.deviceIdentity, transformedInputs.inputData));
        yield put(dataEvent.success(dataEventPayload, false));
      } catch (error) {
        logger.warn(`handleScannedData could not identify scanned code. `
            + `uiMode: [${uiMode}], scannerData: [${JSON.stringify(scannerData)}]`);
        yield put(dataEvent.failure(dataEventPayload, new Error(`Unrecognized scancode`)));
      }
      break;
    case LOCAL_UI_MODE_WAITING_FOR_INPUT:
      //Intentionally empty. If the ui mode is waiting we want the data available in the component's props
      break;
    case LOCAL_UI_MODE_ASSIGN_MEMBER:
      try {
        dataEntryDiscriminator = yield settingsState.diContainer.get(FEATURE_DI_TYPES.IDataEntryDiscriminator);
        transformedInputs = dataEntryDiscriminator.typeAndTransformDataEntry(
          barcodeData, UIINPUT_SOURCE_BARCODE, {encoding: barcodeEncoding});
        logger.trace(`handleScannedData, uiMode: [${uiMode}] `
            + `transformedInputs: [${JSON.stringify(transformedInputs)}]`);

        transformedInputs.inputData.push(new UiInput("deviceId", scannerId, "string", "scannerDevice"));
        if (transformedInputs.eventType === ASSIGN_CUSTOMER_EVENT) {
          yield put(businessOperation.request(settingsState.deviceIdentity,
            transformedInputs.eventType, transformedInputs.inputData));
        } else {
          uiInputs.push(new UiInput(UiInputKey.CUSTOMER_NUMBER, scannerData.data));
          yield put(businessOperation.request(settingsState.deviceIdentity,
            ASSIGN_CUSTOMER_EVENT, uiInputs));
        }

        yield put(dataEvent.success(dataEventPayload, true));
      } catch (error) {
        logger.warn(`handleScannedData could not identify scanned code.`
            + `uiMode: [${uiMode}], scannerData: [${JSON.stringify(dataEventPayload)}]`);
        yield put(dataEvent.failure(dataEventPayload, new Error(`Unrecognized scancode`)));
      }
      break;
    case LOCAL_UI_MODE_SEARCH_POST_VOIDABLE_TRANSACTION:
      uiInputs.push(new UiInput(UiInputKey.TRANSACTION_REFERENCE_NUMBER_FIELD, scannerData.data));
      yield put(businessOperation.request(settingsState.deviceIdentity, SEARCH_POST_VOIDABLE_TRANSACTION_EVENT,
          uiInputs));
      yield put(dataEvent.success(dataEventPayload, true));
      break;
    case LOCAL_UI_MODE_SEARCH_SUSPENDED_TRANSACTIONS:
      yield put(getSuspendedTransactions.request(scannerData.data, DataEventType.ScanData));
      yield put(dataEvent.success(dataEventPayload, false));
      break;
    case LOCAL_UI_MODE_RECEIPT_PRINTER_CHOICE:
      yield put(getPrintersFromSearch.request(scannerData.data, true));
      break;
    default:
      yield put(dataEvent.failure(dataEventPayload, new Error("Scanning not allowed")));
      break;
  }
}

function* handlePaymentData(uiMode: string,
                            dataEventPayload: IDataEventRequestPayload,
                            settingsState: SettingsState): IterableIterator<{}> {

  const paymentData: IPaymentData = dataEventPayload.data as IPaymentData;
  const responseData: IAuthorizationResponse = paymentData.data;
  const uiInputs: UiInput[] = [];
  uiInputs.push(new UiInput(UiInputKey.TENDER_AUTH_RESPONSE, responseData));
  yield put(businessOperation.request(settingsState.deviceIdentity, TENDER_AUTH_STATUS_EVENT, uiInputs));
  yield put(dataEvent.success(dataEventPayload, true));
}

// tslint:disable-next-line: cyclomatic-complexity
function* handleKeyedData(uiMode: string,
                          dataEventPayload: IDataEventRequestPayload,
                          settingsState: SettingsState,
                          isCustomerInTransaction: boolean): IterableIterator<{}> {
  const keyedData = dataEventPayload.data as IKeyedData;
  const inputText: string = keyedData.inputText;
  const uiInputs: UiInput[] = [];

  let dataEntryDiscriminator: DataEntryDiscriminator;
  let transformedInputs: {eventType: string, inputData: UiInput[]};

  switch (uiMode) {
    case LOCAL_UI_MODE_NORMAL:
      try {
        dataEntryDiscriminator = yield settingsState.diContainer.get(FEATURE_DI_TYPES.IDataEntryDiscriminator);
        transformedInputs = dataEntryDiscriminator.typeAndTransformDataEntry(inputText, UIINPUT_SOURCE_KEYBOARD);
        logger.trace(`handleKeyedData, uiMode: [${uiMode}] `
            + `transformedInputs: [${JSON.stringify(transformedInputs)}]`);

        const uiState: UiState = yield select(getUiState);

        if (uiState.mode === UI_MODE_RETURN_WITH_TRANSACTION) {
          yield handleReturnWithTransaction(transformedInputs, dataEventPayload, isCustomerInTransaction,
              settingsState.configurationManager);
        } else if (transformedInputs.eventType === SEARCH_HISTORICAL_TRANSACTIONS_EVENT) {
          yield put(dataEvent.success(dataEventPayload, false));
        } else {
          yield put(businessOperation.request(settingsState.deviceIdentity,
              transformedInputs.eventType, transformedInputs.inputData));

          yield put(dataEvent.success(dataEventPayload, true));
        }
      } catch (error) {
        logger.warn(`handleKeyed could not identify key-entered code.`
            + `uiMode: [${uiMode}], keyedData: [${JSON.stringify(dataEventPayload)}]`);
        yield put(dataEvent.failure(dataEventPayload, new Error(`Unrecognized scancode`)));
      }
      break;
    case LOCAL_UI_MODE_RETURN_WITH_TRANSACTION_TRANSACTION_SEARCH:
      try {
        dataEntryDiscriminator = yield settingsState.diContainer.get(FEATURE_DI_TYPES.IDataEntryDiscriminator);
        transformedInputs = dataEntryDiscriminator.typeAndTransformDataEntry(inputText, UIINPUT_SOURCE_KEYBOARD);
        logger.trace(`handleKeyedData, uiMode: [${uiMode}] transformedInputs: [${JSON.stringify(transformedInputs)}]`);
        if (transformedInputs.eventType !== SEARCH_HISTORICAL_TRANSACTIONS_EVENT) {
          transformedInputs.eventType = SEARCH_HISTORICAL_TRANSACTIONS_EVENT;
          transformedInputs.inputData = [];
          transformedInputs.inputData.push(new UiInput("referenceNumber", "0", "string", UIINPUT_SOURCE_BARCODE));
        }

        yield put(businessOperation.request(
            settingsState.deviceIdentity,
            transformedInputs.eventType,
            transformedInputs.inputData
        ));
        yield put(dataEvent.success(dataEventPayload, true));
      } catch (error) {
        logger.warn(`handleKeyed could not identify key-entered code. `
            + `uiMode: [${uiMode}], keyedData: [${JSON.stringify(dataEventPayload)}]`);
        yield put(dataEvent.failure(dataEventPayload, new Error(`Unrecognized scancode`)));
      }
      break;
    case LOCAL_UI_MODE_VALUE_CERTIFICATE_SEARCH_SCREEN:
      uiInputs.push(new UiInput(UiInputKey.VALUE_CERTIFICATE_NUMBER, inputText, "string", UIINPUT_SOURCE_KEYBOARD));
      uiInputs.push(new UiInput(UiInputKey.TENDER_AUTH_CATEGORY_NAME, TenderAuthCategory.StoredValueCertificateService));
      yield put(businessOperation.request(settingsState.deviceIdentity, APPLY_TENDER_EVENT, uiInputs));
      yield put(dataEvent.success(dataEventPayload, true));
      break;
    case LOCAL_UI_MODE_TRANSACTION_HISTORY: {
      // FIXME: Add transactionReference matchingConditions in dataEntryIdentificationAndMapping
      // Update code to use DataEntryDiscriminator class to identify if the provided value is reference number or not
      const isReferenceNumber = isTransactionReferenceNumber(inputText, settingsState.configurationManager);
      const eventType = isReferenceNumber ? DataEventType.ScanData : DataEventType.KeyedData;

      yield put(getTransactions.request(inputText, eventType));
      yield put(dataEvent.success(dataEventPayload, true));
      break;
    }
    case LOCAL_UI_MODE_TENDERING:
      //
      // Input is tender amount for default tender.
      //
      uiInputs.push(new UiInput(UiInputKey.TENDER_AMOUNT, inputText));
      yield put(businessOperation.request(settingsState.deviceIdentity, APPLY_TENDER_EVENT, uiInputs));

      yield put(dataEvent.success(dataEventPayload, true));
      break;
    case LOCAL_UI_MODE_BALANCE_INQUIRY:
    case LOCAL_UI_MODE_GIFTCARD_ISSUE:
    case LOCAL_UI_MODE_GIFT_CERTIFICATE_ISSUE:
      //Intentionally empty. If the ui mode is gift card issue we want the data available in the component
      break;
    case LOCAL_UI_MODE_TILL_OPERATION:
      yield put(validateCashDrawer.request(inputText, DataEventType.KeyedData, UIINPUT_SOURCE_KEYBOARD));
      yield put(dataEvent.success(dataEventPayload, false));
      break;
    case LOCAL_UI_MODE_PAID_OPERATION:
      yield put(getPaidOutTransactions.request(inputText, DataEventType.KeyedData));
      yield put(dataEvent.success(dataEventPayload, false));
      break;
    case LOCAL_UI_MODE_PRODUCT_INQUIRY:
      try {
        const {limit, offset} = getPaginationMetadata(dataEventPayload);
        dataEntryDiscriminator = yield settingsState.diContainer.get(FEATURE_DI_TYPES.IDataEntryDiscriminator);
        try {
          transformedInputs = dataEntryDiscriminator.typeAndTransformDataEntry(inputText, UIINPUT_SOURCE_KEYBOARD);
        } catch (error) {
          transformedInputs = {eventType: "", inputData: []};
        }
        logger.trace(`handleKeyedData, uiMode: [${uiMode}] `
            + `transformedInputs: [${JSON.stringify(transformedInputs)}]`);

        transformedInputs.inputData.push(new UiInput(UiInputKey.SEARCH_TERM, inputText));
        transformedInputs.inputData.push(new UiInput(UiInputKey.API_LIMIT, limit));
        transformedInputs.inputData.push(new UiInput(UiInputKey.API_OFFSET, offset));

        yield put(productInquiry.request(settingsState.deviceIdentity, transformedInputs.inputData));
        yield put(dataEvent.success(dataEventPayload, true));
      } catch (error) {
        logger.warn(`handleKeyed could not identify key-entered code.`
            + `uiMode: [${uiMode}], keyedData: [${JSON.stringify(dataEventPayload)}]`);
        yield put(dataEvent.failure(dataEventPayload, new Error(`Unrecognized scancode`)));
      }
      break;
    case LOCAL_UI_MODE_ASSIGN_MEMBER:
      uiInputs.push(new UiInput(UiInputKey.CUSTOMER_NUMBER, inputText));
      yield put(businessOperation.request(settingsState.deviceIdentity, ASSIGN_CUSTOMER_EVENT, uiInputs));
      yield put(dataEvent.success(dataEventPayload, true));
      break;
    case LOCAL_UI_MODE_SEARCH_POST_VOIDABLE_TRANSACTION: {
      // FIXME: Add transactionReference matchingConditions in dataEntryIdentificationAndMapping
      // Update code to use DataEntryDiscriminator class to identify if the provided value is reference number or not
      const isReferenceNumber = isTransactionReferenceNumber(inputText, settingsState.configurationManager);
      const uiInputType = isReferenceNumber ?
          UiInputKey.TRANSACTION_REFERENCE_NUMBER_FIELD : UiInputKey.TRANSACTION_NUMBER_FIELD;
      uiInputs.push(new UiInput(uiInputType, inputText));
      yield put(businessOperation.request(settingsState.deviceIdentity, SEARCH_POST_VOIDABLE_TRANSACTION_EVENT,
          uiInputs));
      yield put(dataEvent.success(dataEventPayload, true));
      break;
    }
    case LOCAL_UI_MODE_SEARCH_SUSPENDED_TRANSACTIONS: {
      // FIXME: Add transactionReference matchingConditions in dataEntryIdentificationAndMapping
      // Update code to use DataEntryDiscriminator class to identify if the provided value is reference number or not
      const isReferenceNumber = isTransactionReferenceNumber(inputText, settingsState.configurationManager);
      const eventType = isReferenceNumber ? DataEventType.ScanData : DataEventType.KeyedData;
      yield put(getSuspendedTransactions.request(inputText, eventType));
      yield put(dataEvent.success(dataEventPayload, false));
      break;
    }
    case LOCAL_UI_MODE_RECEIPT_PRINTER_CHOICE:
      yield put(getPrintersFromSearch.request(inputText, true));
      break;
    case LOCAL_UI_MODE_WAITING_FOR_INPUT:
      //Intentionally empty. If the ui mode is waiting we want the data available in the component's props
      break;
    default:
      yield put(dataEvent.failure(dataEventPayload, new Error(`Unrecognized input`)));
      break;
  }
}

// FIXME: Remove the handleUIData function and caller: https://jira.aptos.com/browse/DSS-3186
// This is an anti-pattern:  Everything that is needed to be known passed in the dataEvent action payload.  There is
// no value added, here.
function* handleUIData(uiMode: string,
                       dataEventPayload: IDataEventRequestPayload,
                       settingsState: SettingsState): IterableIterator<{}> {

  const uiData: IUIData = dataEventPayload.data as IUIData;
  const eventType: string = uiData.eventType;
  const data: any = uiData.data;

  if (eventType === VOID_LINE_EVENT) {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput("lineNumber", data.lineNumber));
    yield put(businessOperation.request(settingsState.deviceIdentity, eventType, uiInputs));
    yield put(dataEvent.success(dataEventPayload, true));
  } else {
    yield put(dataEvent.failure(dataEventPayload, new Error(`Unrecognized input`)));
  }
}

// tslint:disable-next-line: cyclomatic-complexity
function* handleKeyListenerData(uiMode: string,
                                isScannable: boolean,
                                dataEventPayload: IDataEventRequestPayload,
                                settingsState: SettingsState,
                                isUnattended: boolean,
                                isCustomerInTransaction: boolean): IterableIterator<{}> {

  if (!isScannable) {
    yield put(dataEvent.failure(dataEventPayload, new Error("Scanning not allowed")));
    return;
  }

  const keyedData: IKeyListenerData = dataEventPayload.data as IKeyListenerData;
  const inputText: string = keyedData.inputText;
  const uiInputs: UiInput[] = [];

  let dataEntryDiscriminator: DataEntryDiscriminator;
  let transformedInputs: {eventType: string, inputData: UiInput[]};

  switch (uiMode) {
    case LOCAL_UI_MODE_NORMAL:
      try {
        dataEntryDiscriminator = yield settingsState.diContainer.get(FEATURE_DI_TYPES.IDataEntryDiscriminator);
        transformedInputs = dataEntryDiscriminator.typeAndTransformDataEntry(inputText, UIINPUT_SOURCE_BARCODE);
        logger.trace(`handleKeyListenerData, uiMode: [${uiMode}] `
            + `transformedInputs: [${JSON.stringify(transformedInputs)}]`);

        if (isUnattended && transformedInputs.eventType === ASSIGN_CUSTOMER_EVENT) {
          yield put(dataEvent.failure(dataEventPayload,
              new PosBusinessError(new LocalizableMessage(SSF_MEMBER_NOT_ALLOWED_I18N_CODE), "", UI_ERROR_CODE)));
        } else if (transformedInputs.eventType === SEARCH_HISTORICAL_TRANSACTIONS_EVENT) {
          yield put(dataEvent.success(dataEventPayload, false));
        } else {
          const uiState: UiState = yield select(getUiState);

          if (uiState.mode === UI_MODE_RETURN_WITH_TRANSACTION) {
            yield handleReturnWithTransaction(transformedInputs, dataEventPayload, isCustomerInTransaction,
                settingsState.configurationManager);
          } else {
            yield put(businessOperation.request(
              settingsState.deviceIdentity,
              transformedInputs.eventType, transformedInputs.inputData
            ));
            yield put(dataEvent.success(dataEventPayload, true));
          }
        }
      } catch (error) {
        logger.warn(`handleKeyListenerData could not identify scanned code.`
            + `uiMode: [${uiMode}], keyListenerData: [${JSON.stringify(dataEventPayload)}]`);
        yield put(dataEvent.failure(dataEventPayload, new Error(`Unrecognized scancode`)));
      }
      break;
    case LOCAL_UI_MODE_CUSTOMER_SEARCH_SCREEN:
      yield handleCustomerSearch(dataEventPayload, uiInputs, settingsState, inputText);
      break;
    case LOCAL_UI_MODE_RETURN_WITH_TRANSACTION_TRANSACTION_SEARCH:
      try {
        dataEntryDiscriminator = yield settingsState.diContainer.get(FEATURE_DI_TYPES.IDataEntryDiscriminator);
        transformedInputs = dataEntryDiscriminator.typeAndTransformDataEntry(inputText, UIINPUT_SOURCE_BARCODE);
        logger.trace(`handleKeyListenerData, uiMode: [${uiMode}] transformedInputs: [${JSON.stringify(transformedInputs)}]`);
        if (transformedInputs.eventType !== SEARCH_HISTORICAL_TRANSACTIONS_EVENT) {
          transformedInputs.eventType = SEARCH_HISTORICAL_TRANSACTIONS_EVENT;
          transformedInputs.inputData = [];
          transformedInputs.inputData.push(new UiInput("referenceNumber", "0", "string", UIINPUT_SOURCE_BARCODE));
        }

        yield put(businessOperation.request(
            settingsState.deviceIdentity,
            transformedInputs.eventType,
            transformedInputs.inputData
        ));
        yield put(dataEvent.success(dataEventPayload, true));
      } catch (error) {
        logger.warn(`handleKeyListenerData could not identify scanned code. `
            + `uiMode: [${uiMode}], keyListenerData: [${JSON.stringify(dataEventPayload)}]`);
        yield put(dataEvent.failure(dataEventPayload, new Error(`Unrecognized scancode`)));
      }
      break;
    case LOCAL_UI_MODE_TRANSACTION_HISTORY:
      yield put(getTransactions.request(inputText, DataEventType.ScanData));
      yield put(dataEvent.success(dataEventPayload, false));
      break;
    case LOCAL_UI_MODE_BALANCE_INQUIRY:
      uiInputs.push(new UiInput(UiInputKey.REDEEM_CARD_NUMBER, inputText, "string", UIINPUT_SOURCE_BARCODE));
      yield put(businessOperation.request(settingsState.deviceIdentity, BALANCE_INQUIRY_EVENT, uiInputs));

      yield put(dataEvent.success(dataEventPayload, true));
      break;
    case LOCAL_UI_MODE_BALANCE_INQUIRY:
    case LOCAL_UI_MODE_GIFTCARD_ISSUE:
    case LOCAL_UI_MODE_GIFT_CERTIFICATE_ISSUE:
      //Intentionally empty. If the ui mode is gift card issue we want the data available in the component's prop
      break;
    case LOCAL_UI_MODE_TILL_OPERATION:
      yield put(validateCashDrawer.request(inputText, DataEventType.ScanData, UIINPUT_SOURCE_BARCODE));
      yield put(dataEvent.success(dataEventPayload, false));
      break;
    case LOCAL_UI_MODE_PAID_OPERATION:
      yield put(getPaidOutTransactions.request(inputText, DataEventType.ScanData));
      yield put(dataEvent.success(dataEventPayload, false));
      break;
    case LOCAL_UI_MODE_PRODUCT_INQUIRY:
      try {
        const {limit, offset} = getPaginationMetadata(dataEventPayload);
        dataEntryDiscriminator = yield settingsState.diContainer.get(FEATURE_DI_TYPES.IDataEntryDiscriminator);
        try {
          transformedInputs = dataEntryDiscriminator.typeAndTransformDataEntry(inputText, UIINPUT_SOURCE_BARCODE);
        } catch (error) {
          transformedInputs = {eventType: "", inputData: []};
        }
        logger.trace(`handleKeyListenerData, uiMode: [${uiMode}] `
            + `transformedInputs: [${JSON.stringify(transformedInputs)}]`);

        transformedInputs.inputData.push(new UiInput(UiInputKey.SEARCH_TERM, inputText));
        transformedInputs.inputData.push(new UiInput(UiInputKey.API_LIMIT, limit));
        transformedInputs.inputData.push(new UiInput(UiInputKey.API_OFFSET, offset));

        yield put(productInquiry.request(settingsState.deviceIdentity, transformedInputs.inputData));
        yield put(dataEvent.success(dataEventPayload, true));
      } catch (error) {
        logger.warn(`handleKeyListenerData could not identify scanned code.`
            + `uiMode: [${uiMode}], keyListenerData: [${JSON.stringify(dataEventPayload)}]`);
        yield put(dataEvent.failure(dataEventPayload, new Error(`Unrecognized scancode`)));
      }
      break;
    case LOCAL_UI_MODE_ORDER_REFERENCE_INQUIRY:
      try {
        dataEntryDiscriminator = yield settingsState.diContainer.get(FEATURE_DI_TYPES.IDataEntryDiscriminator);
        try {
          transformedInputs = dataEntryDiscriminator.typeAndTransformDataEntry(inputText, UIINPUT_SOURCE_BARCODE);
        } catch (error) {
          transformedInputs = {eventType: "", inputData: []};
        }
        logger.trace(`handleKeyListenerData, uiMode: [${uiMode}] `
            + `transformedInputs: [${JSON.stringify(transformedInputs)}]`);

        transformedInputs.inputData.push(new UiInput(UiInputKey.ORDER_REFERENCE_ID, inputText));


        yield put(getOrders.request(settingsState.deviceIdentity, transformedInputs.inputData));
        yield put(dataEvent.success(dataEventPayload, true));
      } catch (error) {
        logger.warn(`handleKeyListenerData could not identify scanned code.`
            + `uiMode: [${uiMode}], keyListenerData: [${JSON.stringify(dataEventPayload)}]`);
        yield put(dataEvent.failure(dataEventPayload, new Error(`Unrecognized scancode`)));
      }
      break;

    case LOCAL_UI_MODE_SEARCH_SUSPENDED_TRANSACTIONS:
      yield put(getSuspendedTransactions.request(inputText, DataEventType.ScanData));
      yield put(dataEvent.success(dataEventPayload, false));
      break;
    case LOCAL_UI_MODE_WAITING_FOR_INPUT:
      //Intentionally empty. If the ui mode is not scannable we want the data available in the component's props
      break;
    case LOCAL_UI_MODE_ASSIGN_MEMBER:
      try {
        dataEntryDiscriminator = yield settingsState.diContainer.get(FEATURE_DI_TYPES.IDataEntryDiscriminator);
        transformedInputs = dataEntryDiscriminator.typeAndTransformDataEntry(inputText, UIINPUT_SOURCE_BARCODE);
        logger.trace(`handleKeyListenerData, uiMode: [${uiMode}] `
            + `transformedInputs: [${JSON.stringify(transformedInputs)}]`);

        if (transformedInputs.eventType === ASSIGN_CUSTOMER_EVENT) {
          yield put(businessOperation.request(settingsState.deviceIdentity,
            transformedInputs.eventType, transformedInputs.inputData));
        } else {
          uiInputs.push(new UiInput(UiInputKey.CUSTOMER_NUMBER, inputText));
          yield put(businessOperation.request(settingsState.deviceIdentity,
            ASSIGN_CUSTOMER_EVENT, uiInputs));
        }

        yield put(dataEvent.success(dataEventPayload, true));
      } catch (error) {
        logger.warn(`handleKeyListenerData could not identify scanned code.`
            + `uiMode: [${uiMode}], keyListenerData: [${JSON.stringify(dataEventPayload)}]`);
        yield put(dataEvent.failure(dataEventPayload, new Error(`Unrecognized scancode`)));
      }
      break;
    case LOCAL_UI_MODE_SEARCH_POST_VOIDABLE_TRANSACTION:
      uiInputs.push(new UiInput(UiInputKey.TRANSACTION_REFERENCE_NUMBER_FIELD, inputText));
      yield put(businessOperation.request(settingsState.deviceIdentity, SEARCH_POST_VOIDABLE_TRANSACTION_EVENT,
          uiInputs));
      yield put(dataEvent.success(dataEventPayload, true));
      break;
    case LOCAL_UI_MODE_RECEIPT_PRINTER_CHOICE:
      yield put(getPrintersFromSearch.request(inputText, true));
      break;
    case LOCAL_UI_MODE_VALUE_CERTIFICATE_SEARCH_SCREEN:
      uiInputs.push(new UiInput(UiInputKey.VALUE_CERTIFICATE_NUMBER, inputText, "string", UIINPUT_SOURCE_BARCODE));
      uiInputs.push(new UiInput(UiInputKey.TENDER_AUTH_CATEGORY_NAME, TenderAuthCategory.StoredValueCertificateService));
      yield put(businessOperation.request(settingsState.deviceIdentity, APPLY_TENDER_EVENT, uiInputs));
      yield put(dataEvent.success(dataEventPayload, true));
      break;
    default:
      yield put(dataEvent.failure(dataEventPayload, new Error("Scanning not allowed")));
      break;
  }
}

export function* resolveDataEvent(action: StandardAction): IterableIterator<{}> {
  logger.traceEntry("resolveDataEvent", JSON.stringify(action));
  const dataEventPayload: IDataEventRequestPayload = action.payload;

  const uiState: UiState = yield select(getUiState);
  logger.trace(() => `In resolveDataEvent, uiState: ${JSON.stringify(uiState)}`);

  const settingsState: SettingsState = yield select(getAppSettingsState);
  const businessState: BusinessState = yield select(getBusinessState);

  const uiMode: string = determineUiMode(uiState);
  const isScannable: boolean = determineScanFlag(uiState);
  const isUnattended: boolean = determineUnattendedFlag(businessState);
  const isCustomerinTransaction: boolean = customerAddedToTransaction(businessState);

  switch (dataEventPayload.eventType) {
    case DataEventType.ScanData:
      logger.trace(`In resolveDataEvent, processing ScanData data event`);
      yield handleScannedData(uiMode, dataEventPayload, settingsState, isUnattended, isCustomerinTransaction);
      break;
    case DataEventType.KeyedData:
      logger.trace(`In resolveDataEvent, processing KeyedData data event`);
      yield handleKeyedData(uiMode, dataEventPayload, settingsState, isCustomerinTransaction);
      break;
    case DataEventType.IUIData:
      logger.trace(`In resolveDataEvent, processing IUIData data event`);
      yield handleUIData(uiMode, dataEventPayload, settingsState);
      break;
    case DataEventType.PaymentData:
      logger.trace(`In resolveDataEvent, processing paymentData data event`);
      yield handlePaymentData(uiMode, dataEventPayload, settingsState);
      break;
    case DataEventType.KeyListenerData:
      logger.trace(`In resolveDataEvent, processing KeyListenerData data event`);
      yield handleKeyListenerData(uiMode, isScannable, dataEventPayload, settingsState, isUnattended,
        isCustomerinTransaction);
      break;
    default:
      yield put(dataEvent.failure(dataEventPayload,
          new Error(`Unsupported data event type: ${dataEventPayload.eventType}`)));
  }
}

export function* watchDataEvent(): SagaIterator {
  yield takeEvery(DATA_EVENT.REQUEST, resolveDataEvent);
}
