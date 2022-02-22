import * as _ from "lodash";
import {SagaIterator} from "redux-saga";
import {call, put, select, takeEvery} from "redux-saga/effects";

import { ILogEntryMessage, ILogger, LogLevel, LogManager } from "@aptos-scp/scp-component-logging";
import {
  DI_TYPES as FEATURES_DI_TYPES,
  IStoreAccountingAdapter,
  ISuspendedTransactionAdapter,
  ISuspendedTransactionSearch
} from "@aptos-scp/scp-component-store-selling-features";

import {DataEventType, getSuspendedTransactions, GET_SUSPENDED_TRANSACTIONS_ACTION, StandardAction} from "../actions";
import { SettingsState } from "../reducers";
import { getAppSettingsState } from "../selectors";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.suspendedTransactions");

export function* fetchSuspendedTransactions(action: StandardAction): IterableIterator<{}> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("fetchSuspendedTransactions");
  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer = settings.diContainer;
  const { input, inputType } = action.payload;
  const storeAccountingAdapter: IStoreAccountingAdapter = diContainer.get(FEATURES_DI_TYPES.IStoreAccountingAdapter);
  const suspendedTransactionAdapter: ISuspendedTransactionAdapter =
      diContainer.get(FEATURES_DI_TYPES.ISuspendedTransactionAdapter);
  try {
    const businessDate = yield call([storeAccountingAdapter, "getBusinessDayDate"]);
    const transactions
        = yield call([suspendedTransactionAdapter, "find"]
        , settings.deviceIdentity.retailLocationIdentity
        , buildTransactionFilter(input, inputType, businessDate));
    yield put(getSuspendedTransactions.success(transactions));
  } catch (err) {
    logger.catching(err, entryMethod, LogLevel.WARN);
    yield put(getSuspendedTransactions.failure(err));
  }
  logger.traceExit(entryMethod);
}

export function* watchGetSuspendedTransactions(): SagaIterator {
  yield takeEvery(GET_SUSPENDED_TRANSACTIONS_ACTION.REQUEST, fetchSuspendedTransactions);
}

/*
It is called through manual entry, either by entering Transaction Number or
Reference Id (The Resume token given while suspending the Transaction).
*/
function keyboardDataEventForTxNumber(input: string): number {
  let trnNum: number = undefined;
  if (!isNaN(Number(input))) {
    trnNum = Number.parseInt(input, 10);
  }
  return trnNum;
}

/*
It filters the suspended transactions list based on the search input.
The search input contains search for TransactionNumber or
ReferenceId(The Resume token given while suspending the Transaction)
entered via Search TextBox (Keyed In)
or ReferenceNumber(It is called through Scanned Camera, it picks up the
Reference Number from the
Payment Receipt obtained while suspending the Transaction.)
*/
function buildTransactionFilter(input: string,
                                inputType: DataEventType,
                                businessDate: string): ISuspendedTransactionSearch {
  const filter: ISuspendedTransactionSearch = {};
  filter.businessDate = businessDate;
  if (!_.isEmpty(input)) {
    if (inputType === DataEventType.ScanData) {
      filter.referenceNumber = input;
    } else if (inputType === DataEventType.KeyedData) {
      const trxNumber = keyboardDataEventForTxNumber(input);
      if (trxNumber) {
        filter.transactionNumber = trxNumber;
        filter.resumeToken = trxNumber.toString();
      } else {
        filter.resumeToken = input;
      }
    }
  }
  return filter;
}
