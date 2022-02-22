import { SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";

import { ILogEntryMessage, ILogger, LogLevel, LogManager } from "@aptos-scp/scp-component-logging";
import { DI_TYPES as FEATURES_DI_TYPES, IHoursOfOperation, IOrganizationAdapter } from "@aptos-scp/scp-component-store-selling-features";

import {
  getHoursOfOperationAction,
  GET_HOURS_OF_OPERATION_ACTION
} from "../actions";
import { SettingsState } from "../reducers";
import { getAppSettingsState } from "../selectors";


const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.hoursOfOperation");

export function* getHoursOfOperationById(action: any): IterableIterator<{}> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("getHoursOfOperationById");
  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer = settings.diContainer;
  const orgApi: IOrganizationAdapter = diContainer.get(FEATURES_DI_TYPES.IOrganizationApi);
  const { hoursOfOperationKey } = action.payload;

  try {
    const hoursOfOperation: IHoursOfOperation = yield call([orgApi, "getHoursOfOperationById"],hoursOfOperationKey);
    yield put(getHoursOfOperationAction.success(hoursOfOperation));
  } catch (err) {
    logger.catching(err, entryMethod, LogLevel.WARN);
    yield put(getHoursOfOperationAction.failure(err));
  }
  logger.traceExit(entryMethod);
}

export function* watchHoursOfOperation(): SagaIterator {
  yield takeEvery(GET_HOURS_OF_OPERATION_ACTION.REQUEST, getHoursOfOperationById);
}
