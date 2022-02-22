import { Container } from "inversify";
import { SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";

import { ILogger, LogLevel, LogManager } from "@aptos-scp/scp-component-logging";
import { UiInput } from "@aptos-scp/scp-component-store-selling-core";
import { DI_TYPES as FEATURES_DI_TYPES, IAppLocalFeaturesStorage, SYNC_STATE_EVENT } from "@aptos-scp/scp-component-store-selling-features";

import { BUSINESS_OPERATION, getExchangeRatesAction } from "../actions";
import { SettingsState } from "../reducers";
import { getAppSettingsState } from "../selectors";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.exchangerates");

export function* getExchangeRates(diContainer: Container): IterableIterator<{}> {
  const entryMethod = logger.traceEntry("getExchangeRates");

  try {
    const appLocalFeaturesStorage: IAppLocalFeaturesStorage =
        diContainer.get<IAppLocalFeaturesStorage>(FEATURES_DI_TYPES.IAppLocalFeaturesStorage);

    const exchangeRates = yield call([appLocalFeaturesStorage, "loadExchangeRates"]);
    if (exchangeRates) {
      yield put(getExchangeRatesAction.success(exchangeRates))
    }
  } catch (err) {
    logger.catching(err, entryMethod, LogLevel.WARN);
  }

  logger.traceExit(entryMethod);
}

export function* businessOperationSuccess(action: any): IterableIterator<{}> {
  if (action.payload.eventType === SYNC_STATE_EVENT &&
      action.payload.inputs.some((input: UiInput) => input.inputKey === "appStartup")) {
    const settingsState: SettingsState = yield select(getAppSettingsState);
    const diContainer: Container = settingsState.diContainer;

    yield call(getExchangeRates, diContainer);
  }
}

export function* watchExchangeRates(): SagaIterator {
  yield takeEvery(BUSINESS_OPERATION.SUCCESS, businessOperationSuccess);
}
