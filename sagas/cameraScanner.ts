import { EventEmitter } from "fbemitter";
import { Container } from "inversify";
import { SagaIterator } from "redux-saga";
import { put, select, takeEvery } from "redux-saga/effects";

import { ILogEntryMessage, ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { DI_TYPES as CORE_DI_TYPES } from "@aptos-scp/scp-component-store-selling-core";

import { BUSINESS_OPERATION, CAMERA_SCANNER, displayErrorScanner, StandardAction } from "../actions";
import { printAmount } from "../components/common/utilities";
import { navigate } from "../components/RootNavigation";
import { SettingsState } from "../reducers";
import { getAppSettingsState } from "../selectors";
import Theme from "../styles";
import { CameraScannerScreenWrapperProps } from "../components/camera/interfaces";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.cashDrawers");

function* clearCameraError(action: StandardAction): IterableIterator<{}> {
  yield put(displayErrorScanner.success());
}

function* handleShowCameraScanner(action: StandardAction): IterableIterator<{}> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("handleStorageOfCashDrawer");

  if (action.payload) {

    const settings: SettingsState = yield select(getAppSettingsState);
    const diContainer: Container = settings && settings.diContainer;

    const cameraScannerScreenProps: CameraScannerScreenWrapperProps = {
      emitter: diContainer.get<EventEmitter>(CORE_DI_TYPES.DeviceNotificationEmitter),
      header: action.payload.header,
      goodIcon: action.payload.goodIcon,
      badIcon: action.payload.badIcon,
      popScreen: action.payload.handleHideCamera.bind(this),
      theme: Theme,
      consecutiveScanningEnabled: action.payload.consecutiveScanningEnabled,
      consecutiveScanningDelay: action.payload.delay,
      t: (key: string) =>  action.payload.translator(key),
      displayableAmount: printAmount
    };
    navigate("scan", cameraScannerScreenProps, false);
  } else {
    logger.debug(`Invalid action payload : ${action.payload}`);
  }
  logger.traceExit(entryMethod);
}

export function* watchShowCameraScanner(): SagaIterator {
  yield takeEvery(CAMERA_SCANNER.REQUEST, handleShowCameraScanner);
  yield takeEvery(BUSINESS_OPERATION.REQUEST, clearCameraError);
}
