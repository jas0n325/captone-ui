import { UPDATE_PENDING_PAYMENT } from "../actions";
import { RequestState } from "./reducers";


export interface PendingPaymentState extends RequestState {
  mode: PendingPaymentMode;
  error?: Error;
}
export enum PendingPaymentMode {
  Completed = "Completed",
  WaitingOnCustomer = "WaitingOnCustomer",
  WaitingOnLoyalty = "WaitingOnLoyalty",
  WaitingOnPayment = "WaitingOnPayment"
}

const INITIAL_STATE: PendingPaymentState = {
  mode: PendingPaymentMode.Completed
};

export default (state: PendingPaymentState = INITIAL_STATE, action: any): PendingPaymentState => {
  switch (action.type) {
    case UPDATE_PENDING_PAYMENT.REQUEST:
    case UPDATE_PENDING_PAYMENT.SUCCESS:
    case UPDATE_PENDING_PAYMENT.FAILURE:
      return Object.assign({}, state, action.payload, { inProgress: false });
    default:
      return state;
  }
};
