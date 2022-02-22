import { ILogEntryMessage, ILogger, LogLevel, LogManager } from "@aptos-scp/scp-component-logging";
import { DI_TYPES as FEATURES_DI_TYPES, IAppLocalFeaturesStorage, ICustomerAttributeOptions } from "@aptos-scp/scp-component-store-selling-features";
import { Container } from "inversify";
import { SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";
import { loadCountries, LOAD_COUNTRIES } from "../actions";
import { compareRenderSelectOptions, RenderSelectOptions } from "../components/common/FieldValidation";
import { SettingsState } from "../reducers";
import { getAppSettingsState } from "../selectors";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.countries");


async function getCountries(diContainer: Container): Promise<RenderSelectOptions[]> {
  try {
    const appLocalFeatureStorage: IAppLocalFeaturesStorage =
      diContainer.get<IAppLocalFeaturesStorage>(FEATURES_DI_TYPES.IAppLocalFeaturesStorage);

    const countries: ICustomerAttributeOptions[] = await appLocalFeatureStorage.loadCustomerCountries();

    return countries
      .map((country: any): RenderSelectOptions => {
        return {
          code: country.code,
          description: country.description
        };
      })
      .sort((reason1: any, reason2: any): number => {
        return compareRenderSelectOptions(reason1, reason2);
      });
  } catch (error) {
    logger.error("Error loading countries", error);
    return [];
  }
};

export function* getCountrySettings(action: any): IterableIterator<any> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("getCountrySettings");
  const settingsState: SettingsState = yield select(getAppSettingsState);
  const diContainer: Container = settingsState.diContainer;
  try {
    const countries: RenderSelectOptions[] = yield call(getCountries, diContainer);
    yield put(loadCountries.success(countries));
  }
  catch (err) {
    logger.catching(err, entryMethod, LogLevel.INFO);
    yield put(loadCountries.failure(err));
  }
  logger.traceExit(entryMethod);
}

export function* watchLoadCountries(): SagaIterator {
  yield takeEvery(LOAD_COUNTRIES.REQUEST, getCountrySettings);
}