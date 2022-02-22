import { LOG_OFF_EVENT } from "@aptos-scp/scp-component-store-selling-features";

import { SCROLL_UPDATE, UPDATE_FEATURE_ACTION_BUTTONS, UPDATE_UI_MODE, UPDATE_UI_STATE } from "../actions";
import { IFeatureActionButtonProps } from "../components/common/utilities";
import { RequestState } from "./reducers";

export const UI_MODE_FATAL_ERROR: string = "FatalError";
export const UI_MODE_ITEM_NOT_FOUND: string = "ItemNotFound";
export const UI_MODE_ITEM_NOT_FOUND_RETRY_ENTRY: string = "ItemNotFoundRetryEntry";
export const UI_MODE_PRICE_CHANGE: string = "PriceChange";
export const UI_MODE_QUANTITY_CHANGE: string = "QuantityChange";
export const UI_MODE_TENDERING: string = "Tendering";
export const UI_MODE_SUSPEND_TRANSACTION: string = "SuspendTransaction";
export const UI_MODE_VOID_TRANSACTION: string = "VoidTransaction";
export const UI_MODE_WAITING_TO_CLEAR_TRANSACTION: string = "WaitingToClearTransaction";
export const UI_MODE_WAITING_TO_CLOSE: string = "WaitingToClose";
export const UI_MODE_ZERO_PRICED: string = "ZeroPriced";
export const UI_MODE_ORDER_REFERENCE_INQUIRY: string = "OrderReferenceInquiry";
export const UI_MODE_PASSWORD_CHANGE: string = "PasswordChange";
export const UI_MODE_PRODUCT_DETAIL: string = "ProductDetail";
export const UI_MODE_PRODUCT_SCREEN: string = "ProductScreen";
export const UI_MODE_PRODUCT_INQUIRY: string = "ProductInquiry";
export const UI_MODE_PRINT_LAST_TRANSACTION: string = "PrintLastTransaction";
export const UI_MODE_BALANCE_INQUIRY: string = "BalanceInquiry";
export const UI_MODE_BALANCE_INQUIRY_TENDER_SELECTION: string = "BalanceInquiryTenderSelection";
export const UI_MODE_TRANSACTION_HISTORY: string = "TransactionHistory";
export const UI_MODE_WAITING_FOR_INPUT: string = "WaitingForInput";
export const UI_MODE_ITEM_SELECTION: string = "ItemSelection";
export const UI_MODE_GIFTCARD_ISSUE: string = "GiftCardIssue";
export const UI_MODE_GIFT_CERTIFICATE_ISSUE: string = "GiftCertificateIssue";
export const UI_MODE_DISCOUNT_TYPE_SELECTION: string = "DiscountTypeSelection";
export const UI_MODE_ASSIGN_SALESPERSON_TO_TRANSACTION: string = "AssignSalespersonToTransaction";
export const UI_MODE_SEARCH_SUSPENDED_TRANSACTIONS: string = "SearchSuspendedTransactions";
export const UI_MODE_SEARCH_POST_VOIDABLE_TRANSACTION: string = "SearchPostVoidableTransaction";
export const UI_MODE_INFORMATION_TERMINAL: string = "InformationTerminal";
export const UI_MODE_CHANGE_PASSWORD: string = "ChangePassword";
export const UI_MODE_STORE_OPERATION: string = "StoreOperation";
export const UI_MODE_STOPPED_ITEM: string = "StoppedItem";
export const UI_MODE_REASON_CODE: string = "ReasonCode";
export const UI_MODE_COUPON_SCREEN: string = "CouponScreen";
export const UI_MODE_TILL_OPERATION: string = "TillOperation";
export const UI_MODE_PAID_OPERATION = "PaidOperation";
export const UI_MODE_RECEIPT_PRINTER_CHOICE: string = "ReceiptPrinterChoice";
export const UI_MODE_RETURN_WITH_TRANSACTION: string = "ReturnWithTransaction";
export const UI_MODE_RETURN_WITH_TRANSACTION_TRANSACTION_SEARCH: string = "ReturnWithTransactionTransactionSearch";
export const UI_MODE_NON_MERCH = "NonMerch";
export const UI_MODE_CUSTOMER_ORDER_PICKUP: string = "CustomerOrderPickup";
export const UI_MODE_CUSTOMER_SEARCH_SCREEN: string = "CustomerSearchScreen";
export const UI_MODE_CUSTOMER_ORDER_CANCEL: string = "CustomerOrderCancel";
export const UI_MODE_SUBSCRIPTION_TOKEN: string = "SubscriptionToken";
export const UI_MODE_VALUE_CERTIFICATE_SEARCH: string = "ValueCertificateSearch";

// SCO UI MODES
export const UI_MODE_ASSIGN_MEMBER_TO_TRANSACTION: string = "AssignMemberToTransaction";
export const UI_MODE_SCO_POPUP: string = "SCOPopup";
export const UI_MODE_THANKYOU_SCREEN: string = "ThankYou";

export interface UiState extends RequestState {
  featureActionButtonProps: IFeatureActionButtonProps;
  logicalState: string;
  events: string[];
  mode: string;
  scannerEnabled: boolean;
  isScrolling: boolean;
  contentOffset: { x: number, y: number };
  isAllowed(eventType: string): boolean;
}

const INITIAL_STATE: UiState = {
  featureActionButtonProps: {} as IFeatureActionButtonProps,
  logicalState: undefined,
  events: [],
  mode: undefined,
  scannerEnabled: true,
  isScrolling: false,
  contentOffset: undefined,
  isAllowed(eventType: string): boolean {
    return this.events && this.events.indexOf(eventType) > -1;
  }
};

export default (state: UiState = INITIAL_STATE, action: any): UiState => {
  switch (action.type) {
    case UPDATE_FEATURE_ACTION_BUTTONS.REQUEST:
    case UPDATE_UI_MODE.REQUEST:
    case UPDATE_UI_STATE.REQUEST:
      // For now, the request and success will be the same.  We might need to tie other processing to UI state changes,
      // so this might change later.
    case UPDATE_UI_MODE.SUCCESS:
    case UPDATE_UI_STATE.SUCCESS:
      // reset the scrolling status if there is no transaction in progress
      return Object.assign({}, state, action.payload,
          state.isScrolling && state.isAllowed(LOG_OFF_EVENT) ? { isScrolling: false, contentOffset: undefined } : {});
    case SCROLL_UPDATE.REQUEST:
      const contentOffset = action.payload.contentOffset;
      if (contentOffset.y > 0 && !state.isScrolling) {
        return Object.assign({}, state, action.payload, { isScrolling: true });
      } else if (contentOffset.y <= 0 && state.isScrolling) {
        return Object.assign({}, state, action.payload, { isScrolling: false });
      }
      return Object.assign({}, state, action.payload);
    case UPDATE_UI_MODE.FAILURE:
    case UPDATE_UI_STATE.FAILURE:
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
};
