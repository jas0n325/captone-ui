import { ILogEntryMessage, ILogger, LogLevel, LogManager } from "@aptos-scp/scp-component-logging";
import { DI_TYPES as FEATURES_DI_TYPES, I18nLocationProvider } from "@aptos-scp/scp-component-store-selling-features";
import { Container } from "inversify";
import { SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";
import { loadI18nLocation, LOAD_I18NLOCATION } from "../actions/i18nLocation";
import { SettingsState } from "../reducers";
import { getAppSettingsState } from "../selectors";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.i18nLocation");


async function getI18nLocation(diContainer: Container): Promise<string> {
  try {
    const i18nLocationProvider: I18nLocationProvider = diContainer.get(FEATURES_DI_TYPES.II18nLocationProvider);
    return i18nLocationProvider?.i18nLocation
  } catch (error) {
    logger.error("Error loading i18nLocation", error);
    return;
  }
};

export function* getI18nLocationSettings(action: any): IterableIterator<any> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("getI18nLocationSettings");
  const settingsState: SettingsState = yield select(getAppSettingsState);
  const diContainer: Container = settingsState.diContainer;
  try {
    const i18nLocation: string = yield call(getI18nLocation, diContainer);
    yield put(loadI18nLocation.success(i18nLocation));
  }
  catch (err) {
    logger.catching(err, entryMethod, LogLevel.INFO);
    yield put(loadI18nLocation.failure(err));
  }
  logger.traceExit(entryMethod);
}

export function* watchLoadI18nLocation(): SagaIterator {
  yield takeEvery(LOAD_I18NLOCATION.REQUEST, getI18nLocationSettings);
}