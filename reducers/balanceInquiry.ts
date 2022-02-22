import { IAuthorizationResponse } from "@aptos-scp/scp-types-commerce-devices";

import { BALANCE_INQUIRY } from "../actions";
import { RequestState } from "./reducers";


export interface BalanceInquiryState extends RequestState {
  authResponse?: IAuthorizationResponse;
  error?: Error;
}

const INITIAL_STATE: BalanceInquiryState = {
  authResponse: undefined
};

export default (state: BalanceInquiryState = INITIAL_STATE, action: any): BalanceInquiryState => {
  switch (action.type) {
    case BALANCE_INQUIRY.SUCCESS:
      return Object.assign({}, state, action.payload, { inProgress: false });
    case BALANCE_INQUIRY.FAILURE:
      return Object.assign({}, state, action.payload, { inProgress: false });
    default:
      return state;
  }
};
