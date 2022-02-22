import { ExchangeRate } from "@aptos-scp/scp-types-currency-conversion";

import {APP_SETTING_GET_EXCHANGE_RATES_ACTION} from "../actions";
import { RequestState } from "./reducers";

export interface ExchangeRateState extends RequestState {
  exchangeRates: ExchangeRate[];
}

const INITIAL_STATE: ExchangeRateState = {
  inProgress: false,
  exchangeRates: undefined,
  error: undefined
};

export default (state: ExchangeRateState = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case APP_SETTING_GET_EXCHANGE_RATES_ACTION.REQUEST:
      return Object.assign({}, INITIAL_STATE, { inProgress: true });
    case APP_SETTING_GET_EXCHANGE_RATES_ACTION.SUCCESS:
    case APP_SETTING_GET_EXCHANGE_RATES_ACTION.FAILURE:
      return Object.assign({}, state, action.payload, { inProgress: false });
    default:
      return state;
  }
};
