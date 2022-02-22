import { UPDATE_PENDING_TRX_COUNT } from "../actions";
import { RequestState } from "./reducers";


export interface PendingTransactionCountState extends RequestState {
  pendingTransactionCount: number;
  error?: Error;
}

const INITIAL_STATE: PendingTransactionCountState = {
  pendingTransactionCount: 0
};

export default (state: PendingTransactionCountState = INITIAL_STATE, action: any): PendingTransactionCountState => {
  switch (action.type) {
    case UPDATE_PENDING_TRX_COUNT.REQUEST:
    case UPDATE_PENDING_TRX_COUNT.SUCCESS:
    case UPDATE_PENDING_TRX_COUNT.FAILURE:
      return Object.assign({}, state, action.payload, { inProgress: false });
    default:
      return state;
  }
};
