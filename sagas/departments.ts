import { SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";

import { ILogEntryMessage, ILogger, LogLevel, LogManager } from "@aptos-scp/scp-component-logging";
import {
  DI_TYPES as FEATURES_DI_TYPES,
  IDepartment, IDepartmentAdapter
} from "@aptos-scp/scp-component-store-selling-features";

import { getDepartments, GET_DEPARTMENTS_ACTION } from "../actions";
import { SettingsState } from "../reducers";
import { getAppSettingsState } from "../selectors";


const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.Departments");

export function* fetchDepartments(action: any): IterableIterator<{}> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("fetchDepartments");
  const settings: SettingsState = yield select(getAppSettingsState);
  const retailLocationId = settings.deviceIdentity.retailLocationId;
  const diContainer = settings.diContainer;
  const departmentAdapter: IDepartmentAdapter = diContainer.get(FEATURES_DI_TYPES.IDepartmentAdapter);

  try {
    const departments: Array<IDepartment> = yield call([departmentAdapter, "findDepartments"], retailLocationId);
    yield put(getDepartments.success(
        departments.filter((value: any): boolean => value.name !== undefined)));
  } catch (err) {
    logger.catching(err, entryMethod, LogLevel.WARN);
    yield put(getDepartments.failure(err));
  }
  logger.traceExit(entryMethod);
}

export function* watchGetDepartments(): SagaIterator {
  yield takeEvery(GET_DEPARTMENTS_ACTION.REQUEST, fetchDepartments);
}
