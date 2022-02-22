import { SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";

import { ILogEntryMessage, ILogger, LogLevel, LogManager } from "@aptos-scp/scp-component-logging";
import { DI_TYPES as FEATURES_DI_TYPES, IOrganizationAdapter, IRetailLocationAbbreviated } from "@aptos-scp/scp-component-store-selling-features";

import {
  getRetailLocationAction,
  getRetailLocationsAction,
  GET_RETAIL_LOCATIONS_ACTION,
  GET_RETAIL_LOCATION_ACTION
} from "../actions";
import { SettingsState } from "../reducers";
import { getAppSettingsState } from "../selectors";


const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.retailLocations");

export function* fetchRetailLocations(action: any): IterableIterator<{}> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("fetchRetailLocations");
  const settings: SettingsState = yield select(getAppSettingsState);
  const tenant = settings.tenantConfig;
  const diContainer = settings.diContainer;
  const orgApi: IOrganizationAdapter = diContainer.get(FEATURES_DI_TYPES.IOrganizationApi);

  try {
    const retailLocations: IRetailLocationAbbreviated[] =
        yield call([orgApi, "findRetailLocations"], tenant.tenantId);
    yield put(getRetailLocationsAction.success(
        retailLocations.filter((value: any): boolean => value.name !== undefined )));
  } catch (err) {
    logger.catching(err, entryMethod, LogLevel.WARN);
    yield put(getRetailLocationsAction.failure(err));
  }
  logger.traceExit(entryMethod);
}

export function* fetchRetailLocation(action: any): IterableIterator<{}> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("fetchRetailLocation");
  const settings: SettingsState = yield select(getAppSettingsState);
  const deviceIdentity = settings.deviceIdentity;
  const diContainer = settings.diContainer;
  const orgAdapter: IOrganizationAdapter = diContainer.get(FEATURES_DI_TYPES.IOrganizationAdapter);

  try {
    const retailLocation = yield call([orgAdapter, "retrieveRetailLocation"], deviceIdentity);
    yield put(getRetailLocationAction.success(retailLocation));
  } catch (err) {
    logger.catching(err, entryMethod, LogLevel.WARN);
    yield put(getRetailLocationAction.failure(err));
  }
  logger.traceExit(entryMethod);
}

export function* watchGetRetailLocations(): SagaIterator {
  yield takeEvery(GET_RETAIL_LOCATIONS_ACTION.REQUEST, fetchRetailLocations);
}

export function* watchGetRetailLocation(): SagaIterator {
  yield takeEvery(GET_RETAIL_LOCATION_ACTION.REQUEST, fetchRetailLocation);
}
