import {
  RESET_TAX_REFUND_STATE,
  SET_IS_INVOICE,
  StandardAction
} from "../actions";
import { RequestState } from "./reducers";

export interface TaxRefundState extends RequestState {
  isInvoice: boolean;
}

const INITIAL_STATE: TaxRefundState = {
  isInvoice: false
};

export default (state: TaxRefundState = INITIAL_STATE, action: StandardAction): TaxRefundState => {
  switch (action.type) {
    case SET_IS_INVOICE.REQUEST:
      return Object.assign({}, state, action.payload, { inProgress: false });
    case RESET_TAX_REFUND_STATE.REQUEST:
      return INITIAL_STATE; // Clear out the taxRefund state.
    default:
      return state;
  }
};
