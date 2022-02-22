import { DeliveryFrequency } from "@aptos-scp/scp-types-store-items";

import { GET_SUBSCRIPTION_FREQUENCIES_ACTION } from "../actions";
import { RequestState } from "./reducers";


export interface SubscriptionFrequenciesState extends RequestState {
  subscriptionFrequencies: Array<DeliveryFrequency>;
}

const INITIAL_STATE: SubscriptionFrequenciesState = {
  subscriptionFrequencies: []
};

export default (state: SubscriptionFrequenciesState = INITIAL_STATE, action: any): SubscriptionFrequenciesState => {
  switch (action.type) {
    case GET_SUBSCRIPTION_FREQUENCIES_ACTION.REQUEST:
      return Object.assign({}, state, {inProgress: true});
    case GET_SUBSCRIPTION_FREQUENCIES_ACTION.SUCCESS:
      return Object.assign({}, state, action.payload, {inProgress: false, error: undefined});
    case GET_SUBSCRIPTION_FREQUENCIES_ACTION.FAILURE:
      return Object.assign({}, state, action.payload, {inProgress: false});
    default:
      return state;
  }
};
