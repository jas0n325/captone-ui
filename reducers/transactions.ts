import { IMerchandiseTransaction, ITenderControlTransaction } from "@aptos-scp/scp-types-commerce-transaction";
import {TransactionWithAdditionalData} from "@aptos-scp/scp-types-ss-transaction-history";

import {
  CLEAR_PAID_OUT_TRANSACTIONS_RESULT,
  CLEAR_POST_VOID_SEARCH_RESULT,
  GET_HISTORICAL_TRANSACTION_BY_ID_ACTION,
  GET_HISTORICAL_TRANSACTIONS_ACTION,
  GET_LAST_TRANSACTION_ACTION,
  GET_PAID_OUT_TRANSACTIONS_ACTION,
  GET_TODAYS_TRANSACTIONS_ACTION,
  GET_TRANSACTIONS_ACTION,
  POST_VOIDABLE_TRANSACTION_SEARCH_ACTION
} from "../actions";
import { RequestState } from "./reducers";

export interface TransactionsState extends RequestState {
  inputSource: string;
  transactions: Array<IMerchandiseTransaction | TransactionWithAdditionalData | ITenderControlTransaction>;
  selectedTransaction: TransactionWithAdditionalData;
}

const INITIAL_STATE: TransactionsState = {
  inputSource: undefined,
  transactions: [],
  selectedTransaction: undefined
};

/* tslint:disable cyclomatic-complexity */
export default (state: TransactionsState = INITIAL_STATE, action: any): TransactionsState => {
  switch (action.type) {
    case GET_TODAYS_TRANSACTIONS_ACTION.REQUEST:
      return Object.assign({}, state, {inProgress: true, error: undefined});
    case GET_TODAYS_TRANSACTIONS_ACTION.SUCCESS:
      return Object.assign({}, state, action.payload, {inProgress: false, error: undefined});
    case GET_TODAYS_TRANSACTIONS_ACTION.FAILURE:
      return Object.assign({}, state, action.payload, {inProgress: false, transactions: undefined });
    case GET_LAST_TRANSACTION_ACTION.REQUEST:
      return Object.assign({}, state, {inProgress: true, error: undefined});
    case GET_LAST_TRANSACTION_ACTION.SUCCESS:
      return Object.assign({}, state, action.payload, {inProgress: false, error: undefined});
    case GET_LAST_TRANSACTION_ACTION.FAILURE:
      return Object.assign({}, state, action.payload, {inProgress: false, transactions: undefined });
    case GET_TRANSACTIONS_ACTION.REQUEST:
      return Object.assign({}, state, {inProgress: true, error: undefined});
    case GET_TRANSACTIONS_ACTION.SUCCESS:
      return Object.assign({}, state, action.payload, {inProgress: false, error: undefined});
    case GET_TRANSACTIONS_ACTION.FAILURE:
      return Object.assign({}, state, action.payload, {inProgress: false, transactions: undefined });
    case GET_PAID_OUT_TRANSACTIONS_ACTION.REQUEST:
      return Object.assign({}, state, {inProgress: true, error: undefined});
    case GET_PAID_OUT_TRANSACTIONS_ACTION.SUCCESS:
      return Object.assign({}, state, action.payload, {inProgress: false, error: undefined});
    case GET_PAID_OUT_TRANSACTIONS_ACTION.FAILURE:
      return Object.assign({}, state, action.payload, {inProgress: false, transactions: undefined });
    case CLEAR_PAID_OUT_TRANSACTIONS_RESULT.REQUEST:
      return Object.assign({}, state, action.payload, {inProgress: false, error: undefined, transactions: undefined});
    case GET_HISTORICAL_TRANSACTIONS_ACTION.REQUEST:
      return Object.assign({}, state, {inProgress: true, error: undefined, inputSource: undefined,
        transactions: undefined});
    case GET_HISTORICAL_TRANSACTIONS_ACTION.SUCCESS:
      return Object.assign({}, state, action.payload, {inProgress: false, error: undefined});
    case GET_HISTORICAL_TRANSACTIONS_ACTION.FAILURE:
      return Object.assign({}, state, action.payload, {inProgress: false, inputSource: undefined,
        transactions: undefined });
    case GET_HISTORICAL_TRANSACTION_BY_ID_ACTION.REQUEST:
      return Object.assign({}, state, {inProgress: true, error: undefined, inputSource: undefined,
        selectedTransaction: undefined});
    case GET_HISTORICAL_TRANSACTION_BY_ID_ACTION.SUCCESS:
      return Object.assign({}, state, action.payload, {inProgress: false, error: undefined});
    case GET_HISTORICAL_TRANSACTION_BY_ID_ACTION.FAILURE:
      return Object.assign({}, state, action.payload, {inProgress: false, inputSource: undefined,
        GET_HISTORICAL_TRANSACTION_BY_ID_ACTION: undefined });
    case POST_VOIDABLE_TRANSACTION_SEARCH_ACTION.SUCCESS:
      return Object.assign({}, state, action.payload, {inProgress: false, error: undefined});
    case POST_VOIDABLE_TRANSACTION_SEARCH_ACTION.FAILURE:
      return Object.assign({}, state, action.payload, {inProgress: false, transactions: undefined});
    case CLEAR_POST_VOID_SEARCH_RESULT.REQUEST:
      return Object.assign({}, state, action.payload, {inProgress: false, error: undefined, transactions: undefined});
    default:
      return state;
  }
};
