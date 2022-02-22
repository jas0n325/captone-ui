import { DeliveryFrequency } from "@aptos-scp/scp-types-store-items";

import { defineRequestType, RequestType, StandardAction } from "./actions";


export const GET_SUBSCRIPTION_FREQUENCIES_ACTION: RequestType = defineRequestType("GET_SUBSCRIPTION_FREQUENCIES");

export const getSubscriptionFrequencies = {
  request: (frequencyCodes?: string[], limit?: number, offset?: number): StandardAction => {
    return {
      type: GET_SUBSCRIPTION_FREQUENCIES_ACTION.REQUEST,
      payload: {
        frequencyCodes,
        limit,
        offset
      }
    };
  },
  success: (subscriptionFrequencies: Array<DeliveryFrequency>): StandardAction => {
    return {
      type: GET_SUBSCRIPTION_FREQUENCIES_ACTION.SUCCESS,
      payload: {
        subscriptionFrequencies
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: GET_SUBSCRIPTION_FREQUENCIES_ACTION.FAILURE,
      payload: {
        error
      }
    };
  }
};
