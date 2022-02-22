import { IMerchandiseTransaction } from "@aptos-scp/scp-types-commerce-transaction";

import { defineRequestType, RequestType, StandardAction } from "./actions";
import { DataEventType } from "./dataEvent";


export const GET_SUSPENDED_TRANSACTIONS_ACTION: RequestType = defineRequestType("GET_SUSPENDED_TRANSACTIONS");

export const getSuspendedTransactions = {
  request: (input: string, inputType: DataEventType): StandardAction => {
    return {
      type: GET_SUSPENDED_TRANSACTIONS_ACTION.REQUEST,
      payload: { input, inputType }
    };
  },
  success: (transactions: IMerchandiseTransaction[]): StandardAction => {
    return {
      type: GET_SUSPENDED_TRANSACTIONS_ACTION.SUCCESS,
      payload: {
        suspendedTransactions: transactions
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: GET_SUSPENDED_TRANSACTIONS_ACTION.FAILURE,
      payload: {
        error
      }
    };
  }
};
