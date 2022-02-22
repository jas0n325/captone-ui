import {call, put, select, takeEvery} from "redux-saga/effects";

import {
  DI_TYPES as FEATURES_DI_TYPES,
  IResourceRepository
} from "@aptos-scp/scp-component-store-selling-features";

import {DI_TYPES} from "../../config/DiTypes";
import {IAppLocalDeviceStorage} from "../../persistence/IAppLocalDeviceStorage";
import {loadAppResource, LOAD_APP_RESOURCE} from "../actions";
import { SettingsState } from "../reducers";
import {getAppSettingsState} from "../selectors";

function* loadAppResourceRequest(payload: any): IterableIterator<{}> {
  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer = settings.diContainer;
  try {
    const appLocalDeviceStorage: IAppLocalDeviceStorage =
        diContainer.get<IAppLocalDeviceStorage>(DI_TYPES.IAppLocalDeviceStorage);

    const resourceName = payload.payload.resourceName;
    const resourceType = payload.payload.isTablet ? "Medium" : "Small";
    const retailLocationId = settings.deviceIdentity.retailLocationId;
    let resource = yield call([appLocalDeviceStorage, "loadAppResource"], resourceName);
    if (!resource) {
      const resourceRepository: IResourceRepository = diContainer
          .get(FEATURES_DI_TYPES.IResourceRepository);
      resource = yield call([resourceRepository, "fetchAppResourcesImageFile"], resourceName, resourceType,
          retailLocationId);
      if (resource) {
        yield call([appLocalDeviceStorage, "storeAppResource"], resourceName, resource);
      }
    }

    yield put(loadAppResource.success(resourceName, resource));
  } catch (error) {
    yield put(loadAppResource.failure(error));
  }
}

export function* watchAppResouces(): IterableIterator<{}> {
  yield takeEvery(LOAD_APP_RESOURCE.REQUEST, loadAppResourceRequest);
}
