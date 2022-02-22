import { SagaIterator } from "redux-saga";
import { put, takeEvery } from "redux-saga/effects";

import { destroyModal, DISMISS_ALERT_MODAL, hideModal, SHOW_ALERT_MODAL, showModal, StandardAction } from "../actions";
import { ALERT_MODAL } from "../components/common/AlertModal";


function* handleShowAlertModalRequest(action: StandardAction): IterableIterator<{}> {
  yield put(showModal(ALERT_MODAL, {
    cancellable: action.payload.alertModalOptions && action.payload.alertModalOptions.cancellable || false
  }));
}

function* handleDismissAlertModalRequest(): IterableIterator<{}> {
  yield put(hideModal(ALERT_MODAL));
  yield put(destroyModal(ALERT_MODAL));
}

export function* watchShowAlertModalRequest(): SagaIterator {
  yield takeEvery(SHOW_ALERT_MODAL.REQUEST, handleShowAlertModalRequest);
}

export function* watchDismissAlertModalRequest(): SagaIterator {
  yield takeEvery(DISMISS_ALERT_MODAL.REQUEST, handleDismissAlertModalRequest);
}
