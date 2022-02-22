import { SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";

import { ILogEntryMessage, ILogger, LogLevel, LogManager } from "@aptos-scp/scp-component-logging";
import {
  DI_TYPES as FEATURES_DI_TYPES,
  IStoreItemAdapter
} from "@aptos-scp/scp-component-store-selling-features";
import { DeliveryFrequency } from "@aptos-scp/scp-types-store-items";

import { getSubscriptionFrequencies, GET_SUBSCRIPTION_FREQUENCIES_ACTION } from "../actions";
import { SettingsState } from "../reducers";
import { getAppSettingsState } from "../selectors";


const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.subsccriptionFrequencies");

export function* fetchSubscriptionFrequencies(action: any): IterableIterator<{}> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("fetchSubscriptionFrequencies");
  const { frequencyCodes, limit, offset } = action.payload;
  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer = settings.diContainer;
  const storeItemAdapter: IStoreItemAdapter = diContainer.get(FEATURES_DI_TYPES.IStoreItemAdapter);

  try {
    const deliveryFrequencies: Array<DeliveryFrequency> = yield call(
        [storeItemAdapter, "getDeliveryFrequencies"], frequencyCodes, limit, offset);
    yield put(getSubscriptionFrequencies.success(deliveryFrequencies));
  } catch (err) {
    logger.catching(err, entryMethod, LogLevel.WARN);
    yield put(getSubscriptionFrequencies.failure(err));
  }
  logger.traceExit(entryMethod);
}

export function* watchGetSubscriptionFrequencies(): SagaIterator {
  yield takeEvery(GET_SUBSCRIPTION_FREQUENCIES_ACTION.REQUEST, fetchSubscriptionFrequencies);
}
