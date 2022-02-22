import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { Container } from "inversify";
import { SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";
import { APP_ACCESS_LOCK_ACTION, StandardAction, updateAppAccessLock} from "../actions";
import { SettingsState } from "../reducers";
import { AppAccessLockDetails, ClientAccessError } from "../reducers/appAccessLock";
import { getAppSettingsState } from "../selectors";
import DI_TYPES from "../../config/DiTypes";
import { IAppLocalDeviceStorage } from "../../persistence/IAppLocalDeviceStorage";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.appAccessLock");

function* appAccessLockRequest(action: StandardAction): IterableIterator<{}> {
  try {
    const settings: SettingsState = yield select(getAppSettingsState);
    const diContainer: Container = settings.diContainer;
    const appLocalDeviceStorage = diContainer.get<IAppLocalDeviceStorage>(DI_TYPES.IAppLocalDeviceStorage);

    let isAppLocked: boolean;
    yield call(async () => {
      const currentAccessLock = await appLocalDeviceStorage.loadAppAccessLock();
      isAppLocked = currentAccessLock.appLocked ?? false;
    });

    if ((action.payload.authError.message === ClientAccessError.InvalidSecret ||
        action.payload.authError.message === ClientAccessError.InvalidCredentials) && (!isAppLocked)) {

      const clientAccessError = (action.payload.authError.message === ClientAccessError.InvalidSecret) ?
        ClientAccessError.InvalidSecret: ClientAccessError.InvalidCredentials

      const accessLock: AppAccessLockDetails = {
        appLocked: true,
        accessError: clientAccessError
      };

      yield call(async () => {
        await appLocalDeviceStorage.storeAppAccessLock(accessLock);
        logger.info(() => `Local device storage storeAppAccessLock called.  Locked status: ${accessLock.appLocked}`);
      });

      yield put(updateAppAccessLock.success(accessLock.appLocked, true, clientAccessError));
    }
  } catch (error) {
    logger.catching(error, "appAccessLockRequest");
  }
}

export function* watchAppAccessLockRequest(): SagaIterator {
  yield takeEvery(APP_ACCESS_LOCK_ACTION.REQUEST, appAccessLockRequest);
}
