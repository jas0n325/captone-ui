import { put, takeEvery } from "redux-saga/effects";

import { EMAIL_VERIFICATION_WARNING, emailVerificationWarningAction } from "../actions";


function* emailVerificationWarning(payload: any): IterableIterator<{}> {

  try {
    yield put(emailVerificationWarningAction.success(payload.payload.message));
  } catch (error) {
    yield put(emailVerificationWarningAction.failure(error));

  }
}
export function* watchEmailVerificationWarning(): IterableIterator<{}> {

  yield takeEvery(EMAIL_VERIFICATION_WARNING.REQUEST, emailVerificationWarning);
}
