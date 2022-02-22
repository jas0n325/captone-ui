import { SagaIterator } from "redux-saga";
import { put, takeEvery } from "redux-saga/effects";

import { UPDATE_PENDING_PAYMENT } from "../actions";

export function* onPendingPayment(action: any): IterableIterator<{}> {
  yield put({ type: UPDATE_PENDING_PAYMENT.SUCCESS, payload: action.payload });
}

export function* watchOnPendingPayment(): SagaIterator {
  yield takeEvery(UPDATE_PENDING_PAYMENT.REQUEST, onPendingPayment);
}
