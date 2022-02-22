import { SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";

import { ILogEntryMessage, ILogger, LogLevel, LogManager } from "@aptos-scp/scp-component-logging";
import { DI_TYPES as FEATURES_DI_TYPES, IOrganizationAdapter, IProximitySearch } from "@aptos-scp/scp-component-store-selling-features";

import {
  getProximitySearchAction,
  GET_PROXIMITY_SEARCH_ACTION
} from "../actions";
import { SettingsState } from "../reducers";
import { getAppSettingsState } from "../selectors";


const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.proximitySearch");

export function* fetchProximitySearch(action: any): IterableIterator<{}> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("fetchProximitySearch");
  const settings: SettingsState = yield select(getAppSettingsState);
  const tenant = settings.tenantConfig;
  const diContainer = settings.diContainer;
  const orgApi: IOrganizationAdapter = diContainer.get(FEATURES_DI_TYPES.IOrganizationApi);
  const { proximitySearch } = action.payload;

  try {
    const retailLocations: IProximitySearch[] =
        yield call([orgApi, "findRetailLocationsInProximity"],proximitySearch, tenant.tenantId);
    yield put(getProximitySearchAction.success(
        retailLocations));
  } catch (err) {
    logger.catching(err, entryMethod, LogLevel.WARN);
    yield put(getProximitySearchAction.failure(err));
  }
  logger.traceExit(entryMethod);
}


export function* watchGetRetailLocationsforProximity(): SagaIterator {
  yield takeEvery(GET_PROXIMITY_SEARCH_ACTION.REQUEST, fetchProximitySearch);
}
