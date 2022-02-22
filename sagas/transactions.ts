import { SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";
import * as uuid from "uuid";

import { ILogEntryMessage, ILogger, LogLevel, LogManager } from "@aptos-scp/scp-component-logging";
import { UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  CollectedDataKey,
  DI_TYPES as FEATURES_DI_TYPES,
  IPostVoidSearchResult,
  IStoreAccountingAdapter,
  ITransactionAdapter,
  ITransactionHistoryAdapter,
  MERCHANDISE_TRANSACTION_TYPE,
  POST_VOID_SEARCH_RESULT,
  SEARCH_HISTORICAL_TRANSACTIONS_EVENT,
  SEARCH_POST_VOIDABLE_TRANSACTION_EVENT
} from "@aptos-scp/scp-component-store-selling-features";
import { ITransactionFields } from "@aptos-scp/scp-component-transaction";
import { IMerchandiseTransaction, MerchandiseTransactionClosingState } from "@aptos-scp/scp-types-commerce-transaction";
import { TransactionWithAdditionalData } from "@aptos-scp/scp-types-ss-transaction-history";

import {
  BUSINESS_OPERATION,
  DataEventType,
  getHistoricalTransaction,
  getHistoricalTransactions,
  getLastTransaction,
  getTodaysTransactions,
  getTransactions,
  GET_HISTORICAL_TRANSACTION_BY_ID_ACTION,
  GET_LAST_TRANSACTION_ACTION,
  GET_PAID_OUT_TRANSACTIONS_ACTION,
  GET_TODAYS_TRANSACTIONS_ACTION,
  GET_TRANSACTIONS_ACTION,
  postVoidableTransactionSearch
} from "../actions";
import { SettingsState } from "../reducers";
import { getAppSettingsState } from "../selectors";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.transactions");
const PAID_OUT_TRANSACTION_TYPE: string = "PaidOut";

export function* fetchPaidOutTransactions(action: any): IterableIterator<{}> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("fetchTransactions");

  const {input, inputType} = action.payload;
  if(!!input && input !== "") {
    const settings: SettingsState = yield select(getAppSettingsState);
    const diContainer = settings.diContainer;

    const transactionFilter: ITransactionFields = {
      retailLocationIdField: settings.deviceIdentity.retailLocationId,
      transactionTypeField: PAID_OUT_TRANSACTION_TYPE,
      closingState: MerchandiseTransactionClosingState.Completed
    };

    if (inputType === DataEventType.ScanData) {
      transactionFilter.referenceNumberField = input;
    } else {
      transactionFilter.transactionNumberField = input;
    }

    const transactionAdapter: ITransactionAdapter = diContainer.get(FEATURES_DI_TYPES.ITransactionAdapter);
    try {
      const transaction = yield call([transactionAdapter, "getTransactions"], transactionFilter);
      yield put(getTransactions.success(transaction));
    } catch (err) {
      logger.catching(err, entryMethod, LogLevel.WARN);
      yield put(getLastTransaction.failure(err));
    }
  }

  logger.traceExit(entryMethod);
}

export function* fetchTodaysTransactions(): IterableIterator<{}> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("fetchTodaysTransactions");
  const settings: SettingsState = yield select(getAppSettingsState);
  const retailLocationId = settings.deviceIdentity.retailLocationId;
  const diContainer = settings.diContainer;
  const transactionAdapter: ITransactionAdapter = diContainer.get(FEATURES_DI_TYPES.ITransactionAdapter);
  const storeAccountingAdapter: IStoreAccountingAdapter = diContainer.get(FEATURES_DI_TYPES.IStoreAccountingAdapter);

  try {
    const businessDayDate = yield call([storeAccountingAdapter, "getBusinessDayDate"]);
    const transactionFilter: ITransactionFields = {
      retailLocationIdField: retailLocationId,
      businessDayDateField: businessDayDate,
      transactionTypeField: MERCHANDISE_TRANSACTION_TYPE,
      limitField: "100",
      closingState: MerchandiseTransactionClosingState.Completed
    };

    const transactions: IMerchandiseTransaction[] =
        yield call([transactionAdapter, "getTransactions"], transactionFilter);
    yield put(getTodaysTransactions.success(transactions.filter((value: IMerchandiseTransaction): boolean =>
        value.transactionType === MERCHANDISE_TRANSACTION_TYPE && !value.postVoided)));
  } catch (err) {
    logger.catching(err, entryMethod, LogLevel.WARN);
    yield put(getTodaysTransactions.failure(err));
  }
  logger.traceExit(entryMethod);
}

export function* fetchLastTransaction(): IterableIterator<{}> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("fetchLastTransaction");
  const settings: SettingsState = yield select(getAppSettingsState);
  const retailLocationId = settings.deviceIdentity.retailLocationId;
  const deviceId = settings.deviceIdentity.deviceId;
  const diContainer = settings.diContainer;
  const transactionAdapter: any = diContainer.get(FEATURES_DI_TYPES.ITransactionAdapter);
  const storeAccountingAdapter: IStoreAccountingAdapter = diContainer.get(FEATURES_DI_TYPES.IStoreAccountingAdapter);

  try {
    const businessDayDate: string = yield call([storeAccountingAdapter, "getBusinessDayDate"]);
    const transaction: IMerchandiseTransaction =
        yield call([transactionAdapter, "getLastTransaction"], retailLocationId, deviceId, businessDayDate);
    if (transaction) {
      yield put(getLastTransaction.success([transaction].filter((value: IMerchandiseTransaction): boolean =>
          !value.postVoided)));
    } else {
      yield put(getLastTransaction.success([]));
    }
  } catch (err) {
    logger.catching(err, entryMethod, LogLevel.WARN);
    yield put(getLastTransaction.failure(err));
  }
  logger.traceExit(entryMethod);
}

export function* fetchTransactions(action: any): IterableIterator<{}> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("fetchTransactions");
  const settings: SettingsState = yield select(getAppSettingsState);
  let transactionFilter: ITransactionFields;
  const diContainer = settings.diContainer;
  const {input, inputType} = action.payload;

  if (inputType === DataEventType.ScanData) {
    transactionFilter = {
      retailLocationIdField: settings.deviceIdentity.retailLocationId,
      referenceNumberField: input,
      transactionTypeField: MERCHANDISE_TRANSACTION_TYPE,
      closingState: MerchandiseTransactionClosingState.Completed
    };
  } else {
    transactionFilter = {
      retailLocationIdField: settings.deviceIdentity.retailLocationId,
      transactionNumberField: input,
      transactionTypeField: MERCHANDISE_TRANSACTION_TYPE,
      closingState: MerchandiseTransactionClosingState.Completed
    };
  }

  const transactionAdapter: ITransactionAdapter = diContainer.get(FEATURES_DI_TYPES.ITransactionAdapter);
  const storeAccountingAdapter: IStoreAccountingAdapter = diContainer.get(FEATURES_DI_TYPES.IStoreAccountingAdapter);
  try {
    const businessDayDate = yield call([storeAccountingAdapter, "getBusinessDayDate"]);
    transactionFilter.businessDayDateField = businessDayDate;
    const transaction = yield call([transactionAdapter, "getTransactions"], transactionFilter);
    yield put(getTransactions.success(transaction));
  } catch (err) {
    logger.catching(err, entryMethod, LogLevel.WARN);
    yield put(getLastTransaction.failure(err));
  }
  logger.traceExit(entryMethod);
}

export function* getHistoricalTransactionByID(action: any): IterableIterator<{}> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("getHistoricalTransactionByID");
  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer = settings.diContainer;
  const {transactionId, preferredLanguage} = action.payload;

  const transactionAdapter: ITransactionHistoryAdapter = diContainer.get(FEATURES_DI_TYPES.ITransactionHistoryAdapter);
  try {
    const transaction = yield call([transactionAdapter, "getHistoricalTransactionById"],
        settings.deviceIdentity.tenantId, transactionId, uuid.v4(), preferredLanguage, [preferredLanguage]);
    yield put(getHistoricalTransaction.success(transaction));
  } catch (err) {
    logger.catching(err, entryMethod, LogLevel.WARN);
    yield put(getHistoricalTransaction.failure(err));
  }
  logger.traceExit(entryMethod);
}

export function* businessOperationRequest(action: any): IterableIterator<{}> {
  if (action.payload.eventType === SEARCH_HISTORICAL_TRANSACTIONS_EVENT) {
    yield put(getHistoricalTransactions.request());
  }
}

export function* businessOperationSuccess(action: any): IterableIterator<{}> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("businessOperationSuccess");
  if (action.payload.eventType === SEARCH_POST_VOIDABLE_TRANSACTION_EVENT &&
      action.payload.nonContextualData && (action.payload.nonContextualData.has(POST_VOID_SEARCH_RESULT)) )  {
    const postVoidSearchResult: IPostVoidSearchResult = action.payload.nonContextualData.get(POST_VOID_SEARCH_RESULT);

    if (postVoidSearchResult.retrievedTransaction) {
      yield put(postVoidableTransactionSearch.success([postVoidSearchResult.retrievedTransaction]));
    } else {
      yield put(postVoidableTransactionSearch.failure(new Error(postVoidSearchResult.failureReason.i18nCode)));
    }
  } else if (action.payload.eventType === SEARCH_HISTORICAL_TRANSACTIONS_EVENT && action.payload.nonContextualData &&
      action.payload.nonContextualData.has(CollectedDataKey.HistoricalTransactions)) {
    const { inputs, nonContextualData } = action.payload;
    const transactions = nonContextualData.get(CollectedDataKey.HistoricalTransactions);
    const uiInput = inputs.find((input: UiInput) => input.inputSource !== undefined);
    const historicalTransactions = transactions && !!transactions.length ?
        transactions.filter((transaction: TransactionWithAdditionalData) => transaction.transaction &&
        transaction.transaction.lines && !!transaction.transaction.lines.length) : transactions;
    yield put(getHistoricalTransactions.success(historicalTransactions, uiInput.inputSource));
  }
  logger.traceExit(entryMethod);
}

export function* businessOperationFailure(action: any): IterableIterator<{}> {
  if (action.payload.eventType === SEARCH_HISTORICAL_TRANSACTIONS_EVENT) {
    yield put(getHistoricalTransactions.failure(action.payload.error));
  }
}

export function* watchGetTodaysTransactions(): SagaIterator {
  yield takeEvery(GET_TODAYS_TRANSACTIONS_ACTION.REQUEST, fetchTodaysTransactions);
}

export function* watchGetTransactions(): SagaIterator {
  yield takeEvery(GET_TRANSACTIONS_ACTION.REQUEST, fetchTransactions);
}

export function* watchLastTransaction(): SagaIterator {
  yield takeEvery(GET_LAST_TRANSACTION_ACTION.REQUEST, fetchLastTransaction);
}

export function* watchGetHistoricalTransactions(): SagaIterator {
  yield takeEvery(BUSINESS_OPERATION.REQUEST, businessOperationRequest);
  yield takeEvery(BUSINESS_OPERATION.FAILURE, businessOperationFailure);
}

export function* watchGetHistoricalTransactionById(): SagaIterator {
  yield takeEvery(GET_HISTORICAL_TRANSACTION_BY_ID_ACTION.REQUEST, getHistoricalTransactionByID);
}

export function* watchPostVoidableTransactionSearch(): SagaIterator {
  yield takeEvery(BUSINESS_OPERATION.SUCCESS, businessOperationSuccess);
}

export function* watchGetPaidOutTransactions(): SagaIterator {
  yield takeEvery(GET_PAID_OUT_TRANSACTIONS_ACTION.REQUEST, fetchPaidOutTransactions);
}
