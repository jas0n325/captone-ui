import { defineRequestType, RequestType, StandardAction } from "./actions";


export const UPDATE_PENDING_TRX_COUNT: RequestType = defineRequestType("UPDATE_PENDING_TRX_COUNT");

export interface PendingTransactionCountPayload {
  pendingTransactionCount: number;
}

export const updatePendingTransactionCount = {
  request: (pendingTransactionCount: number): StandardAction => {
    return {
      type: UPDATE_PENDING_TRX_COUNT.SUCCESS,
      payload: {
        pendingTransactionCount
      }
    };
  }
};
