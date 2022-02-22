import * as React from "react";
import { InteractionManager } from "react-native";
import Orientation from "react-native-orientation-locker";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import { IConfigurationManager, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  CLOSE_TRANSACTION_EVENT,
  CONFIRM_CASH_DRAWER_CLOSED_EVENT,
  Coupon,
  IDisplayInfo,
  ILoyaltyMembershipActivity,
  IN_MERCHANDISE_TRANSACTION_WAITING,
  IN_MERCHANDISE_TRANSACTION_WAITING_TO_CLOSE,
  isFeatureConfigPresentAndEnabled,
  ITEM_SALE_LINE_TYPE,
  NOT_IN_TRANSACTION,
  ORDER_ITEM_MULTI_LINE_EVENT,
  ReceiptCategory,
  ReceiptState,
  RETURN_COUPON_EVENT,
  START_TAX_REFUND_EVENT,
  TAX_REFUND_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import { LineType, LoyaltyActivityType } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  alert,
  AlertRequest,
  blockModal,
  businessOperation,
  dismissAlertModal,
  unblockModal
} from "../../actions";
import {
  AppState,
  BusinessState,
  ModalState,
  RemoteCallState,
  RetailLocationsState,
  SettingsState,
  UiState
} from "../../reducers";
import Theme from "../../styles";
import BaseView from "../common/BaseView";
import ToastPopUp from "../common/ToastPopUp";
import { isFranceLocation } from "../common/utilities";
import {
  displayTenderRoundingAdjustment,
  getItemAttributeDisplayOrderConfig
} from "../common/utilities/configurationUtils";
import { popTo } from "../common/utilities/navigationUtils";
import { getCurrentRouteNameWithNavigationRef } from "../RootNavigation";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { ReceiptSummaryScreenProps } from "./interfaces";
import ReceiptSummaryPhone from "./phone/ReceiptSummary";
import { receiptSummaryScreenStyles } from "./styles";
import ReceiptSummaryTablet from "./tablet/ReceiptSummary";

interface StateProps {
  businessState: BusinessState;
  displayInfo: IDisplayInfo;
  modalState: ModalState;
  remoteCall: RemoteCallState;
  settings: SettingsState;
  uiState: UiState;
  retailLocations: RetailLocationsState;
  isInvoice: boolean;
  currentScreenName: string;
}

interface DispatchProps {
  alert: AlertRequest;
  dismissAlert: ActionCreator;
  blockModal: ActionCreator;
  unblockModal: ActionCreator;
  performBusinessOperation: ActionCreator;
}

interface Props extends ReceiptSummaryScreenProps, StateProps, DispatchProps, NavigationScreenProps<"receiptSummary"> {}

interface State {
  displayInfo: IDisplayInfo;
  shouldAssignCustomer: boolean;
  shouldPromptAdditionalDestinations: boolean;
  showCustomerAssignedMessage: boolean;
  showUnusedCoupons: boolean;
  signatureRequired: boolean;
  returnSignatureCollected: boolean;
  itemPickUpSignatureCollected: boolean;
  isPickingUpItems: boolean;
}

class ReceiptSummaryScreen extends React.Component<Props, State> {
  private currency: any;
  private shouldReturnUnusedCoupons: boolean;
  private styles: any;
  private unusedCoupons: Coupon[];
  private unusedCouponPrompt: string;
  private promptForCustomerAfterReceipts: boolean;
  private requestedCashDrawerStatus: boolean;
  private displayingConfirmCashDrawerClosedAlert: boolean;
  private skipAssigningCustomer: boolean;
  private readonly itemAttributesDisplayOrder?: Set<string>;
  private taxFreeEnabled: boolean;

  constructor(props: Props) {
    super(props);

    this.moveToSignatureScreen = this.moveToSignatureScreen.bind(this);

    this.currency = this.props.businessState.stateValues.get("transaction.accountingCurrency");

    this.shouldReturnUnusedCoupons = this.promptForReturnCoupons(this.props.settings.configurationManager);
    this.unusedCouponPrompt = this.unusedCouponsPromptText(this.props.settings.configurationManager);
    this.promptForCustomerAfterReceipts = this.promptForCustomerAfterTransactionReceipts(
        this.props.settings.configurationManager);

    const unusedCouponsData: Coupon[] = this.props.businessState.stateValues.get("LiabilitiesSession.unusedCoupons");
    if (unusedCouponsData && unusedCouponsData.length > 0) {
      this.unusedCoupons = unusedCouponsData;
    } else {
      this.unusedCoupons = undefined;
    }
    this.styles = Theme.getStyles(receiptSummaryScreenStyles());

    this.itemAttributesDisplayOrder = getItemAttributeDisplayOrderConfig(this.props.settings.configurationManager);


    this.taxFreeEnabled =
        isFeatureConfigPresentAndEnabled(TAX_REFUND_EVENT, this.props.settings.configurationManager) &&
        (!this.props.businessState.stateValues.get("transaction.returnSubTotal") ||
        this.props.businessState.stateValues.get("transaction.returnSubTotal").isZero()) &&
        !this.props.businessState.stateValues.get("TaxRefundSession.documentIdentifier");

    this.state = {
      displayInfo: props.businessState.displayInfo,
      shouldAssignCustomer: false,
      shouldPromptAdditionalDestinations: false,
      showCustomerAssignedMessage: false,
      showUnusedCoupons: this.shouldReturnUnusedCoupons && this.unusedCoupons !== undefined,
      signatureRequired: false,
      returnSignatureCollected: this.props.businessState.stateValues.get("transaction.returnSignatureCollected"),
      itemPickUpSignatureCollected:
          this.props.businessState.stateValues.has("transaction.itemPickUpSignatureCollected") ?
          this.props.businessState.stateValues.get("transaction.itemPickUpSignatureCollected") : false,
      isPickingUpItems: this.props.businessState.stateValues.has("transaction.isPickingUpItems") &&
          this.props.businessState.stateValues.get("transaction.isPickingUpItems")
    };
  }

  public componentDidMount(): void {
    if ((this.returnItemsRequireSignature() && !this.state.returnSignatureCollected ||
        (this.ItemPickUpRequireSignature() && !this.state.itemPickUpSignatureCollected &&
          this.state.isPickingUpItems))  &&
        (this.props.uiState.logicalState === IN_MERCHANDISE_TRANSACTION_WAITING_TO_CLOSE ||
        this.props.uiState.logicalState === IN_MERCHANDISE_TRANSACTION_WAITING)) {
      this.handleSignature();
    }
  }

  public componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.currentScreenName === "receiptSummary" && this.props.currentScreenName === "signatureCapture" &&
        !Theme.isTablet) {
      Orientation.lockToPortrait();
    }
  }

  public componentDidUpdate(prevProps: Props): void {
    const { stateValues } = this.props.businessState;
    if (stateValues.get("transaction.customer") && !prevProps.businessState.stateValues.get("transaction.customer")) {
      this.setState({
          showCustomerAssignedMessage: true,
          shouldPromptAdditionalDestinations: true
      });
    }

    if (!prevProps.businessState.stateValues.get("CashDrawerSession.isClosedOrNoCashDrawer") &&
        stateValues.get("CashDrawerSession.isClosedOrNoCashDrawer")) {
      this.handleCashDrawerClosed(stateValues);
    }

    // receipt has printed successfully and transaction did not close
    if (stateValues.get("ReceiptSession.state") === ReceiptState.Completed) {
      if (this.state.shouldAssignCustomer && !stateValues.get("ReceiptSession.printingFailed") &&
          !this.skipAssigningCustomer) {
        // When there isn't any modal it blocks the modalState so no other modals can be displayed
        if (stateValues.get("CashDrawerSession.isClosedOrNoCashDrawer") &&
            !this.props.modalState.blocked && !this.isModalShowing()) {
          this.props.blockModal();
        } else if (this.props.modalState.blocked && !prevProps.modalState.blocked) {
          // The alert is only shown when there are no other modals being displayed to avoid conflicts
          this.setState({ shouldAssignCustomer: false }, () => setTimeout(this.alertUserToAssignCustomer, 250));
        }
      } else if (this.state.shouldPromptAdditionalDestinations) {
        this.setState({ shouldPromptAdditionalDestinations: false },
            () => this.props.navigation.dispatch(popTo("receiptSummary")));
      } else {
        this.handleCashDrawerPrompts(prevProps);
      }
    }

    if ( prevProps.uiState.logicalState !== NOT_IN_TRANSACTION
        && this.props.uiState.logicalState === NOT_IN_TRANSACTION) {
      this.handleOnClose();
    }

    if (!prevProps.businessState.stateValues.get("TaxRefundSession.isConnected") &&
        stateValues.get("TaxRefundSession.isConnected")) {
      this.proceedToTaxFreeScreen();
    }
  }

  public render(): JSX.Element {
    const configurationManager = this.props.settings.configurationManager;
    const loyaltyMembershipActivities = this.getLoyaltyMembershipActivities();
    const hasDonations = this.props.businessState.displayInfo.donationDisplayLines.length > 0;

    return (
      <BaseView style={this.styles.root}>
        {
          !Theme.isTablet &&
          <ReceiptSummaryPhone
            currency={this.currency}
            receiptCategory={this.props.receiptCategory}
            displayInfo={this.state.displayInfo}
            hasDonations={hasDonations}
            onCloseUnusedCoupons={this.handleUnusedCouponScreenClose.bind(this)}
            shouldPromptAdditionalDestinations={this.state.shouldPromptAdditionalDestinations}
            promptForCustomer={this.promptForCustomer.bind(this)}
            onClose={this.handleOnClose}
            renderUnusedCoupons={this.state.showUnusedCoupons}
            stateValues={this.props.businessState.stateValues}
            loyaltyActivities={loyaltyMembershipActivities}
            unusedCoupons={this.unusedCoupons}
            unusedCouponPrompt={this.unusedCouponPrompt}
            displayRoundingAdjustment={displayTenderRoundingAdjustment(configurationManager)}
            promptForCustomerAfterTransactionReceipts={this.promptForCustomerAfterReceipts}
            handleContinueOnChangeDueScreen={this.handleContinueOnChangeDueScreen.bind(this)}
            handleAddCustomerOnChangeDueScreen={this.handleRequestCashDrawerStatus.bind(this)}
            taxFreeEnabled={this.taxFreeEnabled}
            handleTaxFree={this.handleTaxFree}
            configuration={this.props.settings.configurationManager}
            navigation={this.props.navigation}
          />
        }
        {
          Theme.isTablet &&
          <ReceiptSummaryTablet
            appLogo={this.props.appLogo}
            currency={this.currency}
            displayInfo={this.state.displayInfo}
            hasDonations={hasDonations}
            displayRoundingAdjustment={displayTenderRoundingAdjustment(configurationManager)}
            handleAddCustomerOnChangeDueScreen={this.handleRequestCashDrawerStatus.bind(this)}
            handleContinueOnChangeDueScreen={this.handleContinueOnChangeDueScreen.bind(this)}
            handleTaxFree={this.handleTaxFree}
            itemAttributesOrder = {this.itemAttributesDisplayOrder}
            loyaltyActivities={loyaltyMembershipActivities}
            onClose={this.handleOnClose}
            onCloseUnusedCoupons={this.handleUnusedCouponScreenClose.bind(this)}
            promptForCustomer={this.promptForCustomer.bind(this)}
            promptForCustomerAfterTransactionReceipts={this.promptForCustomerAfterReceipts}
            receiptCategory={this.props.receiptCategory}
            renderUnusedCoupons={this.state.showUnusedCoupons}
            retailLocationLocale={this.props.settings.primaryLanguage}
            shouldPromptAdditionalDestinations={this.state.shouldPromptAdditionalDestinations}
            stateValues={this.props.businessState.stateValues}
            taxFreeEnabled={this.taxFreeEnabled}
            unusedCouponPrompt={this.unusedCouponPrompt}
            unusedCoupons={this.unusedCoupons}
            configuration={this.props.settings.configurationManager}
            navigation={this.props.navigation}
          />
        }
        {
          this.state.showCustomerAssignedMessage &&
          <ToastPopUp textToDisplay={I18n.t("customerAddedAfterReceipt")} hidePopUp={this.onHidePopUp} />
        }
      </BaseView>
    );
  }

  private returnItemsRequireSignature = (): boolean => {

    const configurationManager = this.props.settings.configurationManager;
    const returnBehaviors = configurationManager.getFunctionalBehaviorValues().returnsBehaviors;
    const configReturnSignature: boolean = returnBehaviors && returnBehaviors.customerSignatureRequired;

    const result = configReturnSignature &&
    !!(this.props.displayInfo.itemDisplayLines.find((line) =>
        line.extendedAmountExcludingTransactionDiscounts &&
        line.lineType !== LineType.ItemCancel &&
        line.extendedAmountExcludingTransactionDiscounts.isNegative()));

    return result;
  }

  private ItemPickUpRequireSignature = (): boolean => {

    const configurationManager = this.props.settings.configurationManager;
    const omniChannelBehaviors = configurationManager.getFunctionalBehaviorValues().omniChannelBehaviors;
    const itemPickup = omniChannelBehaviors && omniChannelBehaviors.itemPickUp;
    const configPickupSignature: boolean = itemPickup && itemPickup.customerSignatureRequired;

    const itemSaleLine = this.props.displayInfo.itemDisplayLines.find((line) =>
          line.lineType === ITEM_SALE_LINE_TYPE && line.fulfillmentGroupId);
    const isOrderItemMultiLineEvent = (this.props.businessState.eventType === ORDER_ITEM_MULTI_LINE_EVENT);
    const isOrderItemPickup: UiInput = this.props.businessState.inputs.find((uiInput: UiInput) =>
          uiInput.inputValue === "OrderItemPickup");
    const result = configPickupSignature &&
      !!itemSaleLine && !!isOrderItemMultiLineEvent && !! isOrderItemPickup;

    return result;
  }

  private handleSignature(): void {
    if (!Theme.isTablet) {
      Orientation.lockToLandscapeRight();
      this.moveToSignatureScreen();
    } else if (this.props.currentScreenName === "receiptSummary") {
      this.moveToSignatureScreen();
    }
  }

  private moveToSignatureScreen(): void {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.push("signatureCapture", {
        tenderLine: undefined,
        isReturnSignature: !this.state.isPickingUpItems,
        isItemPickupSignature: this.state.isPickingUpItems
      });
    });
  }

  private onHidePopUp = (): void => {
    if (this.state.showCustomerAssignedMessage) {
      this.setState(
        { showCustomerAssignedMessage: false }
      );
    }
  }

  private promptForReturnCoupons(configurationManager: IConfigurationManager): boolean {
    try {
      return !!configurationManager.getFunctionalBehaviorValues().couponBehaviors.displayUnusedCouponsInTransaction;
    } catch (error) {
      return false;
    }
  }

  private unusedCouponsPromptText(configurationManager: IConfigurationManager): string {
    try {
      const unusedCouponsDisplayMessage = configurationManager.getFunctionalBehaviorValues().
          couponBehaviors.unusedCouponsDisplayMessage[I18n.currentLocale()] ;

      return unusedCouponsDisplayMessage ? unusedCouponsDisplayMessage : I18n.t("unusedCouponsPrompt");
    } catch (error) {
      return I18n.t("unusedCouponsPrompt");
    }
  }

  private promptForCustomerAfterTransactionReceipts(configurationManager: IConfigurationManager): boolean {
    try {
      return configurationManager.getFunctionalBehaviorValues().customerFunctionChoices.
          promptForCustomerAfterTransactionReceipts;
    } catch (error) {
      return false;
    }
  }

  private handleUnusedCouponScreenClose(): void {
    this.setState({ showUnusedCoupons: false });

    const unusedCoupons: Coupon[] = this.props.businessState.stateValues.get("LiabilitiesSession.unusedCoupons");
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput("input_unusedCoupons", unusedCoupons));
    this.props.performBusinessOperation(this.props.settings.deviceIdentity, RETURN_COUPON_EVENT, uiInputs);
  }

  private promptForCustomer(): void {
    if (this.promptForCustomerAfterReceipts &&
        ((isFranceLocation(this.props.retailLocations, this.props.settings.configurationManager) &&
        this.props.receiptCategory === ReceiptCategory.VatReceipt) ||
        this.props.receiptCategory === ReceiptCategory.Receipt)
        && !this.props.businessState.stateValues.get("ReceiptSession.printingFailed")) {
      if (this.props.businessState.stateValues.get("transaction.customer")) {
        this.skipAssigningCustomer = true;
        this.setState({ shouldPromptAdditionalDestinations: true });
      } else if (this.props.businessState.stateValues.get("CashDrawerSession.isClosedOrNoCashDrawer") &&
          !this.skipAssigningCustomer) {
        this.setState({ shouldAssignCustomer: true });
      }
    }
  }

  private handleOnClose = (): void => {
    if (!this.promptForCustomerAfterReceipts ||
        (this.promptForCustomerAfterReceipts &&
        this.props.uiState.logicalState === NOT_IN_TRANSACTION)) {
      this.props.navigation.dispatch(popTo("main"));
    }
  }

  private handleTaxFree = (): void => {
    this.props.performBusinessOperation(this.props.settings.deviceIdentity, START_TAX_REFUND_EVENT, [
      new UiInput(UiInputKey.IS_INVOICE, this.props.isInvoice)
    ]);
  }

  private proceedToTaxFreeScreen = (): void => {
    this.props.navigation.replace("taxFree");
  }

  private handleCashDrawerPrompts = (prevProps: Props): void => {
    const { stateValues } = this.props.businessState;
    const previousStateValues = prevProps.businessState.stateValues;
    if (!this.props.modalState.blocked && !this.isModalShowing() &&
        !this.promptForCustomerAfterReceipts && !this.requestedCashDrawerStatus &&
        stateValues.get("CashDrawerSession.isOpen")) {
      this.handleRequestCashDrawerStatus();
    } else if (stateValues.get("transaction.waitingToClose") &&
        previousStateValues.get("CashDrawerSession.isWaitingForDrawerClosedResponse") &&
        !stateValues.get("CashDrawerSession.isWaitingForDrawerClosedResponse") &&
        !stateValues.get("CashDrawerSession.isClosedOrNoCashDrawer") &&
        !this.props.businessState.inProgress) {
      this.showConfirmDrawerClosedAlert();
    }
  }

  private handleRequestCashDrawerStatus(): void {
    const stateValues = this.props && this.props.businessState && this.props.businessState.stateValues;
    if (stateValues && stateValues.get("transaction.waitingToClose") &&
        !stateValues.get("CashDrawerSession.isClosedOrNoCashDrawer")) {
      this.requestedCashDrawerStatus = true;
      const cashDrawerKey = stateValues.get("CashDrawerSession.cashDrawerKey");
      const uiInputs: UiInput[] = [ new UiInput(UiInputKey.CASH_DRAWER_KEY, cashDrawerKey) ];

      this.props.performBusinessOperation(
        this.props.settings.deviceIdentity,
        CONFIRM_CASH_DRAWER_CLOSED_EVENT,
        uiInputs
      );
    }
  }

  private handleContinueOnChangeDueScreen(): void {
    this.skipAssigningCustomer = true;
    if (this.props.businessState.stateValues.get("CashDrawerSession.isClosedOrNoCashDrawer") &&
        this.props.businessState.stateValues.get("ReceiptSession.printingFailed")) {
      this.props.performBusinessOperation(this.props.settings.deviceIdentity, CLOSE_TRANSACTION_EVENT);
    } else if (this.props.businessState.stateValues.get("CashDrawerSession.isClosedOrNoCashDrawer")) {
      this.manuallyCloseTransaction();
    } else {
      this.handleRequestCashDrawerStatus();
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
    this.handleRequestCashDrawerStatus();
  }

  private manuallyCloseTransaction(): void {
    this.setState({ shouldPromptAdditionalDestinations: true });
  }

  private alertUserToAssignCustomer = (): void => {
    this.props.alert(
      I18n.t("customerAdd"),
      `${I18n.t("customerPreviousPrompt")} ${this.props.businessState.stateValues.get("transaction.number")}`,
      [
        {
          text: I18n.t("cancel"),
          style: "cancel",
          onPress: () => {
            this.props.unblockModal();
            this.manuallyCloseTransaction();
          }
        },
        {
          text: I18n.t("confirm"),
          onPress: () => {
            this.props.unblockModal();
            this.props.navigation.push("customer", {
              isTransactionStarting: true,
              assignCustomer: true,
              onExit: () => {
                // Do not need to close the transaction here
              },
              onCancel: () => {
                this.manuallyCloseTransaction();
              }
            });
          }
        }
      ],
      { cancelable: false }
    );
  }

  private isModalShowing(): boolean {
    return !!Object.keys(this.props.modalState).find(
      (key: string) => this.props.modalState[key].show);
  }

  private handleCashDrawerClosed(stateValues: Map<string, any>): void {
    if (this.displayingConfirmCashDrawerClosedAlert) {
      this.displayingConfirmCashDrawerClosedAlert = false;
      this.props.dismissAlert();
    }
    if (this.promptForCustomerAfterReceipts && !stateValues.get("ReceiptSession.printingFailed") &&
        stateValues.get("ReceiptSession.state") === ReceiptState.Completed) {
      if (!this.skipAssigningCustomer) {
        this.promptForCustomer();
      } else if (!this.state.shouldPromptAdditionalDestinations) {
        this.manuallyCloseTransaction();
      }
    }
  }

  private getLoyaltyMembershipActivities(): ILoyaltyMembershipActivity[] {
    if (this.props.displayInfo && this.props.displayInfo.loyaltyMembershipLines &&
        this.props.displayInfo.loyaltyMembershipLines.length > 0 &&
        this.props.displayInfo.loyaltyMembershipLines[0].loyaltyActivities) {
      return this.props.displayInfo.loyaltyMembershipLines[0].loyaltyActivities.filter((activity) =>
          activity.loyaltyActivityType === LoyaltyActivityType.Sale ||
          activity.loyaltyActivityType === LoyaltyActivityType.PendingSale);
    }

    return undefined;
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    displayInfo: state.businessState.displayInfo,
    isInvoice: state.taxRefund.isInvoice,
    modalState: state.modalState,
    remoteCall: state.remoteCall,
    settings: state.settings,
    uiState: state.uiState,
    retailLocations: state.retailLocations,
    currentScreenName: getCurrentRouteNameWithNavigationRef()
  };
}

export default connect<StateProps, DispatchProps>(mapStateToProps, {
  alert: alert.request,
  dismissAlert: dismissAlertModal.request,
  blockModal,
  unblockModal,
  performBusinessOperation: businessOperation.request
})(withMappedNavigationParams<typeof ReceiptSummaryScreen>()(ReceiptSummaryScreen));
