import * as React from "react";
import { Text, TouchableOpacity, View} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";

import {
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  APPLY_ITEM_SUBSCRIPTION_EVENT,
  getFeatureAccessConfig,
  IDisplayInfo,
  IItemDisplayLine,
  IN_MERCHANDISE_TRANSACTION,
  IN_MERCHANDISE_TRANSACTION_WAITING,
  IN_MERCHANDISE_TRANSACTION_WAITING_TO_CLOSE,
  OPEN_CASH_DRAWER_EVENT,
  REMOVE_TRANSACTION_SUBSCRIPTIONS_EVENT,
  RESET_SUBSCRIPTION_AUTHORIZATION_TOKEN_EVENT,
  RETRIEVE_SUBSCRIPTION_AUTHORIZATION_TOKEN_EVENT,
  SubscriptionFlowOptions,
  SubscriptionTokenSessionState,
  TenderAuthCategory,
  TENDER_AUTHORIZATION_TOKEN_LINE_TYPE,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import { IPaymentStatus } from "@aptos-scp/scp-types-commerce-devices";
import { IAddress, ICustomer, IFulfillmentGroup, IOrder, IPerson, ReceiptCategory } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  alert,
  AlertRequest,
  businessOperation,
  feedbackNoteAction,
  updateUiMode
} from "../../actions";
import {
  AppState,
  BusinessState,
  FeedbackNoteState,
  RetailLocationsState,
  SettingsState,
  UiState,
  UI_MODE_SUBSCRIPTION_TOKEN
} from "../../reducers";
import { FeedbackNoteType } from "../../reducers/feedbackNote";
import Theme from "../../styles";
import FeedbackNote from "../common/FeedbackNote";
import { RenderSelectOptions } from "../common/FieldValidation";
import Header from "../common/Header";
import { popTo } from "../common/utilities/navigationUtils";
import { appIsWaitingForSignature } from "../common/utilities/SignatureUtils";
import { isFranceLocation } from "../common/utilities/utils";
import { getPaymentDevicesAsRenderSelect, makePrimaryDeviceTypeFilter } from "../payment/PaymentDevicesUtils";
import { NavigationScreenProps } from "../StackNavigatorParams";
import { SubscriptionsAuthorizationScreenProps } from "./interfaces";
import { subscriptionAuthorizationStyles } from "./styles";
import SubscriptionSummaryDetails from "./SubscriptionSummaryDetails";

interface State {
  feedbackNote: FeedbackNoteState;
  inRetryState: boolean;
  primaryPaymentDevices: RenderSelectOptions[];
}

interface Props extends SubscriptionsAuthorizationScreenProps, StateProps, DispatchProps,
    NavigationScreenProps<"subscriptionAuthorization"> {}

interface StateProps {
  feedbackNoteState: FeedbackNoteState;
  uiState: UiState;
  displayInfo: IDisplayInfo;
  businessState: BusinessState;
  paymentStatus: Map<string, IPaymentStatus>;
  settings: SettingsState;
  retailLocations: RetailLocationsState;
  stateValues: Map<string, any>;
  i18nLocation: string;
}

export interface DispatchProps {
  alert: AlertRequest;
  performBusinessOperation: ActionCreator;
  clearFeedbackNoteState: ActionCreator;
  updateUiMode: ActionCreator;
}

class SubscriptionAuthorizationScreen extends React.Component<Props, State> {
  private styles: any;
  private isPrimaryPaymentDevices: (status: IPaymentStatus) => boolean = undefined;
  private contact: ICustomer | IPerson;
  private address: IAddress;
  private subscribedItems: IItemDisplayLine[];
  private isCanceling: boolean = false;

  public constructor(props: Props) {
    super(props);

    this.isPrimaryPaymentDevices = makePrimaryDeviceTypeFilter(this.props.settings.configurationManager,
      this.props.settings.deviceIdentity.deviceId);

      const primaryPaymentDevices =
          getPaymentDevicesAsRenderSelect(this.props.paymentStatus, this.isPrimaryPaymentDevices);

      const order: IOrder = this.props.businessState.stateValues.get("transaction.order");
      if (order && order.fulfillmentGroups) {


        order.fulfillmentGroups.forEach((fulfillmentGroup: IFulfillmentGroup) => {
          if (fulfillmentGroup?.deliveryLocation?.address) {
            this.address = fulfillmentGroup.deliveryLocation.address;
          }
          if (fulfillmentGroup?.deliveryLocation?.contact) {
            this.contact = fulfillmentGroup.deliveryLocation.contact;
          }
        });
      }

      this.subscribedItems =
          this.props.businessState.displayInfo && this.props.businessState.displayInfo.itemDisplayLines &&
      this.props.displayInfo.itemDisplayLines.filter((line) => line.subscribed);

    this.state = {
      feedbackNote: {message: I18n.t("initiateSubscriptionPayment"), messageType: FeedbackNoteType.Info},
      inRetryState: false,
      primaryPaymentDevices
    };
    this.styles = Theme.getStyles(subscriptionAuthorizationStyles());
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.paymentStatus !== this.props.paymentStatus) {
      const primaryPaymentDevices =
          getPaymentDevicesAsRenderSelect(this.props.paymentStatus, this.isPrimaryPaymentDevices);
      this.setState({primaryPaymentDevices});
    }

    if (this.props.uiState.logicalState === IN_MERCHANDISE_TRANSACTION && prevProps.uiState.logicalState === IN_MERCHANDISE_TRANSACTION_WAITING ||
          (!this.isTokenBeforePayment() && this.props.uiState.logicalState ===IN_MERCHANDISE_TRANSACTION_WAITING)) {
      if (this.isTokenBeforePayment() && this.props.businessState.displayInfo.tenderDisplayLines &&
            this.props.businessState.displayInfo.tenderDisplayLines.find((line) => line.lineType === TENDER_AUTHORIZATION_TOKEN_LINE_TYPE)) {
        this.props.onCompleted();
      } else {
        if (this.props.feedbackNoteState && this.props.feedbackNoteState.message) {
          this.setState({feedbackNote: this.props.feedbackNoteState, inRetryState: true});
          this.props.clearFeedbackNoteState();
        }
      }
    } else if (this.props.uiState.logicalState === IN_MERCHANDISE_TRANSACTION_WAITING_TO_CLOSE && prevProps.uiState.logicalState === IN_MERCHANDISE_TRANSACTION_WAITING) {
      this.moveToReceiptScreen();
    }

    if (!this.props.businessState.inProgress && prevProps.businessState.inProgress && !this.props.businessState.error) {
      if (this.props.businessState.eventType === REMOVE_TRANSACTION_SUBSCRIPTIONS_EVENT) {
        this.props.navigation.dispatch(popTo("main"));
      }
    }

    this.checkAndHandleCashDrawerInteraction(prevProps);
  }

  public componentDidMount(): void {
    this.props.updateUiMode(UI_MODE_SUBSCRIPTION_TOKEN);
  }

  public componentWillUnmount(): void {
    if (this.props.uiState.mode === UI_MODE_SUBSCRIPTION_TOKEN) {
      this.props.updateUiMode(undefined);
    }
  }

  public render(): JSX.Element {
    const disableCard = !this.state.primaryPaymentDevices || this.state.primaryPaymentDevices.length === 0;
    return (
      <>
      {this.isTokenBeforePayment() &&
        <Header
          title={I18n.t("subscription")}
          backButton={{
            name: "Back",
            action: () => {
              this.props.onBack();
              this.props.navigation.pop();
            }
          }}
          isVisibleTablet={true}
        />
      }
      {!this.isTokenBeforePayment() &&
        <Header
        title={I18n.t("subscription")}
        isVisibleTablet={true}
        />
      }
        <KeyboardAwareScrollView contentContainerStyle={this.styles.root}>
          {
            this.tokenRequired() &&
            <View style={this.styles.tokenContainer}>
              {this.state.feedbackNote?.message &&
                <FeedbackNote message={this.state.feedbackNote.message}
                              messageType={FeedbackNoteType.Info}/>
              }
              <View style={this.styles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => this.retrieveSubscriptionToken()}
                  style={[this.styles.cardButton, disableCard && this.styles.btnDisabled]}
                  disabled={disableCard}
                >
                  <Text style={[this.styles.btnPrimaryText, disableCard && this.styles.btnDisabledText]}>
                    {this.state.inRetryState ? I18n.t("retry") : I18n.t("card")}
                  </Text>
                </TouchableOpacity>
                {
                  (this.state.inRetryState || disableCard) &&
                  <TouchableOpacity
                    onPress={() => {
                      if(this.isCanceling) {
                        //prevent double click
                        return;
                      }
                      this.isCanceling = true;
                      this.isTokenBeforePayment() ? this.removeSubscriptions() : this.resetSubscriptionTokenState()
                    }}
                    style={[this.styles.removeButton]}
                  >
                    <Text style={[this.styles.btnSecondayText]}>
                      {this.isTokenBeforePayment() ? I18n.t("remove") : I18n.t("cancel") }
                    </Text>
                  </TouchableOpacity>
                }
              </View>
            </View>
          }
          <View style={this.styles.summaryContainer}>
            <SubscriptionSummaryDetails
              deliveryAddress={this.address}
              deliveryContact={this.contact}
              subscribedItemDisplayLines={this.subscribedItems}
              settings={this.props.settings}
              i18nLocation={this.props.i18nLocation}
            />
          </View>
        </KeyboardAwareScrollView>

      </>
    );
  }

  private isTokenBeforePayment(): boolean {
    const subscriptionPaymentFlow = getFeatureAccessConfig(this.props.settings.configurationManager, APPLY_ITEM_SUBSCRIPTION_EVENT)?.subscriptionPaymentFlow;
    return subscriptionPaymentFlow === SubscriptionFlowOptions.TokenBeforePayment;
  }

  private tokenRequired(): boolean {
    return this.props.uiState.logicalState !== IN_MERCHANDISE_TRANSACTION_WAITING ||
        (!this.isTokenBeforePayment() &&
        this.props.businessState.stateValues.get("SubscriptionTokenSession.state") === SubscriptionTokenSessionState.RequiresToken)
  }

  private retrieveSubscriptionToken(): void {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.TENDER_AUTH_CATEGORY_NAME, TenderAuthCategory.PaymentDevice));
    uiInputs.push(new UiInput(UiInputKey.AUTHORIZATION_DEVICE_ID, this.getFirstDeviceId()));
    this.props.performBusinessOperation(this.props.settings.deviceIdentity,
        RETRIEVE_SUBSCRIPTION_AUTHORIZATION_TOKEN_EVENT, uiInputs);
  }

  private getFirstDeviceId(): string {
    // TODO: Subscription token retrieval is only supported with Aurus where we do not support multidevice
    return  this.state.primaryPaymentDevices && this.state.primaryPaymentDevices.length > 0 &&
        this.state.primaryPaymentDevices[0].code;
  }

  private removeSubscriptions(): void {
    this.props.alert(undefined, I18n.t("removeSubscriptionsConfirmation"), [
      { text: I18n.t("cancel"), style: "cancel" },
      {
        text: I18n.t("ok"), onPress: () => {
          this.props.performBusinessOperation(this.props.settings.deviceIdentity,
              REMOVE_TRANSACTION_SUBSCRIPTIONS_EVENT, []);
        }
      }
    ]);
  }

  private resetSubscriptionTokenState = (): void => {
    this.props.alert(undefined, I18n.t("subscriptionCancellationConfirmation"), [
      { text: I18n.t("cancel"), style: "cancel" , onPress: () => {
        this.setState({feedbackNote: {message: I18n.t("initiateSubscriptionPayment"), messageType: FeedbackNoteType.Info}, inRetryState: false});
      }},
      {
        text: I18n.t("ok"), onPress: () => {
          this.props.performBusinessOperation(this.props.settings.deviceIdentity, RESET_SUBSCRIPTION_AUTHORIZATION_TOKEN_EVENT, []);
        }
      }
    ]);
    this.isCanceling = false;
  }

  private moveToReceiptScreen = (): void => {
    let receiptCategoryType: ReceiptCategory =  ReceiptCategory.Receipt;
    if (isFranceLocation(this.props.retailLocations, this.props.settings.configurationManager)) {
      receiptCategoryType = ReceiptCategory.VatReceipt;
    }
    if (!this.props.businessState.stateValues.get("transaction.requiresVoid")) {
      requestAnimationFrame(() =>
          this.props.navigation.push("receiptSummary", { receiptCategory: receiptCategoryType }));
    }
  }

  private checkAndHandleCashDrawerInteraction = (prevProps: Props): void => {
    if (!this.isTokenBeforePayment() && !this.props.businessState.inProgress && prevProps.businessState.inProgress &&
        !this.props.businessState.error && this.proceedToScanDrawer(prevProps)) {
      this.props.navigation.replace("scanDrawer", {
        eventType: OPEN_CASH_DRAWER_EVENT
      });
    }
  }

  private proceedToScanDrawer(prevProps: Props): boolean {
    return this.props.businessState.stateValues.get("CashDrawerSession.isWaitingForUserToSelectCashDrawer") &&
        !appIsWaitingForSignature(this.props) && (appIsWaitingForSignature(prevProps) ||
        !prevProps.businessState.stateValues.get("CashDrawerSession.isWaitingForUserToSelectCashDrawer"));
  }

}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    feedbackNoteState: state.feedbackNote,
    paymentStatus: state.deviceStatus && state.deviceStatus.paymentStatus,
    settings: state.settings,
    displayInfo: state.businessState.displayInfo,
    uiState: state.uiState,
    retailLocations: state.retailLocations,
    stateValues: state.businessState.stateValues,
    i18nLocation: state.i18nLocationState?.i18nLocation
  };
}

export default connect<StateProps, DispatchProps>(mapStateToProps, {
  alert: alert.request,
  performBusinessOperation: businessOperation.request,
  clearFeedbackNoteState: feedbackNoteAction.success,
  updateUiMode: updateUiMode.request
})(withMappedNavigationParams<typeof SubscriptionAuthorizationScreen>()(SubscriptionAuthorizationScreen));
