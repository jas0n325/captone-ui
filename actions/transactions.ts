import { IMerchandiseTransaction, ITenderControlTransaction } from "@aptos-scp/scp-types-commerce-transaction";
import { TransactionWithAdditionalData } from "@aptos-scp/scp-types-ss-transaction-history";

import { defineRequestType, RequestType, StandardAction } from "./actions";
import { DataEventType } from "./dataEvent";

export const GET_TODAYS_TRANSACTIONS_ACTION: RequestType = defineRequestType("GET_TODAYS_TRANSACTIONS");
export const GET_TRANSACTIONS_ACTION: RequestType = defineRequestType("GET_TRANSACTIONS");
export const GET_LAST_TRANSACTION_ACTION: RequestType = defineRequestType("GET_LAST_TRANSACTION");
export const GET_HISTORICAL_TRANSACTIONS_ACTION: RequestType = defineRequestType("GET_HISTORICAL_TRANSACTIONS_ACTION");
export const GET_HISTORICAL_TRANSACTION_BY_ID_ACTION: RequestType =
    defineRequestType("GET_HISTORICAL_TRANSACTION_BY_ID_ACTION");
export const POST_VOIDABLE_TRANSACTION_SEARCH_ACTION: RequestType =
    defineRequestType("POST_VOIDABLE_TRANSACTION_SEARCH");
export const CLEAR_POST_VOID_SEARCH_RESULT: RequestType = defineRequestType("CLEAR_POST_VOID_SEARCH_RESULT");
export const GET_PAID_OUT_TRANSACTIONS_ACTION = defineRequestType("GET_PAID_OUT_TRANSACTIONS_ACTION");
export const CLEAR_PAID_OUT_TRANSACTIONS_RESULT = defineRequestType("CLEAR_PAID_OUT_TRANSACTIONS_RESULT");

export const getTodaysTransactions = {
  request: (): StandardAction => {
    return {
      type: GET_TODAYS_TRANSACTIONS_ACTION.REQUEST,
      payload: {}
    };
  },
  success: (transactions: IMerchandiseTransaction[]): StandardAction => {
    return {
      type: GET_TODAYS_TRANSACTIONS_ACTION.SUCCESS,
      payload: {
        transactions
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: GET_TODAYS_TRANSACTIONS_ACTION.FAILURE,
      payload: {
        error
      }
    };
  }
};

export const getLastTransaction = {
  request: (): StandardAction => {
    return {
      type: GET_LAST_TRANSACTION_ACTION.REQUEST,
      payload: {}
    };
  },
  success: (transaction: IMerchandiseTransaction[]): StandardAction => {
    return {
      type: GET_LAST_TRANSACTION_ACTION.SUCCESS,
      payload: {
        transactions: transaction
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: GET_LAST_TRANSACTION_ACTION.FAILURE,
      payload: {
        error
      }
    };
  }
};

export const getTransactions = {
  request: (input: string, inputType: DataEventType): StandardAction => {
    return {
      type: GET_TRANSACTIONS_ACTION.REQUEST,
      payload: {input, inputType}
    };
  },
  success: (transaction: IMerchandiseTransaction[]): StandardAction => {
    return {
      type: GET_TRANSACTIONS_ACTION.SUCCESS,
      payload: {
        transactions: transaction
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: GET_TRANSACTIONS_ACTION.FAILURE,
      payload: {
        error
      }
    };
  }
};

export const getHistoricalTransactions = {
  request: (): StandardAction => {
    return {
      type: GET_HISTORICAL_TRANSACTIONS_ACTION.REQUEST,
      payload: {
        transactions: []
      }
    };
  },
  success: (transaction: TransactionWithAdditionalData[], inputSource: string): StandardAction => {
    return {
      type: GET_HISTORICAL_TRANSACTIONS_ACTION.SUCCESS,
      payload: {
        transactions: transaction,
        inputSource
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: GET_HISTORICAL_TRANSACTIONS_ACTION.FAILURE,
      payload: {
        error
      }
    };
  }
};

export const getHistoricalTransaction = {
  request: (transactionId: string, preferredLanguage: string): StandardAction => {
    return {
      type: GET_HISTORICAL_TRANSACTION_BY_ID_ACTION.REQUEST,
      payload: {
        transactionId,
        preferredLanguage
      }
    };
  },
  success: (transaction: TransactionWithAdditionalData): StandardAction => {
    return {
      type: GET_HISTORICAL_TRANSACTION_BY_ID_ACTION.SUCCESS,
      payload: {
        selectedTransaction: transaction
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: GET_HISTORICAL_TRANSACTION_BY_ID_ACTION.FAILURE,
      payload: {
        error
      }
    };
  }
};

export const postVoidableTransactionSearch = {
  success: (transaction: IMerchandiseTransaction[]): StandardAction => {
    return {
      type: POST_VOIDABLE_TRANSACTION_SEARCH_ACTION.SUCCESS,
      payload: {
        transactions: transaction
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: POST_VOIDABLE_TRANSACTION_SEARCH_ACTION.FAILURE,
      payload: {
        error
      }
    };
  }
};

export const clearPostVoidSearchResult = {
  request: (): StandardAction => {
    return {
      type: CLEAR_POST_VOID_SEARCH_RESULT.REQUEST,
      payload: undefined
    };
  }
};

export const getPaidOutTransactions = {
  request: (input: string, inputType: DataEventType): StandardAction => {
    return {
      type: GET_PAID_OUT_TRANSACTIONS_ACTION.REQUEST,
      payload: {input, inputType}
    };
  },
  success: (transaction: ITenderControlTransaction[]): StandardAction => {
    return {
      type: GET_PAID_OUT_TRANSACTIONS_ACTION.SUCCESS,
      payload: {
        transactions: transaction
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: GET_PAID_OUT_TRANSACTIONS_ACTION.FAILURE,
      payload: {
        error
      }
    };
  }
};

export const clearPaidOutTransactionsResult = {
  request: (): StandardAction => {
    return {
      type: CLEAR_PAID_OUT_TRANSACTIONS_RESULT.REQUEST,
      payload: undefined
    };
  }
};
