import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { Money } from "@aptos-scp/scp-component-business-core";
import { ILogEntryMessage, ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { UIINPUT_SOURCE_BARCODE } from "@aptos-scp/scp-component-store-selling-core";
import { CANCEL_TENDER_SESSION_EVENT, IPinRules, isStoredValueCardServiceAvailable, TenderAuthCategory, TenderAuthorizationState, Usage, ValueCardAction } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { ActionCreator, businessOperation, DataEventType, IDataEventData, IKeyListenerData, updateUiMode } from "../../actions";
import { AppState, DataEventState, UiState, UI_MODE_TENDERING, UI_MODE_WAITING_FOR_INPUT, UI_MODE_WAITING_TO_CLOSE } from "../../reducers";
import Theme from "../../styles";
import { getStoreLocale, getStoreLocaleCurrencyOptions } from "../common/utilities";
import VectorIcon from "../common/VectorIcon";
import { getActiveGiftTender } from "../giftCard/GiftCardUtilities";
import BasePaymentScreen, {
  BasePaymentScreenDispatchProps,
  BasePaymentScreenProps,
  BasePaymentScreenState,
  BasePaymentScreenStateProps
} from "../payment/BasePaymentScreen";
import { getPaymentDevicesAsRenderSelect, ITenderType } from "../payment/PaymentDevicesUtils";
import { SCOScreenKeys, SCOScreenProps } from "./common/constants";
import SCOPopup from "./common/SCOPopup";
import SCORedeemGiftCard from "./SCORedeemGiftCard";
import { paymentSummaryStyles } from "./styles";
import { NavigationProp } from "../StackNavigatorParams";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.payment.selfCheckout.PaymentSummary");

interface StateProps extends BasePaymentScreenStateProps {
  uiState: UiState;
  dataEvent: DataEventState;
}

interface DispatchProps extends BasePaymentScreenDispatchProps {
  updateUiMode: ActionCreator;
}

interface Props extends StateProps, DispatchProps, BasePaymentScreenProps, SCOScreenProps {
  onPaymentComplete: () => void;
  navigation: NavigationProp;
}

interface State extends BasePaymentScreenState {
  shouldRenderPaymentPopUp: boolean;
  showDeviceNotReadyPopUp: boolean;
  showPaymentPopUp: boolean;
  showPartialAuthApprovalPopUp: boolean;
  showGCRedeemOptions: boolean;
  showVoidingPopUp: boolean;
  showVoidingFailedPopUp: boolean;
  cardNumber: string;
}

class PaymentSummary extends BasePaymentScreen<Props, State> {

  private styles: any;
  private giftCardAvailable: boolean;
  private activeGiftTender: ITenderType;
  private pinRules: IPinRules;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(paymentSummaryStyles());
    this.giftCardAvailable = isStoredValueCardServiceAvailable(this.props.settings.configurationManager,
      this.props.businessState.stateValues &&
      this.props.businessState.stateValues.get("StoredValueCardSession.state"), ValueCardAction.Redeem);
    this.activeGiftTender = getActiveGiftTender(this.activeTenders);
    this.pinRules = this.activeGiftTender && this.activeGiftTender.pinRules;

    this.state = {
      tenderAmount: undefined,
      tenderAuthCategory: undefined,
      tenderId: undefined,
      tenderType: undefined,
      showPaymentDeviceSelection: false,
      offlineOptionsOn: false,
      shouldRenderPaymentPopUp: false,
      useFirstDeviceOnly: true,
      retryAuthorizationOn: false,
      showPartialAuthApprovalPopUp: false,
      showDeviceNotReadyPopUp: false,
      showPaymentPopUp: false,
      showGCRedeemOptions: false,
      showVoidingPopUp: false,
      showVoidingFailedPopUp: false,
      cardNumber: undefined,
      references: undefined
    };
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.uiState.mode ===  UI_MODE_TENDERING &&
        this.props.uiState.mode === UI_MODE_WAITING_TO_CLOSE) {
      this.onTenderingComplete();
    }

    if (this.props.businessState.stateValues.get("TenderAuthorizationSession.state") ===
          TenderAuthorizationState.Completed &&
          prevProps.businessState.stateValues.get("TenderAuthorizationSession.state") !==
          TenderAuthorizationState.Completed ) {
      this.setState({showVoidingPopUp: false, retryAuthorizationOn: false, showPaymentPopUp: false , showPartialAuthApprovalPopUp: false});
    }
    if (this.props.businessState.stateValues.get("TenderAuthorizationSession.state") ===
          TenderAuthorizationState.WaitingForRetryLastAuthorization &&
          prevProps.businessState.stateValues.get("TenderAuthorizationSession.state") !==
          TenderAuthorizationState.WaitingForRetryLastAuthorization) {
      if (this.state.showVoidingPopUp) {
        this.setState({showVoidingFailedPopUp: true, showVoidingPopUp: false,  retryAuthorizationOn: false, showPaymentPopUp: false });
      } else {
        this.setState({showVoidingFailedPopUp: false, showVoidingPopUp: false,  retryAuthorizationOn: true, showPaymentPopUp: true });
      }
    }
    if (this.props.businessState.stateValues.get("TenderAuthorizationSession.state") ===
          TenderAuthorizationState.WaitingForPartialAuthorizationApproval &&
          prevProps.businessState.stateValues.get("TenderAuthorizationSession.state") !==
          TenderAuthorizationState.WaitingForPartialAuthorizationApproval) {
      this.setState({ showPartialAuthApprovalPopUp: true, showPaymentPopUp: false });
    }

    if (this.props.dataEvent !== prevProps.dataEvent) {
      this.handleDataEventChange(prevProps);
    }
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
  }

  public render(): JSX.Element {
    const {stateValues} = this.props.businessState;

    const totalSavings: Money = stateValues && stateValues.get("transaction.totalSavings")

    return (
      <>
          {
            !this.state.showGCRedeemOptions &&
            <View style={this.styles.root}>
            <View style={this.styles.leftSide}>
              <View style={this.styles.paymentSummaryArea}>
                <Text style={this.styles.title}>{I18n.t("paymentSummary")}</Text>
                <View style={this.styles.underline} />
                {this.renderAmounts(stateValues)}
                <View style={this.styles.totalSavingsRow}>
                { this.renderTextRow(I18n.t("totalSavings"), this.localizeMoney(totalSavings), false) }
                </View>
              </View>
            </View>
            <View style={this.styles.rightSide}>
            <View style= {this.styles.buttonArea}>
                  <TouchableOpacity
                    style={this.styles.backButton}
                    onPress={() => this.props.navigateToNextScreen(SCOScreenKeys.Payment)}
                  >
                    <Text style={this.styles.backText} >{I18n.t("back")}</Text>
                  </TouchableOpacity>
              </View>
              <View style={this.styles.paymentTypeButtonsArea} >
                  <TouchableOpacity
                    style={this.styles.cardPaymentButton}
                    onPress={this.onPayWithCard.bind(this)}
                  >
                    <Text style={this.styles.cardPaymentButtonText} >{I18n.t("card")}</Text>
                  </TouchableOpacity>
                  {this.giftCardAvailable &&
                    <TouchableOpacity
                      style={this.styles.giftCardPaymentButton}
                      onPress={this.showGCRedeem.bind(this)}
                    >
                      <Text style={this.styles.giftCardPaymentButtonText} >{I18n.t("giftCard")}</Text>
                    </TouchableOpacity>
                  }
              </View>
            </View>
          </View>
          }
          { this.state.showGCRedeemOptions &&
            this.renderGCRedeemOptions()
          }
        {
          this.state.showPaymentPopUp && this.paymentPopUp()
        }
        {
          this.state.showPartialAuthApprovalPopUp && this.partialApprovalPopup()
        }
        {
          this.state.showVoidingPopUp && this.voidingPopUp()
        }
        {
          this.state.showVoidingFailedPopUp && this.voidingFailedPopUp()
        }
      </>
    );
  }

  protected onUiModeVoid(): void {
    // tslint:disable-next-line:max-line-length
    logger.debug("onUiModeVoid called on Self Checkout Payment. Voiding is not currently supported in self checkout mode.");
  }

  protected onTenderingComplete(): void {
    const entryMessage: ILogEntryMessage = logger.traceEntry("onTenderingComplete");
    this.setState({ showPaymentPopUp: false });
    this.props.onPaymentComplete();
    logger.traceExit(entryMessage);
  }

  private renderAmounts(stateValues: Map<string, any>): JSX.Element {
    const zeroCurrency = new Money(0.00, stateValues.get("transaction.accountingCurrency"));

    const transactionSubTotal: Money = stateValues && stateValues.get("transaction.subTotal") || zeroCurrency;
    const transactionTax: Money = stateValues && stateValues.get("transaction.tax") || zeroCurrency;
    const transactionTotalTendered: Money = stateValues && stateValues.get("transaction.totalTendered") || zeroCurrency;
    const transactionBalanceDue: Money = stateValues && stateValues.get("transaction.balanceDue") || zeroCurrency;
    const transactionFee: Money = stateValues && stateValues.get("transaction.totalFee") || zeroCurrency;
    const transactionDonation: Money = stateValues && stateValues.get("transaction.donation");

    return(
      <View style={this.styles.popupMainText}>
        { this.renderTextRow(I18n.t("totalBeforeTax"), this.localizeMoney(transactionSubTotal), false) }
        { this.renderTextRow(I18n.t("totalTax"), this.localizeMoney(transactionTax), false) }
        { this.renderTextRow(I18n.t("fee"), this.localizeMoney(transactionFee), false) }
        { transactionDonation && this.renderTextRow(I18n.t("donation"), this.localizeMoney(transactionDonation), false) }
        { this.renderTextRow(I18n.t("tendered"), this.localizeMoney(transactionTotalTendered, false), false) }
        { this.renderTextRow(I18n.t("totalDue"), this.localizeMoney(transactionBalanceDue), true) }
      </View>
    )
  }
  private renderGCRedeemOptions(): JSX.Element {
    return (
      <View style={this.styles.root}>
        <View style={this.styles.leftSide}>
          <View style={[this.styles.redeemTextArea, this.styles.redeemScanTextArea]}>
            <View style={this.styles.iconArea}>
              <View style={this.styles.icon}>
                <VectorIcon
                  fill={this.styles.scannerIcon.color}
                  height={this.styles.scannerIcon.height}
                  name={"ScanGiftCard"}
                  stroke={this.styles.scannerIcon.borderColor}
                  width={this.styles.scannerIcon.width}
                />
              </View>
            </View>
          </View>
        </View>
        <View style={this.styles.rightSide}>
          <SCORedeemGiftCard
            settings={this.props.settings}
            onRedeem={this.onPayWithGiftCard.bind(this)}
            onBack={this.hideGCRedeem.bind(this)}
            activeGiftTender={this.activeGiftTender}
            pinRules={this.pinRules}
            cardNumber={this.state.cardNumber}
          />
        </View>
      </View>
    );
  }

  private hideGCRedeem(): void {
    this.setState({showGCRedeemOptions: false});
    this.props.updateUiMode(undefined);
  }

  private showGCRedeem(): void {
    this.setState({showGCRedeemOptions: true});
    this.props.updateUiMode(UI_MODE_WAITING_FOR_INPUT);
  }

  private paymentPopUp(): JSX.Element {
    return (
      <SCOPopup preserveUiMode={true} navigation={this.props.navigation}>
        {this.state.retryAuthorizationOn &&
          <View style={this.styles.popUpBase}>
            <Text style={this.styles.title}>{I18n.t("paymentNotProcessed")}</Text>
            <View style={this.styles.popupMainText}>
              <Text style={this.styles.subtitle}>{I18n.t("paymentNotProcessedTryAgain")}</Text>
              <Text style={this.styles.subtitle}>
                {I18n.t("tryAgainOrSelect")}
                <Text style={this.styles.subtitleBold}> {I18n.t("help")} </Text>
                {I18n.t("forAssistance")}
              </Text>
            </View>
            <View style= {this.styles.buttonArea}>
              <TouchableOpacity
                style={this.styles.backButton}
                onPress={this.state.showDeviceNotReadyPopUp ? this.onBackPressOfDeviceNotReady.bind(this) :
                         this.onCancelAuthorization.bind(this)
                  }
              >
                <Text style={this.styles.backText} >{I18n.t("back")}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={this.styles.continueButton} onPress={this.onRetryLastAuthorization.bind(this)} >
                <Text style={this.styles.continueText} >{I18n.t("tryAgain")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        {!this.state.retryAuthorizationOn &&
          <View style={this.styles.popUpBase}>
            <Text style={this.styles.popupTitle}>{I18n.t("cardPayment")}</Text>
            <Text style={this.styles.subtitle}>{I18n.t("pleaseFollowTheInstructionsOnTheCardTerminal")}</Text>
          </View>
        }
      </SCOPopup>
    );
  }

  private partialApprovalPopup(): JSX.Element {
    const {stateValues} = this.props.businessState;
    const zeroCurrency = new Money(0.00, stateValues.get("transaction.accountingCurrency"));
    const transactionBalanceDue: Money = stateValues && stateValues.get("transaction.balanceDue") || zeroCurrency;
    return (
      <SCOPopup preserveUiMode={true} navigation={this.props.navigation}>
          <View style={this.styles.popUpBase}>
            <Text style={this.styles.popupTitle}>{I18n.t("remainingBalance")}</Text>
            <View style={this.styles.popupMainText}>
              <Text style={this.styles.subtitle}>{I18n.t("paymentDoesntCoverTheTotalAmount", { remaining: this.localizeMoney(transactionBalanceDue) } )}</Text>
            </View>
            <View style= {this.styles.buttonArea}>
              <TouchableOpacity
                style={this.styles.backButton}
                onPress={this.state.showDeviceNotReadyPopUp ? this.onBackPressOfDeviceNotReady.bind(this) :
                         this.onCancelPartialAuthorization.bind(this)
                  }
              >
                <Text style={this.styles.backText} >{I18n.t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={this.styles.continueButton} onPress={this.onPartialAuthorizationApproved.bind(this)} >
                <Text style={this.styles.continueText} >{I18n.t("continue")}</Text>
              </TouchableOpacity>
            </View>
          </View>
      </SCOPopup>
    );
  }

  private voidingPopUp(): JSX.Element {
    return (
      <SCOPopup preserveUiMode={true} navigation={this.props.navigation}>
          <View style={this.styles.popUpBase}>
            <Text style={this.styles.popupTitle}>{I18n.t("voidingPayment")}</Text>
            <Text style={this.styles.subtitle}>{I18n.t("previousPaymentIsBeingVoided")}</Text>
          </View>
      </SCOPopup>
    );
  }

  private voidingFailedPopUp(): JSX.Element {
    return (
      <SCOPopup preserveUiMode={true} navigation={this.props.navigation}>
          <View style={this.styles.popUpBase}>
            <Text style={this.styles.popupTitle}>{I18n.t("paymentNotCanceled")}</Text>
            <View style={this.styles.popupMainText}>
              <Text style={this.styles.subtitle}>{I18n.t("unableToCancelYourPayment")}</Text>
            </View>
            <View style= {this.styles.buttonArea}>
              <TouchableOpacity style={this.styles.continueButton} onPress={this.onPaymentNotCanceledOk.bind(this)} >
                <Text style={this.styles.continueText} >{I18n.t("ok")}</Text>
              </TouchableOpacity>
            </View>
          </View>
      </SCOPopup>
    );
  }

  private onPayWithCard(): void {
    this.primaryPaymentDevices =
        getPaymentDevicesAsRenderSelect(this.props.paymentStatus, this.isPrimaryPaymentDevices);
    if (!this.isPrimaryPaymentDeviceAvailable) {
      this.setState({showPaymentPopUp: true, showDeviceNotReadyPopUp: true, retryAuthorizationOn: true});
    } else {
      this.setState({ showPaymentPopUp: true, showDeviceNotReadyPopUp: false});
      this.props.updateUiMode(UI_MODE_TENDERING);
      const totalDue = this.props.businessState.stateValues.get("transaction.balanceDue") as Money;
      const tenderAmount = totalDue ? totalDue.amount : "0";
      this.handlePayment(TenderAuthCategory.PaymentDevice, undefined, tenderAmount);
    }
  }

  private onPayWithGiftCard(cardNumber?: string, inputSource?: string, pin?: string): void {
    this.setState({ showPaymentPopUp: true, showDeviceNotReadyPopUp: false, showGCRedeemOptions: false});
    this.props.updateUiMode(UI_MODE_TENDERING);
    const totalDue = this.props.businessState.stateValues.get("transaction.balanceDue") as Money;
    const tenderAmount = totalDue ? totalDue.amount : "0";
    this.handlePayment(TenderAuthCategory.StoredValueCardService, undefined, tenderAmount, undefined, cardNumber, inputSource, pin);
  }


  private onRetryLastAuthorization(): void {
    this.setState({retryAuthorizationOn: false});
    if (this.state.showDeviceNotReadyPopUp) {
      this.onPayWithCard();
    } else {
      this.handleRetryAuthorization();
    }
  }

  private onCancelAuthorization(): void {
    this.props.updateUiMode(undefined);
    this.setState({ retryAuthorizationOn: false, showPaymentPopUp: false, showGCRedeemOptions: false });
    this.handleCancelAuthorization();
  }

  private onCancelPartialAuthorization(): void {
    this.props.updateUiMode(undefined);
    this.handleCancelPartialAuthorization();
    this.setState({ showVoidingPopUp: true, showPartialAuthApprovalPopUp: false, retryAuthorizationOn: false, showPaymentPopUp: false, showGCRedeemOptions: false });
  }

  private onPartialAuthorizationApproved(): void {
    this.props.performBusinessOperation(this.props.settings.deviceIdentity, CANCEL_TENDER_SESSION_EVENT, []);
    this.setState({showPartialAuthApprovalPopUp: false, showPaymentPopUp: false });
  }

  private onPaymentNotCanceledOk(): void {
    this.setState({ showVoidingFailedPopUp: false, showVoidingPopUp: false, showPartialAuthApprovalPopUp: false, retryAuthorizationOn: false, showPaymentPopUp: false });
  }

  private onBackPressOfDeviceNotReady(): void {
    this.setState({ showDeviceNotReadyPopUp: false, showPaymentPopUp: false, retryAuthorizationOn: false });
  }

  private handleDataEventChange(prevProps: Props): void {
    if (this.props.dataEvent.data !== prevProps.dataEvent.data) {
      let incomingScannerData: IDataEventData;
      let incomingCardNumber: string;
      if (!this.props.dataEvent.error) {
        if (this.props.dataEvent.eventType === DataEventType.KeyListenerData) {
          incomingCardNumber = (this.props.dataEvent.data as IKeyListenerData).inputText;
      } else if (this.props.dataEvent.eventType === DataEventType.ScanData) {
        incomingScannerData = this.props.dataEvent.data ? this.props.dataEvent.data: undefined;
        incomingCardNumber = incomingScannerData ? incomingScannerData.data : undefined;
      }
      if (incomingCardNumber) {
        const pinRedeemRules = this.pinRules && this.pinRules["redeem"];
        const pinScanUsage = pinRedeemRules && pinRedeemRules[UIINPUT_SOURCE_BARCODE] && pinRedeemRules[UIINPUT_SOURCE_BARCODE].usage;
        pinScanUsage === Usage.NotUsed ?
            this.onPayWithGiftCard(incomingCardNumber, UIINPUT_SOURCE_BARCODE) :
            this.setState({cardNumber: incomingCardNumber});
        }
      }
    }
  }

  private renderTextRow(leftText: string, rightText: string, useBold: boolean): JSX.Element {
    return (
      <View style={this.styles.textRow}>
        <Text style={[this.styles.generalText, useBold && this.styles.generalTextWithBold]}>{leftText}</Text>
        <Text style={[this.styles.generalText, useBold && this.styles.generalTextWithBold]}>{rightText}</Text>
      </View>
    );
  }

  private get isPrimaryPaymentDeviceAvailable(): boolean {
    return this.primaryPaymentDevices && this.primaryPaymentDevices.length > 0;
  }

  private localizeMoney(amount: Money, wrapInParenthesis?: boolean): string {
    const converted: string = amount.toLocaleString(getStoreLocale()
      , getStoreLocaleCurrencyOptions());
    return wrapInParenthesis ? `(${converted})` : converted;
  }
}

function mapStateToProps(state: AppState): StateProps {
  return {
    businessState: state.businessState,
    paymentStatus: state.deviceStatus && state.deviceStatus.paymentStatus,
    settings: state.settings,
    uiState: state.uiState,
    dataEvent: state.dataEvent
  };
}

export default connect(mapStateToProps, {
  performBusinessOperation: businessOperation.request,
  updateUiMode: updateUiMode.request
})(PaymentSummary);
