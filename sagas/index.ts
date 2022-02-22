import { SagaIterator } from "redux-saga";
import { all, fork } from "redux-saga/effects";

import {
  watchDiscoverTenant,
  watchLogin,
  watchLogout,
  watchProfile
} from "@aptos-scp/scp-component-rn-auth/redux-saga";

import { watchAddressVerification } from "./addressVerification";
import { watchDismissAlertModalRequest, watchShowAlertModalRequest } from "./alertModal";
import { watchAppAccessLockRequest } from "./appAccessLock";
import { watchAppResouces } from "./appResources";
import { watchAppVersionBlockedRequest } from "./appVersionBlocked";
import { watchBusinessOperation } from "./businessState";
import { watchShowCameraScanner } from "./cameraScanner";
import { watchCashDrawerUpdate, watchCashDrawerValidation } from "./cashDrawers";
import { watchLoadCountries } from "./countries";
import { watchCustomerSearch } from "./customer";
import { startWatchOnDataSyncStatusNotifications } from "./dataSyncStatus";
import {watchGetDepartments} from "./departments";
import {startWatchOnDeviceNotifications, watchEventsForDevice} from "./deviceNotification";
import { watchDeviceServiceEvent } from "./deviceService";
import { startWatchOnDeviceStatusNotifications } from "./deviceStatusNotification";
import { startWatchOnDeviceUserNotifications } from "./deviceUserNotification";
import { startWatchOnDomainNotification } from "./domainNotification";
import { watchEmailVerificationWarning } from "./emailVerification";
import { watchExchangeRates } from "./exchangeRates";
import { watchHoursOfOperation } from "./hoursOfOperation";
import { watchLoadI18nLocation } from "./i18nLocation";
import { watchInventory } from "./inventory";
import { watchCalculateLoyaltyMembership, watchLoadRewardReasons } from "./loyaltyMembership";
import { watchLoyaltySearch } from "./loyaltyVoucher";
import {
  watchGatherOrderItemSelectionRequest,
  watchOrders,
  watchUpdateOrderItemQuantityRequest,
  watchUpdateOrderItemSelectionRequest
} from "./orders";
import { startWatchOnPaymentNotifications } from "./paymentNotification";
import { watchOnPendingPayment } from "./pendingPayment";
import { startWatchOnPendingTransactionNotifications } from "./pendingTransactionCount";
import { watchproductInquiry, watchproductInquiryVariants } from "./productInquiry";
import { watchProximityInventory } from "./proximityInventory";
import { watchGetRetailLocationsforProximity } from "./proximitySearch";
import {
  watchGetConfiguredPrinters,
  watchGetPrintersFromSearch,
  watchGetReceiptTypes,
  watchGetTaxCustomer,
  watchGetTaxCustomerFromHistorical
} from "./receipt";
import { startWatchOnRemoteCall } from "./remoteCall";
import { watchDataEvent } from "./resolveDataEvent";
import { watchGetRetailLocation, watchGetRetailLocations } from "./retailLocations";
import {
  watchGatherReturnedQuantitiesRequest,
  watchRecordEnteredReturnItem,
  watchReturnItemImagesRequest,
  watchUpdateReturnAvailableItemQuantitiesRequest,
  watchUpdateReturnItemQuantityRequest
} from "./return";
import {
  watchGetLastTransactionNumber, watchInitAppSettings,
  watchPrepareTerminalSettingsChange, watchSetTenantSettings, watchSetTerminalSettings
} from "./settings";
import { watchGetSubscriptionFrequencies } from "./subscriptionFrequencies";
import { watchGetSuspendedTransactions } from "./suspendedTransactions";
import { watchLoadTaxAuthorities } from "./taxAuthoritySelection";
import { startWatchTimerReduxAction } from "./timers";
import {
  watchGetHistoricalTransactionById,
  watchGetHistoricalTransactions,
  watchGetPaidOutTransactions,
  watchGetTodaysTransactions,
  watchGetTransactions,
  watchLastTransaction,
  watchPostVoidableTransactionSearch
} from "./transactions";
import { watchUpdateUiState, watchUpdateUiStateEvents } from "./updateUiState";
import { startWatchOnUserNotification } from "./userNotification";
import { watchValueCertificateSearch } from "./valueCertificate";
import { startWatchOnNetConnectionStatusNotifications } from "./netConnectedStatus";


export default function* root(): SagaIterator {
  yield all([
    fork(watchDiscoverTenant),
    fork(watchLogin),
    fork(watchLogout),
    fork(watchProfile),
    fork(watchDeviceServiceEvent),
    fork(watchBusinessOperation),
    fork(watchShowCameraScanner),
    fork(watchCustomerSearch),
    fork(watchproductInquiry),
    fork(watchproductInquiryVariants),
    fork(watchInitAppSettings),
    fork(watchLoadCountries),
    fork(watchPrepareTerminalSettingsChange),
    fork(watchSetTenantSettings),
    fork(watchGetLastTransactionNumber),
    fork(watchSetTerminalSettings),
    fork(watchGetRetailLocations),
    fork(watchGetRetailLocation),
    fork(watchDataEvent),
    fork(watchEventsForDevice),
    fork(watchGetDepartments),
    fork(watchGetConfiguredPrinters),
    fork(watchGetPrintersFromSearch),
    fork(watchGetReceiptTypes),
    fork(watchGetTaxCustomer),
    fork(watchGetHistoricalTransactionById),
    fork(watchGetHistoricalTransactions),
    fork(watchGetTransactions),
    fork(watchGetTodaysTransactions),
    fork(watchLastTransaction),
    fork(watchUpdateUiState),
    fork(watchUpdateUiStateEvents),
    fork(startWatchOnDataSyncStatusNotifications),
    fork(startWatchOnNetConnectionStatusNotifications),
    fork(startWatchOnPendingTransactionNotifications),
    fork(startWatchOnDeviceNotifications),
    fork(startWatchOnDeviceStatusNotifications),
    fork(startWatchOnPaymentNotifications),
    fork(startWatchOnRemoteCall),
    fork(startWatchOnUserNotification),
    fork(startWatchOnDeviceUserNotifications),
    fork(startWatchOnDomainNotification),
    fork(watchGetSuspendedTransactions),
    fork(watchAddressVerification),
    fork(watchEmailVerificationWarning),
    fork(startWatchTimerReduxAction),
    fork(watchPostVoidableTransactionSearch),
    fork(watchGetPaidOutTransactions),
    fork(watchLoyaltySearch),
    fork(watchShowAlertModalRequest),
    fork(watchDismissAlertModalRequest),
    fork(watchCashDrawerValidation),
    fork(watchCashDrawerUpdate),
    fork(watchCalculateLoyaltyMembership),
    fork(watchLoadRewardReasons),
    fork(watchLoadTaxAuthorities),
    fork(watchInventory),
    fork(watchGatherReturnedQuantitiesRequest),
    fork(watchUpdateReturnItemQuantityRequest),
    fork(watchUpdateReturnAvailableItemQuantitiesRequest),
    fork(watchRecordEnteredReturnItem),
    fork(watchOrders),
    fork(watchReturnItemImagesRequest),
    fork(watchAppResouces),
    fork(watchGatherOrderItemSelectionRequest),
    fork(watchUpdateOrderItemSelectionRequest),
    fork(watchGetSubscriptionFrequencies),
    fork(watchOnPendingPayment),
    fork(watchAppAccessLockRequest),
    fork(watchAppVersionBlockedRequest),
    fork(watchGetRetailLocationsforProximity),
    fork(watchProximityInventory),
    fork(watchGetTaxCustomerFromHistorical),
    fork(watchExchangeRates),
    fork(watchHoursOfOperation),
    fork(watchValueCertificateSearch),
    fork(watchUpdateOrderItemQuantityRequest),
    fork(watchLoadI18nLocation)
  ]);
}
