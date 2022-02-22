import { isEqual } from "lodash";
import { SagaIterator } from "redux-saga";
import { put, select, takeEvery } from "redux-saga/effects";

import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import { DI_TYPES, II18nLocationProvider, NOT_IN_TRANSACTION } from "@aptos-scp/scp-component-store-selling-features";

import { UPDATE_UI_MODE, UPDATE_UI_STATE, updateEnabledFeatureActionButtons } from "../actions";
import { deviceService, DeviceServiceType } from "../actions/deviceService";
import { getFeatureActionButtonProps, IFeatureActionButtonProps } from "../components/common/utilities";
import { BusinessState, SettingsState, UiState } from "../reducers";
import { getAppSettingsState, getBusinessState, getUiState } from "../selectors";


function* updateUiStateEvents(action: any): IterableIterator<{}> {
  const settings: SettingsState = yield select(getAppSettingsState);
  const configManager: IConfigurationManager = settings.configurationManager;
  const i18nLocationProvider = settings.diContainer.get<II18nLocationProvider>(DI_TYPES.II18nLocationProvider);

  const uiState: UiState = yield select(getUiState);
  const businessState: BusinessState = yield select(getBusinessState);

  const newFeatureActionButtonProps: IFeatureActionButtonProps = getFeatureActionButtonProps(
    configManager,
    (eventType: string) => uiState.isAllowed(eventType), //Wrapping function required to ensure proper context of "this"
    uiState.logicalState !== NOT_IN_TRANSACTION &&
        businessState && businessState.stateValues && businessState.stateValues.get("ItemHandlingSession.isReturning"),
    i18nLocationProvider.i18nLocation
  );

  if (!isEqual(newFeatureActionButtonProps, uiState.featureActionButtonProps)) {
    yield put(updateEnabledFeatureActionButtons.request(newFeatureActionButtonProps));
  }
}

export function* updateUiStateDeviceService(action: any): IterableIterator<{}> {
  yield put(deviceService.request(DeviceServiceType.ScannerUpdate, {}));
}

export function* watchUpdateUiStateEvents(): SagaIterator {
  yield takeEvery(UPDATE_UI_STATE.REQUEST, updateUiStateEvents);
}

export function* watchUpdateUiState(): SagaIterator {
  yield takeEvery([UPDATE_UI_MODE.REQUEST, UPDATE_UI_STATE.REQUEST], updateUiStateDeviceService);
}
