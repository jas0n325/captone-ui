import { IItemLine } from "@aptos-scp/scp-types-commerce-transaction";

import { defineRequestType, RequestType, StandardAction } from "./actions";
import { IDataEventRequestPayload } from "./dataEvent";


export interface ReturnTransactionItemsQuantity {
  [lineNumber: number]: {
    [sublineIndex: number]: {
      quantity: string;
      inputSource?: string;
    };
  };
}

export interface SublineDisplayLine {
  itemLine: IItemLine;
  sublineIndex: number;
}

export const GATHER_RETURNED_QUANTITIES: RequestType = defineRequestType("GATHER_RETURNED_QUANTITIES");
export const UPDATE_RETURN_ITEM_QUANTITY: RequestType = defineRequestType("UPDATE_RETURN_ITEM_QUANTITY");
export const RECORD_ENTERED_RETURN_ITEM: RequestType = defineRequestType("RECORD_ENTERED_RETURN_ITEM");
export const UPDATE_RETURN_AVAILABLE_ITEM_QUANTITIES: RequestType = defineRequestType("UPDATE_RETURN_AVAILABLE_ITEM_QUANTITIES");
export const RETURN_ITEM_IMAGES: RequestType = defineRequestType("RETURN_ITEM_IMAGES");

export const gatherReturnedQuantities = {
  request: (): StandardAction => ({ type: GATHER_RETURNED_QUANTITIES.REQUEST }),
  success: (newReturnedQuantities: ReturnTransactionItemsQuantity): StandardAction => ({
    type: GATHER_RETURNED_QUANTITIES.SUCCESS,
    payload: { newReturnedQuantities }
  })
};

export const updateReturnItemQuantity = {
  request: (sublineDisplayLine: SublineDisplayLine, newQuantity: number): StandardAction => ({
    type: UPDATE_RETURN_ITEM_QUANTITY.REQUEST,
    payload: { sublineDisplayLine, newQuantity }
  }),
  success: (workingReturnedQuantities: ReturnTransactionItemsQuantity): StandardAction => ({
    type: UPDATE_RETURN_ITEM_QUANTITY.SUCCESS,
    payload: { workingReturnedQuantities }
  })
};

export const recordEnteredReturnItem = {
  request: (lookupKeyType: string, lookupKey: string, dataEventPayload: IDataEventRequestPayload): StandardAction => ({
    type: RECORD_ENTERED_RETURN_ITEM.REQUEST,
    payload: { lookupKeyType, lookupKey, dataEventPayload }
  })
};

export const updateReturnAvailableItemQuantities = {
  request: (sublineDisplayLines: SublineDisplayLine[]): StandardAction => ({
    type: UPDATE_RETURN_AVAILABLE_ITEM_QUANTITIES.REQUEST,
    payload: { sublineDisplayLines }
  }),
  success: (workingReturnedQuantities: ReturnTransactionItemsQuantity): StandardAction => ({
    type: UPDATE_RETURN_ITEM_QUANTITY.SUCCESS,
    payload: { workingReturnedQuantities }
  })
};

export type ImageUrl = string;

export interface UniqueIdToImageUrlHash {
  [uniqueId: string]: ImageUrl;
}

export const returnWithTransactionItemImages = {
  request: (uniqueIds: string[]): StandardAction => ({
    type: RETURN_ITEM_IMAGES.REQUEST,
    payload: { uniqueIds }
  }),
  success: (uniqueIdToImageUrlHash: UniqueIdToImageUrlHash): StandardAction => ({
    type: RETURN_ITEM_IMAGES.SUCCESS,
    payload: { uniqueIdToImageUrlHash }
  }),
  failure: (error: Error): StandardAction => ({
    type: RETURN_ITEM_IMAGES.FAILURE,
    payload: { error }
  })
};
