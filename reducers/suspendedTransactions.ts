import { IMerchandiseTransaction } from "@aptos-scp/scp-types-commerce-transaction";

import { GET_SUSPENDED_TRANSACTIONS_ACTION, StandardAction } from "../actions";
import { RequestState } from "./reducers";


export interface SuspendedTransactionsState extends RequestState {
  suspendedTransactions: Array<IMerchandiseTransaction>;
}

const INITIAL_STATE: SuspendedTransactionsState = {
  suspendedTransactions: []
};

export default (state: SuspendedTransactionsState = INITIAL_STATE,
                action: StandardAction): SuspendedTransactionsState => {
  switch (action.type) {
    case GET_SUSPENDED_TRANSACTIONS_ACTION.REQUEST:
      return Object.assign({}, state, {inProgress: true, error: undefined});
    case GET_SUSPENDED_TRANSACTIONS_ACTION.SUCCESS:
      return Object.assign({}, state, action.payload, {inProgress: false, error: undefined});
    case GET_SUSPENDED_TRANSACTIONS_ACTION.FAILURE:
      return Object.assign({}, state, action.payload, {inProgress: false, suspendedTransactions: undefined });
    default:
      return state;
  }
};
