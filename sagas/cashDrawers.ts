import { Container } from "inversify";
import { isEmpty } from "lodash";
import { SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";

import { ILogEntryMessage, ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import {
  DI_TYPES as FEATURE_DI_TYPES,
  ICashDrawer,
  ICashDrawerDetail,
  ICashDrawerResponse,
  IStoreAccountingAdapter
} from "@aptos-scp/scp-component-store-selling-features";

import { DI_TYPES } from "../../config";
import { IAppLocalDeviceStorage } from "../../persistence/IAppLocalDeviceStorage";
import {
  DataEventType,
  getCashDrawers,
  GET_CASH_DRAWERS,
  StandardAction,
  validateCashDrawer,
  VALIDATE_CASH_DRAWER
} from "../actions";
import { SettingsState } from "../reducers";
import { getAppSettingsState } from "../selectors";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.cashDrawers");

const PAGE_SIZE: number = 100;

function findCashDrawer(cashDrawerList: ICashDrawer[], alternateKey: string, cashDrawerKey: string): ICashDrawerDetail {
  let cashDrawer: ICashDrawerDetail;
  if (cashDrawerList) {
    cashDrawer = cashDrawerList.find((drawer: ICashDrawer): drawer is ICashDrawerDetail =>
        (
            (alternateKey && drawer.alternateKey === alternateKey) ||
            (cashDrawerKey && drawer.cashDrawerKey.toUpperCase() === cashDrawerKey.toUpperCase())
        )
    );
  }
  return cashDrawer;
}

function* handleCashDrawerValidation(action: StandardAction): IterableIterator<{}> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("handleCashDrawerValidation");

  if (action.payload) {
    let cashDrawer: ICashDrawerDetail;

    const cashDrawerKey: string = action.payload.inputType === DataEventType.KeyedData ?
        action.payload.input : undefined;
    const alternateKey: string = (action.payload.inputType === DataEventType.ScanData ||
        action.payload.inputType === DataEventType.KeyListenerData) ? action.payload.input : undefined;
    const inputSource: string = action.payload.inputSource;

    const settings: SettingsState = yield select(getAppSettingsState);

    const diContainer: Container = settings.diContainer;
    const appLocalDeviceStorage: IAppLocalDeviceStorage = diContainer.get(DI_TYPES.IAppLocalDeviceStorage);
    const storeAccountingAdapter: IStoreAccountingAdapter = diContainer.get(FEATURE_DI_TYPES.IStoreAccountingAdapter);

    //Find the match from local cash drawer list
    let localCashDrawerList: ICashDrawer[] = [];
    yield call(async () => {
      localCashDrawerList = (await appLocalDeviceStorage.loadCashDrawers()) || localCashDrawerList;
    });
    cashDrawer = findCashDrawer(localCashDrawerList, alternateKey, cashDrawerKey);

    //If not found in the local list, reset the local list from the latest cash drawer list from SAS and check again
    if (!cashDrawer) {
      let remoteCashDrawerList: ICashDrawer[] = [];
      yield call(async () => {
        remoteCashDrawerList = await retrieveRemoteCashDrawerList(storeAccountingAdapter, settings);
      });
      // Save the remote cash drawer list to local if it has data otherwise will keep the local list
      // Note: the remote list will be empty if we encounter any error while fetching the list from SAS
      if (!isEmpty(remoteCashDrawerList)) {
        yield call(async () => {
          await appLocalDeviceStorage.storeCashDrawers(remoteCashDrawerList);
        });
      }
      cashDrawer = findCashDrawer(remoteCashDrawerList, alternateKey, cashDrawerKey);
    }

    if (cashDrawer) {
      yield put(validateCashDrawer.success(cashDrawer, inputSource));
    } else {
      yield put(validateCashDrawer.failure(new Error(`Invalid cash drawer : ${action.payload}`)));
    }
  } else {
    logger.debug(`Invalid action payload : ${action.payload}`);
  }
  logger.traceExit(entryMethod);
}

function* handleGetCashDrawers(action: StandardAction): IterableIterator<{}> {
  const entryMethod: ILogEntryMessage = logger.traceEntry("handleGetCashDrawers");

  const settings: SettingsState = yield select(getAppSettingsState);

  const diContainer: Container = settings.diContainer;
  const appLocalDeviceStorage: IAppLocalDeviceStorage = diContainer.get(DI_TYPES.IAppLocalDeviceStorage);
  const storeAccountingAdapter: IStoreAccountingAdapter = diContainer.get(FEATURE_DI_TYPES.IStoreAccountingAdapter);

  let remoteCashDrawerList: ICashDrawer[] = [];
  yield call(async () => {
    remoteCashDrawerList = await retrieveRemoteCashDrawerList(storeAccountingAdapter, settings);
  });

  if (!isEmpty(remoteCashDrawerList)) {
    yield call(async () => {
      await appLocalDeviceStorage.storeCashDrawers(remoteCashDrawerList);
    });
  }
  yield put(getCashDrawers.success());
  logger.traceExit(entryMethod);
}

async function retrieveRemoteCashDrawerList(storeAccountingAdapter: IStoreAccountingAdapter,
                                            settings: SettingsState): Promise<ICashDrawer[]> {
  let remoteCashDrawerList: ICashDrawer[] = [];
  // Will fetch the record in paginated fashion (if the list is big enough, 100 record per page).
  // And return the full list at the end
  let offset: number = 0;
  let totalCount: number = 0;
  do {
    let response: ICashDrawerResponse;
    try {
      response = await storeAccountingAdapter.getCashDrawers(settings.deviceIdentity, PAGE_SIZE, offset);
    } catch (err) {
      response = { data: [], limit: PAGE_SIZE, offset, totalCount: 0 };
    }
    remoteCashDrawerList = [...remoteCashDrawerList, ...response.data] as ICashDrawer[];
    offset = response.limit + response.offset;
    totalCount = response.totalCount;
  } while (offset < totalCount);
  return remoteCashDrawerList;
}

export function* watchCashDrawerValidation(): SagaIterator {
  yield takeEvery(VALIDATE_CASH_DRAWER.REQUEST, handleCashDrawerValidation);
}

export function* watchCashDrawerUpdate(): SagaIterator {
  yield takeEvery(GET_CASH_DRAWERS.REQUEST, handleGetCashDrawers);
}
