import { combineReducers } from "redux";
import { reducer as form } from "redux-form";
import { reducer as modal } from "redux-modal";

import {
  authReducer as auth,
  AuthReduxState,
  tenantReducer as tenant,
  TenantReduxState
} from "@aptos-scp/scp-component-rn-auth/redux-saga";

import { ISearchAddressState, IVerifyAddressState, searchAddress, verifyAddress } from "./addressVerification";
import alertModalState, { AlertModalState } from "./alertModal";
import appAccessLock, { IAppAccessLockState } from "./appAccessLock";
import { appResources,  IAppResourcesState } from "./appResources";
import appVersionBlocked, { IAppVersionBlockedState } from "./appVersionBlocked";
import balanceInquiry, { BalanceInquiryState } from "./balanceInquiry";
import businessState, { BusinessState } from "./businessState";
import cameraScanner, { CameraScannerState } from "./cameraScanner";
import cashDrawerState, { CashDrawerState } from "./cashDrawers";
import countries,{ CountriesState } from "./countries";
import customer, { CustomerState } from "./customer";
import dataEvent, { DataEventState } from "./dataEvent";
import dataSyncStatus, { DataSyncState } from "./dataSyncStatus";
import departments, { DepartmentsState } from "./departments";
import deviceStatus, { DeviceStatusState } from "./deviceStatus";
import emailVerification, { IEmailVerificationState } from "./emailVerification";
import exchangeRate, { ExchangeRateState } from "./exchangeRates";
import feedbackNote, { FeedbackNoteState } from "./feedbackNote";
import hoursOfOperation, { HoursOfOperationState } from "./hoursOfOperation";
import i18nLocationState, { I18nLocationState } from "./i18nLocation";
import inventory, { InventoryState } from "./inventory";
import itemSelectionState, { ItemSelectionState } from "./itemSelectionState";
import loyaltyMembershipState, { LoyaltyMembershipState } from "./loyaltyMembership";
import loyaltyVoucher, { LoyaltyVoucherState } from "./loyaltyVoucher";
import modalState, { ModalState } from "./modal";
import orders, { OrdersState } from "./orders";
import pendingPayment, { PendingPaymentState } from "./pendingPayment";
import pendingTransactionCount, { PendingTransactionCountState } from "./pendingTransactionCount";
import productInquiry, { ProductInquiryState } from "./productInquiry";
import proximityInventory, { ProximityInventoryState } from "./proximityInventory";
import proximitySearch, { ProximitySearchState } from "./proximitySearch";
import receipt, { ReceiptState } from "./receipt";
import remoteCall, { RemoteCallState } from "./remoteCall";
import retailLocations, { RetailLocationsState } from "./retailLocations";
import returnState, { ReturnState } from "./return";
import sceneTitlesState, { SceneTitlesState } from "./sceneTitles";
import selfCheckoutState, { SelfCheckoutState } from "./selfCheckoutMode";
import settings, { SettingsState } from "./settings";
import displayToastState, { DisplayToastState } from "./displayToast";
import subscriptionFrequencies, { SubscriptionFrequenciesState } from "./subscriptionFrequencies";
import suspendedTransactions, { SuspendedTransactionsState } from "./suspendedTransactions";
import taxAuthorityForExemption, { TaxAuthorityForExemptionState } from "./taxAuthoritySelection";
import taxRefund, { TaxRefundState } from "./taxRefund";
import terminalSyncState, { TerminalSyncState } from "./terminalSync";
import timersState, { TimersState } from "./timers";
import transactions, { TransactionsState } from "./transactions";
import uiState, { UiState } from "./uiState";
import userNotification, { IUserNotificationState } from "./userNotification";
import valueCertificate, { ValueCertificateState } from "./valueCertificate";
import netConnectedStatus, { NetConnectedState } from "./netConnectedStatus";

export { AlertModalState } from "./alertModal";
export { IUserNotificationState } from "./userNotification";
export { BalanceInquiryState } from "./balanceInquiry";
export { BusinessState } from "./businessState";
export { CameraScannerState } from "./cameraScanner";
export { CashDrawerState } from "./cashDrawers";
export { CustomerState } from "./customer";
export {
  AttributeMap,
  BaseVariants,
  getCombinationFromVariants,
  ProductInquiryState,
  Variants,
  SecondaryAttributeMap
} from "./productInquiry";
export { DataEventState } from "./dataEvent";
export { DepartmentsState } from "./departments";
export { DeviceStatusState } from "./deviceStatus";
export { FeedbackNoteState } from "./feedbackNote";
export { InventoryState } from "./inventory";
export { ISelectedRedemptions, LoyaltyMembershipState } from "./loyaltyMembership";
export { LoyaltyVoucherState } from "./loyaltyVoucher";
export { ModalState } from "./modal";
export { OrdersState } from "./orders";
export { ReceiptState } from "./receipt";
export { RemoteCallState } from "./remoteCall";
export { RetailLocationsState } from "./retailLocations";
export { IAppResourcesState } from "./appResources";
export { SettingsState } from "./settings";
export { TaxRefundState } from "./taxRefund";
export { TerminalSyncState } from "./terminalSync";
export { TimersState } from "./timers";
export { TransactionsState } from "./transactions";
export { SuspendedTransactionsState } from "./suspendedTransactions";
export { SelfCheckoutState } from "./selfCheckoutMode";
export { TaxAuthorityForExemptionState } from "./taxAuthoritySelection";
export { ReturnState } from "./return";
export { SubscriptionFrequenciesState } from "./subscriptionFrequencies";
export { IAppAccessLockState } from "./appAccessLock";
export { IAppVersionBlockedState } from "./appVersionBlocked";
export { ProximitySearchState } from "./proximitySearch";
export { ValueCertificateState } from "./valueCertificate";
export {
  UI_MODE_ASSIGN_MEMBER_TO_TRANSACTION,
  UI_MODE_ASSIGN_SALESPERSON_TO_TRANSACTION,
  UI_MODE_BALANCE_INQUIRY,
  UI_MODE_BALANCE_INQUIRY_TENDER_SELECTION,
  UI_MODE_CHANGE_PASSWORD,
  UI_MODE_COUPON_SCREEN,
  UI_MODE_CUSTOMER_SEARCH_SCREEN,
  UI_MODE_DISCOUNT_TYPE_SELECTION,
  UI_MODE_FATAL_ERROR,
  UI_MODE_GIFTCARD_ISSUE,
  UI_MODE_GIFT_CERTIFICATE_ISSUE,
  UI_MODE_INFORMATION_TERMINAL,
  UI_MODE_ITEM_NOT_FOUND,
  UI_MODE_ITEM_NOT_FOUND_RETRY_ENTRY,
  UI_MODE_ITEM_SELECTION,
  UI_MODE_ORDER_REFERENCE_INQUIRY,
  UI_MODE_PAID_OPERATION,
  UI_MODE_PASSWORD_CHANGE,
  UI_MODE_PRICE_CHANGE,
  UI_MODE_PRINT_LAST_TRANSACTION,
  UI_MODE_PRODUCT_DETAIL,
  UI_MODE_PRODUCT_INQUIRY,
  UI_MODE_PRODUCT_SCREEN,
  UI_MODE_QUANTITY_CHANGE,
  UI_MODE_REASON_CODE,
  UI_MODE_RECEIPT_PRINTER_CHOICE,
  UI_MODE_RETURN_WITH_TRANSACTION,
  UI_MODE_RETURN_WITH_TRANSACTION_TRANSACTION_SEARCH,
  UI_MODE_SCO_POPUP,
  UI_MODE_SEARCH_POST_VOIDABLE_TRANSACTION,
  UI_MODE_SEARCH_SUSPENDED_TRANSACTIONS,
  UI_MODE_STOPPED_ITEM,
  UI_MODE_STORE_OPERATION,
  UI_MODE_SUBSCRIPTION_TOKEN,
  UI_MODE_SUSPEND_TRANSACTION,
  UI_MODE_TENDERING,
  UI_MODE_THANKYOU_SCREEN,
  UI_MODE_TILL_OPERATION,
  UI_MODE_TRANSACTION_HISTORY,
  UI_MODE_VOID_TRANSACTION,
  UI_MODE_WAITING_FOR_INPUT,
  UI_MODE_WAITING_TO_CLEAR_TRANSACTION,
  UI_MODE_WAITING_TO_CLOSE,
  UI_MODE_ZERO_PRICED,
  UI_MODE_VALUE_CERTIFICATE_SEARCH,
  UiState
} from "./uiState";

export interface AppState {
  alertModalState: AlertModalState;
  appAccessLock: IAppAccessLockState;
  appVersionBlocked: IAppVersionBlockedState;
  auth: AuthReduxState;
  balanceInquiry: BalanceInquiryState;
  businessState: BusinessState;
  cameraScanner: CameraScannerState;
  cashDrawerState: CashDrawerState;
  countries: CountriesState;
  customer: CustomerState;
  dataEvent: DataEventState;
  dataSyncStatus: DataSyncState;
  departments: DepartmentsState;
  deviceStatus: DeviceStatusState;
  feedbackNote: FeedbackNoteState;
  emailVerification: IEmailVerificationState;
  inventory: InventoryState;
  orders: OrdersState;
  itemSelectionState: ItemSelectionState;
  selfCheckoutState: SelfCheckoutState;
  loyaltyMembershipState: LoyaltyMembershipState;
  loyaltyVoucher: LoyaltyVoucherState;
  modalState: ModalState;
  netConnectedStatus: NetConnectedState;
  pendingTransactionCount: PendingTransactionCountState;
  productInquiry: ProductInquiryState;
  receipt: ReceiptState;
  remoteCall: RemoteCallState;
  retailLocations: RetailLocationsState;
  sceneTitlesState: SceneTitlesState;
  searchAddress: ISearchAddressState;
  settings: SettingsState;
  displayToastState: DisplayToastState;
  suspendedTransactions: SuspendedTransactionsState;
  taxAuthorityForExemption: TaxAuthorityForExemptionState;
  validTaxAuthorities: TaxAuthorityForExemptionState[];
  taxRefund: TaxRefundState;
  tenant: TenantReduxState;
  terminalSyncState: TerminalSyncState;
  timersState: TimersState;
  transactions: TransactionsState;
  uiState: UiState;
  userNotification: IUserNotificationState;
  verifyAddress: IVerifyAddressState;
  returnState: ReturnState;
  appResources: IAppResourcesState;
  subscriptionFrequencies: SubscriptionFrequenciesState;
  pendingPayment: PendingPaymentState;
  exchangeRate: ExchangeRateState;
  proximitySearch: ProximitySearchState;
  proximityInventory: ProximityInventoryState;
  hoursOfOperation: HoursOfOperationState;
  valueCertificate: ValueCertificateState;
  i18nLocationState: I18nLocationState;
}

export default combineReducers({
  alertModalState,
  appAccessLock,
  appVersionBlocked,
  auth,
  balanceInquiry,
  businessState,
  cameraScanner,
  cashDrawerState,
  customer,
  countries,
  dataEvent,
  dataSyncStatus,
  departments,
  deviceStatus,
  emailVerification,
  feedbackNote,
  inventory,
  itemSelectionState,
  selfCheckoutState,
  form,
  modal,
  appResources,
  loyaltyMembershipState,
  loyaltyVoucher,
  orders,
  modalState,
  netConnectedStatus,
  pendingTransactionCount,
  productInquiry,
  receipt,
  remoteCall,
  retailLocations,
  sceneTitlesState,
  searchAddress,
  settings,
  displayToastState,
  suspendedTransactions,
  taxAuthorityForExemption,
  taxRefund,
  tenant,
  terminalSyncState,
  timersState,
  transactions,
  uiState,
  userNotification,
  verifyAddress,
  returnState,
  subscriptionFrequencies,
  pendingPayment,
  exchangeRate,
  proximitySearch,
  proximityInventory,
  hoursOfOperation,
  valueCertificate,
  i18nLocationState
});
