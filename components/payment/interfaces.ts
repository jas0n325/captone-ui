import { Money } from "@aptos-scp/scp-component-business-core";
import {
  IConfigurationManager,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  IDisplayInfo,
  ILoyaltyMembershipActivity,
  ITenderGroup,
  ReceiptCategory
} from "@aptos-scp/scp-component-store-selling-features";
import { ExchangeRate } from "@aptos-scp/scp-types-currency-conversion";

import { ActionCreator } from "../../actions/actions";
import { BusinessState } from "../../reducers/businessState";
import { PendingPaymentMode } from "../../reducers/pendingPayment";
import { RenderSelectOptions } from "../common/FieldValidation";
import { NavigationProp } from "../StackNavigatorParams";
import {
  IOriginalTender,
  IOriginalTransactionDetails,
  IOriginalTransactionRefundReference,
  ITenderType
} from "./PaymentDevicesUtils";

export interface NonIntegratedPaymentProps {
  onCancel: () => void;
  isTendering: boolean;
  originalEventType: string;
  requiredInputs: any[];
  //When multiple nonIntegratedPaymentScreens are used in voidTran, unique prop is required
  uiId: number;
  /**
   * The name of the screen containing the NonIntegratedPayment component.
   * Will default to nonIntegratedAuthorization if not provided.
   */
  originalScreen?: string;
}

export interface PaymentScreenProps {
  /**
   * required for Tablet form factor
   */
  appLogo?: any;
  onSuspendTransaction?: () => void;
  nonIntegratedPayment?: boolean;
  inputs?: UiInput[];
  originalEventType?: string;
  isTendering?: boolean;
  requiredInputs?: any[];
  tenderVoidMessage?: string;
  isInitialCashDrawerOnStartup?: boolean;
}

export interface OfflineAuthorizationProps {
  onCancel: () => void;
  isGiftCardIssue: boolean;
}

export interface TenderPromptRulesProps {
  onSave: (referenceNumber: string) => void;
  onCancel: () => void;
  requiredInputs: any[];
}

export interface CommonPaymentProps {
  sceneTitle: ActionCreator;
  activeTenders: ITenderType[];
  allowsRefundOriginalTenders: ITenderType[];
  activeTenderGroups: ITenderGroup[];
  balanceDue: string;
  currency: string;
  displayInfo: IDisplayInfo;
  hasDonations: boolean;
  onLoyaltyVoucher: (tenderName: string, pluralTenderName: string) => void;
  onApplyPayment: (
    tenderAuthCategory: string,
    tenderId: string,
    tenderAmount?: string,
    originalTenderAmount?: string,
    softMaxProceed?: boolean,
    valueCertificateNumber?: string,
    references?: IOriginalTransactionRefundReference[],
    giftCardRefund?: boolean,
    cardNumber?: string,
    cardSource?: string,
    useSwipe?: boolean,
    existingCard?: boolean,
    tenderType?: string,
    tenderSubType?: string,
    foreignTender?: IForeignTender
  ) => void;
  onApplyPaymentDeviceSelected: (deviceId: string) => void;
  deviceSelectTenderAuthCategory: string;
  primaryPaymentDevices: RenderSelectOptions[];
  nonIntegratedPaymentDevices: RenderSelectOptions[];
  primaryGiftDevices: RenderSelectOptions[];
  walletPaymentDevices: RenderSelectOptions[];
  resetPaymentDeviceSelection: () => void;
  stateValues: Map<string, any>;
  businessState: BusinessState;
  loyaltyMembershipActivities: ILoyaltyMembershipActivity[];
  showPaymentDeviceSelection: boolean;
  showOfflineOptions: boolean;
  showRetryAuthorization: boolean;
  handleOfflineOptions: () => {};
  handleCancelOfflineAuthorization: () => void;
  handleRetryAuthorization: () => void;
  onEditTransaction: () => void;
  uiInteractionDetected: () => void;
  disablePaymentScreenButtons: boolean;
  configuration: IConfigurationManager;
  tenderVoidMessage?: string;
  originalTransactionDetails: IOriginalTransactionDetails[];
  originalTenders: IOriginalTender[];
  originalUnreferencedTenders: IOriginalTender[];
  handleTaxCustomerAssignment: () => void;
  receiptCategoryForReturnWithTransaction: ReceiptCategory;
  updatePendingPayment: ActionCreator;
  pendingPaymentMode: PendingPaymentMode;
  exchangeRates: ExchangeRate[];
  getConvertedAmountFromBalanceDue: (
    currency: string,
    exchangeRate: ExchangeRate
  ) => Money;
  onVoidTransaction: () => void;
  startExchangeRateEntry: (exchangeRate: ExchangeRate) => void;
  navigation: NavigationProp;
}

export interface IForeignTender {
  foreignTenderAmount?: Money;
  exchangeRateValue?: string;
  exchangeRateManuallyEntered?: boolean;
}

export interface IIssueChangeOptions {
  inputs: UiInput[];
  isFallback: boolean;
  requiredInput: string;
}
