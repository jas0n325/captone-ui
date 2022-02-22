import { ICashDrawerDetail } from "@aptos-scp/scp-component-store-selling-features";

import { defineRequestType, RequestType, StandardAction } from "./actions";
import { DataEventType } from "./dataEvent";

export const VALIDATE_CASH_DRAWER: RequestType = defineRequestType("VALIDATE_CASH_DRAWER");
export const GET_CASH_DRAWERS: RequestType = defineRequestType("GET_CASH_DRAWERS");

export const validateCashDrawer = {
  request: (input: string, inputType: DataEventType, inputSource: string): StandardAction => {
    return {
      type: VALIDATE_CASH_DRAWER.REQUEST,
      payload: { input, inputType, inputSource }
    };
  },
  success: (cashDrawer: ICashDrawerDetail, inputSource: string): StandardAction => {
    return {
      type: VALIDATE_CASH_DRAWER.SUCCESS,
      payload: { cashDrawer, inputSource }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: VALIDATE_CASH_DRAWER.FAILURE,
      payload: {
        error
      }
    };
  }
};

export const getCashDrawers = {
  request: (): StandardAction => {
    return {
      type: GET_CASH_DRAWERS.REQUEST,
      payload: {}
    };
  },
  success: (): StandardAction => {
    return {
      type: GET_CASH_DRAWERS.SUCCESS,
      payload: {}
    };
  }
};
