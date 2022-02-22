import * as React from "react";
import { Alert, InteractionManager } from "react-native";
import Orientation from "react-native-orientation-locker";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import { Money } from "@aptos-scp/scp-component-business-core";
import { CurrencyConverter } from "@aptos-scp/scp-component-currency-conversion";
import {
  IConfigurationValues,
  ITransaction,
  QualificationError,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  APPLY_SUBSCRIPTION_AUTHORIZATION_TOKEN_EVENT,
  APPLY_TENDER_EVENT,
  CAPTURE_LOTTERY_CODE_EVENT,
  Customer,
  EXIT_ATTENDANT_MODE_EVENT,
  I18nLocationValues,
  IDisplayInfo,
  IItemDisplayLine,
  ILoyaltyMembershipActivity,
  ILoyaltyVoucher,
  IN_MERCHANDISE_TRANSACTION,
  IN_MERCHANDISE_TRANSACTION_WAITING,
  isValueCertificateSearchEnabled,
  ITaxIdentifier,
  ITEM_CANCEL_LINE_TYPE,
  ITEM_RETURN_LINE_TYPE,
  ITenderDisplayLine,
  ITenderLine,
  IValueCertificateResult,
  LotteryVoidDescription,
  LotteryVoidReason,
  MERCHANDISE_TRANSACTION_TYPE,
  OPEN_CASH_DRAWER_EVENT,
  ReceiptCategory,
  SSF_TENDER_REFERENCE_DATA_MISSING_I18N_CODE,
  START_EXCHANGE_RATE_ENTRY_EVENT,
  SubscriptionTokenSessionState,
  TaxCustomer,
  TAX_CUSTOMER_LINE_TYPE,
  TenderAuthCategory,
  TenderAuthorizationState,
  TimerUpdateType,
  UiInputKey,
  VOID_TRANSACTION_EVENT,
  VOID_TAX_REFUND_LINE_TYPE,
  IChangeInputOptions,
  TENDER_CHANGE_EVENT,
  TENDER_CHANGE_FALLBACK_EVENT,
  TENDER_CHANGE_CANCEL_EVENT,
  VOID_DONATION_EVENT } from "@aptos-scp/scp-component-store-selling-features";
import {
  IMerchandiseTransaction,
  IReceiptLine,
  isReceiptLine,
  ITaxCustomerLine,
  ITransactionLine,
  LineType,
  LoyaltyActivityType,
  MerchandiseTransactionClosingState,
  MerchandiseTransactionTradeType
} from "@aptos-scp/scp-types-commerce-transaction";
import { ExchangeRate } from "@aptos-scp/scp-types-currency-conversion";
import { TransactionWithAdditionalData } from "@aptos-scp/scp-types-ss-transaction-history";
import { ValueCertSubType } from "@aptos-scp/scp-types-commerce-devices";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  alert,
  AlertRequest,
  businessOperation,
  dismissAlertModal,
  getTaxCustomer,
  sceneTitle,
  updatePendingPayment,
  updateTimers,
  updateUiMode
} from "../../actions";
import {
  AppState,
  BusinessState,
  RemoteCallState,
  RetailLocationsState,
  UiState,
  UI_MODE_RECEIPT_PRINTER_CHOICE,
  UI_MODE_SUSPEND_TRANSACTION,
  UI_MODE_TENDERING,
  UI_MODE_VOID_TRANSACTION,
  UI_MODE_WAITING_TO_CLEAR_TRANSACTION,
  UI_MODE_WAITING_TO_CLOSE
} from "../../reducers";
import { PendingPaymentMode } from "../../reducers/pendingPayment";
import { UI_MODE_CUSTOMER_SEARCH_SCREEN } from "../../reducers/uiState";
import Theme from "../../styles";
import { AlertModalButton } from "../common/AlertModal";
import BaseView from "../common/BaseView";
import { RenderSelectOptions } from "../common/FieldValidation";
import {
  appIsWaitingForSignature,
  displayLinesHasType,
  getCustomerDetailsThresholdValdiation,
  getGiftCertificateTenderIdFromCashDrawerState,
  getI18nLocation,
  getTaxationValdiation,
  getTaxidentifierValdiation,
  ICustomerValidation,
  isFranceLocation,
  ITaxationValidation,
  ITaxIdentifierValidation,
  printAmount,
  shouldOpenGiftCertificateIssuance,
  shouldOpenSignatureScreen
} from "../common/utilities";
import {
  getReasonListType,
  getReasonOptions
} from "../common/utilities/configurationUtils";
import { popAndReplace, popTo } from "../common/utilities/navigationUtils";
import { shouldCallReceiptSummary } from "../giftCard/GiftCardUtilities";
import { ITransactionInfo } from "../receipt/receiptFlow";
import { createFromTransaction } from "../receipt/receiptFlow/utils";
import { getCurrentRouteNameWithNavigationRef } from "../RootNavigation";
import { NavigationScreenProps } from "../StackNavigatorParams";
import BasePaymentScreen, {
  BasePaymentScreenDispatchProps,
  BasePaymentScreenProps,
  BasePaymentScreenState,
  BasePaymentScreenStateProps
} from "./BasePaymentScreen";
import { CommonPaymentProps, IForeignTender, PaymentScreenProps } from "./interfaces";
import {
  beginProgressTenderAuthorization,
  businessEventCompletedWithError,
  businessEventCompletedWithoutError,
  completedTenderAuthorization,
  getOriginalTenders,
  getOriginalTransactionDetails,
  getOriginalUnreferencedTenders,
  getPaymentDevicesAsRenderSelect,
  IOriginalTender,
  IOriginalTransactionDetails,
  IOriginalTransactionRefundReference,
  isRefund,
  isValueCertificatePartialRedeemEnabled,
  tenderAuthorizationInProgress
} from "./PaymentDevicesUtils";
import PaymentPhone, { PaymentPhoneProps } from "./phone/Payment";
import PaymentTablet, { PaymentTabletProps } from "./tablet/Payment";
import { isCashDrawerAction } from "../common/utilities/tillManagementUtilities";

interface StateProps extends BasePaymentScreenStateProps {
  isSuspendTransactionVisible: boolean;
  isSuspendTransactionEnabled: boolean;
  isVoidTransactionVisible: boolean;
  isVoidTransactionEnabled: boolean;
  loyaltyMembershipActivities: ILoyaltyMembershipActivity[];
  remoteCall: RemoteCallState;
  uiState: UiState;
  displayInfo: IDisplayInfo;
  taxCustomer: TaxCustomer;
  retailLocations: RetailLocationsState;
  itemDisplayLines: IItemDisplayLine[];
  returnTransaction: IMerchandiseTransaction;
  isReprintLastReceipt: boolean;
  pendingPaymentMode: PendingPaymentMode;
  exchangeRates: ExchangeRate[];
  currentScreenName: string;
  i18nLocation: string;
}

interface DispatchProps extends BasePaymentScreenDispatchProps {
  updateTimers: ActionCreator;
  updateUiMode: ActionCreator;
  sceneTitle: ActionCreator;
  getTaxCustomer: ActionCreator;
  updatePendingPayment: ActionCreator;
  alert: AlertRequest;
  dismissAlertModal: ActionCreator;
}

interface Props extends PaymentScreenProps, BasePaymentScreenProps, StateProps, DispatchProps,
    NavigationScreenProps<"payment"> {}

interface State extends BasePaymentScreenState {
  tenderLine: ITenderDisplayLine;
  isSwitchingModes: boolean;
  voidSaleReasonCodes: RenderSelectOptions[];
  selectedVoidSaleReasonCode: RenderSelectOptions;
  disablePaymentScreenButtons: boolean;
  nonIntegratedPayment: boolean;
  originalTransactionDetails: IOriginalTransactionDetails[];
  originalTenders: IOriginalTender[];
  originalUnreferencedTenders: IOriginalTender[];
  receiptCategoryForReturnWithTransaction: ReceiptCategory;
  subscriptionTokenDialogShowing: boolean;
  isInitialCashDrawerOnStartup: boolean;
}

class PaymentScreen extends BasePaymentScreen<Props, State> {

  private voidTransactionReasonListType: string;
  private selfCheckoutModeValue: boolean;
  private typeChoicesConfig: any;
  private customer: Customer;

  public constructor(props: Props) {
    super(props);
    this.voidTransactionReasonListType = getReasonListType(this.props.settings.configurationManager,
        VOID_TRANSACTION_EVENT);

    const functionalBehaviorConfigs = this.props.settings.configurationManager.getFunctionalBehaviorValues();
    this.selfCheckoutModeValue = functionalBehaviorConfigs.selfCheckoutModeBehaviors &&
        functionalBehaviorConfigs.selfCheckoutModeBehaviors.enabled;

    const refundDue = this.props.businessState.stateValues.get("transaction.balanceDue").abs();
    const originalTransactionDetails = getOriginalTransactionDetails(this.props.businessState.stateValues.get("TenderSession.originalTransactionDetails"),
        this.allowsRefundOriginalTenders, this.props.settings.configurationManager, refundDue);
    const originalTenders: IOriginalTender[] = isRefund(this.props.businessState.stateValues) &&
        getOriginalTenders(originalTransactionDetails, refundDue) || [];
    const originalUnreferencedTenders: IOriginalTender[] = isRefund(this.props.businessState.stateValues) &&
        getOriginalUnreferencedTenders(originalTenders) || [];
    this.typeChoicesConfig = functionalBehaviorConfigs.receipt.typeChoices;

    if (this.props.taxCustomer) {
      this.customer = this.props.taxCustomer;
    } else if (this.props.isReprintLastReceipt && this.props.businessState.lastPrintableTransactionInfo.customer) {
      this.customer = this.props.businessState.lastPrintableTransactionInfo.customer;
    } else {
      this.customer = this.props.businessState.stateValues.get("transaction.customer") as Customer;
    }

    const receiptCategoryForReturnWithTransaction = this.getReceiptCategoryForReturnWithTransaction();
    this.handleTaxCustomerForReturnWithTransaction();

    this.state = {
      tenderAmount: undefined,
      tenderAuthCategory: undefined,
      tenderId: undefined,
      tenderType: undefined,
      tenderLine: undefined,
      showPaymentDeviceSelection: false,
      offlineOptionsOn: false,
      useFirstDeviceOnly: false,
      isSwitchingModes: false,
      retryAuthorizationOn: false,
      selectedVoidSaleReasonCode: undefined,
      voidSaleReasonCodes: getReasonOptions(this.props.settings.configurationManager,
          this.voidTransactionReasonListType),
      disablePaymentScreenButtons: tenderAuthorizationInProgress(
          this.props.businessState.stateValues.get("TenderAuthorizationSession.state")),
      nonIntegratedPayment: false,
      references: undefined,
      originalTransactionDetails,
      originalTenders,
      originalUnreferencedTenders,
      receiptCategoryForReturnWithTransaction,
      subscriptionTokenDialogShowing: false,
      isInitialCashDrawerOnStartup: false
    };

    this.getConvertedAmountFromBalanceDue = this.getConvertedAmountFromBalanceDue.bind(this);
    this.startExchangeRateEntry = this.startExchangeRateEntry.bind(this);
  }

  public componentWillMount(): void {
    if (appIsWaitingForSignature(this.props)) {
      this.handleSignature(this.props.businessState.displayInfo.tenderDisplayLines);
    }
    this.props.updateUiMode(UI_MODE_TENDERING);
  }

  public componentDidMount(): void {
    if (this.props.isInitialCashDrawerOnStartup) {
      this.setState({isInitialCashDrawerOnStartup: true});
    }
    if (this.props.businessState.stateValues.get("TenderAuthorizationSession.state") ===
        TenderAuthorizationState.WaitingForCallforAuthorization) {
      this.setState({offlineOptionsOn: true});
    }
  }

  public componentWillUnmount(): void {
    if (this.props.uiState.mode !== UI_MODE_WAITING_TO_CLOSE
        && this.props.uiState.mode !== UI_MODE_RECEIPT_PRINTER_CHOICE) {
      this.props.updateUiMode(undefined);
    }
  }

  // tslint:disable-next-line: cyclomatic-complexity
  public componentWillReceiveProps(nextProps: Props): void {
    const oldScreen = this.props.currentScreenName;

    if (this.shouldLeavePaymentScreen(nextProps)) {
      // If the last tender is not a credit tender (the last logical name is not IN_MERCHANDISE_TRANSACTION_WAITING),
      // then it just works as before
      if (this.shouldPopToMain()) {
        this.props.navigation.dispatch(popTo("main"));
      } else if (this.props.uiState.mode === UI_MODE_TENDERING || this.props.uiState.mode === UI_MODE_WAITING_TO_CLOSE
          && !this.state.isSwitchingModes) {

        if (this.selfCheckoutModeValue && !this.props.businessState.stateValues.get("UserSession.unattended")) {
          this.setState({isSwitchingModes: true});
          this.props.performBusinessOperation(this.props.settings.deviceIdentity, EXIT_ATTENDANT_MODE_EVENT, []);
        } else if (shouldCallReceiptSummary(this.props, nextProps)
            && nextProps.businessState.stateValues.get("transaction.closingState")
            !== MerchandiseTransactionClosingState.Suspended
            && this.props.businessState.stateValues.get("SubscriptionTokenSession.state") !==
            SubscriptionTokenSessionState.RequiresToken) {
          this.moveToReceiptScreen();
        }
      }
    }

    if (this.shouldShowSubscriptionTokenDialog()) {
      const paymentTenderLine = this.props.businessState.stateValues.get("SubscriptionTokenSession.paymentTenderLine");
      const onApplyTenderTokenHandler = () => {
        //Create a TENDER_AUTHORIZATION_TOKEN_LINE_TYPE using the tender line that was accepted by the user
        const uiInputs: UiInput[] = [];
        uiInputs.push(new UiInput(UiInputKey.SUBSCRIPTION_PAYMENT_TENDER_LINE, paymentTenderLine));
        this.props.performBusinessOperation(this.props.settings.deviceIdentity,
            APPLY_SUBSCRIPTION_AUTHORIZATION_TOKEN_EVENT, uiInputs);
      };

      const onProcessSubscriptionPaymentHandler = () => {
        //send user to the subscription payment screen to try seperate tender
        this.moveToTokenAuthorizationScreen();
      };

      this.setState({ subscriptionTokenDialogShowing: true });

      if (paymentTenderLine) {
        //user has used a valid payment tender that can be used for the subscription.
        //ask whether the same tender should be used.
        this.showSubscriptionTenderAlert(onApplyTenderTokenHandler, onProcessSubscriptionPaymentHandler, paymentTenderLine);
      } else {
        //user did not use a valid tender for subscription, forward to screen to capture new tender.
        onProcessSubscriptionPaymentHandler();
      }
    } else if (this.state.subscriptionTokenDialogShowing) {
      this.props.dismissAlertModal();
      this.setState({ subscriptionTokenDialogShowing: false });
    }

    if (shouldOpenSignatureScreen(this.props, nextProps)) {
      this.handleSignature(nextProps.businessState.displayInfo.tenderDisplayLines);
    }

    if (nextProps.businessState.stateValues.get("TenderAuthorizationSession.state") ===
        TenderAuthorizationState.WaitingForCallforAuthorization &&
        (this.props.businessState.stateValues.get("TenderAuthorizationSession.state") ===
        TenderAuthorizationState.InProgress ||
        this.props.businessState.stateValues.get("TenderAuthorizationSession.state") ===
        TenderAuthorizationState.GiftCardRefundInProgress)) {
      this.setState({offlineOptionsOn: true});
    }

    // When the signature page is closed, it switch the orientation to the original position and opens the receipt
    if (nextProps.currentScreenName === "payment" && oldScreen === "signatureCapture" && !Theme.isTablet) {
      Orientation.lockToPortrait();
    }

    if (nextProps.paymentStatus !== this.props.paymentStatus) {
      this.primaryPaymentDevices =
          getPaymentDevicesAsRenderSelect(nextProps.paymentStatus, this.isPrimaryPaymentDevices);
      this.primaryGiftDevices =
          getPaymentDevicesAsRenderSelect(nextProps.paymentStatus, this.isPrimaryGiftDevice);
      this.walletPaymentDevices =
          getPaymentDevicesAsRenderSelect(nextProps.paymentStatus, this.isWalletPaymentDevice);
      this.nonIntegratedPaymentDevices = this.nonIntegratedPaymentDevices &&
          getPaymentDevicesAsRenderSelect(nextProps.paymentStatus, this.isNonIntegratedPaymentDevice);
    }
  }

  // tslint:disable-next-line:cyclomatic-complexity
  public componentDidUpdate(prevProps: Props, prevState: State): void {
    if (prevProps.displayInfo.tenderDisplayLines.length !== this.props.displayInfo.tenderDisplayLines.length) {
      if (isRefund(this.props.businessState.stateValues) && this.state.originalTransactionDetails) {
        const refundDue = this.props.businessState.stateValues.get("transaction.balanceDue").abs();
        const originalTransactionDetails = getOriginalTransactionDetails(this.props.businessState.stateValues.get("TenderSession.originalTransactionDetails"),
            this.allowsRefundOriginalTenders, this.props.settings.configurationManager, refundDue);
        const originalTenders: IOriginalTender[] = getOriginalTenders(originalTransactionDetails, refundDue) || [];
        const originalUnreferencedTenders: IOriginalTender[] = getOriginalUnreferencedTenders(originalTenders) || [];
        this.setState({
          originalTransactionDetails,
          originalTenders,
          originalUnreferencedTenders
        });
      }
    }
    if (this.props.businessState.stateValues.get("TenderAuthorizationSession.state") ===
          TenderAuthorizationState.WaitingForRetryLastAuthorization &&
          prevProps.businessState.stateValues.get("TenderAuthorizationSession.state") !==
          TenderAuthorizationState.WaitingForRetryLastAuthorization) {
      this.setState({retryAuthorizationOn: true});
    }
    if (beginProgressTenderAuthorization(
        prevProps.businessState.stateValues.get("TenderAuthorizationSession.state"),
        this.props.businessState.stateValues.get("TenderAuthorizationSession.state")) &&
        !this.state.disablePaymentScreenButtons) {
      this.setState({disablePaymentScreenButtons: true});
    }
    if (completedTenderAuthorization(
        prevProps.businessState.stateValues.get("TenderAuthorizationSession.state"),
        this.props.businessState.stateValues.get("TenderAuthorizationSession.state")) ||
        businessEventCompletedWithError(prevProps.businessState, this.props.businessState) ||
        this.shouldReEnableAfterPartialCashTender(prevProps.businessState)) {
      if (this.state.nonIntegratedPayment) {
        this.resetNonIntegratedPayment();
      }
      this.setState({disablePaymentScreenButtons: false});
    }

    if ((this.props.uiState.mode === UI_MODE_VOID_TRANSACTION &&
          prevProps.uiState.logicalState === IN_MERCHANDISE_TRANSACTION_WAITING &&
          this.props.uiState.logicalState === IN_MERCHANDISE_TRANSACTION) ||
        (this.props.uiState.mode === UI_MODE_CUSTOMER_SEARCH_SCREEN &&
            this.props.businessState.stateValues.get("transaction.customer"))) {
      this.props.updateUiMode(UI_MODE_TENDERING);
    } else if (this.shouldMoveToReceiptScreen(prevProps)) {
      this.moveToReceiptScreen();
    }

    if (prevProps.nonIntegratedPayment !== this.props.nonIntegratedPayment) {
      this.setState({nonIntegratedPayment: this.props.nonIntegratedPayment});
    }

    this.checkAndHandleDonation(prevProps);

    this.shouldPromptTenderReferenceData(prevProps);

    this.checkAndHandleCashDrawerInteraction(prevProps);
    this.checkChangeRequiredInputsHandling(prevProps);

    if (this.state.isInitialCashDrawerOnStartup) {
      this.setState({isInitialCashDrawerOnStartup: false});
    }
  }

  public render(): JSX.Element {
    const transactionBalanceDue: string = this.props.businessState.stateValues.get("transaction.balanceDue") &&
        printAmount(this.props.businessState.stateValues.get("transaction.balanceDue")) || "0";
    const hasDonations = this.props.businessState.displayInfo.donationDisplayLines.length > 0;
    // FIXME: This is an immediate fix to address RSOD issue described in https://jira.aptos.com/browse/ZSPFLD-2236
    // Upon logged out, businessState.displayInfo becomes undefined, thus `tenderDisplayLines cannot be read from
    // undefined` error would appear. This should be a broader fix where upon logout, the app should immediately
    // kick back to Login screen without having to do PaymentScreen.render() or any other render method in any
    // UI component for that matters.  Opened a JIRA ticket to potentially address this change.
    // Jira: https://jira.aptos.com/browse/ZSPFLD-2274
    const loyaltyMembershipActivities = this.getLoyaltyMembershipActivities();

    const commonProps: CommonPaymentProps = {
      sceneTitle: this.props.sceneTitle,
      activeTenders: this.activeTenders,
      allowsRefundOriginalTenders: this.allowsRefundOriginalTenders,
      activeTenderGroups: this.activeTenderGroups,
      balanceDue: transactionBalanceDue,
      currency: this.props.businessState.stateValues.get("transaction.accountingCurrency"),
      displayInfo: this.props.businessState.displayInfo,
      hasDonations,
      onLoyaltyVoucher: this.onLoyaltyVoucher.bind(this),
      onApplyPayment: this.onApplyPayment.bind(this),
      onApplyPaymentDeviceSelected: this.onApplyPaymentDeviceSelected.bind(this),
      deviceSelectTenderAuthCategory: this.state.tenderAuthCategory,
      onEditTransaction: this.onEditTransaction.bind(this),
      onVoidTransaction: this.onVoidTransaction.bind(this),
      walletPaymentDevices: this.walletPaymentDevices,
      primaryPaymentDevices: this.primaryPaymentDevices,
      nonIntegratedPaymentDevices: this.nonIntegratedPaymentDevices,
      primaryGiftDevices: this.primaryGiftDevices,
      resetPaymentDeviceSelection: this.resetPaymentDeviceSelection.bind(this),
      stateValues: this.props.businessState.stateValues,
      showPaymentDeviceSelection: this.state.showPaymentDeviceSelection,
      showOfflineOptions: this.state.offlineOptionsOn,
      showRetryAuthorization: this.state.retryAuthorizationOn,
      handleOfflineOptions: this.handleOfflineAuthorization.bind(this),
      handleCancelOfflineAuthorization: this.handleCancelAuthorization.bind(this),
      handleRetryAuthorization: this.handleRetryAuthorization.bind(this),
      uiInteractionDetected: () => this.props.updateTimers(TimerUpdateType.UiInteraction),
      businessState: this.props.businessState,
      loyaltyMembershipActivities,
      disablePaymentScreenButtons: this.state.disablePaymentScreenButtons,
      configuration: this.props.settings.configurationManager,
      tenderVoidMessage: this.props.tenderVoidMessage,
      originalTransactionDetails: this.state.originalTransactionDetails,
      originalTenders: this.state.originalTenders,
      originalUnreferencedTenders: this.state.originalUnreferencedTenders,
      handleTaxCustomerAssignment: this.handleTaxCustomerAssignment.bind(this),
      receiptCategoryForReturnWithTransaction: this.state.receiptCategoryForReturnWithTransaction,
      updatePendingPayment: this.props.updatePendingPayment,
      pendingPaymentMode: this.props.pendingPaymentMode,
      exchangeRates: this.props.exchangeRates,
      getConvertedAmountFromBalanceDue: this.getConvertedAmountFromBalanceDue,
      startExchangeRateEntry: this.startExchangeRateEntry,
      navigation: this.props.navigation
    };

    return (
      <BaseView style={Theme.styles.miscellaneous.fill}>
        {this.renderPaymentComponent(commonProps)}
      </BaseView>
    );

  }

  public getConvertedAmountFromBalanceDue(currency: string, exchangeRate: ExchangeRate): Money {
    return CurrencyConverter.convert(this.props.businessState.stateValues.get("transaction.balanceDue").amount,
        currency, exchangeRate?.exchangeRate, true);
  }

  public startExchangeRateEntry(exchangeRate: ExchangeRate): void {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.EXCHANGE_RATE, exchangeRate));
    this.props.performBusinessOperation(this.props.settings.deviceIdentity, START_EXCHANGE_RATE_ENTRY_EVENT, uiInputs);
  }

  private renderPaymentComponent(commonProps: CommonPaymentProps): React.ReactNode {
    if (Theme.isTablet) {
      const tabletProps: Omit<PaymentTabletProps, keyof CommonPaymentProps> = {
        isSuspendTransactionVisible: this.props.isSuspendTransactionVisible,
        isSuspendTransactionEnabled: this.props.isSuspendTransactionEnabled,
        isVoidTransactionVisible: this.props.isVoidTransactionVisible,
        isVoidTransactionEnabled: this.props.isVoidTransactionEnabled,
        onSuspendTransaction: this.props.onSuspendTransaction,
        nonIntegratedPayment: this.state.nonIntegratedPayment,
        inputs: this.props.inputs,
        originalEventType: this.props.originalEventType,
        isTendering: this.props.isTendering,
        handleCancelNonIntegrated: this.cancelNonIntegrated.bind(this),
        useFirstDeviceOnly: this.state.useFirstDeviceOnly,
        requiredInputs: this.props.requiredInputs,
        appLogo: this.props.appLogo,
        isInitialCashDrawerOnStartup: this.props.isInitialCashDrawerOnStartup
      };
      return (
        <PaymentTablet
          { ...tabletProps }
          { ...commonProps }
        />
      );
    } else {
      const phoneProps: Omit<PaymentPhoneProps, keyof CommonPaymentProps> = {
        handleRedeemPayment: this.handleRedeemPayment.bind(this),
        isInitialCashDrawerOnStartup: this.props.isInitialCashDrawerOnStartup,
        settings: this.props.settings      };
      return (
        <PaymentPhone
          { ...phoneProps }
          { ...commonProps }
        />
      );
    }
  }

  private shouldMoveToReceiptScreen(prevProps: Props): boolean {
    return this.props.uiState.mode === UI_MODE_WAITING_TO_CLOSE
        && (!this.selfCheckoutModeValue || this.props.businessState.stateValues.get("UserSession.unattended"))
        && shouldCallReceiptSummary(prevProps, this.props)
        && this.props.businessState.stateValues.get("transaction.closingState")
        !== MerchandiseTransactionClosingState.Suspended
        && this.props.businessState.stateValues.get("transaction.closingState")
        !== MerchandiseTransactionClosingState.Voided
        && this.props.businessState.stateValues.get("SubscriptionTokenSession.state")
        !== SubscriptionTokenSessionState.RequiresToken;
  }

  private cancelNonIntegrated(): void {
    this.handleCancelAuthorization();
    this.resetNonIntegratedPayment();
  }
  private resetNonIntegratedPayment(): void {
    this.props.navigation.setParams({nonIntegratedPayment: false});
  }

  private getLoyaltyMembershipActivities(): ILoyaltyMembershipActivity[] {
    if (this.props.loyaltyMembershipActivities && this.props.loyaltyMembershipActivities.length > 0) {
      return this.props.loyaltyMembershipActivities.filter(
          (loyaltyMembershipActivity: ILoyaltyMembershipActivity) =>
              loyaltyMembershipActivity.loyaltyActivityType === LoyaltyActivityType.Sale ||
              loyaltyMembershipActivity.loyaltyActivityType === LoyaltyActivityType.PendingSale);
    }

    return undefined;
  }

  private handleRedeemPayment(inputValue: string, tenderAuthCategory: TenderAuthCategory,
                              originalTender?: IOriginalTender, tenderType?: string, subType?: string): void {
    const redeemPaymentHandler = () => {
      this.redeemPayment(inputValue, tenderAuthCategory, originalTender, tenderType, subType);
    };
    this.handleTenderLotteryCode(redeemPaymentHandler, tenderAuthCategory);
  }

  private redeemPayment(inputValue: string, tenderAuthCategory: TenderAuthCategory,
                        originalTender?: IOriginalTender, tenderType?: string, subType?: string): void {
    if (isRefund(this.props.businessState.stateValues)) {
      this.props.navigation.push("issueGiftCard", {
        onGCIssue: (cardNumber: string, amount: string, inputSource: string, useSwipe?: boolean, existingCard?: boolean) => {
          this.onApplyPayment(tenderAuthCategory, undefined, amount, undefined, undefined, undefined,
              originalTender && originalTender.originalTransactionReferences, true, cardNumber, inputSource, useSwipe, existingCard, tenderType)
        },
        onExit: () => this.props.navigation.dispatch(popTo("payment")),
        isRefund: true,
        amount: inputValue
      });
    } else if (tenderAuthCategory === TenderAuthCategory.StoredValueCertificateService &&
        isValueCertificateSearchEnabled(this.props.settings.configurationManager, subType) &&
        this.props.businessState.stateValues.get("transaction.customer")?.customerNumber) {
      this.props.navigation.push("valueCertificate", {
        partialRedeemEnabled: isValueCertificatePartialRedeemEnabled(this.props.settings.configurationManager),
        onExit: () => {
          const changeDue: Money = this.props.businessState.stateValues.get("transaction.changeDue");
          if (!changeDue || changeDue.eq(
              new Money(0, this.props.businessState.stateValues.get("transaction.accountingCurrency")))) {
            this.props.navigation.dispatch(popTo("payment"))
          }
        },
        onApply: (valueCertificate: IValueCertificateResult, tenderAmount: string) => {
          this.onRedeemValueCertificate(valueCertificate, tenderAmount);
        },
        subType
      });
    } else {
      this.props.navigation.push("redeem", {
        tenderAuthCategory,
        remainingTenderAmount: inputValue,
        stateValues: this.props.businessState.stateValues,
        paymentScreenIndex: "payment",
        walletPaymentDevices: this.walletPaymentDevices,
        primaryGiftDevices: this.primaryGiftDevices,
        useFirstDeviceOnly: this.state.useFirstDeviceOnly,
        activeTenders: this.activeTenders,
        updatePendingPayment: this.props.updatePendingPayment,
        configuration: this.props.settings.configurationManager,
        onCancel: () => this.props.navigation.dispatch(popTo("payment")),
        subType
      });
    }
  }

  private checkChangeRequiredInputsHandling(prevProps: Props): void {
    if (!Theme.isTablet && ((!this.props.businessState.inProgress && prevProps.businessState.inProgress) || this.state.isInitialCashDrawerOnStartup) &&
        this.props.businessState.stateValues.get("TenderAuthorizationSession.state") === TenderAuthorizationState.Completed) {
      const error = this.props.businessState.error as QualificationError;
      if (!isCashDrawerAction(this.props.businessState.eventType) &&
          !this.isAuthorizationDeviceIdError(error) &&
          !this.waitingOnCustomerPrompts() &&
          (this.props.businessState.stateValues.get("EndOfTransactionTenderingSession.changeRequiresInputs") &&
          (!this.props.businessState.stateValues.get("EndOfTransactionTenderingSession.isChangeFallbackInProgress") || this.state.isInitialCashDrawerOnStartup)) ||
           (error?.requiredInputs?.find((item) => item === UiInputKey.VALUE_CERTIFICATE_NUMBER || item === "cardNumber" || item === UiInputKey.TENDER_ID) &&
           this.props.businessState.stateValues.get("EndOfTransactionTenderingSession.isChangeInProgress"))) {

        const changeInputOptions: IChangeInputOptions =
            this.props.businessState.stateValues.get("EndOfTransactionTenderingSession.changeInputOptions");

        const requiredInputs = this.getRequiredInputs(error, changeInputOptions);

        if (requiredInputs.find((item) => item === UiInputKey.VALUE_CERTIFICATE_NUMBER)) {
          const issueCertProps = {
            onIssue: (certificateNumber: string, amount: string, inputSource: string, inputs?: UiInput[]) =>
                { this.onIssueGCertChange(certificateNumber, amount, inputSource, changeInputOptions, inputs); },
            onExit: () => this.onCancelChangeInput(changeInputOptions),
            isChange: true,
            amount: this.props.businessState.stateValues.get("transaction.changeDue"),
            updatePendingPayment: this.props.updatePendingPayment,
            initialInputs: error?.requiredInputs ? this.props.businessState.inputs : changeInputOptions.inputs
          };
          if (this.props.currentScreenName === "tenderChange") {
            this.props.navigation.replace("issueGiftCertificate", issueCertProps);
          } else {
            this.props.navigation.push("issueGiftCertificate", issueCertProps);
          }
        } else if (requiredInputs.find((item) => item === "cardNumber")) {
          const issueGiftProps = {
            onGCIssue: (cardNumber: string, amount: string, inputSource: string, useSwipe?: boolean, existingCard?: boolean) => {
              this.onIssueGiftCardChange(cardNumber, inputSource, changeInputOptions, useSwipe, existingCard)},
            onExit: () => this.onCancelChangeInput(changeInputOptions),
            isChange: true,
            amount: this.props.businessState.stateValues.get("transaction.changeDue")?.amount
          };
          if (this.props.currentScreenName === "tenderChange") {
            this.props.navigation.replace("issueGiftCard", issueGiftProps);
          } else {
            this.props.navigation.push("issueGiftCard", issueGiftProps);
          }
        } else if (requiredInputs.find((item) => item === UiInputKey.TENDER_ID)) {
          this.navigateToTenderChange();
        }
      }
    }
  }

  private waitingOnCustomerPrompts(): boolean {
    return this.props.pendingPaymentMode === PendingPaymentMode.WaitingOnCustomer ||
        this.props.pendingPaymentMode === PendingPaymentMode.WaitingOnLoyalty
  }

  private navigateToTenderChange(): void {
    if (this.props.currentScreenName === "payment" || this.props.currentScreenName === "main") {
      this.props.navigation.push("tenderChange", { updatePendingPayment: this.props.updatePendingPayment });
    } else {
      this.props.navigation.replace("tenderChange", { updatePendingPayment: this.props.updatePendingPayment });
    }
  }

  private isAuthorizationDeviceIdError(businessStateError: QualificationError): boolean {
    return businessStateError?.requiredInputs.find((item) => item === UiInputKey.AUTHORIZATION_DEVICE_ID);
  }

  private getRequiredInputs(error: QualificationError, changeInputOptions: IChangeInputOptions): any[] {
    let requiredInputs;
    if (shouldOpenGiftCertificateIssuance(this.props.businessState)) {
      requiredInputs = [UiInputKey.VALUE_CERTIFICATE_NUMBER];
    } else {
      requiredInputs = error?.requiredInputs || changeInputOptions?.requiredChangeInputs;
    }
    return requiredInputs;
  }

  private onIssueGiftCardChange(accountNumber: string,
                               inputSource: string,
                               changeInputOptions: IChangeInputOptions,
                               useSwipe?: boolean,
                               existingCard?: boolean): void {
    let uiInputs: UiInput[];
    const error = this.props.businessState.error as QualificationError;
    if (error?.requiredInputs && (error.requiredInputs.find((item) => item === "cardNumber") ||
          error.requiredInputs.find((item) => item === UiInputKey.AUTHORIZATION_DEVICE_ID))) {
      uiInputs = [...this.props.businessState.inputs];
    } else {
      uiInputs = changeInputOptions?.inputs && [...changeInputOptions.inputs] || [];
    }
    if (!useSwipe) {
      uiInputs.push(new UiInput("cardNumber", accountNumber, "string", inputSource));
    } else {
      uiInputs.push(new UiInput("giftCardIssueSwipe", true));
    }
    uiInputs.push(new UiInput(UiInputKey.EXISTING_GIFT_CARD, existingCard));

    this.props.performBusinessOperation(this.props.settings.deviceIdentity,
      this.props.businessState.stateValues.get("EndOfTransactionTenderingSession.isChangeFallbackInProgress") ?
      TENDER_CHANGE_FALLBACK_EVENT: TENDER_CHANGE_EVENT, uiInputs);
  }

  private onIssueGCertChange(accountNumber: string, amount: string, inputSource: string, changeInputOptions: IChangeInputOptions, inputs?: UiInput[]): void {
    let uiInputs: UiInput[];
    if (inputs?.length > 0) {
      uiInputs = inputs;
    } else {
      uiInputs = changeInputOptions?.inputs || [];
    }
    if (!uiInputs.find((i) => i.inputKey === UiInputKey.TENDER_ID)){
      const tenderId = getGiftCertificateTenderIdFromCashDrawerState(this.props.businessState);
      if (tenderId) {
        uiInputs.push(new UiInput(UiInputKey.TENDER_ID, tenderId));
      }
    }
    if (!uiInputs.find((i) => i.inputKey === UiInputKey.TENDER_AMOUNT) && amount){
      uiInputs.push(new UiInput(UiInputKey.TENDER_AMOUNT, amount));
    }
    uiInputs.push(new UiInput(UiInputKey.VALUE_CERTIFICATE_NUMBER, accountNumber, "string", inputSource));
    this.props.performBusinessOperation(this.props.settings.deviceIdentity,
      this.props.businessState.stateValues.get("EndOfTransactionTenderingSession.isChangeFallbackInProgress") ?
      TENDER_CHANGE_FALLBACK_EVENT: TENDER_CHANGE_EVENT, uiInputs);

    this.props.navigation.dispatch(popTo("payment"));
  }

  private onCancelChangeInput(changeInputOptions?: IChangeInputOptions): void {
    let uiInputs: UiInput[];
    const error = this.props.businessState.error as QualificationError;

    if (error?.requiredInputs && error.requiredInputs.find((item) =>
        item === UiInputKey.VALUE_CERTIFICATE_NUMBER ||
        item === "cardNumber" ||
        item === UiInputKey.AUTHORIZATION_DEVICE_ID)) {
      uiInputs = this.props.businessState.inputs && [...this.props.businessState.inputs];
    } else {
      uiInputs = changeInputOptions?.inputs && [...changeInputOptions.inputs] || [];
    }
    this.props.performBusinessOperation(this.props.settings.deviceIdentity, TENDER_CHANGE_CANCEL_EVENT,
      uiInputs);
    this.props.navigation.dispatch(popTo("payment"));
  }

  private showTenderLotteryAlert(onPressHandler: () => void): void {
    const buttons: AlertModalButton[] = [
      { text: I18n.t("cancel"), style: "cancel" },
      { text: I18n.t("continue"), onPress: onPressHandler }
    ];
    this.props.alert(
      I18n.t("warning"),
      I18n.t("voidTenderLotteryMessage"), buttons, { cancelable: false });
  }

  private showSubscriptionTenderAlert(onApplyTenderTokenHandler: () => void, onProcessSubscriptionPaymentHandler: () => void, paymentTender: ITenderLine): void {
    const tenderName = paymentTender.tenderName;
    const tenderNumber = paymentTender.authResponse.cardNumber;
    const buttons: AlertModalButton[] = [
      { text: I18n.t("yes"), onPress: onApplyTenderTokenHandler},
      { text: I18n.t("no"), style: "cancel", onPress:  onProcessSubscriptionPaymentHandler}
    ];
    this.props.alert(
      "",
      I18n.t("useSameCardForSubscriptions", {
        tenderName,
        tenderNumber
      }), buttons, { cancelable: false });
  }

  private isLotteryValidationRequired(tenderAuthCategory?: string, tenderId?: string): boolean {
    if (tenderId) {
      const tenderDefinitions = this.props.settings?.configurationManager?.getTendersValues()?.tenderDefinitions;
      const tender = tenderDefinitions && tenderDefinitions.find(
        (tenderDefinition: IConfigurationValues) => tenderDefinition.tenderId === tenderId);
      if (tender.hasOwnProperty('eligibleForTaxLottery')) {
        return tender && !tender.eligibleForTaxLottery;
      } else {
        return false;
      }
    } else if (tenderAuthCategory) {
      const tenderAuthCategoryDefinitions =
          this.props.settings?.configurationManager?.getTendersValues()?.tenderAuthCategoryDefinitions;
      if (tenderAuthCategoryDefinitions) {
        for (const field in tenderAuthCategoryDefinitions) {
          if (field === tenderAuthCategory) {
            const tenderAuthCategoryDefinition = tenderAuthCategoryDefinitions[field];
            if (tenderAuthCategoryDefinition.hasOwnProperty('eligibleForTaxLottery')) {
              return tenderAuthCategoryDefinition && !tenderAuthCategoryDefinition.eligibleForTaxLottery;
            }
          }
        }
      }
      return false;
    }
  }

  private openLoyaltyVoucher(tenderName: string, pluralTenderName: string): void {
    this.props.navigation.push("loyaltyVoucher", {
      tenderName,
      pluralTenderName,
      onApply: (loyaltyVoucher: ILoyaltyVoucher) => this.handleLoyaltyVoucherPayment(loyaltyVoucher),
      onExit: () => this.props.navigation.dispatch(popTo("payment"))
    });
  }

  private onLoyaltyVoucher(tenderName: string, pluralTenderName: string): void {
    if (this.props.businessState.stateValues.get("transaction.customer")) {
      this.openLoyaltyVoucher(tenderName, pluralTenderName);
    } else {
      this.props.navigation.push("customer", {
        isTransactionStarting: false,
        assignCustomer: true,
        hideCreateCustomer: true,
        backNavigationTitle: I18n.t("payment"),
        onExit: () => {
          if (this.props.businessState.stateValues.get("transaction.customer")) {
            this.openLoyaltyVoucher(tenderName, pluralTenderName);
          } else {
            const isCustomerAssigned = () => {
              if (this.props.businessState.stateValues.get("transaction.customer")) {
                this.openLoyaltyVoucher(tenderName, pluralTenderName);
              } else if (this.props.businessState.inProgress) {
                setTimeout(isCustomerAssigned, 250);
              } else {
                // In case there is an error it goes back to the payment screen
                this.props.navigation.dispatch(popTo("payment"));
              }
            };
            setTimeout(isCustomerAssigned, 250);
          }
        },
        onCancel: () => {
          this.props.navigation.dispatch(popTo("payment"));
        }
      });
    }
  }

  private handleSignature(tenderDisplayLines: ITenderDisplayLine[]): void {
    const tenderLine: ITenderDisplayLine = tenderDisplayLines[tenderDisplayLines.length - 1];
    if (!Theme.isTablet) {
      Orientation.lockToLandscapeRight();
      InteractionManager.runAfterInteractions(() => this.props.navigation.push("signatureCapture", {tenderLine}));
    } else {
      this.props.navigation.push("signatureCapture", {tenderLine});
    }
  }

  private handleOfflineAuthorization(): void {
    this.setState({offlineOptionsOn: false});
    if (!Theme.isTablet) {
      this.props.navigation.push("offlineAuthorization", {
        onCancel: () => this.props.navigation.dispatch(popTo("payment")),
        isGiftCardIssue: false
      });
    }
  }

  private resetPaymentDeviceSelection(): void {
    this.setState({
      tenderAuthCategory: undefined,
      tenderId: undefined,
      showPaymentDeviceSelection: false,
      disablePaymentScreenButtons: false
    });
  }

  private onRedeemValueCertificate(valueCertificate: IValueCertificateResult, tenderAmount: string): void {
    this.onApplyPayment(TenderAuthCategory.StoredValueCertificateService, undefined, tenderAmount, undefined,
        undefined, valueCertificate.accountNumber, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, valueCertificate.valueCertificateType);
  }

  // FIXME: [https://jira.aptos.com/browse/DSS-14251] - Update this to use an object rather than a params list
  private onApplyPayment(tenderAuthCategory: string, tenderId: string, tenderAmount?: string,
                         originalTenderAmount?: string, softMaxProceed?: boolean, valueCertificateNumber?: string,
                         references?: IOriginalTransactionRefundReference[], giftCardRefund?: boolean,
                         cardNumber?: string, cardSource?: string, useSwipe?: boolean, existingCard?: boolean,
                         tenderType?: string, tenderSubType?: string, foreignTender?: IForeignTender): void {
    if (isRefund(this.props.businessState.stateValues) &&
        tenderAuthCategory === TenderAuthCategory.StoredValueCertificateService &&
        tenderSubType === ValueCertSubType.GiftCertificate && !Theme.isTablet) {
      if (tenderId) {
        this.props.businessState.inputs.push(new UiInput(UiInputKey.TENDER_ID, tenderId));
      }
      this.props.navigation.push("issueGiftCertificate", {
        onIssue: (certNumber: string, amount: string, inputSource: string, inputs?: UiInput[]) =>
            {
              this.props.navigation.dispatch(popTo("payment"));
              this.applyPayment(tenderAuthCategory, undefined, amount, originalTenderAmount, softMaxProceed, certNumber,
                references, true, undefined, inputSource, undefined, undefined, tenderType, tenderSubType, foreignTender)
            },
        onExit: () => this.props.navigation.dispatch(popTo("payment")),
        isRefund: true,
        amount: new Money(tenderAmount, this.props.businessState.stateValues.get("transaction.accountingCurrency"))
      });
    } else {
      const onApplyPaymentHandler = () => {
        this.applyPayment(tenderAuthCategory, tenderId, tenderAmount,
            originalTenderAmount, softMaxProceed, valueCertificateNumber,
            references, giftCardRefund,
            cardNumber, cardSource, useSwipe, existingCard,
            tenderType, tenderSubType, foreignTender);
      };
      this.handleTenderLotteryCode(onApplyPaymentHandler, tenderAuthCategory, tenderId);
    }
  }

  private applyPayment(tenderAuthCategory: string, tenderId: string, tenderAmount?: string,
                       originalTenderAmount?: string, softMaxProceed?: boolean, valueCertificateNumber?: string,
                       references?: IOriginalTransactionRefundReference[], giftCardRefund?: boolean,
                       cardNumber?: string, cardSource?: string, useSwipe?: boolean, existingCard?: boolean,
                       tenderType?: string, tenderSubType?: string, foreignTender?: IForeignTender): void {
    this.setState({showPaymentDeviceSelection: false, disablePaymentScreenButtons: true });
    this.softMaxProceed = softMaxProceed;
    this.handlePayment(tenderAuthCategory, tenderId, tenderAmount, originalTenderAmount, valueCertificateNumber,
        cardNumber, cardSource, undefined, references, giftCardRefund, useSwipe, existingCard, tenderType,
        tenderSubType, foreignTender);
  }

  private handleTenderLotteryCode(tenderLotteryCodeHandler: () => void, tenderAuthCategory: string,
                                  tenderId?: string): void {
    const lotteryCode = this.props.businessState.stateValues.get("transaction.taxLotteryCustomerCode");
    const lotteryValidationRequired: boolean = this.isLotteryValidationRequired(tenderAuthCategory, tenderId);
    if (lotteryCode && lotteryValidationRequired) {
      const onPressHandler = () => {
        this.voidLotteryCode();
        tenderLotteryCodeHandler();
      };
      this.showTenderLotteryAlert(onPressHandler);
    } else {
      tenderLotteryCodeHandler();
    }
  }

  private voidLotteryCode(): void {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.VOID_REASON, LotteryVoidReason.VOIDED_FOR_INELIGIBLE_TENDER));
    uiInputs.push(new UiInput(UiInputKey.VOID_REASON_DESC, LotteryVoidDescription.VOIDED_FOR_INELIGIBLE_TENDER));
    uiInputs.push(new UiInput(UiInputKey.VOID_LOTTERY_CODE, true));
    this.props.performBusinessOperation(this.props.settings.deviceIdentity, CAPTURE_LOTTERY_CODE_EVENT, uiInputs);
  }

  private onEditTransaction(): void {
    this.setState({ disablePaymentScreenButtons: true });
    if (this.props.displayInfo.donationDisplayLines.length) {
      this.props.performBusinessOperation(this.props.settings.deviceIdentity, VOID_DONATION_EVENT, [
        new UiInput("lineNumber", this.props.displayInfo.donationDisplayLines[0].lineNumber)
      ]);
    } else {
      this.props.navigation.dispatch(popTo("main"));
    }
  }

  private getVoidTransactionTitle(): string {
    const hasCancelledItems = displayLinesHasType(this.props.displayInfo, ITEM_CANCEL_LINE_TYPE);
    const isReturning = this.props.businessState.stateValues &&
      this.props.businessState.stateValues.get("ItemHandlingSession.isReturning");
    if (isReturning) {
        return "voidReturnTransactionTitle";
    } else if(hasCancelledItems) {
      return  "voidCancelTransactionTitle";
    } else {
      return  "voidTransactionTitle";
    }
  }

  private onVoidTransaction(): void {
    const voidTranTitle: string = this.getVoidTransactionTitle();
    Alert.alert(I18n.t(voidTranTitle), this.transactionHasVoidedTaxFreeItems() ? I18n.t("voidTransactionMessageWithTaxFreeDocument") : I18n.t("voidTransactionMessage"), [
      {text: I18n.t("cancel"), style: "cancel"},
      {text: I18n.t("okCaps"), onPress: () => {
        if (this.voidTransactionReasonListType) {
          this.props.navigation.push("reasonCodeList", {
            resetTitle: true,
            currentSelectedOption: this.state.selectedVoidSaleReasonCode,
            options: this.state.voidSaleReasonCodes,
            onOptionChosen: this.handleSetReasonCode.bind(this)});
        } else {
          this.performVoidSaleBusinessOperation();
        }
      }}
    ], { cancelable: true });
  }

  private transactionHasVoidedTaxFreeItems = (): boolean => {
    return !!(this.props.displayInfo && this.props.displayInfo.taxFreeDisplayLines &&
      this.props.displayInfo.taxFreeDisplayLines.some((line) => (line.lineType === VOID_TAX_REFUND_LINE_TYPE && line.successful)));
  }

  private handleSetReasonCode(newReasonCode: RenderSelectOptions): void {
    this.setState({ selectedVoidSaleReasonCode: newReasonCode }, () => {
      this.performVoidSaleBusinessOperation();
    });
  }

  private performVoidSaleBusinessOperation(): void {
    const uiInputs: Array<UiInput> = [];
    if (this.voidTransactionReasonListType) {
      uiInputs.push(new UiInput(UiInputKey.REASON_CODE, this.state.selectedVoidSaleReasonCode.code));
      uiInputs.push(new UiInput(UiInputKey.REASON_DESCRIPTION,
          this.state.selectedVoidSaleReasonCode.description));
      uiInputs.push(new UiInput(UiInputKey.REASON_LIST_TYPE, this.voidTransactionReasonListType));
    }
    this.props.performBusinessOperation(this.props.settings.deviceIdentity, VOID_TRANSACTION_EVENT, uiInputs);
    this.props.updateUiMode(UI_MODE_VOID_TRANSACTION);
  }

  private shouldLeavePaymentScreen(nextProps: Props): boolean {
    const uiModeIsWaitingToClose: boolean = nextProps.uiState.mode === UI_MODE_WAITING_TO_CLOSE ||
                                            nextProps.uiState.mode === UI_MODE_WAITING_TO_CLEAR_TRANSACTION;

    return uiModeIsWaitingToClose && (nextProps.uiState.mode !== this.props.uiState.mode ||
            (!this.props.businessState.stateValues.get("transaction.voided") &&
            this.props.businessState.stateValues.get("transaction.closingState")
            !== MerchandiseTransactionClosingState.Suspended && shouldCallReceiptSummary(this.props, nextProps)));
  }

  private shouldPopToMain(): boolean {
    return this.props.uiState.mode === UI_MODE_VOID_TRANSACTION ||
        this.props.uiState.mode === UI_MODE_SUSPEND_TRANSACTION;
  }

  private moveToReceiptScreen(): void {
    let receiptCategory: ReceiptCategory = this.getReceiptSessionCategory() || ReceiptCategory.Receipt;
    if (isFranceLocation(this.props.retailLocations, this.props.settings.configurationManager)) {
      receiptCategory = ReceiptCategory.VatReceipt;
    }
    if (!this.props.businessState.stateValues.get("transaction.requiresVoid")) {
      if (this.props.currentScreenName === "payment") {
        this.props.navigation.replace("receiptSummary", { receiptCategory });
      } else {
        this.props.navigation.dispatch(popAndReplace("receiptSummary", { receiptCategory }));
      }
    }
  }

  private getReceiptSessionCategory(): ReceiptCategory {
    if (isFranceLocation(this.props.retailLocations, this.props.settings.configurationManager)) {
      return ReceiptCategory.VatReceipt;
    }
    return this.props.businessState.stateValues &&
        this.props.businessState.stateValues.get("ReceiptSession.receiptCategory");
  }

  private handleLoyaltyVoucherPayment(loyaltyVoucher: ILoyaltyVoucher): void {
    const tenderType = this.activeTenders.find(
        (aTender) => aTender.tenderAuthCategory === TenderAuthCategory.LoyaltyVoucherService);

    this.handlePayment(tenderType.tenderAuthCategory, tenderType.tenderId, loyaltyVoucher.amount.amount,
        undefined, loyaltyVoucher.voucherKey);
  }

  private shouldReEnableAfterPartialCashTender(prevBusinessState: BusinessState): boolean {
    if (this.state.disablePaymentScreenButtons) {
      const cashUiInput: UiInput = this.props.businessState.inputs?.find((uiInput: UiInput) =>
          uiInput.inputValue === TenderAuthCategory.None && uiInput.inputKey === UiInputKey.TENDER_AUTH_CATEGORY_NAME);
      return businessEventCompletedWithoutError(prevBusinessState, this.props.businessState) &&
          cashUiInput &&  this.props.businessState.eventType === APPLY_TENDER_EVENT;
    }
    return false;
  }

  private checkAndHandleDonation = (prevProps: Props): void => {
    if (!this.props.businessState.inProgress && prevProps.businessState.inProgress &&
        !this.props.businessState.error && this.props.businessState.eventType === VOID_DONATION_EVENT) {
      this.props.navigation.dispatch(popTo("main"));
    }
  }

  private checkAndHandleCashDrawerInteraction = (prevProps: Props): void => {
    if (!this.props.businessState.inProgress && prevProps.businessState.inProgress &&
        !this.props.businessState.error && this.proceedToScanDrawer(prevProps)) {
      if (this.props.currentScreenName === "payment") {
        this.props.navigation.replace("scanDrawer", { eventType: OPEN_CASH_DRAWER_EVENT });
      } else {
        this.props.navigation.dispatch(popAndReplace("scanDrawer", { eventType: OPEN_CASH_DRAWER_EVENT }));
      }
    }
  }

  private shouldPromptTenderReferenceData = (prevProps: Props): void => {
    if (this.props.businessState.error && prevProps.businessState.inProgress && !this.props.businessState.inProgress) {
      const error = this.props.businessState.error as QualificationError;
      if (error.requiredInputs && error.localizableMessage &&
            error.localizableMessage.i18nCode === SSF_TENDER_REFERENCE_DATA_MISSING_I18N_CODE) {
        if (!Theme.isTablet) {
          this.props.navigation.push("tenderReference", {
            onSave: (referenceNumber: string) => this.acceptTenderReferenceData(referenceNumber),
            onCancel: () => this.props.navigation.dispatch(popTo("payment")),
            requiredInputs: error.requiredInputs
          });
        }
      }
    }
  }

  private acceptTenderReferenceData(referenceNumber: string): void {
    const uiInputs = [...this.props.businessState.inputs];
    uiInputs.push(new UiInput(UiInputKey.TENDER_REFERENCE_DATA, {referenceNumber}));

    this.props.performBusinessOperation(this.props.settings.deviceIdentity,
        this.props.businessState.eventType, uiInputs);
    this.props.navigation.dispatch(popTo("payment"));
  }

  private proceedToScanDrawer(prevProps: Props): boolean {
    return this.props.businessState.stateValues.get("CashDrawerSession.isWaitingForUserToSelectCashDrawer") &&
        !appIsWaitingForSignature(this.props) && (appIsWaitingForSignature(prevProps) ||
        !prevProps.businessState.stateValues.get("CashDrawerSession.isWaitingForUserToSelectCashDrawer"));
  }

  private handleTaxCustomerForReturnWithTransaction(): void {
    if (this.typeChoicesConfig?.restrictReturnWithTransactionReceiptOptionsToOriginal &&
        this.props.businessState.stateValues.get("transaction.type") === MERCHANDISE_TRANSACTION_TYPE) {
      const transactionTradeType: MerchandiseTransactionTradeType =
          this.props.businessState.stateValues.get("transaction.transactionTradeType");
      const returnWithTransaction: boolean = this.props.businessState.stateValues.get("ItemHandlingSession.returnWithTransaction");
      const transactionInformationForReturn = this.props.businessState.stateValues.get("ItemHandlingSession.transactionInformationForReturn");
      const returnTransactionDetails = transactionInformationForReturn?.transaction as ITransaction;

      if (transactionTradeType === MerchandiseTransactionTradeType.Return && returnWithTransaction && returnTransactionDetails) {
        const taxCustomer: TaxCustomer = createFromTransaction(returnTransactionDetails);
        if (taxCustomer) {
          this.props.getTaxCustomer(taxCustomer);
        }
      }
    }
  }

  private getReceiptCategoryForReturnWithTransaction(): ReceiptCategory {
    if (this.typeChoicesConfig?.restrictReturnWithTransactionReceiptOptionsToOriginal &&
        this.props.businessState.stateValues.get("transaction.type") === MERCHANDISE_TRANSACTION_TYPE) {
      const transactionTradeType: MerchandiseTransactionTradeType =
          this.props.businessState.stateValues.get("transaction.transactionTradeType");
      const returnWithTransaction: boolean = this.props.businessState.stateValues.get("ItemHandlingSession.returnWithTransaction");

      if (transactionTradeType === MerchandiseTransactionTradeType.Return && returnWithTransaction && this.props.returnTransaction) {
        const receiptLine: IReceiptLine =
          this.props.returnTransaction.lines.find((line: ITransactionLine) =>
            isReceiptLine(line) && line.lineType === LineType.Receipt && (
              line.receiptCategory === ReceiptCategory.Invoice ||
              line.receiptCategory === ReceiptCategory.VatReceipt)) as IReceiptLine ||
          this.props.returnTransaction.lines.find((line: ITransactionLine) =>
            isReceiptLine(line) && line.lineType === LineType.Receipt &&
            line.receiptCategory === ReceiptCategory.Receipt) as IReceiptLine;

        const receiptCategory = receiptLine?.receiptCategory;
        if (receiptCategory) {
          if (receiptCategory === ReceiptCategory.Receipt &&
              this.typeChoicesConfig.standardReceipt) {
            return receiptCategory;
          }
          if (receiptCategory === ReceiptCategory.VatReceipt &&
              this.typeChoicesConfig.vatReceipt) {
            return receiptCategory;
          }
          if (receiptCategory === ReceiptCategory.Invoice &&
              this.typeChoicesConfig.fullTaxInvoice) {
            return receiptCategory;
          }
        }
      }
    }
    return undefined;
  }

  private getTransactionDetails(): ITransactionInfo {
    let transactionTotal: Money = undefined;
    let accountingCurrency: string = undefined;
    if (this.props.businessState.stateValues.get("transaction.type") === MERCHANDISE_TRANSACTION_TYPE) {
      accountingCurrency = this.props.businessState.stateValues.get("transaction.accountingCurrency");
      if (this.props.returnTransaction) {
        const totalAmount =
            this.props.returnTransaction.transactionTotal && this.props.returnTransaction.transactionTotal.amount;
        transactionTotal = new Money(totalAmount || 0.00, accountingCurrency);
      } else {
        transactionTotal = this.props.businessState.stateValues.get("transaction.total");
      }
    }
    const transactionTotalVal = transactionTotal && transactionTotal.amount && transactionTotal.amount.replace(/[-]/g, "");
    transactionTotal = transactionTotalVal && new Money(transactionTotalVal, accountingCurrency);
    const transactionDetails: ITransactionInfo = {
      transactionTotal,
      accountingCurrency
    };
    return transactionDetails;
  }

  private handleTaxIdentifiersThreshold(): boolean {
    let isIdNumberRequired: boolean = false;
    let isRucRequired: boolean = false;
    const taxCustomer = this.customer && this.customer as TaxCustomer;
    if (this.props.itemDisplayLines &&
      this.props.itemDisplayLines.some((line: IItemDisplayLine) => line.lineType === ITEM_RETURN_LINE_TYPE)) {
      isRucRequired = this.props.returnTransaction &&
        this.props.returnTransaction.lines.some((line: ITaxCustomerLine) => line.lineType === TAX_CUSTOMER_LINE_TYPE &&
          line.ruc?.value);
      isIdNumberRequired = this.props.returnTransaction &&
        this.props.returnTransaction.lines.some((line: ITaxCustomerLine) => line.lineType === TAX_CUSTOMER_LINE_TYPE &&
          line.idNumber?.value);
    } else if (this.typeChoicesConfig?.fullTaxInvoice) {
      const transactionDetails: ITransactionInfo = this.getTransactionDetails();
      const transactionTotal: Money = transactionDetails.transactionTotal;
      const accountingCurrency: string = transactionDetails.accountingCurrency;
      if (transactionTotal && accountingCurrency) {
        const i18nLocation = this.props.i18nLocation;
        if (i18nLocation && i18nLocation === I18nLocationValues.Peru) {
          const taxIdentifiersThreshold: ITaxIdentifierValidation =
              getTaxidentifierValdiation(this.props.settings.configurationManager, i18nLocation,
              transactionTotal, accountingCurrency);
          isRucRequired = taxIdentifiersThreshold.ruc;
          isIdNumberRequired = taxIdentifiersThreshold.idNumber;
        }
      } else if (taxCustomer) {
        if (taxCustomer.ruc && taxCustomer.ruc.value) {
          isRucRequired = true;
        } else if (taxCustomer.idNumber && taxCustomer.idNumber.value) {
          isIdNumberRequired = true;
        }
      }
    }
    return  isRucRequired && !isIdNumberRequired;
  }

  private handleTaxationThreshold(): boolean {
    let isVatNumberRequired: boolean = false;
    if (this.typeChoicesConfig?.fullTaxInvoice) {
      const transactionDetails: ITransactionInfo = this.getTransactionDetails();
      const transactionTotal: Money = transactionDetails.transactionTotal;
      const accountingCurrency: string = transactionDetails.accountingCurrency;
      if (transactionTotal && accountingCurrency) {
        const i18nLocation = getI18nLocation(this.props.retailLocations, this.props.settings.configurationManager);
        if (i18nLocation && i18nLocation === I18nLocationValues.Portugal) {
          const taxIdentifiersThreshold: ITaxationValidation =
              getTaxationValdiation(this.props.settings.configurationManager, i18nLocation,
              transactionTotal, accountingCurrency);
          isVatNumberRequired = taxIdentifiersThreshold.vatNumber? false : true;
        }
      }
    }
    return  isVatNumberRequired;
  }

  private handleCustomerDetailsThreshold(): ICustomerValidation {
    let customerValidationDetails: ICustomerValidation = {};

    if (this.props.returnTransaction) {
      customerValidationDetails = {
        firstName: false,
        lastName: false,
        companyName: false,
        countryCode: false,
        phoneNumber: false,
        address: false
      };
    } else {
      if (this.typeChoicesConfig?.fullTaxInvoice) {
        const transactionDetails: ITransactionInfo = this.getTransactionDetails();
        const transactionTotal: Money = transactionDetails.transactionTotal;
        const accountingCurrency: string = transactionDetails.accountingCurrency;
        if (transactionTotal && accountingCurrency) {
          const i18nLocation = this.props.i18nLocation;
          if (i18nLocation &&
              (i18nLocation === I18nLocationValues.Peru || i18nLocation === I18nLocationValues.Portugal)) {
            customerValidationDetails =
                getCustomerDetailsThresholdValdiation(this.props.settings.configurationManager, i18nLocation,
                transactionTotal, accountingCurrency);
          }
        }
      } else {
        customerValidationDetails = {
          firstName: false,
          lastName: false,
          companyName: false,
          countryCode: false,
          phoneNumber: false,
          address: false
        };
      }
    }
    return customerValidationDetails;
  }

  private handleSaveTaxCustomer = (customer: Customer, taxIdentifier: string, taxIdentifierName: string,
                                   taxCode: string, taxCodeName: string, pecAddress: string,
                                   pecAddressName: string, addressCode: string, addressCodeName: string,
                                   idNumber: string, idNumberName: string, ruc: string, rucName: string): void => {
    const taxCustomer = customer as TaxCustomer;

    taxCustomer.governmentTaxIdentifier = {
      name: taxIdentifierName,
      value: taxIdentifier
    } as ITaxIdentifier;

    taxCustomer.taxCode = {
      name: taxCodeName,
      value: taxCode
    } as ITaxIdentifier;

    taxCustomer.pecAddress = {
      name: pecAddressName,
      value: pecAddress
    } as ITaxIdentifier;

    taxCustomer.addressCode = {
      name: addressCodeName,
      value: addressCode
    } as ITaxIdentifier;

    taxCustomer.idNumber = {
      name: idNumberName,
      value: idNumber
    } as ITaxIdentifier;

    taxCustomer.ruc = {
      name: rucName,
      value: ruc
    } as ITaxIdentifier;

    this.props.getTaxCustomer(taxCustomer);
    this.props.navigation.pop();
  }

  private handleTaxCustomerAssignment(): void {
    this.props.sceneTitle("customerTaxInvoice", "confirmDetails");
    const i18nLocation = this.props.i18nLocation;
    this.props.navigation.push("customerTaxInvoice", {
      taxInvoiceButtonText: `${I18n.t("save")}`,
      saveCustomerTaxInformation: this.handleSaveTaxCustomer,
      isRucRequired: i18nLocation && i18nLocation === I18nLocationValues.Peru ?
          this.handleTaxIdentifiersThreshold() : false,
      vatNumberRequired: i18nLocation && i18nLocation === I18nLocationValues.Portugal ?
          this.handleTaxationThreshold() : true,
      customerValidationDetails: this.handleCustomerDetailsThreshold(),
      onExit: () => { return; }
    });
  }

  private shouldShowSubscriptionTokenDialog(): boolean {
    return this.props.uiState.logicalState === IN_MERCHANDISE_TRANSACTION_WAITING
        && this.props.businessState.stateValues.get("SubscriptionTokenSession.state") === SubscriptionTokenSessionState.RequiresToken;
  }

  private moveToTokenAuthorizationScreen = () => {
      this.props.navigation.replace("subscriptionAuthorization");
  }
}

function mapStateToProps(state: AppState): StateProps {
  const transactionInformationForReturn: TransactionWithAdditionalData = state.businessState.stateValues.get(
    "ItemHandlingSession.transactionInformationForReturn"
  );
  return {
    businessState: state.businessState,
    isSuspendTransactionVisible: state.uiState.featureActionButtonProps.isSuspendTransactionVisible,
    isSuspendTransactionEnabled: state.uiState.featureActionButtonProps.isSuspendTransactionEnabled,
    isVoidTransactionVisible: state.uiState.featureActionButtonProps.isVoidTransactionVisible,
    isVoidTransactionEnabled: state.uiState.featureActionButtonProps.isVoidTransactionEnabled,
    paymentStatus: state.deviceStatus && state.deviceStatus.paymentStatus,
    loyaltyMembershipActivities: state.loyaltyMembershipState &&
        state.loyaltyMembershipState.loyaltyMembershipActivities,
    remoteCall: state.remoteCall,
    settings: state.settings,
    uiState: state.uiState,
    displayInfo: state.businessState.displayInfo,
    taxCustomer: state.receipt.taxCustomer,
    retailLocations: state.retailLocations,
    itemDisplayLines: state.businessState.displayInfo && state.businessState.displayInfo.itemDisplayLines,
    returnTransaction: transactionInformationForReturn?.transaction as IMerchandiseTransaction,
    isReprintLastReceipt: state.receipt.isReprintLastReceipt,
    pendingPaymentMode: state.pendingPayment && state.pendingPayment.mode,
    exchangeRates: state.exchangeRate.exchangeRates,
    currentScreenName: getCurrentRouteNameWithNavigationRef(),
    i18nLocation: state.i18nLocationState?.i18nLocation
  };
}

export default connect<StateProps, DispatchProps>(mapStateToProps, {
  alert: alert.request,
  performBusinessOperation: businessOperation.request,
  updateTimers,
  updateUiMode: updateUiMode.request,
  sceneTitle: sceneTitle.request,
  getTaxCustomer: getTaxCustomer.request,
  updatePendingPayment: updatePendingPayment.request,
  dismissAlertModal: dismissAlertModal.request
})(withMappedNavigationParams<typeof PaymentScreen>()(PaymentScreen));
