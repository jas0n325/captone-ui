import { Container } from "inversify";
import { SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";

import { LocalizableMessage } from "@aptos-scp/scp-component-business-core";
import {
  UIINPUT_SOURCE_BARCODE, UIINPUT_SOURCE_KEYBOARD, IConfigurationManager
} from "@aptos-scp/scp-component-store-selling-core";
import {
  IItemLine,
  IItemLookupKey,
  IMerchandiseTransaction,
  isItemLine,
  ItemType,
  ISubline,
  ITransactionLine,
  LineType
} from "@aptos-scp/scp-types-commerce-transaction";
import { AdditionalData, TransactionWithAdditionalData } from "@aptos-scp/scp-types-ss-transaction-history";
import {
  DI_TYPES as FEATURES_DI_TYPES,
  IItemSearchCriteria,
  IStoreItemAdapter,
  IStoreItemSearchResponse,
  StoreItem
} from "@aptos-scp/scp-component-store-selling-features";

import {
  dataEvent,
  DataEventType,
  GATHER_RETURNED_QUANTITIES,
  gatherReturnedQuantities,
  IDataEventRequestPayload,
  RECORD_ENTERED_RETURN_ITEM,
  ReturnTransactionItemsQuantity,
  StandardAction,
  SublineDisplayLine,
  UPDATE_RETURN_AVAILABLE_ITEM_QUANTITIES,
  UPDATE_RETURN_ITEM_QUANTITY,
  updateReturnItemQuantity,
  userNotification,
  RETURN_ITEM_IMAGES,
  returnWithTransactionItemImages,
  UniqueIdToImageUrlHash
} from "../actions";
import {
  getSublineAvailableReturnQuantity,
  getSublineDisplayLinesFromTransaction,
  getSublineQuantityReturned,
  ReturnWithTransactionQuantityChangeMode,
  getReturnWithTransactionQuantityChangeMode
} from "../components/common/utilities";
import { BusinessState, ReturnState, SettingsState } from "../reducers";
import { getBusinessState, getReturnState, getAppSettingsState } from "../selectors";


function* handleGatherReturnedQuantities(action: StandardAction): IterableIterator<{}> {
  const businessState: BusinessState = yield select(getBusinessState);

  const transaction: IMerchandiseTransaction =
      businessState.stateValues.get("ItemHandlingSession.transactionInformationForReturn") &&
      businessState.stateValues.get("ItemHandlingSession.transactionInformationForReturn").transaction;
  const sublineDisplayLines: SublineDisplayLine[] = getSublineDisplayLinesFromTransaction(transaction);

  yield put(gatherReturnedQuantities.success(getSublineQuantityReturned(
    transaction.transactionId,
    sublineDisplayLines,
    businessState.displayInfo && businessState.displayInfo.itemDisplayLines
  )));
}

function* handleUpdateReturnedItemQuantity(action: StandardAction): IterableIterator<{}> {
  const returnState: ReturnState = yield select(getReturnState);

  const updatedQuantityInputs: ReturnTransactionItemsQuantity = Object.assign(
    {},
    returnState.workingReturnedQuantities
  );

  const sublineDisplayLine: SublineDisplayLine = action.payload.sublineDisplayLine;

  const businessState: BusinessState = yield select(getBusinessState);
  const transactionWithAdditionalData: TransactionWithAdditionalData = businessState.stateValues.get(
    "ItemHandlingSession.transactionInformationForReturn"
  );
  const transactionAdditionalData: AdditionalData = transactionWithAdditionalData &&
                                                    transactionWithAdditionalData.additionalData;

  const newQuantity: number = action.payload.newQuantity;

  const { itemLine, sublineIndex } = sublineDisplayLine;

  const { sublineAvailableQuantity } = getSublineAvailableReturnQuantity(sublineDisplayLine, transactionAdditionalData);

  if (newQuantity <= sublineAvailableQuantity && newQuantity >= 0) {
    updatedQuantityInputs[itemLine.lineNumber][sublineIndex].quantity = newQuantity.toString();
  } else if (newQuantity > sublineAvailableQuantity) {
    updatedQuantityInputs[itemLine.lineNumber][sublineIndex].quantity = sublineAvailableQuantity.toString();
  } else if (newQuantity < 0) {
    updatedQuantityInputs[itemLine.lineNumber][sublineIndex].quantity = "0";
  }
  updatedQuantityInputs[itemLine.lineNumber][sublineIndex].inputSource = UIINPUT_SOURCE_KEYBOARD;

  yield put(updateReturnItemQuantity.success(updatedQuantityInputs));
}

function* handleUpdateReturnAvailableItemQuantities(action: StandardAction): IterableIterator<{}> {
  const returnState: ReturnState = yield select(getReturnState);

  const updatedQuantityInputs: ReturnTransactionItemsQuantity = Object.assign(
      {},
      returnState.workingReturnedQuantities
  );

  const sublineDisplayLines: SublineDisplayLine[] = action.payload.sublineDisplayLines;

  const businessState: BusinessState = yield select(getBusinessState);
  const transactionWithAdditionalData: TransactionWithAdditionalData = businessState.stateValues.get(
      "ItemHandlingSession.transactionInformationForReturn"
  );
  const transactionAdditionalData: AdditionalData = transactionWithAdditionalData &&
      transactionWithAdditionalData.additionalData;

  sublineDisplayLines.forEach((sublineDisplayLine: SublineDisplayLine) => {
    const { itemLine, sublineIndex } = sublineDisplayLine;
    const { sublineAvailableQuantity } = getSublineAvailableReturnQuantity(sublineDisplayLine, transactionAdditionalData);

    if (sublineAvailableQuantity > 0) {
      updatedQuantityInputs[itemLine.lineNumber][sublineIndex].quantity = sublineAvailableQuantity.toString();
      if (!updatedQuantityInputs[itemLine.lineNumber][sublineIndex].inputSource) {
        updatedQuantityInputs[itemLine.lineNumber][sublineIndex].inputSource = UIINPUT_SOURCE_KEYBOARD;
      }
    }
  });

  yield put(updateReturnItemQuantity.success(updatedQuantityInputs));
}

function* handleRecordEnteredItemRequest(action: StandardAction): IterableIterator<{}> {
  const businessState: BusinessState = yield select(getBusinessState);

  const transactionWithAdditionalData: TransactionWithAdditionalData = businessState.stateValues.get(
    "ItemHandlingSession.transactionInformationForReturn"
  );
  const {
    lookupKeyType,
    lookupKey,
    dataEventPayload
  }: { lookupKeyType: string, lookupKey: string, dataEventPayload: IDataEventRequestPayload } = action.payload;

  const itemLinesFromTransactionForReturn = getItemLinesFromTransactionForReturn(transactionWithAdditionalData, lookupKeyType, lookupKey);

  if (!itemLinesFromTransactionForReturn.length) {
    yield put(userNotification.request(new LocalizableMessage("itemMustBeInTheOriginalTransaction")));
    yield put(dataEvent.failure(dataEventPayload, new Error("Return item must be in the original transaction")));
    return;
  }

  const returnState: ReturnState = yield select(getReturnState);

  let sublineIndexFromReturnItem: number = 0;

  const validItemLine: IItemLine = itemLinesFromTransactionForReturn.find((itemLine: IItemLine) => {
    return itemLine.sublines.some((subline: ISubline, index: number) => {

      const { sublineAvailableQuantity } = getSublineAvailableReturnQuantity(
        { itemLine, sublineIndex: index },
        transactionWithAdditionalData && transactionWithAdditionalData.additionalData
      );

      const workingQuantity: number = Number(returnState.workingReturnedQuantities[itemLine.lineNumber][index].
          quantity);
      if (workingQuantity < sublineAvailableQuantity) {
        sublineIndexFromReturnItem = index;

        return true;
      }

      return false;
    });
  });

  const resultQuantities: ReturnTransactionItemsQuantity = Object.assign(
    {},
    returnState.workingReturnedQuantities
  );

  const settingsState: SettingsState = yield select(getAppSettingsState);
  const { isReturnable, configValue } = geIsReturnableAndConfigValue(validItemLine, settingsState);
  if (validItemLine && isReturnable) {
    const lineNumberFromReturnTransaction: number = validItemLine.lineNumber;

    const currentReturnQuantity: number = parseInt(
      resultQuantities[lineNumberFromReturnTransaction][sublineIndexFromReturnItem].quantity,
      10
    );

    const { sublineAvailableQuantity } = getSublineAvailableReturnQuantity(
      { itemLine: validItemLine, sublineIndex: sublineIndexFromReturnItem },
      transactionWithAdditionalData.additionalData
    );

    if (currentReturnQuantity < sublineAvailableQuantity) {
      const quantityChangeMode: ReturnWithTransactionQuantityChangeMode = getReturnWithTransactionQuantityChangeMode(
        getConfigManager(settingsState)
      );

      const useSelectLineForQuantityChange: boolean = quantityChangeMode === ReturnWithTransactionQuantityChangeMode
          .SelectLine;

      let newQuantity: number = useSelectLineForQuantityChange ? sublineAvailableQuantity : currentReturnQuantity + 1;
      if ((configValue && configValue === "OMS" && validItemLine.lineType === LineType.ItemOrder)) {
        newQuantity=0;
        yield put(userNotification.request(new LocalizableMessage("itemNotReturnable")));
      }
      resultQuantities[lineNumberFromReturnTransaction][sublineIndexFromReturnItem].quantity = newQuantity.toString();
    }
    resultQuantities[lineNumberFromReturnTransaction][sublineIndexFromReturnItem].inputSource =
      dataEventPayload.eventType === DataEventType.ScanData ? UIINPUT_SOURCE_BARCODE : UIINPUT_SOURCE_KEYBOARD;
    yield put(dataEvent.success(dataEventPayload, false));
  } else if (validItemLine && !isReturnable) {
    yield put(userNotification.request(new LocalizableMessage("itemNotReturnable")));
    yield put(dataEvent.failure(dataEventPayload, new Error(
      "Cannot return item due to item treatment rules"
    )));
  } else {
    yield put(userNotification.request(new LocalizableMessage("quantityExceedsWhatIsAvailableForReturn")));
    yield put(dataEvent.failure(dataEventPayload, new Error(
      "Cannot return item due to quantity limit from the original transaction"
    )));
  }

  yield put(updateReturnItemQuantity.success(resultQuantities));
}

function geIsReturnableAndConfigValue(validItemLine: IItemLine, settingsState: SettingsState): any {
  const configValue = getStoreOmniChannelValues(settingsState);
  const isReturnable: boolean = validItemLine &&
    (validItemLine.itemType === ItemType.Merchandise || validItemLine.itemType === ItemType.NonMerch) &&
    validItemLine.returnable !== false && !validItemLine.tenderId &&
    (configValue && configValue === "OMS" && validItemLine.lineType === LineType.ItemSale);
  return { isReturnable, configValue };
}

function getItemLinesFromTransactionForReturn(transactionWithAdditionalData: TransactionWithAdditionalData, lookupKeyType: string, lookupKey: string): any {
  const transaction: IMerchandiseTransaction = transactionWithAdditionalData &&
    transactionWithAdditionalData.transaction as IMerchandiseTransaction;
    return transaction.lines.filter((line: ITransactionLine) =>
    isItemLine(line) &&
    (line.lineType === LineType.ItemSale || line.lineType === LineType.ItemFulfillment || line.lineType === LineType.ItemOrder) &&
    !line.voided && line.itemLookupKeys.some(
      (itemLookupKey: IItemLookupKey) => itemLookupKey.keyType === lookupKeyType && itemLookupKey.value === lookupKey
    )
  ) as IItemLine[];
}

function getConfigManager(settingsState: SettingsState): IConfigurationManager {
  return settingsState.configurationManager
}

function getStoreOmniChannelValues(settingsState: SettingsState): any {
  const configManager = getConfigManager(settingsState);
  const storeOmniChannelValues = configManager.getStoreOmniChannelValues();
  return storeOmniChannelValues && storeOmniChannelValues.sourceForOrderHistory;
}

function* handleReturnItemImagesRequest(action: StandardAction): IterableIterator<{}> {
  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer: Container = settings.diContainer;
  const storeItemAdapter: IStoreItemAdapter = diContainer.get(FEATURES_DI_TYPES.IStoreItemAdapter);

  const businessState: BusinessState = yield select(getBusinessState);

  try {
    const searchResponse: IStoreItemSearchResponse = yield call(
      [storeItemAdapter, "searchItems"],
      settings.deviceIdentity.retailLocationIdentity,
      businessState.stateValues.get("transaction.accountingCurrency"),
      { uniqueIds: action.payload.uniqueIds } as IItemSearchCriteria
    );

    // Create a hash so retrieval is easier in the ui component
    const uniqueIdToImageUrlHash: UniqueIdToImageUrlHash = {};
    if (searchResponse && searchResponse.items && searchResponse.items.length) {
      searchResponse.items.forEach((item: StoreItem) => {
        uniqueIdToImageUrlHash[item.uniqueId] = item.imageUrl;
      });
    }

    yield put(returnWithTransactionItemImages.success(uniqueIdToImageUrlHash));
  } catch (error) {
    yield put(returnWithTransactionItemImages.failure(error));
  }
}

export function* watchGatherReturnedQuantitiesRequest(): SagaIterator {
  yield takeEvery(GATHER_RETURNED_QUANTITIES.REQUEST, handleGatherReturnedQuantities);
}

export function* watchUpdateReturnItemQuantityRequest(): SagaIterator {
  yield takeEvery(UPDATE_RETURN_ITEM_QUANTITY.REQUEST, handleUpdateReturnedItemQuantity);
}

export function* watchRecordEnteredReturnItem(): SagaIterator {
  yield takeEvery(RECORD_ENTERED_RETURN_ITEM.REQUEST, handleRecordEnteredItemRequest);
}

export function* watchUpdateReturnAvailableItemQuantitiesRequest(): SagaIterator {
  yield takeEvery(UPDATE_RETURN_AVAILABLE_ITEM_QUANTITIES.REQUEST, handleUpdateReturnAvailableItemQuantities);
}

export function* watchReturnItemImagesRequest(): SagaIterator {
  yield takeEvery(RETURN_ITEM_IMAGES.REQUEST, handleReturnItemImagesRequest);
}
