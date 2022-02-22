import { SagaIterator } from "redux-saga";
import { put, select, takeEvery } from "redux-saga/effects";

import { ILogEntryMessage, ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  CollectedDataKey,
  IItemDisplayLine,
  IItemSearchCriteria,
  ItemLookupKey,
  SEARCH_NON_MERCH_ITEMS_EVENT,
  SEARCH_ITEM_EVENT,
  SEARCH_ITEM_VARIANTS_EVENT,
  StoreItem,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import { ItemType } from "@aptos-scp/scp-types-commerce-transaction";

import {
  BUSINESS_OPERATION,
  businessOperation,
  NON_MERCH,
  nonMerch,
  PRODUCT_INQUIRY,
  PRODUCT_INQUIRY_VARIANTS,
  productInquiry,
  productInquiryVariants
} from "../actions";
import { getCombinationFromVariants, SettingsState } from "../reducers";
import { getAppSettingsState } from "../selectors";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.productInquiry");

export function* productInquiryRequest(action: any): IterableIterator<{}> {
  const entryMessage: ILogEntryMessage = logger.traceEntry("productInquiryRequest");

  const { deviceIdentity, uiInputs } = action.payload;
  logger.debug(() => `In productInquiryRequest: Calling performBusinessOperation with `
      + `${SEARCH_ITEM_EVENT} and params: ${JSON.stringify(uiInputs)}`);
  yield put(businessOperation.request(deviceIdentity, SEARCH_ITEM_EVENT, uiInputs));
  logger.traceExit(entryMessage);
}

export function* productInquiryVariantsRequest(action: any): IterableIterator<{}> {
  const entryMessage: ILogEntryMessage = logger.traceEntry("productInquiryVariantsRequest");

  const { deviceIdentity, uiInputs } = action.payload;
  logger.debug(() => `In productInquiryVariantsRequest: Calling performBusinessOperation with `
      + `${SEARCH_ITEM_VARIANTS_EVENT} and params: ${JSON.stringify(uiInputs)}`);
  yield put(businessOperation.request(deviceIdentity, SEARCH_ITEM_VARIANTS_EVENT, uiInputs));
  logger.traceExit(entryMessage);
}

export function* nonMerchItemsRequest(action: any): IterableIterator<{}> {
  const entryMessage: ILogEntryMessage = logger.traceEntry("nonMerchItemsRequest");

  const { deviceIdentity, uiInputs } = action.payload;
  logger.debug(() => `In nonMerchItemsRequest: Calling performBusinessOperation with `
      + `${SEARCH_NON_MERCH_ITEMS_EVENT} and params: ${JSON.stringify(uiInputs)}`);
  yield put(businessOperation.request(deviceIdentity, SEARCH_NON_MERCH_ITEMS_EVENT, uiInputs));
  logger.traceExit(entryMessage);
}

export function* businessOperationSuccess(action: any): IterableIterator<{}> {
  if (action.payload.nonContextualData && (action.payload.nonContextualData.has("storeItems") ||
      action.payload.nonContextualData.has("productInquiryPricingItems")))  {
    let items: Array<StoreItem> = action.payload.nonContextualData.get("storeItems");
    const paginationMetadata = action.payload.nonContextualData.get(CollectedDataKey.PaginationMetadata);
    const productInquiryPricingItem: StoreItem = action.payload.nonContextualData.has("productInquiryPricingItems") ?
        action.payload.nonContextualData.get("productInquiryPricingItems") : undefined;
    const itemSearchCriteria: IItemSearchCriteria = action.payload.nonContextualData.get("itemSearchCriteria");

    if (action.payload.eventType === SEARCH_ITEM_EVENT) {
      yield put(productInquiry.success(items, productInquiryPricingItem, paginationMetadata, itemSearchCriteria));
    } else if (action.payload.eventType === SEARCH_NON_MERCH_ITEMS_EVENT) {
      yield put(nonMerch.success(items, productInquiryPricingItem, paginationMetadata, itemSearchCriteria));
    } else if (action.payload.eventType === SEARCH_ITEM_VARIANTS_EVENT) {
        const settingsState: SettingsState = yield select(getAppSettingsState);

        if (!items && productInquiryPricingItem) {
          items = [productInquiryPricingItem];
        }

        yield put(productInquiryVariants.success(
          { ...getCombinationFromVariants(items, settingsState.primaryLanguage), items },
          productInquiryPricingItem
        ));
    }
  } else if (action.payload.eventType === SEARCH_ITEM_EVENT) {
    const { displayInfo, inputs } = action.payload;
    const lineNumber: UiInput = inputs.find((input: UiInput) => input.inputKey === UiInputKey.LINE_NUMBER);
    const items: Array<StoreItem> = [];
    if (lineNumber && displayInfo) {
      const itemDisplayLine: IItemDisplayLine = displayInfo.itemDisplayLines.find((line: IItemDisplayLine) =>
          line.lineNumber === lineNumber.inputValue
      );
      if (itemDisplayLine) {
        const settingsState: SettingsState = yield select(getAppSettingsState);
        const itemKeyType: string = itemDisplayLine.itemIdKeyType;
        const itemIdKey: string = itemDisplayLine.itemIdKey;
        items.push({
          id: undefined,
          uniqueId: itemIdKey,
          retailLocationIdentity: settingsState.deviceIdentity.retailLocationIdentity,
          itemLookupKeys: [{ type: itemKeyType, value: itemIdKey }],
          itemGroupId: undefined,
          itemType: itemDisplayLine.itemType as ItemType,
          imageUrl: itemDisplayLine.itemImageUrl,
          name: itemDisplayLine.itemShortDescription,
          shortDescription: itemDisplayLine.itemShortDescription,
          additionalDescription: itemDisplayLine.itemAdditionalDescription,
          taxGroupId: undefined,
          price: itemDisplayLine.unitPrice,
          salePrice: undefined,
          images: itemDisplayLine.images,
          productAttributes: itemDisplayLine.productAttributes,
          lookupKeyByType: (type: string): ItemLookupKey => {
            return { type: itemKeyType, value: itemIdKey };
          },
          isManualItemDiscountAllowed: (): boolean => {
            return itemDisplayLine.isManualItemDiscountAllowed;
          },
          isManualTransactionDiscountAllowed: (): boolean => {
            return false;
          },
          isEmployeeDiscountAllowed: (): boolean => {
            return itemDisplayLine.isEmployeeDiscountAllowed;
          }
        });
      }
    }
    yield put(productInquiry.success(items, undefined, items.length > 0 ?
        { limit: items.length, offset: 0, totalCount: items.length } : undefined, undefined));
  }
}

export function* watchproductInquiry(): SagaIterator {
  yield takeEvery(PRODUCT_INQUIRY.REQUEST, productInquiryRequest);
  yield takeEvery(BUSINESS_OPERATION.SUCCESS, businessOperationSuccess);
  yield takeEvery(NON_MERCH.REQUEST, nonMerchItemsRequest);
}

export function* watchproductInquiryVariants(): SagaIterator {
  yield takeEvery(PRODUCT_INQUIRY_VARIANTS.REQUEST, productInquiryVariantsRequest);
  yield takeEvery(BUSINESS_OPERATION.SUCCESS, businessOperationSuccess);
}
