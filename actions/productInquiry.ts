import { DeviceIdentity, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import { IItemSearchCriteria, StoreItem } from "@aptos-scp/scp-component-store-selling-features";

import { Variants } from "../reducers";
import { defineRequestType, RequestType, StandardAction } from "./actions";
import { IPaginationMetadata } from "./dataEvent";


export const PRODUCT_INQUIRY: RequestType = defineRequestType("PRODUCT_INQUIRY");
export const PRODUCT_INQUIRY_CLEAR: RequestType = defineRequestType("PRODUCT_INQUIRY_CLEAR");
export const PRODUCT_INQUIRY_VARIANTS: RequestType = defineRequestType("PRODUCT_INQUIRY_VARIANTS");

export const NON_MERCH: RequestType = defineRequestType("NON_MERCH");

export const productInquiry = {
  request: (deviceIdentity: DeviceIdentity, uiInputs: UiInput[]): StandardAction => {
    return {
      type: PRODUCT_INQUIRY.REQUEST,
      payload: {
        deviceIdentity,
        uiInputs
      }
    };
  },
  success: (items: Array<StoreItem>, itemFromPricing: StoreItem,
            paginationMetadata: IPaginationMetadata, itemSearchCriteria: IItemSearchCriteria): StandardAction => {
    return {
      type: PRODUCT_INQUIRY.SUCCESS,
      payload: {
        items,
        itemFromPricing,
        paginationMetadata,
        itemSearchCriteria,
        error: undefined
      }
    };
  }
};

export const productInquiryClear = {
  request: () => {
    return {
      type: PRODUCT_INQUIRY_CLEAR.REQUEST,
      payload: {
        items: undefined as Array<StoreItem>
      }
    };
  }
};

export const productInquiryVariants = {
  request: (deviceIdentity: DeviceIdentity, storeItem: StoreItem, uiInputs: UiInput[]): StandardAction => {
    return {
      type: PRODUCT_INQUIRY_VARIANTS.REQUEST,
      payload: {
        deviceIdentity,
        storeItem,
        uiInputs
      }
    };
  },
  success: (variants: Variants, itemFromPricing: StoreItem): StandardAction => {
    return {
      type: PRODUCT_INQUIRY_VARIANTS.SUCCESS,
      payload: {
        variants,
        itemFromPricing,
        error: undefined
      }
    };
  }
};

export const nonMerch = {
  request: (deviceIdentity: DeviceIdentity, uiInputs: UiInput[]): StandardAction => {
    return {
      type: NON_MERCH.REQUEST,
      payload: {
        deviceIdentity,
        uiInputs
      }
    };
  },
  success: (items: Array<StoreItem>, itemFromPricing: StoreItem,
            paginationMetadata: IPaginationMetadata, itemSearchCriteria: IItemSearchCriteria): StandardAction => {
    return {
      type: NON_MERCH.SUCCESS,
      payload: {
        items,
        itemFromPricing,
        paginationMetadata,
        itemSearchCriteria,
        error: undefined
      }
    };
  }
};
