import { IAuthorizationResponse } from "@aptos-scp/scp-types-commerce-devices";

import { defineRequestType, RequestType, StandardAction } from "./actions";


export const BALANCE_INQUIRY: RequestType = defineRequestType("BALANCE_INQUIRY");

export const balanceInquiry = {
  success: (authResponse: IAuthorizationResponse): StandardAction => {
    return {
      type: BALANCE_INQUIRY.SUCCESS,
      payload: {
        authResponse
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: BALANCE_INQUIRY.FAILURE,
      payload: {
        error
      }
    };
  }
};
