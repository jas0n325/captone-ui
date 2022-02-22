import {
  AppState,
  BusinessState,
  OrdersState,
  ReceiptState,
  ReturnState,
  SettingsState,
  TransactionsState,
  UiState
} from "../reducers";
import { SelfCheckoutState } from "../reducers/selfCheckoutMode";


export function getAppSettingsState(state: AppState): SettingsState {
  return state.settings;
}

export function getBusinessState(state: AppState): BusinessState {
  return state.businessState;
}

export function getSelfCheckoutState(state: AppState): SelfCheckoutState {
  return state.selfCheckoutState;
}

export function getReceiptState(state: AppState): ReceiptState {
  return state.receipt;
}

export function getReturnState(state: AppState): ReturnState {
  return state.returnState;
}

export function getTransactionsState(state: AppState): TransactionsState {
  return state.transactions;
}

export function getUiState(state: AppState): UiState {
  return state.uiState;
}

export function getOrdersState(state: AppState): OrdersState   {
  return state.orders;
}
