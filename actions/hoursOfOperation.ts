import { IHoursOfOperation } from "@aptos-scp/scp-component-store-selling-features";

import { defineRequestType, RequestType, StandardAction } from "./actions";


export const GET_HOURS_OF_OPERATION_ACTION: RequestType = defineRequestType("GET_HOURS_OF_OPERATION");

export const getHoursOfOperationAction ={
  request: (hoursOfOperationKey: string): StandardAction => {
    return {
      type: GET_HOURS_OF_OPERATION_ACTION.REQUEST,
      payload: { hoursOfOperationKey }
    };
  },
  success: (hoursOfOperation: IHoursOfOperation): StandardAction => {
    return {
      type: GET_HOURS_OF_OPERATION_ACTION.SUCCESS,
      payload: {
        hoursOfOperation
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: GET_HOURS_OF_OPERATION_ACTION.FAILURE,
      payload: {
        error
      }
    };
  }
};
