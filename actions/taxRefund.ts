import { defineRequestType, RequestType, StandardAction } from "./actions";

export const SET_IS_INVOICE: RequestType = defineRequestType("SET_IS_INVOICE");
export const RESET_TAX_REFUND_STATE: RequestType = defineRequestType("RESET_TAX_REFUND_STATE");

export const resetTaxRefundState = {
  request: (): StandardAction => {
    return {
      type: RESET_TAX_REFUND_STATE.REQUEST
    };
  }
};
export const setIsInvoice = {
  request: (isInvoice: boolean): StandardAction => {
    return {
      type: SET_IS_INVOICE.REQUEST,
      payload: { isInvoice }
    };
  }
};
