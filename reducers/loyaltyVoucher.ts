import { ILoyaltyVoucher } from "@aptos-scp/scp-component-store-selling-features";
import { SEARCH_LOYALTY_VOUCHER } from "../actions";
import { RequestState } from "./reducers";

export interface LoyaltyVoucherState extends RequestState {
  loyaltyVouchers: ILoyaltyVoucher[];
  error: Error;
}

const INITIAL_STATE: LoyaltyVoucherState = {
  loyaltyVouchers: undefined,
  inProgress: false,
  error: undefined
};

export default (state: LoyaltyVoucherState = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case SEARCH_LOYALTY_VOUCHER.REQUEST:
      return Object.assign({}, state, { inProgress: true, loyaltyVouchers: [] });
    case SEARCH_LOYALTY_VOUCHER.SUCCESS:
      return Object.assign({}, state, action.payload, { inProgress: false });
    case SEARCH_LOYALTY_VOUCHER.FAILURE:
      return Object.assign({}, state, action.payload, { inProgress: false });
    default:
      return state;
  }
};
