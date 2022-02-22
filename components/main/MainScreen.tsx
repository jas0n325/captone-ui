import { isEmpty, last } from "lodash";
import _ from "lodash";
import Moment from "moment";
import * as React from "react";
import { Alert, AlertOptions } from "react-native";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import { Money, Quantity } from "@aptos-scp/scp-component-business-core";
import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { IPrintResult } from "@aptos-scp/scp-component-rn-device-services";
import {
  DeviceIdentity,
  IConfigurationManager,
  IConfigurationValues,
  QualificationError,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  AllowedReturnTypes,
  APPLY_ITEM_EVENT,
  APPLY_ITEM_EXTENSIBILITY_FORM_DATA_EVENT,
  APPLY_ITEM_SUBSCRIPTION_EVENT,
  APPLY_SINGLE_USE_COUPON_EVENT,
  APTOS_ITEM_COMMENTS_FORM,
  APTOS_STORE_SELLING_NAMESPACE,
  AuthorizationMode,
  BAG_FEE_EVENT,
  BALANCE_INQUIRY_RECEIPT_EVENT,
  CANCEL_TENDER_SESSION_EVENT,
  CAPTURE_LOTTERY_CODE_EVENT,
  CollectedDataKey,
  COMMENT_ITEM_EVENT,
  CONFIRM_CASH_DRAWER_CLOSED_EVENT,
  ConfirmSubscriptionsOptions,
  CREATE_CUSTOMER_EVENT,
  Customer,
  CUSTOMER_UPDATE_RESULT,
  datesAreEqual,
  DIGITAL_SIGNATURE_UNAVAILABLE_REASON_CODE,
  ENROLL_CUSTOMER_EVENT,
  ENTER_RETURN_MODE_EVENT,
  EXIT_ATTENDANT_MODE_EVENT,
  EXIT_RETURN_MODE_EVENT,
  FIND_CUSTOMERS_EVENT,
  GiftCertificateState,
  IDiscountDisplayLine,
  IDisplayInfo,
  IItemDisplayLine,
  IN_MERCHANDISE_TRANSACTION,
  IN_MERCHANDISE_TRANSACTION_WAITING,
  IN_MERCHANDISE_TRANSACTION_WAITING_TO_CLOSE,
  IN_NO_SALE_TRANSACTION,
  IN_NO_SALE_TRANSACTION_WAITING,
  IN_NO_SALE_TRANSACTION_WAITING_TO_CLOSE,
  IN_TAX_REFUND_CONTROL_TRANSACTION,
  IN_TAX_REFUND_CONTROL_TRANSACTION_WAITING_TO_CLOSE,
  IN_TENDER_CONTROL_TRANSACTION,
  IN_TENDER_CONTROL_TRANSACTION_WAITING,
  IN_TENDER_CONTROL_TRANSACTION_WAITING_TO_CLOSE,
  IN_TILL_CONTROL_TRANSACTION,
  IN_TILL_CONTROL_TRANSACTION_WAITING,
  IN_TILL_CONTROL_TRANSACTION_WAITING_TO_CLOSE,
  isFeatureConfigPresentAndEnabled,
  isLoyaltyMembershipEnabled,
  isValidOrder,
  ITEM_CANCEL_LINE_TYPE,
  ITEM_ORDER_LINE_TYPE,
  ITEM_RETURN_LINE_TYPE,
  ITEM_SALE_LINE_TYPE,
  ITillDisplayLine,
  LOG_OFF_EVENT,
  LOOKUP_CUSTOMER_EVENT,
  LotteryVoidDescription,
  LotteryVoidReason,
  MERCHANDISE_TRANSACTION_TYPE,
  MODIFY_RETURN_ITEM_REASON_CODE_EVENT,
  MULTI_LINE_EVENT,
  NO_SALE_EVENT,
  NOT_IN_TRANSACTION,
  OPEN_CASH_DRAWER_EVENT,
  Order,
  ORDER_ITEM_MULTI_LINE_EVENT,
  PAID_IN_EVENT,
  PAID_OUT_EVENT,
  POST_VOID_TRANSACTION_EVENT,
  ReceiptState,
  REPRINT_LAST_TRANSACTION_RECEIPTS_EVENT,
  REPRINT_RECEIPT_TRANSACTION_TYPE,
  REPRINT_TRANSACTION_RECEIPTS_EVENT,
  RESERVE_INVENTORY_EVENT,
  ResumeTransactionSessionState,
  RETRY_AUTHORIZATION_EVENT,
  RETURN_ITEM_EVENT,
  RETURN_ITEM_NOT_ON_FILE_EVENT,
  RETURN_TOTAL_EVENT,
  SAFE_TO_TILL_EVENT,
  SecurityAuthorizationStatusType,
  SELL_ITEM_NOT_ON_FILE_EVENT,
  SHIPPING_FEE_EVENT,
  SKIP_TAX_REFUND_EVENT,
  SSF_CURRENCY_MISMATCH_I18N_CODE,
  SSF_GET_TERMINAL_STATE_API_ERROR_I18N_CODE,
  SSF_ITEM_API_ERROR_I18N_CODE,
  SSF_ITEM_DISALLOW_ZERO_PRICE_ENTRY,
  SSF_ITEM_HARD_STOP_I18N_CODE,
  SSF_ITEM_NOT_FOUND_I18N_CODE,
  SSF_ITEM_REQUIRES_PRICE_ENTRY,
  SSF_ITEM_RETURN_CUST_INFO,
  SSF_ITEM_SOFT_STOP_I18N_CODE,
  SSF_ITEM_ZERO_PRICED_I18N_CODE,
  SSF_ORDER_NOT_PREPAID_I18N_CODE,
  SSF_RESTRICTED_SAME_DISCOUNT_EVENT_I18N_CODE,
  SSF_RETAIL_LOCATION_CLOSED_I18N,
  SSF_SINGLE_USE_COUPON_CANNOT_ACCEPT_I18N_CODE,
  SSF_SINGLE_USE_COUPON_EXPIRED_I18N_CODE,
  SSF_SINGLE_USE_COUPON_INVALID_I18N_CODE,
  SSF_SINGLE_USE_COUPON_REQUIRES_VALID_CUSTOMER_NUMBER_I18N_CODE,
  START_TAX_REFUND_VOID_EVENT,
  StoreItem,
  SubscriptionFlowOptions,
  SubscriptionTokenSessionState,
  TAX_REFUND_PRINT_STATUS_EVENT,
  TAX_REFUND_VOID_EVENT,
  TENDER_AUTHORIZATION_TOKEN_LINE_TYPE,
  TenderAuthCategory,
  TenderAuthorizationState,
  TERMINAL_CLOSED,
  TERMINAL_CONTROL_TRANSACTION_TYPE,
  TILL_AUDIT_EVENT,
  TILL_COUNT_EVENT,
  TILL_IN_EVENT,
  TILL_OUT_EVENT,
  TILL_RECONCILIATION_EVENT,
  TILL_TO_BANK_EVENT,
  TILL_TO_SAFE_EVENT,
  TOTAL_TRANSACTION_EVENT,
  TRANSACTION_FEE_EVENT,
  TRANSACTION_RECEIPTS_EVENT,
  UiInputKey,
  UPDATE_CUSTOMER_EVENT,
  UPDATE_USER_PREFERRED_LANGUAGE_EVENT,
  VOID_CASH_DRAWER_TENDER_EVENT,
  VOID_TAX_REFUND_LINE_TYPE,
  VOID_TRANSACTION_EVENT
} from "@aptos-scp/scp-component-store-selling-features";
import { ValueCertSubType } from "@aptos-scp/scp-types-commerce-devices";
import {
  FeeType,
  FulfillmentType,
  ITaxIdentifier,
  MerchandiseTransactionClosingState,
  MerchandiseTransactionReservationStatus,
  MerchandiseTransactionTradeType,
  OrderType,
  ReceiptCategory,
  ReceiptType
} from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  alert,
  AlertRequest,
  businessOperation,
  clearLoyaltyMembership,
  clearSelectedItemLines,
  DataEventType,
  dismissAlertModal,
  displayErrorScanner,
  displayToast,
  getCashDrawers,
  getRetailLocationAction,
  ItemSelectionMode,
  ModalAction,
  recordSCOBlockingBusinessError,
  selectCustomer,
  showModal,
  updateUiMode
} from "../../actions";
import {
  AppState,
  CustomerState,
  DeviceStatusState,
  RetailLocationsState,
  UI_MODE_ASSIGN_SALESPERSON_TO_TRANSACTION,
  UI_MODE_COUPON_SCREEN,
  UI_MODE_CUSTOMER_SEARCH_SCREEN,
  UI_MODE_ITEM_NOT_FOUND,
  UI_MODE_ITEM_NOT_FOUND_RETRY_ENTRY,
  UI_MODE_ITEM_SELECTION,
  UI_MODE_PRODUCT_DETAIL,
  UI_MODE_PRODUCT_INQUIRY,
  UI_MODE_REASON_CODE,
  UI_MODE_STOPPED_ITEM,
  UI_MODE_SUSPEND_TRANSACTION,
  UI_MODE_VOID_TRANSACTION,
  UI_MODE_WAITING_TO_CLEAR_TRANSACTION,
  UI_MODE_WAITING_TO_CLOSE,
  UI_MODE_ZERO_PRICED,
  UiState
} from "../../reducers";
import Theme from "../../styles";
import { AlertModalButton } from "../common/AlertModal";
import BaseView from "../common/BaseView";
import { SUSPEND_TRANSACTION_MODAL } from "../common/constants";
import { RenderSelectOptions } from "../common/FieldValidation";
import Header from "../common/Header";
import ToastPopUp from "../common/ToastPopUp";
import {
  countOfAllItems,
  getCouponMessage,
  getCouponTitle,
  getCurrentValueOfField,
  getFeatureAccessConfig,
  getItemDisplayLine,
  getPrintStatusFromPrintResult,
  getReasonListType,
  getReasonOptions,
  getStoreLocale,
  getTransactionIsOpen,
  IFeatureActionButtonProps,
  isCustomerLoyaltyPromptNeeded,
  isDonationVisible,
  isFranceLocation,
  itemDisplayLineAdded,
  itemDisplayLineCreated,
  itemDisplayLineHasValidExtensibilityForms,
  printAmount,
  promptForCustomerAfterTransactionReceipts,
  promptToReturnCoupon
} from "../common/utilities";
import { basketContainsNonReturnItems } from "../common/utilities/basketUtils";
import { popTo } from "../common/utilities/navigationUtils";
import {
  getEligibleSubscriptionItems,
  getSubscriptionInfoForMassUnsubscribe
} from "../common/utilities/subscriptionUtils";
import {
  printSuspendedReceipt
} from "../common/utilities/suspendUtilities";
import { getTillEventFromStartLine } from "../common/utilities/tillManagementUtilities";
import { GiftCertificateAction } from "../common/utilities/utils";
import { DiscountLevel, DiscountType } from "../discounts/constants";
import { getCurrentRouteNameWithNavigationRef } from "../RootNavigation";
import { SCOScreenKeys } from "../selfCheckout/common/constants";
import { ShippingMethod } from "../shipping/ShippingMethodScreen";
import { NavigationScreenProps, StackNavigatorParams } from "../StackNavigatorParams";
import { MainComponentCommonProps } from "./constants";
import { MainScreenProps } from "./interfaces";
import { default as MainPhone } from "./phone/Main";
import { mainStyle } from "./styles";
import { default as MainTablet } from "./tablet/Main";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.main.MainScreen");

interface StateProps {
  businessStateError: Error;
  businessStateEventType: string;
  businessStateInputs: UiInput[];
  businessStateInProgress: boolean;
  configManager: IConfigurationManager;
  customerState: CustomerState;
  deviceIdentity: DeviceIdentity;
  deviceStatus: DeviceStatusState;
  displayInfo: IDisplayInfo;
  eventType: DataEventType;
  hasRewardReasons: boolean;
  itemSelectionMode: ItemSelectionMode;
  nonContextualData: Readonly<Map<string, any>>;
  scoBlockingBusinessError: Error;
  scoLastSceneKey: SCOScreenKeys;
  selectedItems: number[];
  stateValues: Map<string, any>;
  uiState: UiState;
  featureActionButtonProps: IFeatureActionButtonProps;
  retailLocations: RetailLocationsState;
  totalTransactionIsAllowed: boolean;
  currentScreenName: string;
  displayToast: string;
  i18nLocation: string;
}

interface DispatchProps {
  alert: AlertRequest;
  clearSelectedItemLines: ActionCreator;
  clearLoyaltyMembership: ActionCreator;
  dismissAlert: ActionCreator;
  showModal: ModalAction;
  displayErrorScanner: ActionCreator;
  performBusinessOperation: ActionCreator;
  resolveSCOBlockingBusinessError: ActionCreator;
  selectCustomer: ActionCreator;
  updateUiMode: ActionCreator;
  getRetailLocation: ActionCreator;
  getCashDrawers: ActionCreator;
  displayToastSuccess: ActionCreator;
}

interface Props extends MainScreenProps, StateProps, DispatchProps,
    NavigationScreenProps<"main"> {}

interface State {
  closingTransaction: boolean;
  offlineOptionsOn: boolean;
  printSuspendReceipt: boolean;
  printVoidReceipt: boolean;
  retryAuthorizationOn: boolean;
  partialAuthorizationApprovalOn: boolean;
  returnTotalAuthorization: boolean;
  totalTransactionRequested: boolean;
  totalTransactionOptions: ITotalTransactionOptions;
  salespersonSkipped: boolean;
  selectedVoidSaleReasonCode: RenderSelectOptions;
  stoppedItem: IItemDisplayLine;
  stoppedItemStatus: string;
  stoppedItemStatusMessage: string;
  tempInfoMessage: string;
  transactionVoided: boolean;
  voidSaleReasonCodes: RenderSelectOptions[];
  returnItemReasonCodes: RenderSelectOptions[];
  returnItemNotOnFileReasonCodes: RenderSelectOptions[];
  selectedReturnItemReasonCode: RenderSelectOptions;
  deviceStatus: DeviceStatusState;
  isVoidLotteryCode: boolean;
  shouldShowCommentScreen: boolean;
  isCustomerAttached: boolean;
  isInitialCashDrawerOnStartup: boolean;
  isCustomerAssignedDuringTransactionReturns: boolean;
}

interface ITotalTransactionOptions {
  replaceAction: boolean;
  showSuspendModal: boolean;
}

class MainScreen extends React.PureComponent<Props, State> {
  private styles: any;
  private customerBannerButtonClickable: boolean;
  private customerBannerButtonVisible: boolean = true;
  private customerBannerButtonActionIsCreate: boolean = true;
  private selfCheckoutModeEnabled: boolean;
  private mixedBasketAllowed: boolean;
  private shouldPromptForCustomer: boolean = false;
  private shouldPromptForSalesperson: boolean = true;
  private allowSalespersonPromptAtTransactionStartToBeSkipped: boolean;
  private shouldDisplayCustomerNumber: boolean;
  private shouldDisplayLoyaltyIndicator: boolean;
  private returnItemReasonListType: string;
  private returnItemNotOnFileReasonListType: string;
  private allowExpiredCouponOverride: boolean = true;
  private returnWithTransactionEnabled: boolean = false;
  private returnModeAll: boolean;
  private defaultSalespersonToCashier: boolean = false;
  private requestedCashDrawerStatus: boolean = false;
  private displayingConfirmCashDrawerClosedAlert: boolean = false;
  private isDonationVisible: boolean = false;
  private isEnteringSalespersonUiMode: boolean = false;

  public constructor(props: Props) {
    super(props);

    this.returnItemReasonListType = getReasonListType(this.props.configManager, RETURN_ITEM_EVENT);
    this.returnItemNotOnFileReasonListType = getReasonListType(this.props.configManager, RETURN_ITEM_NOT_ON_FILE_EVENT);

    this.styles = Theme.getStyles(mainStyle());

    const functionalBehaviorValues: IConfigurationValues = this.props.configManager.getFunctionalBehaviorValues();

    const customerBannerButtonConfig = functionalBehaviorValues.customerFunctionChoices.customerBannerButton;
    logger.debug(() => "customerBannerButton Configuration Values",
        {metaData: new Map([["customerBannerButtonConfig", customerBannerButtonConfig]])});

    this.customerBannerButtonVisible = customerBannerButtonConfig ? customerBannerButtonConfig.visible : undefined;
    this.customerBannerButtonActionIsCreate = (
        this.customerBannerButtonVisible ? (customerBannerButtonConfig.noCustomerAction === "create") : false
    );

    this.shouldPromptForCustomer = functionalBehaviorValues.customerFunctionChoices.
        promptForCustomerAtTransactionStart;

    this.shouldPromptForSalesperson = functionalBehaviorValues.salespersonBehaviors.
        promptForSalespersonAtTransactionStart;

    this.allowSalespersonPromptAtTransactionStartToBeSkipped = functionalBehaviorValues.salespersonBehaviors
        ?.allowSalespersonPromptAtTransactionStartToBeSkipped;

    this.defaultSalespersonToCashier = functionalBehaviorValues.salespersonBehaviors?.defaultSalespersonToCashier;

    this.allowExpiredCouponOverride =
        functionalBehaviorValues.couponBehaviors.allowExpiredValidatedCouponsInTransaction;

    this.customerBannerButtonClickable = functionalBehaviorValues.customerFunctionChoices.customerBannerButton.
        clickable;

    this.shouldDisplayCustomerNumber = functionalBehaviorValues.customerFunctionChoices.customerBannerButton.
        displayCustomerNumber;

    this.shouldDisplayLoyaltyIndicator =
        _.get(functionalBehaviorValues, "customerFunctionChoices.customerBannerButton.displayLoyaltyIndicator", true);

    this.selfCheckoutModeEnabled = functionalBehaviorValues.selfCheckoutModeBehaviors &&
        functionalBehaviorValues.selfCheckoutModeBehaviors.enabled;

    this.mixedBasketAllowed = functionalBehaviorValues.returnsBehaviors &&
        functionalBehaviorValues.returnsBehaviors.mixedBasketAllowed;

    const enterReturnModeFeatureConfig = getFeatureAccessConfig(
      this.props.configManager,
      ENTER_RETURN_MODE_EVENT
    );
    this.returnWithTransactionEnabled = enterReturnModeFeatureConfig &&
        (enterReturnModeFeatureConfig.allowReturn === AllowedReturnTypes.All ||
            enterReturnModeFeatureConfig.allowReturn === AllowedReturnTypes.WithTransaction);

    this.returnModeAll = enterReturnModeFeatureConfig &&
        (enterReturnModeFeatureConfig.allowReturn === AllowedReturnTypes.All);

    this.isDonationVisible = isDonationVisible(this.props.configManager);

    const hasSalesPerson: boolean = !!(props.stateValues && props.stateValues.get("transaction.salesperson"));

    this.state = {
      transactionVoided: false,
      closingTransaction: false,
      printSuspendReceipt: false,
      printVoidReceipt: false,
      tempInfoMessage: this.props.message ? this.props.message : undefined,
      deviceStatus: undefined,
      offlineOptionsOn: false,
      retryAuthorizationOn: false,
      partialAuthorizationApprovalOn: false,
      returnTotalAuthorization: false,
      totalTransactionRequested: false,
      totalTransactionOptions: undefined,
      stoppedItem: undefined,
      stoppedItemStatus: undefined,
      stoppedItemStatusMessage: undefined,
      voidSaleReasonCodes: props.featureActionButtonProps.voidTransactionReasonListType &&
          getReasonOptions(props.configManager, props.featureActionButtonProps.voidTransactionReasonListType),
      selectedVoidSaleReasonCode: undefined,
      returnItemReasonCodes: this.returnItemReasonListType &&
          getReasonOptions(props.configManager, this.returnItemReasonListType),
      returnItemNotOnFileReasonCodes: this.returnItemNotOnFileReasonListType &&
          getReasonOptions(props.configManager, this.returnItemNotOnFileReasonListType),
      selectedReturnItemReasonCode: undefined,
      salespersonSkipped: !hasSalesPerson && props.uiState.logicalState === IN_MERCHANDISE_TRANSACTION &&
          functionalBehaviorValues.salespersonBehaviors.promptForSalespersonAtTransactionStart,
      isVoidLotteryCode: false,
      shouldShowCommentScreen: false,
      isCustomerAttached: false,
      isInitialCashDrawerOnStartup: false,
      isCustomerAssignedDuringTransactionReturns: false
    };

    this.onEnterReturnMode = this.onEnterReturnMode.bind(this);
  }

  public componentDidMount(): void {
    if (this.props.startup) {
      this.setState({isInitialCashDrawerOnStartup: true});
      this.handleStartupBehavior();
    } else if (this.props.scoLastSceneKey) {
      const scoBusinessError = this.props.scoBlockingBusinessError;
      const shouldShowHardStopSoftStop: boolean = scoBusinessError && scoBusinessError instanceof QualificationError &&
          (scoBusinessError.localizableMessage.i18nCode === SSF_ITEM_HARD_STOP_I18N_CODE ||
           scoBusinessError.localizableMessage.i18nCode === SSF_ITEM_SOFT_STOP_I18N_CODE);

      if (shouldShowHardStopSoftStop) {
        this.handleCaughtStoppedItem(scoBusinessError as QualificationError);
        this.props.resolveSCOBlockingBusinessError();

      } else if (this.props.scoLastSceneKey === SCOScreenKeys.Payment) {
        this.moveToPaymentScreen();
      }
    }

    if (!this.props.retailLocations.retailLocation) {
      this.props.getRetailLocation();
    }
  }

  // tslint:disable-next-line:cyclomatic-complexity
  public componentDidUpdate(prevProps: Props, prevState: State): void {
    const lotteryCode: string = this.props.stateValues.get("transaction.taxLotteryCustomerCode");
    const prevLotteryCode: string = prevProps.stateValues.get("transaction.taxLotteryCustomerCode");

    if (this.state.isVoidLotteryCode && prevLotteryCode && !lotteryCode) {
      this.setState({isVoidLotteryCode: false});
      this.handleOnTotalPressedAfterValidation();
    }

    if (this.state.shouldShowCommentScreen && prevProps.currentScreenName === "comment" &&
        this.props.currentScreenName !== "comment") {
      this.setState({shouldShowCommentScreen: false});
    }

    if (!this.props.stateValues.get("transaction.type") && prevProps.stateValues.get("transaction.type")) {
      this.setState({
        transactionVoided: false,
        closingTransaction: false,
        selectedVoidSaleReasonCode: undefined
      });
      this.props.clearLoyaltyMembership();
      this.requestedCashDrawerStatus = false;
    } else if (prevProps.uiState.logicalState !== NOT_IN_TRANSACTION &&
          this.props.uiState.logicalState === NOT_IN_TRANSACTION &&
          prevProps.uiState.logicalState !== TERMINAL_CLOSED) {
      const closingState: MerchandiseTransactionClosingState = prevProps.stateValues.get("transaction.closingState");
      const closingMessage: string =
          (closingState === MerchandiseTransactionClosingState.PostVoidCompleted && "postVoidSuccessful") ||
          (closingState === MerchandiseTransactionClosingState.PostVoidFailed && "postVoidFailed");
      if (closingMessage) {
        this.setState({ tempInfoMessage: I18n.t(closingMessage), closingTransaction: false });
      }
    } else if (!this.props.stateValues.get("ResumeSession.isPostVoiding") &&
          ((prevProps.uiState.logicalState === NOT_IN_TRANSACTION &&
          this.props.uiState.logicalState === IN_MERCHANDISE_TRANSACTION &&
          !this.props.stateValues.get("ItemHandlingSession.isReturning") &&
          !isCustomerLoyaltyPromptNeeded(this.props.configManager, this.props.businessStateEventType,
              this.props.stateValues, prevProps.stateValues, this.props.customerState.customer) &&
          this.props.businessStateEventType !== ENROLL_CUSTOMER_EVENT &&
          this.props.currentScreenName !== "productInquiryDetail" &&
          this.props.currentScreenName !== "comment" && !this.state.shouldShowCommentScreen &&
          !this.state.isCustomerAssignedDuringTransactionReturns) ||
          this.promptForSalesPerson(prevProps, prevState))) {
      if (this.isCancellingOrders()) {
        this.handleDonationScreen(true, Theme.isTablet);
      } else if (this.props.uiState.logicalState !== IN_MERCHANDISE_TRANSACTION_WAITING) {
        if ((this.shouldPromptForSalesperson ||
            this.shouldPromptForSalespersonOnResume()) &&
            prevProps.stateValues && !prevProps.stateValues.get("transaction.salesperson")) {
          this.openSalespersonScreen();
        } else if ((this.shouldPromptForCustomer || this.shouldPromptForCustomerOnReturn()) &&
            !this.props.stateValues.get("transaction.customer")) {
          if (!Theme.isTablet) {
            this.props.navigation.push("customer", {
              isTransactionStarting: !this.shouldPromptForCustomerOnReturn(),
              assignCustomer: true,
              onExit: () => this.props.navigation.dispatch(popTo("main")),
              onCancel: () => this.props.navigation.dispatch(popTo("main"))
            });
          } else {
            this.onCustomerUpdate(true);
          }
        }
      }
    }
    if (prevProps.stateValues.get("TenderAuthorizationSession.state") ===
          TenderAuthorizationState.GiftCardIssueInProgress) {
      if (this.props.stateValues.get("TenderAuthorizationSession.state") ===
            TenderAuthorizationState.WaitingForCallforAuthorization) {
        this.setState({offlineOptionsOn: true});
      } else if (this.props.stateValues.get("TenderAuthorizationSession.state") ===
            TenderAuthorizationState.WaitingForRetryLastAuthorization) {
        this.setState({retryAuthorizationOn: true});
      }
    }
    if (!this.props.businessStateInProgress && prevProps.businessStateInProgress) {
      if (!this.props.businessStateError && Theme.isTablet && this.props.uiState.mode === UI_MODE_ITEM_NOT_FOUND) {
        // If the item was found or another action was executed and it is a tablet the not found mode has to be unset
        this.props.updateUiMode(undefined);
      } else if (this.props.businessStateError && this.props.businessStateError instanceof QualificationError) {
        const error: QualificationError = this.props.businessStateError;
        const errorCode: string = error.localizableMessage.i18nCode;
        const collectedData: Map<string, any> = error.collectedData;
        // TODO: Find a better way to distinguish the reject reason (https://jira.aptos.com/browse/ZSPFLD-1829)
        if ((errorCode === SSF_ITEM_API_ERROR_I18N_CODE ||
             errorCode === SSF_ITEM_NOT_FOUND_I18N_CODE ||
             errorCode === SSF_ITEM_ZERO_PRICED_I18N_CODE) &&
            collectedData &&
            prevProps.uiState.mode !== UI_MODE_PRODUCT_INQUIRY &&
            prevProps.uiState.mode !== UI_MODE_PRODUCT_DETAIL &&
            prevProps.uiState.mode !== UI_MODE_COUPON_SCREEN) {

          const itemKey: string = collectedData.get("itemKey");
          const itemKeyType: string = collectedData.get("itemKeyType");
          const inputSource: string = collectedData.get("inputSource");

          if (errorCode !== SSF_ITEM_ZERO_PRICED_I18N_CODE) {
            const returnMode: boolean = this.props.stateValues &&
              this.props.stateValues.get("ItemHandlingSession.isReturning");
            const featureType: string = returnMode ?
                RETURN_ITEM_NOT_ON_FILE_EVENT : SELL_ITEM_NOT_ON_FILE_EVENT;
            const notOnFileFeatureConfig = getFeatureAccessConfig(this.props.configManager, featureType);
            if (prevProps.uiState.mode !== UI_MODE_ITEM_NOT_FOUND &&
                this.props.businessStateEventType !== POST_VOID_TRANSACTION_EVENT) {
              if (notOnFileFeatureConfig && notOnFileFeatureConfig.enabled) {
                if (this.props.eventType === DataEventType.ScanData ||
                    this.props.eventType === DataEventType.KeyListenerData) {
                  this.props.updateUiMode(UI_MODE_ITEM_NOT_FOUND);
                  this.props.navigation.push("notOnFile", {itemKey, itemKeyType, inputSource});
                } else if (!Theme.isTablet && this.props.currentScreenName !== "nonMerch") {
                  // Not found in tablet is display in the right panel of the main page
                  this.props.updateUiMode(UI_MODE_ITEM_NOT_FOUND);
                  this.props.navigation.push("notFound", {itemKeyType});
                } else if (this.props.uiState.mode !== UI_MODE_ITEM_NOT_FOUND_RETRY_ENTRY) {
                  this.props.updateUiMode(UI_MODE_ITEM_NOT_FOUND_RETRY_ENTRY);
                }
              } else {
                this.showAlert(I18n.t("itemNotOnFileTitle"), 500, I18n.t("itemNotFound"),
                  [{
                    text: I18n.t("ok"),
                    onPress: () => this.props.navigation.dispatch(popTo("main"))
                  }],
                  {cancelable: false});
              }
            } else if (prevProps.uiState.mode === UI_MODE_ITEM_NOT_FOUND && !Theme.isTablet) {
              this.props.navigation.push("notOnFile", {itemKey, itemKeyType, inputSource});
            }
          } else if (prevProps.uiState.mode !== UI_MODE_ZERO_PRICED) {
            const previousSellSoftStoppedItemValue = collectedData.get(CollectedDataKey.SellSoftStopItem);

            const searchItemKey: string = collectedData.get("searchItemKey");
            const searchItemKeyType: string = collectedData.get("searchItemKeyType");
            const storeItem: StoreItem = collectedData.get("storeItem");
            const line: IItemDisplayLine = getItemDisplayLine(storeItem, searchItemKey, searchItemKeyType);

            this.props.navigation.push("zeroPriced", {
              itemKey,
              itemKeyType,
              line,
              sellSoftStoppedItem: previousSellSoftStoppedItemValue
            });
          }
        } else if (errorCode === SSF_ITEM_HARD_STOP_I18N_CODE || errorCode === SSF_ITEM_SOFT_STOP_I18N_CODE) {
          if (Theme.isTablet && this.props.currentScreenName !== "main") {
            this.props.navigation.dispatch(popTo("main"));
          }

          this.handleCaughtStoppedItem(this.props.businessStateError);
        } else if (errorCode === SSF_ITEM_REQUIRES_PRICE_ENTRY) {
          const itemKey: string = collectedData.get("searchItemKey") || collectedData.get("itemKey");
          const itemKeyType: string = collectedData.get("searchItemKeyType") || collectedData.get("itemKeyType");
          const storeItem: StoreItem = collectedData.get("storeItem");
          const quantity: Quantity = collectedData.has(CollectedDataKey.Quantity) &&
              collectedData.get(CollectedDataKey.Quantity);

          if (storeItem) {
            const line: IItemDisplayLine =
                getItemDisplayLine(storeItem, itemKey, itemKeyType, quantity);

            this.props.navigation.push("price", {
              line,
              showLine: true,
              onExit: () => this.props.navigation.pop(),
              requiresPriceEntry: true
            });
          }
        } else if (errorCode === SSF_CURRENCY_MISMATCH_I18N_CODE ||
            errorCode === SSF_ORDER_NOT_PREPAID_I18N_CODE) {
          this.props.navigation.pop();
        }

        if (errorCode === SSF_GET_TERMINAL_STATE_API_ERROR_I18N_CODE ||
                   errorCode === SSF_RETAIL_LOCATION_CLOSED_I18N) {
          this.props.navigation.push("openCloseTerminal");
        } else if ( errorCode === SSF_SINGLE_USE_COUPON_INVALID_I18N_CODE ||
              errorCode === SSF_SINGLE_USE_COUPON_EXPIRED_I18N_CODE ||
              errorCode === SSF_SINGLE_USE_COUPON_CANNOT_ACCEPT_I18N_CODE) {
            const couponTitle = getCouponTitle(errorCode);
            const couponMessage = getCouponMessage(errorCode);
            this.showAlert(couponTitle, 500, couponMessage,
              this.allowExpiredCouponOverride && errorCode === SSF_SINGLE_USE_COUPON_EXPIRED_I18N_CODE
                    ? [
                      { text: I18n.t("override"), onPress: () => this.handleOnExpiredCouponOverride() },
                      { text: I18n.t("ok"), onPress: () => { promptToReturnCoupon(); } }
                    ]
                    : [{ text: I18n.t("ok") }],
                    { cancelable: false }
                    );
        } else if (errorCode === SSF_SINGLE_USE_COUPON_REQUIRES_VALID_CUSTOMER_NUMBER_I18N_CODE) {
          const isTransactionStarting: boolean = prevProps.uiState.logicalState === NOT_IN_TRANSACTION &&
              this.props.uiState.logicalState === IN_MERCHANDISE_TRANSACTION;
          const singleUseCouponUiInput: UiInput = this.props.businessStateInputs.find((uiInput: UiInput) =>
              uiInput.inputKey === UiInputKey.SINGLE_USE_COUPON_NUMBER);
          this.handleOnRequiredCustomerMissing(isTransactionStarting, singleUseCouponUiInput.inputValue);
        } else if (errorCode === SSF_ITEM_RETURN_CUST_INFO) {
          const isTransactionStarting: boolean = prevProps.uiState.logicalState === NOT_IN_TRANSACTION &&
              this.props.uiState.logicalState === IN_MERCHANDISE_TRANSACTION;
          this.handleOnRequiredCustomerMissing(isTransactionStarting, undefined);
        } else if (errorCode === SSF_RESTRICTED_SAME_DISCOUNT_EVENT_I18N_CODE) {
          let multiLineEvent: boolean = false;
          if (this.props.businessStateEventType === MULTI_LINE_EVENT && this.props.selectedItems.length > 1) {
            multiLineEvent = true;
          }
          this.props.alert(
            "",
            multiLineEvent ? I18n.t("restrictedSameDiscountMultiEvent") : I18n.t("restrictedSameDiscountEvent"),
            [{ text: I18n.t("ok") }],
            { cancellable: true }
          );
        } else if (errorCode === SSF_ITEM_DISALLOW_ZERO_PRICE_ENTRY) {
          this.props.alert(
            "",
            I18n.t("disallowZeroPriceItem"),
            [{ text: I18n.t("okCaps") }],
            { cancellable: true }
          );
        }
      }
    }

    if (this.props.uiState.mode === UI_MODE_WAITING_TO_CLOSE &&
        prevProps.uiState.mode === UI_MODE_SUSPEND_TRANSACTION) {
          if (!printSuspendedReceipt(this.props.configManager)) {
            const uiInputs: UiInput[] = [];
            uiInputs.push(new UiInput(UiInputKey.RECEIPT_TYPE, ReceiptType.None));
            uiInputs.push(new UiInput(UiInputKey.RECEIPT_CATEGORY, ReceiptCategory.Suspend));
            this.setState(
              { printSuspendReceipt: false, closingTransaction: true, isCustomerAttached: false},
              () => {
                this.props.performBusinessOperation(this.props.deviceIdentity, TRANSACTION_RECEIPTS_EVENT, uiInputs);
              }
            );
          } else {
            this.setState({ printSuspendReceipt: true, closingTransaction: true, isCustomerAttached: false });
          }
    } else if (this.voidTransactionEnded(prevProps)) {

      this.setState({
        printVoidReceipt: true,
        transactionVoided: true,
        closingTransaction: true,
        isCustomerAttached: false,
        selectedVoidSaleReasonCode: undefined
      });
    } else if (this.props.uiState.mode === UI_MODE_WAITING_TO_CLEAR_TRANSACTION &&
        prevProps.uiState.mode !== UI_MODE_WAITING_TO_CLEAR_TRANSACTION) {

      this.setState({
        transactionVoided: prevProps.uiState.mode === UI_MODE_VOID_TRANSACTION,
        salespersonSkipped: false,
        closingTransaction: true,
        isCustomerAttached: false
      });
    }

    if (!this.props.businessStateInProgress && prevProps.businessStateInProgress) {

      const order = this.props.stateValues.has("transaction.order") && this.props.stateValues.get("transaction.order");
      const showCustomerPromptOnPay = this.shouldPromptForCustomerOnPay();
      const showCustomerPromptOnReturn = this.shouldPromptForCustomerOnReturn();
      const requireCustomerForOrderCreate: boolean = this.shouldRequireCustomerForOrderCreate();

      if (this.props.businessStateEventType === RESERVE_INVENTORY_EVENT) {

        const inventoryReservationStatus =
            this.props.stateValues.has("transaction.inventoryReservationStatus") &&
            this.props.stateValues.get("transaction.inventoryReservationStatus");
        if (inventoryReservationStatus === MerchandiseTransactionReservationStatus.PartiallyReserved) {
          this.moveToUnreservedQuantitiesDetailScreen(this.props.displayInfo);
        } else {
          this.moveFromOrSkipInventoryReserve();
        }
      } else if (this.props.businessStateEventType === APPLY_ITEM_SUBSCRIPTION_EVENT &&
            this.props.currentScreenName === "itemSubscription" &&
            this.props.selectedItems.length === 0) {
        this.moveFromOrSkipInventoryReserve();
      } else if (this.props.businessStateEventType === BAG_FEE_EVENT) {
        this.moveFromOrSkipBagFeeScreen(order, showCustomerPromptOnReturn,
          showCustomerPromptOnPay, requireCustomerForOrderCreate);
      } else if (this.props.businessStateEventType === CREATE_CUSTOMER_EVENT) {
        const transactionCustomer = this.props.stateValues.get("transaction.customer");
        if (transactionCustomer && transactionCustomer.customerNumber) {
          this.setState({tempInfoMessage: I18n.t("customerCreateSuccess")});
        } else if (!this.props.configManager.getFunctionalBehaviorValues().
            customerFunctionChoices?.customerCreate?.discardCustomerOnServiceFailure) {
          this.setState({tempInfoMessage: I18n.t("customerUnsuccessful")});
        }
      } else if (this.props.businessStateEventType === LOOKUP_CUSTOMER_EVENT) {
        const transactionCustomer = this.props.stateValues.get("transaction.customer");
        if (transactionCustomer && transactionCustomer.customerNumber) {
          if (this.state.isCustomerAttached) {
            this.setState({tempInfoMessage: I18n.t("customerUpdateStatus")});
          } else {
            this.setState({isCustomerAttached: true});
          }
        }
      } else if (this.props.businessStateEventType === UPDATE_CUSTOMER_EVENT &&
            this.props.nonContextualData.get(CUSTOMER_UPDATE_RESULT)) {
        if (this.props.nonContextualData.get(CUSTOMER_UPDATE_RESULT).successful) {
          this.setState({tempInfoMessage: I18n.t("customerUpdateSuccess")});
        } else {
          this.setState({tempInfoMessage: I18n.t("customerUpdateUnsuccessful")});
        }
      } else if (this.props.businessStateEventType === UPDATE_USER_PREFERRED_LANGUAGE_EVENT) {
        if (this.props.stateValues.get("UserSession.user.preferredLanguage") === I18n.locale) {
          this.setState({tempInfoMessage: I18n.t("preferencesUpdated")});
        } else {
          this.setState({tempInfoMessage: I18n.t("preferencesUpdatedFailure")});
        }
      } else if (this.props.businessStateEventType === REPRINT_TRANSACTION_RECEIPTS_EVENT ||
                this.props.businessStateEventType === REPRINT_LAST_TRANSACTION_RECEIPTS_EVENT) {
        if (this.props.stateValues.get("transaction.type") === REPRINT_RECEIPT_TRANSACTION_TYPE  &&
            this.props.stateValues.get("transaction.closed")) {
          this.setState({tempInfoMessage: I18n.t("receiptSent")});
        }
      } else if (this.props.businessStateEventType === TAX_REFUND_VOID_EVENT ||
                 (this.props.businessStateEventType === START_TAX_REFUND_VOID_EVENT &&
                  this.props.stateValues.get("ItemHandlingSession.returnWithTransaction"))) {
        if (this.props.nonContextualData.get(CollectedDataKey.TaxRefundVoidSuccessful)) {
          this.setState({tempInfoMessage: I18n.t("taxFreeVoidSuccess")});
        } else {
          this.setState({tempInfoMessage: I18n.t("taxFreeVoidFailed")});
        }
      }
    }

    if (!this.state.voidSaleReasonCodes && !prevProps.featureActionButtonProps.voidTransactionReasonListType &&
          this.props.featureActionButtonProps.voidTransactionReasonListType) {
      this.setState({ voidSaleReasonCodes: getReasonOptions(this.props.configManager,
          this.props.featureActionButtonProps.voidTransactionReasonListType) });
    }

    if (this.props.displayToast && this.state.tempInfoMessage !== this.props.displayToast) {
      this.setState({ tempInfoMessage: this.props.displayToast });
      this.props.displayToastSuccess();
    }

    this.checkAndHandleCustomerSearch(prevProps);

    this.checkAndHandleTerminalOpenChange(prevProps);

    this.checkAndHandleChangeInSelectionMode(prevProps);

    this.checkAndHandleSupervisorOverrideForReturnItems(prevProps);

    this.checkAndHandleReasonCodeForReturnItems(prevProps);

    this.checkAndHandleTotalTransactionRequested(prevProps);

    this.checkAndHandleTransactionVoidToast(prevProps);

    this.checkAndHandleTransactionFulfillmentToast(prevProps);

    this.handleEnteredReturnMode(prevProps);

    this.handleCashDrawerPrompts(prevProps);

    this.handleExtensibilityForms(prevProps);

    if (this.isEnteringSalespersonUiMode) {
      this.isEnteringSalespersonUiMode = false;
    }
  }

  public render(): JSX.Element {
    const customer: Customer = this.props.stateValues && this.props.stateValues.get("transaction.customer");

    const receiptCategory: ReceiptCategory = this.receiptCategory;

    const isLoyaltyDiscountEnable = isLoyaltyMembershipEnabled(customer, this.props.configManager) &&
        this.props.hasRewardReasons;

    const mainComponentCommonProps: MainComponentCommonProps = {
      appLogo: this.props.appLogo,
      canSelectItems: this.showSelectItems,
      closingTransaction: this.state.closingTransaction,
      customer,
      customerBannerButtonClickable: this.customerBannerButtonClickable,
      customerBannerButtonVisible: this.customerBannerButtonVisible,
      mixedBasketAllowed: this.mixedBasketAllowed,
      printReceipt: !!receiptCategory,
      receiptCategory,
      shouldDisplayCustomerNumber: this.shouldDisplayCustomerNumber,
      shouldDisplayLoyaltyIndicator: this.shouldDisplayLoyaltyIndicator,
      showOfflineOptions: this.state.offlineOptionsOn,
      showRetryAuthorization: this.state.retryAuthorizationOn,
      showPartialAuthorizationApproval: this.state.partialAuthorizationApprovalOn,
      transactionVoided: this.state.transactionVoided,
      isLoyaltyDiscountEnable,
      handleCancelOfflineAuthorization: this.handleCancelOfflineAuthorization,
      handleOfflineOptions: this.handleOfflineAuthorization,
      handleOnTotalPressed: this.handleOnTotalPressed,
      handleRetryAuthorization: this.handleRetryAuthorization,
      handleCancelNonEmptyReturnTransaction: this.handleCancelNonEmptyReturnTransaction,
      onVoidTransaction: this.onVoidTransaction,
      onCustomerUpdate: this.onCustomerUpdate,
      onEnterReturnMode: this.onEnterReturnMode,
      onExitReturnMode: this.onExitReturnMode,
      onIssueGC: this.onIssue,
      onIssueGCert: this.onIssueGCert,
      onMenuToggle: this.props.onMenuToggle,
      onResetAfterReceiptPrint: this.handleResetAfterReceiptPrint,
      onSuspendTransaction: this.handleShowSuspendTransactionModal,
      handleReturnReasonChange: this.handleReturnReasonChange.bind(this),
      totalTransactionIsAllowed: this.props.totalTransactionIsAllowed,
      navigation: this.props.navigation
    };

    return (
      <BaseView style={this.styles.root}>
        {
          Theme.isTablet &&
          <MainTablet
            {...mainComponentCommonProps}
            shouldPromptForCustomer={this.shouldPromptForCustomer}
            stoppedItem={this.state.stoppedItem}
            stoppedItemStatus={this.state.stoppedItemStatus}
            stoppedItemStatusMessage={this.state.stoppedItemStatusMessage}
            shouldPromptForAdditionalInfo={this.state.shouldShowCommentScreen}
            onResetFromStoppedItem={this.handleResetFromStoppedItem}
            onSellSoftStoppedItem={this.handleSellSoftStoppedItem}
            onFreeTextItemCommentProvided={this.onFreeTextItemCommentProvided}
            onAdditionalInfoProvided={this.onAdditionalInfoProvided}
            togglePromptForAdditionalInfo={() =>
                this.setState({shouldShowCommentScreen: !this.state.shouldShowCommentScreen})}
            onSalespersonSkipped={(skipped?: boolean) => this.setState({salespersonSkipped: skipped})}
          />
        }
        { !Theme.isTablet && <MainPhone {...mainComponentCommonProps} /> }
        {
          this.state.tempInfoMessage &&
          <ToastPopUp textToDisplay={this.state.tempInfoMessage} hidePopUp={this.hideToastPopUp} />
        }
      </BaseView>
    );
  }

  private get receiptCategory(): ReceiptCategory {
    if (this.state.printSuspendReceipt) {
      return ReceiptCategory.Suspend;
    } else if (this.state.printVoidReceipt) {
      return ReceiptCategory.Void;
    } else {
      return undefined; // Intentional, absence of the return value used for truthy falsy check
    }
  }

  private voidTransactionEnded(prevProps: Props): boolean {
    const isWaitingToCloseMode = this.props.uiState.mode === UI_MODE_WAITING_TO_CLOSE;
    const isNotWaitingForVoid = this.props.stateValues.get("TenderAuthorizationSession.state") !==
        TenderAuthorizationState.WaitingForTransactionVoid;
    const wasVoidTransactionMode = prevProps.uiState.mode === UI_MODE_VOID_TRANSACTION;
    const wasWaitingForVoid = prevProps.stateValues.get("TenderAuthorizationSession.state") ===
        TenderAuthorizationState.WaitingForTransactionVoid;
    return isWaitingToCloseMode && isNotWaitingForVoid && (wasVoidTransactionMode || wasWaitingForVoid);
  }

  private isCancellingOrders(): boolean {
    if (this.props.displayInfo && this.props.displayInfo.itemDisplayLines) {
      return !!(this.props.displayInfo.itemDisplayLines.find((line) =>
        line.lineType === ITEM_CANCEL_LINE_TYPE ||
        (line.lineType === ITEM_ORDER_LINE_TYPE && line.cancelled)));
    }
    return false;
  }

  private isCancellingReservedOrders(): boolean {
    if (this.props.displayInfo && this.props.displayInfo.itemDisplayLines) {
      return !!(this.props.displayInfo.itemDisplayLines.find((line) =>
        (line.lineType === ITEM_ORDER_LINE_TYPE && line.cancelled)));
    }
    return false;
  }

  private isFulfillingPickupOrder(prevProps?: Props): boolean {
    let propsToUse: Props = this.props;
    if (prevProps) {
      propsToUse = prevProps;
    }
    if (propsToUse.displayInfo && propsToUse.displayInfo.itemDisplayLines) {
      const itemSaleLine = this.props.displayInfo.itemDisplayLines.find((line) =>
        line.lineType === ITEM_SALE_LINE_TYPE);
      const isOrderMultilineEvent = !!(propsToUse.businessStateEventType === ORDER_ITEM_MULTI_LINE_EVENT);
      return !!itemSaleLine && !!isOrderMultilineEvent;
    }
    return false;
  }

  private hideToastPopUp = (): void => {
    this.setState({ tempInfoMessage: undefined });
  }

  private handleResetAfterReceiptPrint = (): void => {
    this.setState({ printSuspendReceipt: false, printVoidReceipt: false });
    this.props.navigation.dispatch(popTo("main"));
  }

  private moveToUnreservedQuantitiesDetailScreen = (displayInfo: IDisplayInfo): void => {
    this.props.navigation.push("unavailableQuantities", {
      displayInfo,
      onAccepted: () => this.props.navigation.dispatch(popTo("main"))
    });
  }

  private moveToBagScreen = (order: any,
                             showCustomerPromptOnReturn: boolean,
                             showCustomerPromptOnPay: boolean,
                             requireCustomerForOrderCreate: boolean): void => {
    const currentScreenName = getCurrentRouteNameWithNavigationRef();
    if (currentScreenName === "itemSubscription") {
      this.props.navigation.replace("bagFee", {
        onSkipBagFee: () => this.moveFromOrSkipBagFeeScreen(order, showCustomerPromptOnReturn,
            showCustomerPromptOnPay, requireCustomerForOrderCreate)
      });
    } else {
      this.props.navigation.push("bagFee", {
        onSkipBagFee: () => this.moveFromOrSkipBagFeeScreen(order, showCustomerPromptOnReturn,
          showCustomerPromptOnPay, requireCustomerForOrderCreate)
      });
    }
  }

  private moveFromOrSkipBagFeeScreen = (order: any,
                                        showCustomerPromptOnReturn: boolean,
                                        showCustomerPromptOnPay: boolean,
                                        requireCustomerForOrderCreate: boolean): void => {
    if (showCustomerPromptOnReturn || showCustomerPromptOnPay || requireCustomerForOrderCreate) {
      requestAnimationFrame(() =>
        this.moveToCustomerScreen(order,
          showCustomerPromptOnReturn,
          showCustomerPromptOnPay,
          requireCustomerForOrderCreate));
    } else {
      this.moveToPickupDetailsOrDeliveryAddressConfirmationScreen(order);
    }
  }

  private moveToCustomerScreen = (order: any,
                                  showCustomerPromptOnReturn: boolean,
                                  showCustomerPromptOnPay: boolean,
                                  requireCustomerForOrderCreate: boolean): void => {
    if ((showCustomerPromptOnReturn || showCustomerPromptOnPay || requireCustomerForOrderCreate) &&
        this.props.uiState.mode !== UI_MODE_CUSTOMER_SEARCH_SCREEN) {
      const currentScreenName = getCurrentRouteNameWithNavigationRef();
      if (currentScreenName !== "main") {
        this.props.navigation.replace("customer", {
          isTransactionStarting: !requireCustomerForOrderCreate, //false isTransactionStarting removes the skip option
          assignCustomer: true,
          showReturnPopup: showCustomerPromptOnReturn,
          onExit: () => this.moveFromCustomerScreen(order),
          onCancel: () => this.moveFromCustomerScreen(order)
        });
      } else {
        this.props.navigation.push("customer", {
          isTransactionStarting: !requireCustomerForOrderCreate, //false isTransactionStarting removes the skip option
          assignCustomer: true,
          showReturnPopup: showCustomerPromptOnReturn,
          onExit: () => this.moveFromCustomerScreen(order),
          onCancel: () => this.moveFromCustomerScreen(order)
        });
      }
    }
  }

  private moveFromCustomerScreen = (order: any): void => {
    if (this.shouldRequireCustomerForOrderCreate()) {
      const { itemDisplayLines } = this.props.displayInfo;

      if (itemDisplayLines.some((line: IItemDisplayLine) => line.eligibleForSubscription && line.subscribed)) {
        this.showAlert(I18n.t("cancelSubscriptionsTitle"), 500, undefined, [
          {
            text: I18n.t("yes"),
            onPress: () => {
              this.props.performBusinessOperation(
                this.props.deviceIdentity,
                APPLY_ITEM_SUBSCRIPTION_EVENT,
                [new UiInput(UiInputKey.SUBSCRIPTIONS, getSubscriptionInfoForMassUnsubscribe(itemDisplayLines))]
              );
              this.handleDonationScreen(true, Theme.isTablet);
            }
          },
          { text: I18n.t("no") }
        ],
        { cancelable: true });
      } else {
        this.props.navigation.dispatch(popTo("main"));
      }
    } else {
      if (order) {
        this.moveToPickupDetailsOrDeliveryAddressConfirmationScreen(order);
      } else {
        this.handleDonationScreen(true, Theme.isTablet);
      }
    }
  }

  private isSaleMerchandiseTransaction = (): boolean => {
    const tradeType = this.props.stateValues.get("transaction.transactionTradeType");
    return this.props.stateValues.get("transaction.type") === MERCHANDISE_TRANSACTION_TYPE &&
      tradeType === MerchandiseTransactionTradeType.Sale;
  }

  private moveToNipOrPaymentScreen = (): void => {
    const i18nLocation: string = this.props.i18nLocation;
    let taxIdentifier =
        this.props.stateValues.get("transaction.taxCustomer")?.governmentTaxIdentifier as ITaxIdentifier;
    if (!taxIdentifier) {
      taxIdentifier =
          this.props.stateValues.get("transaction.taxCustomer")?.taxIdentifierCollection as ITaxIdentifier;
    }
    if (i18nLocation === "PL" && this.isSaleMerchandiseTransaction() && !taxIdentifier) {
      this.moveToCustomerNipScreen();
    } else {
      this.moveToPaymentScreen();
    }
  }

  private moveToCustomerNipScreen = (): void => {
    const currentScreenName = getCurrentRouteNameWithNavigationRef();
    if (currentScreenName !== "main") {
      this.props.navigation.replace("customerNip", {
        onContinue: () => this.moveToPaymentScreen(),
        onCancel: () => this.moveFromCustomerNipScreen()
      });
    } else {
      this.props.navigation.push("customerNip", {
        onContinue: () => this.moveToPaymentScreen(),
        onCancel: () => this.moveFromCustomerNipScreen()
      });
    }
  }

  private moveFromCustomerNipScreen = (): void => {
    this.props.navigation.dispatch(popTo("main"));
  }

  private moveToPickupDetailsOrDeliveryAddressConfirmationScreen = (order: any): void => {
    if (isValidOrder(order)) {
      if (Order.getFulfillmentGroupByType(order, FulfillmentType.shipToStore)) {
        this.props.navigation.push("orderPickupDetailsConfirmation", {
          onExit: () => this.handleDonationScreen(true, Theme.isTablet),
          onCancel: () => this.props.navigation.dispatch(popTo("main"))
        });
      } else if (Order.getFulfillmentGroupByType(order, FulfillmentType.shipToCustomer)) {
        this.props.navigation.push("orderDeliveryAddressConfirmation", {
          onExit: () => this.handleDonationScreen(true, Theme.isTablet),
          onCancel: () => this.props.navigation.dispatch(popTo("main")),
          onContinue: order.orderType === OrderType.Subscription ?
              () => this.moveToSubscriptionPayment() :
              () => this.moveFromOrderDeliveryAddressConfirmationScreen(order)
        });
      } else {
        this.handleDonationScreen(false, Theme.isTablet);
      }
    } else {
      this.handleDonationScreen(false, Theme.isTablet);
    }
  }

  private handleDonationScreen = (replaceAction: boolean = false,
                                  showSuspendModal: boolean = false): void => {
    const balanceDue: Money = this.props.stateValues && this.props.stateValues.get("transaction.balanceDue");
    if (this.isDonationVisible && balanceDue && balanceDue.isPositive()) {
      const actions = {
        onCancel: () => this.props.navigation.dispatch(popTo("main")),
        onSkip: () => this.handleOnTotalTransactionRequested(replaceAction, showSuspendModal),
        onExit: () => this.handleOnTotalTransactionRequested(replaceAction, showSuspendModal)
      };
      const currentScreenName = getCurrentRouteNameWithNavigationRef();
      if (currentScreenName !== "main") {
        this.props.navigation.replace("donation", actions);
      } else {
        this.props.navigation.push("donation", actions);
      }
    } else {
      this.handleOnTotalTransactionRequested(replaceAction, showSuspendModal);
    }
  }

  private moveToPaymentScreen = (isInitialCashDrawerOnStartup?: boolean): void => {
    const replaceAction: boolean = this.state.totalTransactionOptions
        && this.state.totalTransactionOptions.replaceAction;
    const showSuspendModal: boolean = this.state.totalTransactionOptions
        && this.state.totalTransactionOptions.showSuspendModal;
    if (replaceAction && showSuspendModal) {
      requestAnimationFrame(() => this.props.navigation.replace("payment", {
        onSuspendTransaction: this.handleShowSuspendTransactionModal
      }));
    } else if (replaceAction) {
      requestAnimationFrame(() => this.props.navigation.replace("payment"));
    } else {
      if (this.props.stateValues.get("CashDrawerSession.isWaitingForUserToSelectCashDrawer") &&
          this.props.stateValues.get("TenderAuthorizationSession.state") !==
          TenderAuthorizationState.WaitingForSignature) {
        requestAnimationFrame(() => this.props.navigation.push("scanDrawer", {
          eventType: OPEN_CASH_DRAWER_EVENT
        }));
      } else {
        requestAnimationFrame(() => this.props.navigation.push("payment", {
          onSuspendTransaction: this.handleShowSuspendTransactionModal,
          isInitialCashDrawerOnStartup
        }));
      }
    }
  }

  private transactionRequiresSubscriptionToken = (): boolean => {
    return this.transactionHasSubscribedItems() && !this.transactionHasSubscriptionToken();
  }

  private transactionHasSubscribedItems = (): boolean => {
    return !!(this.props.displayInfo && this.props.displayInfo.itemDisplayLines &&
      this.props.displayInfo.itemDisplayLines.find((line) => line.subscribed));
  }

  private transactionHasSubscriptionToken = (): boolean => {
    return !!(this.props.displayInfo && this.props.displayInfo.tenderDisplayLines &&
        this.props.displayInfo.tenderDisplayLines.find(
          (line) => line.lineType === TENDER_AUTHORIZATION_TOKEN_LINE_TYPE
        ));
  }

  private moveToReceiptScreen = (): void => {
    let receiptCategory: ReceiptCategory =  ReceiptCategory.Receipt;
    if (isFranceLocation(this.props.retailLocations, this.props.configManager)) {
      receiptCategory = ReceiptCategory.VatReceipt;
    }
    if (!this.props.stateValues.get("transaction.requiresVoid")) {
      requestAnimationFrame(() =>
          this.props.navigation.push("receiptSummary", { receiptCategory }));
    }
  }

  private handleOnTotalTransactionRequested = (replaceAction: boolean = false,
                                               showSuspendModal: boolean = false) => {
    if (this.props.totalTransactionIsAllowed) {
      this.props.performBusinessOperation(this.props.deviceIdentity, TOTAL_TRANSACTION_EVENT, []);
      this.setState({ totalTransactionRequested: true, totalTransactionOptions: {replaceAction, showSuspendModal}});
    }
  }

  private moveFromOrderDeliveryAddressConfirmationScreen = (currentOrder: Order) => {
    if (currentOrder.orderType !== OrderType.Subscription) {
      const storeShippingMethods: IConfigurationValues = this.props.configManager.getStoreShippingMethodsValues();
      const shippingMethods: ShippingMethod[] = storeShippingMethods && storeShippingMethods.shippingMethods &&
          storeShippingMethods.shippingMethods.filter(
            (x: ShippingMethod) => x.enabled === true || x.enabled === undefined
          );

      if (isEmpty(shippingMethods) || (shippingMethods.length === 1 && shippingMethods.find(
          (x) => x.shippingFee.amount === "0" || x.shippingFee.amount === "0.00" || x.shippingFee.amount === ""))) {
        const inputs: UiInput[] = [];
        if (this.props.stateValues.has("transaction.order") && this.props.stateValues.get("transaction.order")) {
          const order = this.props.stateValues.get("transaction.order");
          inputs.push(new UiInput(UiInputKey.ORDER_REFERENCE_ID, order._orderReferenceId));
        }
        inputs.push(new UiInput(UiInputKey.FEE_TYPE, FeeType.Shipping));
        if (shippingMethods && shippingMethods.length === 1) {
          inputs.push(new UiInput(UiInputKey.SHIPPING, shippingMethods[0]));
        }
        this.props.performBusinessOperation(this.props.deviceIdentity, SHIPPING_FEE_EVENT, inputs);
        this.handleDonationScreen(true, Theme.isTablet);
      } else {
        this.props.navigation.replace("shippingMethod", {
          onExit: () => this.handleDonationScreen(true, Theme.isTablet)
        });
      }
    }
  }

  private moveToSubscriptionPayment = () => {
    const subscriptionPaymentFlow =
        getFeatureAccessConfig(this.props.configManager, APPLY_ITEM_SUBSCRIPTION_EVENT)?.subscriptionPaymentFlow;
    if (subscriptionPaymentFlow === SubscriptionFlowOptions.TokenBeforePayment) {
      //if flow is TokenBeforePayment then continue token auth screen
      this.moveToTokenAuthorizationScreen();
    } else {
      //else if flow is PaymentBeforeToken then show payment screen first
      const balanceDue: Money = this.props.stateValues.get("transaction.balanceDue");

      if (balanceDue.isZero()) {
        this.props.performBusinessOperation(this.props.deviceIdentity, TOTAL_TRANSACTION_EVENT, []);
        this.moveToTokenAuthorizationScreen();
      } else {
        this.handleDonationScreen(true, Theme.isTablet);
      }
    }
  }

  private moveToTokenAuthorizationScreen = () => {
    if (this.transactionRequiresSubscriptionToken()) {
      const currentScreenName = getCurrentRouteNameWithNavigationRef();
      if (currentScreenName !== "subscriptionAuthorization") {
        this.props.navigation.replace("subscriptionAuthorization",
          {
            onBack: () => this.handleSubscriptionSummaryRequested(),
            onCompleted: () => this.handleDonationScreen(true, Theme.isTablet)
          }
        );
      }
    } else {
      this.handleDonationScreen(true, Theme.isTablet);
    }
  }

  private handleSubscriptionSummaryRequested = () => {
    const order: Order = this.props.stateValues.get("transaction.order");
    const eligibleSubscriptionItems: IItemDisplayLine[] =
        getEligibleSubscriptionItems(order, this.props.displayInfo.itemDisplayLines);

    this.props.navigation.push("itemSubscription", {
      lines: eligibleSubscriptionItems,
      onExit: () => this.props.navigation.dispatch(popTo("main")),
      isCheckout: true
    });
  }

  private handleInventoryReserveRequested = () => {
    this.props.performBusinessOperation(this.props.deviceIdentity, RESERVE_INVENTORY_EVENT, []);
  }

  private moveFromOrSkipInventoryReserve = () => {
    const order = this.props.stateValues.has("transaction.order") && this.props.stateValues.get("transaction.order");
    const showCustomerPromptOnReturn = this.shouldPromptForCustomerOnReturn();
    const showCustomerPromptOnPay = this.shouldPromptForCustomerOnPay();
    const requireCustomerForOrderCreate: boolean = this.shouldRequireCustomerForOrderCreate();

    if (!this.props.businessStateError) {
      if (this.props.uiState.isAllowed(TRANSACTION_FEE_EVENT)) {
        this.moveToBagScreen(order, showCustomerPromptOnReturn, showCustomerPromptOnPay, requireCustomerForOrderCreate);
      } else {
        this.moveFromOrSkipBagFeeScreen(order, showCustomerPromptOnReturn,
            showCustomerPromptOnPay, requireCustomerForOrderCreate);
      }
    }
  }

  private onCustomerUpdate = (isTransactionStarting: boolean): void => {
    if (!this.state.transactionVoided && !this.state.closingTransaction) {
      const customer: Customer = this.props.stateValues.get("transaction.customer");
      const customerPage = (this.customerBannerButtonActionIsCreate ? "customerCreate" : "customer");
      if (!customer) {
        this.props.navigation.push(customerPage, {
          isTransactionStarting,
          assignCustomer: true,
          onExit: () => this.handleOnAddCustomer(),
          onCancel: () => this.props.navigation.dispatch(popTo("main"))
        });
      } else {
        this.props.navigation.push("customerDisplay", {
          onExit: () => this.props.navigation.dispatch(popTo("main"))
        });
      }
    }
  }

  private handleShowSuspendTransactionModal = () => {
    this.props.showModal(SUSPEND_TRANSACTION_MODAL);
  }

  private onIssue = (cardNumber: string, amount: string, inputSource: string, useSwipe?: boolean,
                     existingCard?: boolean): void => {
    const uiInputs: UiInput[] = [];
    if (!useSwipe) {
      uiInputs.push(new UiInput("cardNumber", cardNumber, "string", inputSource));
    } else {
      uiInputs.push(new UiInput("giftCardIssueSwipe", true));
    }
    uiInputs.push(new UiInput("price", amount));
    uiInputs.push(new UiInput(UiInputKey.EXISTING_GIFT_CARD, existingCard));

    this.props.performBusinessOperation(this.props.deviceIdentity, APPLY_ITEM_EVENT, uiInputs);
  }

  private onIssueGCert = (certificateNumber: string, amount: string, inputSource: string): void => {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.VALUE_CERTIFICATE_NUMBER, certificateNumber, "string", inputSource));
    uiInputs.push(new UiInput(UiInputKey.TENDER_AUTH_CATEGORY_NAME, TenderAuthCategory.StoredValueCertificateService));
    uiInputs.push(new UiInput(UiInputKey.TENDER_SUB_TYPE, ValueCertSubType.GiftCertificate));
    uiInputs.push(new UiInput("price", amount));

    this.props.performBusinessOperation(this.props.deviceIdentity, APPLY_ITEM_EVENT, uiInputs);
  }

  private handleReturnReasonChange = (line: IItemDisplayLine): void => {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput("lineNumber", line.lineNumber));
    // set state to display already selected reason code in reasonCodeList
    this.setState({ selectedReturnItemReasonCode: {code: line.reasonCode, description: line.reasonDescription}});
    this.props.performBusinessOperation(this.props.deviceIdentity, MODIFY_RETURN_ITEM_REASON_CODE_EVENT, uiInputs);
    this.props.clearSelectedItemLines();
    if (!Theme.isTablet) {
      this.props.navigation.dispatch(popTo("main"));
    }
    return;
  }

  private onEnterReturnMode(): void {
    this.props.performBusinessOperation(this.props.deviceIdentity, ENTER_RETURN_MODE_EVENT, []);

    if (!Theme.isTablet) {
      this.props.navigation.dispatch(popTo("main"));
    }
  }

  private handleEnteredReturnMode(prevProps: Props): void {
    if (!prevProps.stateValues.get("ItemHandlingSession.isReturning") &&
        this.props.stateValues.get("ItemHandlingSession.isReturning") &&
        this.returnWithTransactionEnabled &&
        !this.props.stateValues.get("ItemHandlingSession.offlineReturnTransaction")) {
      this.props.navigation.push("returnTransaction");
      this.setState({isCustomerAssignedDuringTransactionReturns: false});
    }
  }

  private onExitReturnMode = (): void => {
    if (this.mixedBasketAllowed || this.returnModeAll || !this.anyDisplayLines) {
      this.props.performBusinessOperation(this.props.deviceIdentity, EXIT_RETURN_MODE_EVENT, []);
    } else {
      this.handleCancelNonEmptyReturnTransaction();
    }
  }

  private handleOfflineAuthorization = (): void => {
    this.setState({offlineOptionsOn: false});
    if (!Theme.isTablet) {
      this.props.navigation.push("offlineAuthorization", {
        onCancel: () => this.props.navigation.pop(),
        isGiftCardIssue: true
      });
    }
  }

  private handleSupervisorOverride = (): void => {
    this.setState({ returnTotalAuthorization: true }, () =>
        this.props.performBusinessOperation(this.props.deviceIdentity, RETURN_TOTAL_EVENT, []));
  }

  private showAlert = (title: string, timeout?: number, message?: string, buttons?: AlertModalButton[],
                       options?: AlertOptions): void => {
    const currentScreenName = getCurrentRouteNameWithNavigationRef();
    if (currentScreenName === "scan") {
      this.props.displayErrorScanner(message || title);
    } else {
      if (timeout) {
        setTimeout(() => {this.props.alert(title, message, buttons, options); }, timeout);
      } else {
        this.props.alert(title, message, buttons, options);
      }
    }
  }

  private handleOnTotalPressed = (): void => {
    const lotteryCode = this.props.stateValues.get("transaction.taxLotteryCustomerCode");
    let shouldAlertForRemovingLottery: boolean;
    if (lotteryCode) {
      let lotteryValidationRequired: boolean = false;
      const i18nLocation = this.props.i18nLocation;
      const taxationConfig: IConfigurationValues =
          this.props.configManager.getI18nCountryConfigValues(i18nLocation).taxation;
      const minimumPurchaseAmountRequired = taxationConfig && taxationConfig.taxLottery &&
          taxationConfig.taxLottery.minimumPurchaseAmountRequired;
      const amountDue = this.props.stateValues.get("transaction.subTotal");
      const accountingCurrency: string = this.props.stateValues.get("transaction.accountingCurrency");

      if (minimumPurchaseAmountRequired) {
        const formattedMinimumPurchaseAmount =
            printAmount(new Money(minimumPurchaseAmountRequired, accountingCurrency));
        lotteryValidationRequired = amountDue
            .lt(new Money(minimumPurchaseAmountRequired, accountingCurrency));
        if (lotteryValidationRequired) {
          shouldAlertForRemovingLottery = true;
          this.props.alert(
            I18n.t("warning"),
            I18n.t("lotteryWarningMessage", { minimumPurchaseAmountRequired: formattedMinimumPurchaseAmount }),
            [ { text: I18n.t("cancel"), style: "cancel" },
              {
                text: I18n.t("continue"), onPress: () => {
                  this.voidLotteryCode();
                }
              }
            ],
            { cancellable: true }
          );
        }
      }
    }
    if (!shouldAlertForRemovingLottery) {
      this.handleOnTotalPressedAfterValidation();
    }
  }

  private voidLotteryCode = (): void => {
    const uiInputs: UiInput[] = [];
    this.setState({isVoidLotteryCode: true});
    uiInputs.push(new UiInput(UiInputKey.VOID_REASON, LotteryVoidReason.VOIDED_FOR_MINIMUM_AMOUNT));
    uiInputs.push(new UiInput(UiInputKey.VOID_REASON_DESC, LotteryVoidDescription.VOIDED_FOR_MINIMUM_AMOUNT));
    uiInputs.push(new UiInput(UiInputKey.VOID_LOTTERY_CODE, true));
    this.props.performBusinessOperation(this.props.deviceIdentity, CAPTURE_LOTTERY_CODE_EVENT, uiInputs);
  }

  private handleOnTotalPressedAfterValidation = (): void => {
    if (this.returnItemNeedsSupervisorOverride()) {
      this.handleSupervisorOverride();
    } else {
      this.checkAndHandleOnTotalPressed();
    }
  }

  private checkAndHandleOnTotalPressed = (): void => {
    const order: Order = this.props.stateValues.get("transaction.order");
    const eligibleSubscriptionItems: IItemDisplayLine[] =
        getEligibleSubscriptionItems(order, this.props.displayInfo.itemDisplayLines);

    //MACA workflow. Subscriptions require a customer, but we can't prompt or require one to be added
    const promptForCustomerAfterReceipts = promptForCustomerAfterTransactionReceipts(this.props.configManager);
    const transactionHasCustomer = this.props.stateValues.get("transaction.customer");
    const subscriptionCanBeApplied = promptForCustomerAfterReceipts ? !!transactionHasCustomer : true;
    const showSubscriptionScreen =
        getFeatureAccessConfig(this.props.configManager, APPLY_ITEM_SUBSCRIPTION_EVENT)?.confirmSubscriptionsAtTotal;

    if (subscriptionCanBeApplied &&
        !!eligibleSubscriptionItems?.length &&
        isFeatureConfigPresentAndEnabled(APPLY_ITEM_SUBSCRIPTION_EVENT, this.props.configManager) &&
        showSubscriptionScreen === ConfirmSubscriptionsOptions.Always) {
      this.props.navigation.push("itemSubscription", {
        lines: eligibleSubscriptionItems,
        onExit: () => this.props.navigation.dispatch(popTo("main")),
        isCheckout: true
      });
    } else {
      this.handleInventoryReserveRequested();
    }
  }

  private returnItemNeedsSupervisorOverride = (): boolean => {
    return !!(this.props.displayInfo.itemDisplayLines.find((line) =>
        line.extendedAmountExcludingTransactionDiscounts &&
        line.extendedAmountExcludingTransactionDiscounts.isNegative() && !line.hasSupervisorOverride));
  }

  private handleCancelOfflineAuthorization = (): void => {
    this.props.performBusinessOperation(this.props.deviceIdentity, CANCEL_TENDER_SESSION_EVENT, []);
    this.setState({offlineOptionsOn: false, retryAuthorizationOn: false});
  }

  private handleRetryAuthorization = (): void => {
    this.props.performBusinessOperation(this.props.deviceIdentity, RETRY_AUTHORIZATION_EVENT, []);
    this.setState({offlineOptionsOn: false, retryAuthorizationOn: false});
  }

  private promptForSalesPerson(prevProps: Props, prevState: State): boolean {
    // Prompt for the salesperson for the first item in the transaction based on the balance due,
    // and sales person is not prompted yet. If gift card issue is the first item in the transaction,
    // after authorization logical state is "InMerchandiseTransaction"
    // and it skips the previous check, hence adding this check to prompt for sales person
    //
    // FIXME: Need to review the logic surrounding this.state.salespersonSkipped and find if there's a better
    //  way to handle prompting for sales person based on that.

    const isVoidCashDrawerTenderEvent = this.props.businessStateEventType === VOID_CASH_DRAWER_TENDER_EVENT;
    const isLoyaltyEnrollmentEvent = this.props.businessStateEventType === ENROLL_CUSTOMER_EVENT;

    const prevPropsTransactionBalanceDue: Money = prevProps.stateValues &&
                                                  prevProps.stateValues.get("transaction.balanceDue");

    const currentPropsTransactionBalanceDue: Money = this.props.stateValues &&
                                                     this.props.stateValues.get("transaction.balanceDue");

    const hasSalesPerson: boolean = !!(prevProps.stateValues && prevProps.stateValues.get("transaction.salesperson"));

    const currency = this.props.stateValues.get("transaction.accountingCurrency");

    if (currency && prevPropsTransactionBalanceDue && currentPropsTransactionBalanceDue &&
        prevProps.currentScreenName !== "price") {
      const zeroCurrency: Money = new Money(0.00, this.props.stateValues.get("transaction.accountingCurrency"));
      const promptForSalesPerson: boolean = !hasSalesPerson && !this.state.salespersonSkipped &&
          !isVoidCashDrawerTenderEvent && !isLoyaltyEnrollmentEvent;
      const isMovingFromVoidableErrorScreen = prevProps.currentScreenName === "voidableErrorScreen" &&
          !this.props.stateValues.get("transaction.voided");
      const isMovingFromScreenThatDelaysSalespersonPrompt = (
        this.previousScreens(prevProps) ||
        isMovingFromVoidableErrorScreen ||
        this.isMovingFromCommentScreen(prevState, this.state)
      ) && this.props.currentScreenName === "main" && promptForSalesPerson;

      return ((prevPropsTransactionBalanceDue.eq(zeroCurrency)
        && currentPropsTransactionBalanceDue.ne(zeroCurrency) &&
        promptForSalesPerson) || isMovingFromScreenThatDelaysSalespersonPrompt);
    }

    return false;
  }

  private isMovingFromCommentScreen(prevState: State, state: State): boolean {
    return prevState.shouldShowCommentScreen && !state.shouldShowCommentScreen;
  }

  private previousScreens(prevProps: Props): boolean {
    return prevProps.currentScreenName === "productInquiryDetail" || prevProps.currentScreenName === "productInquiry"
        || prevProps.currentScreenName === "returnTransaction";
  }

  private shouldPromptForSalespersonOnResume(): boolean {
    const nonContextualData = this.props.nonContextualData;
    return !this.defaultSalespersonToCashier &&
        this.props.stateValues.get("ResumeSession.state") === ResumeTransactionSessionState.Completed &&
        nonContextualData?.get(CollectedDataKey.ResumeTransactionCompleted) &&
        this.props.displayInfo?.itemDisplayLines?.some((itemDisplayLine) => !!itemDisplayLine.salesperson);
  }

  private get showSelectItems(): boolean {
    const returnMode: boolean = this.props.stateValues && this.props.stateValues.get("ItemHandlingSession.isReturning");
    return this.props.displayInfo && this.props.displayInfo.itemDisplayLines &&
           this.props.displayInfo.itemDisplayLines.length > 1 && !returnMode &&
           basketContainsNonReturnItems(this.props.displayInfo);
  }

  private get anyDisplayLines(): boolean {
    return this.props.displayInfo && this.props.displayInfo.itemDisplayLines &&
        this.props.displayInfo.itemDisplayLines.length > 0;
  }

  private checkAndHandleChangeInSelectionMode = (prevProps: Props): void => {
    if (prevProps.itemSelectionMode !== this.props.itemSelectionMode) {
      if (this.props.itemSelectionMode !== ItemSelectionMode.None) {
        this.props.updateUiMode(UI_MODE_ITEM_SELECTION);

        if (this.props.itemSelectionMode === ItemSelectionMode.Single && !Theme.isTablet) {
          const handleOnExit = (): void => {
            this.props.navigation.dispatch(popTo("main"));
            this.props.clearSelectedItemLines();
          };

          this.props.navigation.push("product", {
            showLine: true,
            lineNumber: this.props.selectedItems[0],
            onProductInformation: (line: IItemDisplayLine) => {
              this.props.updateUiMode(UI_MODE_PRODUCT_DETAIL);
              this.props.navigation.push("productInquiryDetail", { line });
            },
            onChangeQuantity: (line: IItemDisplayLine) => this.props.navigation.push("quantity", {
              line,
              showLine: true,
              onExit: handleOnExit
            }),
            onChangePrice: (line: IItemDisplayLine) => this.props.navigation.push("price", {
              line,
              showLine: true,
              onExit: handleOnExit
            }),
            onItemDiscount: (line: IItemDisplayLine) => this.props.navigation.push("discountTypeSelection", {
              discountLevel: DiscountLevel.Item,
              itemLines: [line],
              onDiscount: (discountLevel: DiscountLevel, discountType: DiscountType,
                           discountDisplayLine: IDiscountDisplayLine) =>
                  this.props.navigation.push("discountScreen", {
                    discountLevel,
                    discountType,
                    itemLines: [line],
                    discountDisplayLine,
                    showLine: true,
                    onCancel: handleOnExit
                  }),
              onExit: handleOnExit
            }),
            onAssignSalesperson: (line: IItemDisplayLine) => this.props.navigation.push("assignSalesperson", {
              lineNumbers: [line.lineNumber],
              onExit: handleOnExit,
              assignToTransaction: false,
              isTransactionStarting: false
            }),
            onItemComments: (line: IItemDisplayLine) => this.props.navigation.push("comments", {
              line,
              onItemFreeTextComment: this.onItemFreeTextComment,
              onExit: handleOnExit
            }),
            onItemTaxPress: (line: IItemDisplayLine) => this.props.navigation.push("taxActionPanel", {
              onItemTaxOverride: this.onItemTaxOverride,
              lineNumber: this.props.selectedItems[0],
              isItemLevel: true,
              onItemTaxExempt: (displayLine: IItemDisplayLine): void => {
                this.props.navigation.push("taxExempt", {
                  itemLines: [line],
                  showLine: true,
                  onExit: (): void => {
                    this.props.navigation.dispatch(popTo("main"));
                    this.props.clearSelectedItemLines();
                  }
                });
              },
              onExit: handleOnExit
            }),
            onReturnReasonChange: this.handleReturnReasonChange,
            onItemSubscription: (line: IItemDisplayLine) => {
              if (promptForCustomerAfterTransactionReceipts(this.props.configManager) &&
                  !this.props.stateValues.get("transaction.customer")) {
                this.props.alert(
                  I18n.t("warning"),
                  I18n.t("actionRequiresTransactionCustomer"),
                  [{ text: I18n.t("ok")}]
                );
              } else {
                this.props.navigation.push("itemSubscription", {
                  lines: [line],
                  onExit: handleOnExit
                });
              }
            },
            onAdditionalInfo: this.onAdditionalInfo,
            onExit: handleOnExit
          });
        }
      } else if (!this.isEnteringSalespersonUiMode) {
        this.props.updateUiMode(undefined);
      }
    }
  }

  private shouldPromptForCustomerOnPay = (): boolean => {
    const { configManager, stateValues } = this.props;
    const customerFunctionChoices = configManager.getFunctionalBehaviorValues().customerFunctionChoices;
    return customerFunctionChoices && customerFunctionChoices.promptForCustomerAtTransactionPayment &&
        !stateValues.get("transaction.customer");
  }


  private shouldPromptForCustomerOnReturn = (): boolean => {
    const { configManager, stateValues } = this.props;
    const customerFunctionChoices = configManager.getFunctionalBehaviorValues().customerFunctionChoices;
    const customerPromptRequiredForReturns: boolean = customerFunctionChoices &&
                                                      customerFunctionChoices.customerRequiredForReturns;


    return customerPromptRequiredForReturns && stateValues &&
      (stateValues.get("ItemHandlingSession.isReturning") || this.totalNumberOfReturnItems > 0) &&
        !stateValues.get("transaction.customer");
  }

  private shouldRequireCustomerForOrderCreate = (): boolean => {
    const { configManager, stateValues } = this.props;
    const customerFunctionChoices = configManager.getFunctionalBehaviorValues().customerFunctionChoices;
    const customerRequiredFor: [string] = customerFunctionChoices && customerFunctionChoices.customerRequiredFor;

    const customerAlreadyAssigned: boolean = stateValues.get("transaction.customer") !== undefined;
    if (customerAlreadyAssigned) {
      return false;
    }

    //The order object existing on the transaction is the only thing we have to go by to determine
    // order creation at this point. This will need attention once we're trying to determine other
    // order actions are occuring.
    const order: Order = stateValues.get("transaction.order");
    const isOrderTransaction: boolean = order && !order.voided;
    const customerRequiredForOrderCreate: boolean = customerRequiredFor && customerRequiredFor.includes("OrderCreate");

    return customerRequiredForOrderCreate && isOrderTransaction;
  }

  private get totalNumberOfReturnItems(): number {
    return getTransactionIsOpen(this.props.stateValues) && countOfAllItems(this.props.displayInfo,
        (line: IItemDisplayLine) => line.lineType === ITEM_RETURN_LINE_TYPE) || 0;
  }

  private checkAndHandleSupervisorOverrideForReturnItems = (prevProps: Props): void => {
    if (this.state.returnTotalAuthorization) {
      if (!this.props.businessStateInProgress && prevProps.businessStateInProgress) {
        if (!this.props.businessStateError) {
          if (this.props.businessStateEventType === RETURN_TOTAL_EVENT) {
            this.setState({ returnTotalAuthorization: false }, () => this.checkAndHandleOnTotalPressed());
          } else {
            this.setState({ returnTotalAuthorization: false });
          }
        }
      }
    }
  }

  private checkAndHandleTotalTransactionRequested = (prevProps: Props): void => {
    if (this.state.totalTransactionRequested) {
      if (!this.props.businessStateInProgress && prevProps.businessStateInProgress) {
        if (!this.props.businessStateError) {
          if (this.props.nonContextualData.get(CollectedDataKey.LoyaltyDiscountsRemoved)) {
            this.props.navigation.dispatch(popTo("main"));
          } else if (this.isCancellingReservedOrders()) {
            this.setState(
              { totalTransactionRequested: false, totalTransactionOptions: undefined },
              () => this.props.navigation.dispatch(popTo("main"))
            );
          } else if (this.props.stateValues.get("transaction.waitingToClose")) {
            this.setState(
              { totalTransactionRequested: false, totalTransactionOptions: undefined },
              () => this.moveToReceiptScreen()
            );
          } else {
            this.setState({ totalTransactionRequested: false }, () => this.moveToNipOrPaymentScreen());
          }
        }
      }
    } else if (this.isFulfillingPickupOrder()) {
      if (!this.props.businessStateInProgress && prevProps.businessStateInProgress) {
        if (!this.props.businessStateError) {
          if (this.props.stateValues.get("transaction.waitingToClose")) {
            this.setState({ totalTransactionRequested: false }, () => this.moveToReceiptScreen());
          } else {
            this.setState({ totalTransactionRequested: false }, () => this.props.navigation.dispatch(popTo("main")));
          }
        }
      }
    }
  }

  private onItemFreeTextComment = (line: IItemDisplayLine, itemCommentIsFreeText: boolean): void => {
    const handleOnExit = (): void => {
      this.props.navigation.dispatch(popTo("main"));
      this.props.clearSelectedItemLines();
    };
    this.props.navigation.push("comment", {
              lineNumber: line.lineNumber,
              freeTextCommentValue: itemCommentIsFreeText && line.comment,
              onExit: handleOnExit,
              onDone: this.onFreeTextItemCommentProvided
            });
  }

  private onItemTaxOverride = (line: IItemDisplayLine): void => {
    const handleOnExit = (): void => {
      this.props.navigation.dispatch(popTo("main"));
      this.props.clearSelectedItemLines();
    };
    this.props.navigation.push("taxOverrideScreen", {
      lines: [line],
      showLine: true,
      isItemLevel: true,
      onExit: handleOnExit
    });
  }

  private  checkAndHandleReasonCodeForReturnItems = (prevProps: Props): void => {
    if (!this.props.businessStateInProgress && prevProps.businessStateInProgress) {
      const error = this.props.businessStateError;
      const returnMode: boolean = this.props.stateValues.get("ItemHandlingSession.isReturning");
      const isReturnItemReasonCodeChange: boolean =
          this.props.businessStateEventType === MODIFY_RETURN_ITEM_REASON_CODE_EVENT;

      if (error && error instanceof QualificationError && error.requiredInputs &&
          error.requiredInputs.find((item) => item === UiInputKey.RETURN_ITEM_REASON_CODE)) {
        if ((returnMode || isReturnItemReasonCodeChange) &&
            (this.returnItemReasonListType || this.returnItemNotOnFileReasonListType)) {
          this.props.updateUiMode(UI_MODE_REASON_CODE);

          const returnWithTransaction: boolean = this.props.stateValues.get(
              "ItemHandlingSession.returnWithTransaction");

          this.props.navigation.push("reasonCodeList", {
            resetTitle: true,
            currentSelectedOption: this.state.selectedReturnItemReasonCode,
            options: returnWithTransaction || this.props.businessStateEventType === APPLY_ITEM_EVENT
                ? this.state.returnItemReasonCodes
                : this.state.returnItemNotOnFileReasonCodes,
            onOptionChosen: this.handleSetReasonCodeOnReturnItem.bind(this),
            onExitNavigation: () => this.props.navigation.dispatch(popTo('main'))
          });
        }
      }
    }
  }

  private handleSetReasonCodeOnReturnItem(newReasonCode: RenderSelectOptions): void {
    this.setState({ selectedReturnItemReasonCode: newReasonCode }, () => {
      this.performReturnItemBusinessOperation();
    });
  }

  private performReturnItemBusinessOperation(): void {
    const uiInputs: UiInput[] = this.props.businessStateInputs;
    uiInputs.push(new UiInput(UiInputKey.REASON_CODE, this.state.selectedReturnItemReasonCode.code));
    uiInputs.push(new UiInput(UiInputKey.REASON_DESCRIPTION,
        this.state.selectedReturnItemReasonCode.description));
    uiInputs.push(new UiInput(UiInputKey.REASON_LIST_TYPE,
        this.returnItemReasonListType));
    uiInputs.push(new UiInput(UiInputKey.SECURITY_AUTHORIZATION_STATUS, SecurityAuthorizationStatusType.Pending));
    this.props.performBusinessOperation(this.props.deviceIdentity, this.props.businessStateEventType, uiInputs);
    this.setState({ selectedReturnItemReasonCode: undefined });
    this.props.updateUiMode(undefined);
  }

  private handleSellSoftStoppedItem = (itemKey: string, itemKeyType: string): void => {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput("itemKey", itemKey));
    uiInputs.push(new UiInput("itemKeyType", itemKeyType));
    uiInputs.push(new UiInput(UiInputKey.SELL_SOFT_STOPPED_ITEM, true));

    this.props.performBusinessOperation(this.props.deviceIdentity, APPLY_ITEM_EVENT, uiInputs);

    this.handleResetFromStoppedItem();
  }

  private handleResetFromStoppedItem = (): void => {
    if (Theme.isTablet) {
      this.setState({
        stoppedItem: undefined,
        stoppedItemStatus: undefined,
        stoppedItemStatusMessage: undefined
      });
      this.props.updateUiMode(undefined);
    } else {
      this.props.navigation.dispatch(popTo("main"));
    }
  }

  private handleCaughtStoppedItem(errorExperienced: QualificationError): void {
    const itemKey: string = errorExperienced.collectedData.get("searchItemKey");
    const itemKeyType: string = errorExperienced.collectedData.get("searchItemKeyType");
    const stoppedItemStatus: string = errorExperienced.collectedData.get(CollectedDataKey.ItemStatus);
    const stoppedItemStatusMessage: string = errorExperienced.collectedData.get(CollectedDataKey.ItemStopStatusMessage);
    const storeItem: StoreItem = errorExperienced.collectedData.get("storeItem");

    const stoppedItemDisplayInfo: IItemDisplayLine = getItemDisplayLine(storeItem, itemKey, itemKeyType);

    if (Theme.isTablet) {
      this.setState({
        stoppedItem: stoppedItemDisplayInfo,
        stoppedItemStatus,
        stoppedItemStatusMessage
      });
      this.props.updateUiMode(UI_MODE_STOPPED_ITEM);
    } else {
      this.props.navigation.push("stoppedItem", {
        onResetFromStoppedItem: this.handleResetFromStoppedItem,
        onSellSoftStoppedItem: this.handleSellSoftStoppedItem,
        stoppedItemStatus,
        stoppedItemStatusMessage,
        stoppedItem: stoppedItemDisplayInfo
      });
    }
  }

  private handleCancelNonEmptyReturnTransaction = (): void => {
    Alert.alert(
      I18n.t("exitReturnsTitle"),
      I18n.t("completeOrVoidReturnMessage"),
      [{ text: I18n.t("ok") }],
      { cancelable: true }
    );
  }

  private onVoidTransaction = (): void => {
    const voidTranTitle: string = this.props.stateValues &&
        this.props.stateValues.get("ItemHandlingSession.isReturning") ?
        "voidReturnTransactionTitle" : "voidTransactionTitle";
    Alert.alert(I18n.t(voidTranTitle), this.transactionHasVoidedTaxFreeItems() ?
        I18n.t("voidTransactionMessageWithTaxFreeDocument") : I18n.t("voidTransactionMessage"), [
      { text: I18n.t("cancel"), style: "cancel" },
      {
        text: I18n.t("okCaps"),
        onPress: () => {
          if (!Theme.isTablet) {
            this.props.navigation.dispatch(popTo("main"));
          }

          if (this.props.featureActionButtonProps.voidTransactionReasonListType) {
            this.props.navigation.push("reasonCodeList", {
              resetTitle: true,
              currentSelectedOption: this.state.selectedVoidSaleReasonCode,
              options: this.state.voidSaleReasonCodes,
              onOptionChosen: this.handleSetReasonCode.bind(this)
            });
          } else {
            this.performVoidSaleBusinessOperation();
          }
        }
      }
    ], { cancelable: true });
  }

  private transactionHasVoidedTaxFreeItems = (): boolean => {
    return !!(this.props.displayInfo && this.props.displayInfo.taxFreeDisplayLines &&
      this.props.displayInfo.taxFreeDisplayLines
          .some((line) => (line.lineType === VOID_TAX_REFUND_LINE_TYPE && line.successful)));
  }

  private handleSetReasonCode(newReasonCode: RenderSelectOptions): void {
    if (!this.props.businessStateInProgress) {
      this.setState({ selectedVoidSaleReasonCode: newReasonCode }, () => {
        this.performVoidSaleBusinessOperation();
      });
    }
  }

  private performVoidSaleBusinessOperation(): void {
    const uiInputs: Array<UiInput> = [];
    if (this.props.featureActionButtonProps.voidTransactionReasonListType) {
      uiInputs.push(new UiInput(UiInputKey.REASON_CODE, this.state.selectedVoidSaleReasonCode.code));
      uiInputs.push(new UiInput(UiInputKey.REASON_DESCRIPTION,
          this.state.selectedVoidSaleReasonCode.description));
      uiInputs.push(new UiInput(UiInputKey.REASON_LIST_TYPE,
          this.props.featureActionButtonProps.voidTransactionReasonListType));
    }
    this.props.performBusinessOperation(this.props.deviceIdentity, VOID_TRANSACTION_EVENT, uiInputs);
    this.props.updateUiMode(UI_MODE_VOID_TRANSACTION);
  }

  private handleOnExpiredCouponOverride = (): void => {
    const uiInputs: Array<UiInput> = [];
    const singleUseCouponUiInput: UiInput = this.props.businessStateInputs.find((uiInput: UiInput) =>
          uiInput.inputKey === UiInputKey.SINGLE_USE_COUPON_NUMBER);
    uiInputs.push(new UiInput(UiInputKey.SINGLE_USE_COUPON_NUMBER, singleUseCouponUiInput.inputValue));
    uiInputs.push(new UiInput(UiInputKey.EXPIRED_COUPON_OVERRIDE, true));
    this.props.performBusinessOperation(this.props.deviceIdentity, APPLY_SINGLE_USE_COUPON_EVENT, uiInputs);
  }

  private handleOnRequiredCustomerMissing = (isTransactionStarting: boolean, singleUseCouponNumber: string): void => {
    const originatedFromCouponScene: boolean = this.props.currentScreenName === "coupon";
    const customerPage = (this.customerBannerButtonActionIsCreate ? "customerCreate" : "customer");
    requestAnimationFrame(() => {
      this.props.navigation.push(customerPage, {
        isTransactionStarting,
        assignCustomer: true,
        onExit: () => {
          singleUseCouponNumber ?
              this.handleOnAddCustomerForSingleUseCoupon(singleUseCouponNumber, originatedFromCouponScene) :
              this.handleOnAddCustomerForEnterReturnMode();
        },
        onCancel: () => {
          singleUseCouponNumber ? this.handleOnCustomerNumberNotAddedForSingleUseCoupon()
                                : this.handleOnCustomerNumberNotAddedForEnterReturnMode();
        }
      });
    });
  }

  private handleOnAddCustomerForSingleUseCoupon = (singleUseCouponNumber: string,
                                                   originatedFromCouponScene: boolean): void => {
    const transactionCustomer = this.props.stateValues.get("transaction.customer");
    if (transactionCustomer && transactionCustomer.customerNumber) {
      this.props.performBusinessOperation(this.props.deviceIdentity, APPLY_SINGLE_USE_COUPON_EVENT,
          [new UiInput(UiInputKey.SINGLE_USE_COUPON_NUMBER, singleUseCouponNumber)]);
      try {
        this.props.navigation.dispatch(popTo(originatedFromCouponScene ? "coupon" : "main"));
      } catch {
        // Just in case the preceding popTo cannot go back to the coupon scene
        this.props.navigation.dispatch(popTo("main"));
      }
    } else {
      // Customer added but with no customer number.  This scenario is out-of-scope for DSS-2275.
      // TODO: implement handling of customer added but not saved to CRM when adding customer for SUC
      this.handleOnCustomerNumberNotAddedForSingleUseCoupon();
    }
  }

  private handleOnAddCustomerForEnterReturnMode = (): void => {
    const transactionCustomer = this.props.stateValues.get("transaction.customer");
    if (transactionCustomer) {
      this.props.performBusinessOperation(this.props.deviceIdentity, ENTER_RETURN_MODE_EVENT, []);

      if (this.returnWithTransactionEnabled) {
        this.setState({isCustomerAssignedDuringTransactionReturns: true});
      } else {
        this.props.navigation.dispatch(popTo("main"));
      }
    } else {
      this.handleOnCustomerNumberNotAddedForEnterReturnMode();
    }
  }

  /**
   * If the app is on the assign the salesperson screen because the transaction was started after adding the
   * customer, it shouldn't pop back to main
   */
  private handleOnAddCustomer = (): void => {
    if (getCurrentRouteNameWithNavigationRef() !== "assignSalesperson") {
      this.props.navigation.dispatch(popTo("main"));
    }
  }

  private handleOnCustomerNumberNotAddedForSingleUseCoupon = (): void => {
    this.showAlert(I18n.t("customerNumberRequiredForCouponValidation"), 500, undefined,
        [{ text: I18n.t("ok"), onPress: () => this.props.navigation.dispatch(popTo("main")) }], { cancelable: false });
  }
  private handleOnCustomerNumberNotAddedForEnterReturnMode = (): void => {
    this.showAlert(I18n.t("customerNumberRequiredForEnterReturnMode"), 500, undefined,
        [{ text: I18n.t("ok"), onPress: () => this.props.navigation.dispatch(popTo("main")) }], { cancelable: false });
  }

  private checkAndHandleCustomerSearch = (prevProps: Props): void => {
    const currentScreenName = getCurrentRouteNameWithNavigationRef();

    if (currentScreenName === "main" && (
        // Changes to handle DSS-13946
        (this.props.businessStateEventType === FIND_CUSTOMERS_EVENT &&
            !this.props.businessStateInProgress && prevProps.businessStateInProgress &&
        (this.props.eventType === DataEventType.ScanData || this.props.eventType === DataEventType.KeyListenerData)) ||
        // Changes to handle DSS-14784
        (!this.props.customerState.inProgress && prevProps.customerState.inProgress &&
            this.props.customerState.customers && this.props.customerState.customers.length === 1)
    )) {
      this.props.navigation.push("customer", {
        isTransactionStarting: (!prevProps.stateValues.get("transaction.id") &&
            this.props.stateValues.get("transaction.id")),
        returnMode: this.props.stateValues.get("ItemHandlingSession.isReturning"),
        assignCustomer: true,
        searchOccurred: true,
        onExit: () => this.handleOnAddCustomer(),
        onCancel: () => this.props.navigation.dispatch(popTo("main"))
      });
    }
  }

  private checkAndHandleTerminalOpenChange = (prevProps: Props): void => {
    if (!prevProps.stateValues.get("TerminalSession.isOpen") && this.props.stateValues.get("TerminalSession.isOpen")) {
      this.setState({ tempInfoMessage: I18n.t("terminalHasBeenOpenedSuccessfully") });

      const businessDate = this.props.stateValues.get("TerminalSession.lastActiveBusinessDay");
      const terminalDate = new Date();
      const locale = getStoreLocale();

      const format = I18n.t("date.format", {locale});

      const cashDrawerConfigSection = this.props.configManager.getPeripheralsValues().cashDrawerType;
      const cashDrawersConfigured = cashDrawerConfigSection?.deviceDefinitions?.length > 0;
      if (cashDrawersConfigured) {
        this.props.getCashDrawers();
      }

      // Prevent alert when application was upgraded while in a transaction to have open/close terminal feature.
      if (this.props.stateValues.get("transaction.type") === TERMINAL_CONTROL_TRANSACTION_TYPE) {
        if (businessDate && !datesAreEqual(businessDate, terminalDate)) {
          setTimeout(() => Alert.alert(
            I18n.t("dateMismatch"),
            I18n.t("businessDayDifference", {
              businessDate: Moment(businessDate).format(format),
              terminalDate: Moment(terminalDate).format(format)
            }),
            [{ text: I18n.t("ok"), onPress: () => this.showStayLoggedInAlert() }],
            { cancelable: false }
          ), 500);
        } else {
          // Using timeout to prevent collision between the Alert and LOADING modal in InitScreen.
          setTimeout(() => this.showStayLoggedInAlert(), 500);
        }
      }
    }
  }

  private showStayLoggedInAlert(): void {
    this.props.alert(
      this.selfCheckoutModeEnabled ? I18n.t("stayInAttendantMode") : I18n.t("stayLoggedIn"),
      this.selfCheckoutModeEnabled
          ? I18n.t("doYouWishToStayInAttendantMode")
          : I18n.t("doYouWishToStayLoggedIntoThisTerminal"),
      [
        { text: I18n.t("yes") },
        {
          text: I18n.t("no"),
          onPress: () => this.props.performBusinessOperation(this.props.deviceIdentity,
              this.selfCheckoutModeEnabled ? EXIT_ATTENDANT_MODE_EVENT : LOG_OFF_EVENT, []),
          style: "cancel"
        }
      ]
    );
  }

  private checkAndHandleTransactionVoidToast(prevProps: Props): void {
    const transactionClosed: boolean = !prevProps.stateValues.get("transaction.closed") &&
                                       this.props.stateValues.get("transaction.closed");

    if (transactionClosed && this.props.stateValues.get("transaction.voided")) {
      this.setState({ tempInfoMessage: I18n.t("transactionHasBeenVoided") });
    }
  }

  private checkAndHandleTransactionFulfillmentToast(prevProps: Props): void {
    const transactionClosed: boolean = !prevProps.stateValues.get("transaction.closed") &&
                                       this.props.stateValues.get("transaction.closed");
    const itemPickUpSignatureCollected = this.props.stateValues.has("transaction.itemPickupSignatureCollected") &&
                                        this.props.stateValues.get("transaction.itemPickupSignatureCollected") ?
                                        this.props.stateValues.get("transaction.itemPickupSignatureCollected") :
                                        false;
    if ((transactionClosed || itemPickUpSignatureCollected) &&
        this.isFulfillingPickupOrder(prevProps)) {
      this.setState({ tempInfoMessage: I18n.t("pickupSuccess") });
    }
  }

  private handleRequiresVoidOnStartup(): void {
    if (this.props.stateValues.get("transaction.voided")) {
      this.setState({transactionVoided: true});
    } else {
      this.props.navigation.push("voidableErrorScreen", {
        voidableReasonInfo: {
          reasonCode: DIGITAL_SIGNATURE_UNAVAILABLE_REASON_CODE,
          reasonDescription: I18n.t("digitalSignatureUnavailable")
        }
      });
    }
  }

  // tslint:disable-next-line: cyclomatic-complexity
  private handleStartupBehavior(): void {
    this.handleRequestCashDrawerStatus(true);
    const giftCertificateState: GiftCertificateState =
        this.props.stateValues.get("CashDrawerSession.giftCertificateState");
    if (giftCertificateState?.action && giftCertificateState.action !== GiftCertificateAction.Change &&
        (this.props.stateValues.get("CashDrawerSession.isOpen") ||
         this.props.stateValues.get("CashDrawerSession.isWaitingForOpenDrawerResponse") ||
         this.props.stateValues.get("CashDrawerSession.isWaitingForDrawerClosedResponse"))) {
      //if user was using issuing gift cert as a sale or refund
      if (giftCertificateState.action === GiftCertificateAction.Refund) {
        this.moveToPaymentScreen(true);
      } else {
        //reopen gift cert issuance screen for sale
        this.props.navigation.push("issueGiftCertificate", {
          onIssue: (certificateNumber: string, amount: string, inputSource: string, inputs?: UiInput[]) => {
            this.onIssueGCert(certificateNumber, amount, inputSource);
            this.props.navigation.dispatch(popTo("main"));
          },
          onExit: () => this.props.navigation.dispatch(popTo("main"))
        });
      }
    } else if (this.props.stateValues.get("transaction.requiresVoid")) {
      this.handleRequiresVoidOnStartup();
    } else if (this.props.uiState.logicalState === IN_MERCHANDISE_TRANSACTION_WAITING) {
      if (this.props.stateValues.get("TenderAuthorizationSession.authorizationMode") === AuthorizationMode.Tender ||
          this.props.stateValues.get("SubscriptionTokenSession.state") === SubscriptionTokenSessionState.RequiresToken
      ) {
        this.moveToPaymentScreen(true);
      } else {
        if (this.props.stateValues.get("TenderAuthorizationSession.state") ===
              TenderAuthorizationState.WaitingForCallforAuthorization) {
          this.setState({offlineOptionsOn: true});
        } else if (this.props.stateValues.get("TenderAuthorizationSession.state") ===
              TenderAuthorizationState.WaitingForRetryLastAuthorization) {
          this.setState({retryAuthorizationOn: true});
        } else if (this.props.stateValues.get("TenderAuthorizationSession.state") ===
              TenderAuthorizationState.WaitingForPartialAuthorizationApproval) {
          this.setState({partialAuthorizationApprovalOn: true});
        }
      }
    } else if (this.isTillManagementTransaction()) {
      if (this.props.uiState.logicalState === IN_TENDER_CONTROL_TRANSACTION_WAITING_TO_CLOSE &&
          last(this.props.displayInfo?.balanceInquiryLines) &&
          this.props.uiState.isAllowed(BALANCE_INQUIRY_RECEIPT_EVENT)) {
        this.closeBalanceInquiryTransaction();
      } else if (this.props.stateValues.get("transaction.isTenderExchangeTransaction")) {
        this.props.navigation.push("tenderExchange");
      } else {
        this.invokeMappedTillAction();
      }
    } else if (this.props.uiState.logicalState === IN_MERCHANDISE_TRANSACTION_WAITING_TO_CLOSE) {
      this.handleWaitingToCloseMerchandise();
    } else if (this.props.uiState.logicalState === IN_NO_SALE_TRANSACTION ||
        this.props.uiState.logicalState === IN_NO_SALE_TRANSACTION_WAITING ||
        this.props.uiState.logicalState === IN_NO_SALE_TRANSACTION_WAITING_TO_CLOSE) {
      this.props.navigation.push("scanDrawer", { eventType: NO_SALE_EVENT, startup: true });
    } else if (this.props.uiState.logicalState === IN_MERCHANDISE_TRANSACTION &&
        this.props.stateValues.get("ItemHandlingSession.isReturning") &&
        this.returnWithTransactionEnabled &&
        this.props.stateValues.get("ItemHandlingSession.returnWithTransaction")
    ) {
      this.props.navigation.push("returnTransaction");
    } else if (this.props.uiState.logicalState === IN_TAX_REFUND_CONTROL_TRANSACTION_WAITING_TO_CLOSE) {
      this.handleStartupBehaviorForTaxRefundControlTransactionWaitingToClose(this.props.stateValues);
    } else if (this.props.uiState.logicalState === IN_TAX_REFUND_CONTROL_TRANSACTION) {
      // currently no information available about the original transaction so instead of automatically searching again
      // and duplicating the start events, just skip the tax free process and close the transaction
      this.skipTaxFree();
    } else if (this.shouldOpenSalespersonScreenOnStartup()) {
      this.openSalespersonScreen();
    }
  }

  private closeBalanceInquiryTransaction(): void {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.RECEIPT_CATEGORY, ReceiptCategory.BalanceInquiry));
    uiInputs.push(new UiInput(UiInputKey.RECEIPT_TYPE, ReceiptType.None));
    this.props.performBusinessOperation(this.props.deviceIdentity, BALANCE_INQUIRY_RECEIPT_EVENT, uiInputs);
  }

  private invokeMappedTillAction(): void {
    const mapTillEventToScreenName: Map<string, keyof StackNavigatorParams> =
        new Map<string, keyof StackNavigatorParams>([
          [TILL_IN_EVENT, "tillDetail"],
          [TILL_OUT_EVENT, "tillDetail"],
          [TILL_AUDIT_EVENT, "tillDetail"],
          [TILL_COUNT_EVENT, "tillDetail"],
          [TILL_TO_BANK_EVENT, "tillDetail"],
          [TILL_RECONCILIATION_EVENT, "tillDetail"],
          [PAID_IN_EVENT, "paidDetail"],
          [PAID_OUT_EVENT, "paidDetail"],
          [SAFE_TO_TILL_EVENT, "tillDetail"],
          [TILL_TO_SAFE_EVENT, "tillDetail"]
        ]);
    const tillLine: ITillDisplayLine = last(this.props.displayInfo?.tillDisplayLines);
    if (tillLine) {
      const eventType: string = getTillEventFromStartLine(tillLine.lineType);
      this.props.navigation.push(mapTillEventToScreenName.get(eventType), {
        eventType,
        cashDrawerKey: tillLine.cashDrawerKey,
        inputSource: tillLine.inputSource,
        startup: true,
        alternateKey: tillLine.alternateKey
      });
    }
  }

  private shouldOpenSalespersonScreenOnStartup(): boolean {
    return this.shouldPromptForSalesperson &&
        (this.state.salespersonSkipped && this.allowSalespersonPromptAtTransactionStartToBeSkipped === false);
  }

  private openSalespersonScreen(): void {
    if (!Theme.isTablet) {
      requestAnimationFrame(() => this.props.navigation.push("assignSalesperson", {
        isTransactionStarting: true,
        assignToTransaction: true,
        onExit: (skipped?: boolean) => {
          this.setState({salespersonSkipped: skipped});
          if (this.shouldPromptForCustomer && !this.props.stateValues.get("transaction.customer")) {
            this.props.navigation.push("customer", {
              isTransactionStarting: true,
              assignCustomer: true,
              onExit: () => this.props.navigation.dispatch(popTo("main")),
              onCancel: () => this.props.navigation.dispatch(popTo("main"))
            });
          } else {
            this.props.navigation.dispatch(popTo("main"));
          }
        }
      }));
    } else {
      this.isEnteringSalespersonUiMode = true;
      this.props.updateUiMode(UI_MODE_ASSIGN_SALESPERSON_TO_TRANSACTION);
    }
  }

  private isTillManagementTransaction(): boolean {
    return this.props.uiState.logicalState === IN_TILL_CONTROL_TRANSACTION ||
        this.props.uiState.logicalState === IN_TILL_CONTROL_TRANSACTION_WAITING ||
        this.props.uiState.logicalState === IN_TILL_CONTROL_TRANSACTION_WAITING_TO_CLOSE ||
        this.props.uiState.logicalState === IN_TENDER_CONTROL_TRANSACTION ||
        this.props.uiState.logicalState === IN_TENDER_CONTROL_TRANSACTION_WAITING ||
        this.props.uiState.logicalState === IN_TENDER_CONTROL_TRANSACTION_WAITING_TO_CLOSE;
  }

  private handleStartupBehaviorForTaxRefundControlTransactionWaitingToClose(stateValues: Map<string, any>): void {
    if (stateValues && stateValues.get("TaxRefundSession.isPrinting")) {
      const documentIdentifier: string = stateValues.get("TaxRefundSession.documentIdentifier");
      this.props.navigation.push("genericPrinter", {
        onFinish: this.handlePrintResult.bind(this),
        header: this.renderHeaderForPrintScreen("taxFree"),
        dataUrl: this.props.stateValues.get("TaxRefundSession.contentAsDataUrl"),
        documentName: `${documentIdentifier}.pdf` || "TaxFreeForm.pdf"
      });
    } else {
      this.skipTaxFree();
    }
  }

  private renderHeaderForPrintScreen(titleI18nCode: string): JSX.Element {
    return (<Header title={I18n.t(titleI18nCode)} isVisibleTablet={Theme.isTablet} />);
  }

  private handlePrintResult(result: IPrintResult): void {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.PRINT_STATUS, getPrintStatusFromPrintResult(result)));
    this.props.performBusinessOperation(this.props.deviceIdentity, TAX_REFUND_PRINT_STATUS_EVENT, uiInputs);
    this.props.navigation.dispatch(popTo("main"));
  }

  private skipTaxFree(): void {
    this.props.performBusinessOperation(this.props.deviceIdentity, SKIP_TAX_REFUND_EVENT, []);
  }

  private handleCashDrawerPrompts(prevProps: Props): void {
    const stateValues = this.props.stateValues;
    const previousStateValues = prevProps.stateValues;
    if ((this.state.transactionVoided && stateValues.get("ReceiptSession.state") === ReceiptState.Completed) ||
        this.state.isInitialCashDrawerOnStartup) {
      if (!stateValues.get("CashDrawerSession.isClosedOrNoCashDrawer") && !this.requestedCashDrawerStatus) {
        this.handleRequestCashDrawerStatus();
      } else if ((stateValues.get("transaction.waitingToClose") || this.state.isInitialCashDrawerOnStartup) &&
          !(stateValues.get("CashDrawerSession.skipConfirmClose") && stateValues.get("CashDrawerSession.isForGiftCertificate")) &&
          previousStateValues.get("CashDrawerSession.isWaitingForDrawerClosedResponse") &&
          !stateValues.get("CashDrawerSession.isWaitingForDrawerClosedResponse") &&
          !stateValues.get("CashDrawerSession.isClosedOrNoCashDrawer") &&
          !this.props.businessStateInProgress) {
        this.showConfirmDrawerClosedAlert();
      }
    }
    if ((!previousStateValues.get("CashDrawerSession.isClosedOrNoCashDrawer") ||
        this.state.isInitialCashDrawerOnStartup) &&
        stateValues.get("CashDrawerSession.isClosedOrNoCashDrawer")) {
      this.handleCashDrawerClosed();
    }
  }

  private handleRequestCashDrawerStatus(force?: boolean): void {
    const stateValues = this.props.stateValues;
    if (stateValues &&
        (stateValues.get("transaction.waitingToClose") || force || this.state.isInitialCashDrawerOnStartup) &&
        !stateValues.get("CashDrawerSession.isClosedOrNoCashDrawer")) {
      this.requestedCashDrawerStatus = true;
      const cashDrawerKey = stateValues.get("CashDrawerSession.cashDrawerKey");
      const uiInputs: UiInput[] = [ new UiInput(UiInputKey.CASH_DRAWER_KEY, cashDrawerKey) ];

      if (stateValues.get("CashDrawerSession.skipConfirmClose") &&
          stateValues.get("CashDrawerSession.isForGiftCertificate")) {
        uiInputs.push(new UiInput(UiInputKey.CASH_DRAWER_RESET, true));
      }

      this.props.performBusinessOperation(
        this.props.deviceIdentity,
        CONFIRM_CASH_DRAWER_CLOSED_EVENT,
        uiInputs
      );
    }
  }

  private showConfirmDrawerClosedAlert(): void {
    this.displayingConfirmCashDrawerClosedAlert = true;
    this.props.alert(
      I18n.t("closeDrawerTitle"),
      I18n.t("closeDrawerMessage"),
      [{ text: I18n.t("ok"), onPress: () => this.handleConfirmDrawerClosedAlertInteraction() }],
      { cancellable: true }
    );
  }

  private handleConfirmDrawerClosedAlertInteraction(): void {
    this.displayingConfirmCashDrawerClosedAlert = false;
    this.handleRequestCashDrawerStatus(true);
  }

  private handleWaitingToCloseMerchandise(): void {
    let receiptCategorytype: ReceiptCategory =  this.props.stateValues.get("ReceiptSession.receiptCategory");
    if (isFranceLocation(this.props.retailLocations, this.props.configManager)) {
      receiptCategorytype = ReceiptCategory.VatReceipt;
    }
    this.props.navigation.push("receiptSummary", {
      receiptCategory: receiptCategorytype
    });
  }

  private handleCashDrawerClosed(): void {
    if (this.displayingConfirmCashDrawerClosedAlert) {
      this.displayingConfirmCashDrawerClosedAlert = false;
      this.props.dismissAlert();
    }
    if (this.state.isInitialCashDrawerOnStartup) {
      this.setState({isInitialCashDrawerOnStartup: false});
    }
  }

  private handleExtensibilityForms(prevProps: Props): void {
    if (!this.props.nonContextualData?.get(CollectedDataKey.ResumeTransactionCompleted) &&
        (itemDisplayLineCreated(prevProps.displayInfo, this.props.displayInfo) ||
        itemDisplayLineAdded(prevProps.displayInfo, this.props.displayInfo))) {
      const lastAddedItem = last(this.props.displayInfo.itemDisplayLines);
      if (itemDisplayLineHasValidExtensibilityForms(lastAddedItem)) {
        this.setState({shouldShowCommentScreen: true});
        if (!Theme.isTablet) {
          this.onAdditionalInfo(lastAddedItem, APTOS_ITEM_COMMENTS_FORM, false);
        }
      }
    }
  }

  private onFreeTextItemCommentProvided = (lineNumber: number, freeText?: string) => {
    this.props.performBusinessOperation(
      this.props.deviceIdentity,
      COMMENT_ITEM_EVENT,
      [
        new UiInput(UiInputKey.LINE_NUMBER, lineNumber),
        new UiInput(UiInputKey.ITEM_COMMENT,  freeText)
      ]
    );
  }

  private onAdditionalInfo = (line: IItemDisplayLine, formName: string, popToMain: boolean = true) => {
    const freeTextCommentValue: string = getCurrentValueOfField(line, "comment");
    this.props.navigation.push("comment", {
      lineNumber: line.lineNumber,
      freeTextCommentValue,
      onExit: () => {
        this.props.clearSelectedItemLines();
        if (popToMain) {
          this.props.navigation.dispatch(popTo("main"));
        } else {
          this.props.navigation.pop();
        }
      },
      onDone: (lineNumber: number, comment?: string) => {
        this.onAdditionalInfoProvided(lineNumber, formName, comment && { comment });
      }
    });
  }

  private onAdditionalInfoProvided = (lineNumber: number, formName: string, fields?: object) => {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput("lineNumber", lineNumber));
    uiInputs.push(new UiInput(UiInputKey.FORM_NAME, formName));
    uiInputs.push(new UiInput(UiInputKey.NAMESPACE, APTOS_STORE_SELLING_NAMESPACE));
    uiInputs.push(new UiInput(UiInputKey.FIELDS, fields));
    this.props.performBusinessOperation(
      this.props.deviceIdentity,
      APPLY_ITEM_EXTENSIBILITY_FORM_DATA_EVENT,
      uiInputs
    );
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessStateError: state.businessState.error,
    businessStateEventType: state.businessState.eventType,
    businessStateInputs: state.businessState.inputs,
    businessStateInProgress: state.businessState.inProgress,
    totalTransactionIsAllowed: state.uiState.isAllowed(TOTAL_TRANSACTION_EVENT),
    configManager: state.settings.configurationManager,
    deviceIdentity: state.settings.deviceIdentity,
    displayInfo: state.businessState.displayInfo,
    deviceStatus: state.deviceStatus,
    eventType: state.dataEvent.eventType,
    customerState: state.customer,
    featureActionButtonProps: state.uiState.featureActionButtonProps,
    hasRewardReasons: !!state.loyaltyMembershipState.rewardReasons,
    itemSelectionMode: state.itemSelectionState.itemSelectionMode,
    nonContextualData: state.businessState.nonContextualData,
    scoBlockingBusinessError: state.selfCheckoutState.scoBlockingBusinessError,
    scoLastSceneKey: state.selfCheckoutState.lastSceneKey,
    selectedItems: state.itemSelectionState.selectedItems,
    stateValues: state.businessState.stateValues,
    uiState: state.uiState,
    retailLocations: state.retailLocations,
    currentScreenName: getCurrentRouteNameWithNavigationRef(),
    displayToast: state.displayToastState.toastMessage,
    i18nLocation: state.i18nLocationState?.i18nLocation
  };
}

export default connect<StateProps, DispatchProps, NavigationScreenProps<"main">>(mapStateToProps, {
  alert: alert.request,
  clearSelectedItemLines: clearSelectedItemLines.request,
  clearLoyaltyMembership: clearLoyaltyMembership.request,
  dismissAlert: dismissAlertModal.request,
  showModal,
  displayErrorScanner: displayErrorScanner.request,
  performBusinessOperation: businessOperation.request,
  resolveSCOBlockingBusinessError: recordSCOBlockingBusinessError.success,
  selectCustomer: selectCustomer.request,
  updateUiMode: updateUiMode.request,
  getRetailLocation: getRetailLocationAction.request,
  getCashDrawers: getCashDrawers.request,
  displayToastSuccess: displayToast.success
})(withMappedNavigationParams<typeof MainScreen>()(MainScreen));
