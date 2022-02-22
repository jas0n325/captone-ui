import { SagaIterator } from "redux-saga";
import { put, takeEvery } from "redux-saga/effects";

import { ILogEntryMessage, ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import {
  CollectedDataKey,
  FIND_LOYALTY_VOUCHERS_EVENT,
  ILoyaltyVoucher
} from "@aptos-scp/scp-component-store-selling-features";

import {
  businessOperation,
  BUSINESS_OPERATION,
  searchLoyaltyVouchers,
  SEARCH_LOYALTY_VOUCHER
} from "../actions";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.loyalty");

export function* searchLoyaltyRequest(action: any): IterableIterator<{}> {
  const entryMessage: ILogEntryMessage = logger.traceEntry("searchLoyaltyRequest");

  const { deviceIdentity, uiInputs } = action.payload;

  logger.debug(() => `In searchLoyaltyRequest: Calling performBusinessOperation with ${FIND_LOYALTY_VOUCHERS_EVENT} `
  + `and params: ${JSON.stringify(uiInputs)}`);
  yield put(businessOperation.request(deviceIdentity, FIND_LOYALTY_VOUCHERS_EVENT, uiInputs));
  logger.traceExit(entryMessage);
}

export function* businessOperationSuccess(action: any): IterableIterator<{}> {
  if (action.payload.eventType ===  FIND_LOYALTY_VOUCHERS_EVENT &&
      action.payload.nonContextualData && action.payload.nonContextualData.has(CollectedDataKey.ValueCertificates)) {
    const loyalties: ILoyaltyVoucher[] = action.payload.nonContextualData.get(CollectedDataKey.ValueCertificates);
    yield put(searchLoyaltyVouchers.success(loyalties));
  }
}

export function* businessOperationFailure(action: any): IterableIterator<{}> {
  if (action.payload.eventType ===  FIND_LOYALTY_VOUCHERS_EVENT) {
    yield put(searchLoyaltyVouchers.failure(action.payload.error));
  }
}

export function* watchLoyaltySearch(): SagaIterator {
  yield takeEvery(SEARCH_LOYALTY_VOUCHER.REQUEST, searchLoyaltyRequest);
  yield takeEvery(BUSINESS_OPERATION.SUCCESS, businessOperationSuccess);
  yield takeEvery(BUSINESS_OPERATION.FAILURE, businessOperationFailure);
}
