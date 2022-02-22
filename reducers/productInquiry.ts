import * as _ from "lodash";

import { PosBusinessError } from "@aptos-scp/scp-component-store-selling-core";
import { IItemSearchCriteria, StoreItem } from "@aptos-scp/scp-component-store-selling-features";

import {
  BUSINESS_OPERATION,
  IPaginationMetadata,
  NON_MERCH,
  PRODUCT_INQUIRY,
  PRODUCT_INQUIRY_CLEAR,
  PRODUCT_INQUIRY_VARIANTS
} from "../actions";
import { getColorName, getSeasonName, getSizeName } from "../components/common/utilities/productInquiry";
import { RequestState } from "./reducers";


export type SecondaryAttributeMap = Map<string, boolean>;
export type AttributeMap = Map<string, SecondaryAttributeMap>;
export interface BaseVariants {
  colors: AttributeMap;
  sizes: AttributeMap;
  seasons: AttributeMap;
}

export interface Variants extends BaseVariants {
  items: Array<StoreItem>;
}

export interface ProductInquiryState extends RequestState {
  items: Array<StoreItem>;
  variants: Variants;
  error: PosBusinessError;
  itemFromPricing?: StoreItem;
  paginationMetadata?: IPaginationMetadata;
  itemSearchCriteria?: IItemSearchCriteria;
}

const INITIAL_STATE: ProductInquiryState = {
  inProgress: false,
  items: undefined,
  variants: undefined,
  error: undefined,
  itemFromPricing: undefined,
  itemSearchCriteria: undefined
};

export default (state: ProductInquiryState = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case PRODUCT_INQUIRY.REQUEST:
    case NON_MERCH.REQUEST:
      return Object.assign({}, state, INITIAL_STATE, {
        inProgress: true,
        variants: undefined,
        items: undefined,
        itemFromPricing: undefined,
        itemSearchCriteria: undefined
      });
    case PRODUCT_INQUIRY.SUCCESS:
    case NON_MERCH.SUCCESS:
      return Object.assign({}, state, action.payload, { inProgress: false });
    case PRODUCT_INQUIRY_CLEAR.REQUEST:
      return Object.assign({}, state, action.payload);
    case PRODUCT_INQUIRY_VARIANTS.REQUEST:
      return Object.assign({}, state, {
        inProgress: true,
        variants: undefined,
        itemFromPricing: undefined
      });
    case PRODUCT_INQUIRY_VARIANTS.SUCCESS:
      return Object.assign({}, state, action.payload, { inProgress: false});
    case BUSINESS_OPERATION.FAILURE:
      return (state.inProgress ? Object.assign({}, state, action.payload, { inProgress: false }) : state);

    default:
      return state;
  }
};

export function getCombinationFromVariants(items: Array<StoreItem>, retailLocationLocale: string): BaseVariants {
  const combination: BaseVariants = {
    colors: new Map<string, SecondaryAttributeMap>(),
    sizes: new Map<string, SecondaryAttributeMap>(),
    seasons: new Map<string, SecondaryAttributeMap>()
  };
  if (items) {
    items.forEach((item: StoreItem) => {
      const colorName = getColorName(item, retailLocationLocale);
      const sizeName = getSizeName(item, retailLocationLocale);
      const seasonName = getSeasonName(item, retailLocationLocale);
      if (colorName || sizeName || seasonName) {
        pairKeyWithKey(combination.colors, colorName, [sizeName, seasonName]);
        pairKeyWithKey(combination.sizes, sizeName, [colorName, seasonName]);
        pairKeyWithKey(combination.seasons, seasonName, [sizeName, colorName]);
      }
    });
  }
  return combination;
}

function pairKeyWithKey(src: AttributeMap, key: string, keyToPair: string[]): void {
  if (key) {
    if (!src.has(key)) {
      src.set(key, new Map<string, boolean>());
    }
    if (keyToPair.length > 0) {
      _.forEach(keyToPair, (value: string) => {
        if (value) { src.get(key).set(value, true); }
      });
    }
  }
}
