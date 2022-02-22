import { PendingPaymentMode } from "../reducers/pendingPayment";
import { defineRequestType, RequestType, StandardAction } from "./actions";


export const UPDATE_PENDING_PAYMENT: RequestType = defineRequestType("UPDATE_PENDING_PAYMENT");

export const updatePendingPayment = {
  request: (mode: PendingPaymentMode): StandardAction => {
    return {
      type: UPDATE_PENDING_PAYMENT.SUCCESS,
      payload: {
        mode
      }
    };
  }
};
