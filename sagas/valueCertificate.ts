import { ILogEntryMessage, ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import {
  FIND_VALUE_CERTIFICATES_EVENT
} from "@aptos-scp/scp-component-store-selling-features";
import { put, takeEvery } from "redux-saga/effects";
import { BUSINESS_OPERATION, businessOperation, SEARCH_VALUE_CERTIFICATE, searchValueCertificates } from "../actions";
import { SagaIterator } from "redux-saga";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.valueCertificate");

export function* searchValueCertificatesRequest(action: any): IterableIterator<{}> {
  const entryMessage: ILogEntryMessage = logger.traceEntry("searchValueCertificatesRequest");

  const { deviceIdentity, uiInputs } = action.payload;

  logger.debug(() => `In searchValueCertificatesRequest: Calling performBusinessOperation with ${FIND_VALUE_CERTIFICATES_EVENT} `
      + `and params: ${JSON.stringify(uiInputs)}`);
  yield put(businessOperation.request(deviceIdentity, FIND_VALUE_CERTIFICATES_EVENT, uiInputs));
  logger.traceExit(entryMessage);
}

export function* businessOperationSuccess(action: any): IterableIterator<{}> {
  if (action.payload.eventType ===  FIND_VALUE_CERTIFICATES_EVENT) {
    yield put(searchValueCertificates.success());
  }
}

export function* businessOperationFailure(action: any): IterableIterator<{}> {
  if (action.payload.eventType ===  FIND_VALUE_CERTIFICATES_EVENT) {
    yield put(searchValueCertificates.failure(action.payload.error));
  }
}

export function* watchValueCertificateSearch(): SagaIterator {
  yield takeEvery(SEARCH_VALUE_CERTIFICATE.REQUEST, searchValueCertificatesRequest);
  yield takeEvery(BUSINESS_OPERATION.SUCCESS, businessOperationSuccess);
  yield takeEvery(BUSINESS_OPERATION.FAILURE, businessOperationFailure);
}

