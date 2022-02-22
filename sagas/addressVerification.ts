import {call, put, select, takeEvery} from "redux-saga/effects";

import {
  DI_TYPES as FEATURES_DI_TYPES,
  IAddressVerificationApi
} from "@aptos-scp/scp-component-store-selling-features";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { loadSearchAddressAction, loadVerifyAddressAction, LOAD_SEARCH_ADDRESS, LOAD_VERIFY_ADDRESS } from "../actions";
import { SettingsState } from "../reducers";
import {getAppSettingsState} from "../selectors";

function* loadSearchAddressResponse(payload: any): IterableIterator<{}> {
  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer = settings.diContainer;
  const addressVerificationAdapter: IAddressVerificationApi = diContainer
      .get(FEATURES_DI_TYPES.IAddressVerificationApi);

  const searchText = encodeURIComponent(payload.payload.searchText);
  const countryCode = encodeURIComponent(payload.payload.countryCode);
  const netInfoState: NetInfoState = yield call(NetInfo.fetch);
  const isConnected = netInfoState.isConnected;
  let searchAddressResponse;
  if (isConnected) {
    searchAddressResponse = yield call([addressVerificationAdapter, "searchAddress"],
        searchText, countryCode);
  }
  try {
    yield put(loadSearchAddressAction.success(searchAddressResponse));
  } catch (error) {
    yield put(loadSearchAddressAction.failure(error));
  }
}

function* loadVerifyAddressResponse(payload: any): IterableIterator<{}> {
  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer = settings.diContainer;
  const addressVerificationAdapter: IAddressVerificationApi = diContainer
      .get(FEATURES_DI_TYPES.IAddressVerificationApi);

  const verifyAddressResponse = yield call([addressVerificationAdapter, "verifyAddress"],
      payload.payload.id, payload.payload.countryCode);

  try {
    yield put(loadVerifyAddressAction.success(verifyAddressResponse));
  } catch (error) {
    yield put(loadVerifyAddressAction.failure(error));
  }
}

export function* watchAddressVerification(): IterableIterator<{}> {
  yield takeEvery(LOAD_SEARCH_ADDRESS.REQUEST, loadSearchAddressResponse);
  yield takeEvery(LOAD_VERIFY_ADDRESS.REQUEST, loadVerifyAddressResponse);
}
