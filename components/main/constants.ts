import { Customer, IItemDisplayLine, ReceiptCategory } from "@aptos-scp/scp-component-store-selling-features";

import { NavigationProp } from "../StackNavigatorParams";

export interface MainComponentCommonProps {
  appLogo: any;
  canSelectItems: boolean;
  closingTransaction: boolean;
  customer: Customer;
  customerBannerButtonClickable: boolean;
  customerBannerButtonVisible: boolean;
  mixedBasketAllowed: boolean;
  printReceipt: boolean;
  receiptCategory: ReceiptCategory;
  shouldDisplayCustomerNumber: boolean;
  shouldDisplayLoyaltyIndicator: boolean;
  showOfflineOptions: boolean;
  showRetryAuthorization: boolean;
  showPartialAuthorizationApproval: boolean;
  transactionVoided: boolean;
  totalTransactionIsAllowed: boolean;
  isLoyaltyDiscountEnable: boolean;
  handleCancelNonEmptyReturnTransaction: () => void;
  handleCancelOfflineAuthorization: () => void;
  handleOfflineOptions: () => void;
  handleOnTotalPressed: () => void;
  handleRetryAuthorization: () => void;
  handleReturnReasonChange: (line: IItemDisplayLine) => void;
  onVoidTransaction: () => void;
  onCustomerUpdate: (isTransactionStarting: boolean) => void;
  onEnterReturnMode: () => void;
  onExitReturnMode: () => void;
  onIssueGC:
      (cardNumber: string, amount: string, inputSource: string, useSwipe?: boolean, existingCard?: boolean) => void;
  onIssueGCert:
      (cardNumber: string, amount: string, inputSource: string) => void;
  onMenuToggle: () => void;
  onResetAfterReceiptPrint: () => void;
  onSuspendTransaction: () => void;
  navigation: NavigationProp;
}

export const RADIX = 10;
export const DEFAULT_DECIMAL_PRECISION = 2;
