import _ from "lodash";
import * as React from "react";
import { Keyboard, Text, TouchableOpacity } from "react-native";
import { View } from "react-native-animatable";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { withMappedNavigationParams } from "react-navigation-props-mapper";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import {
  DecoratedFormProps,
  Field,
  FormErrors,
  FormInstance,
  formValueSelector,
  InjectedFormProps,
  reduxForm
} from "redux-form";

import { Money } from "@aptos-scp/scp-component-business-core";
import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import {
  DeviceIdentity,
  UiInput,
  UIINPUT_SOURCE_BARCODE,
  UIINPUT_SOURCE_KEYBOARD
} from "@aptos-scp/scp-component-store-selling-core";
import {
  BALANCE_INQUIRY_EVENT,
  EXIT_ATTENDANT_MODE_EVENT,
  IBalanceInquiryDisplayLine,
  IDisplayInfo,
  IN_TENDER_CONTROL_TRANSACTION,
  isStoredValueCardServiceAvailable,
  ITenderDisplayLine,
  ReceiptCategory,
  SSF_MAXIMUM_EXCHANGE_AMOUNT_EXCEEDED_I18N_CODE,
  TenderAuthCategory,
  TenderAuthorizationState,
  TenderDenominationRoundings,
  TenderType,
  TENDER_AUTH_STATUS_EVENT,
  TENDER_EXCHANGE_EVENT,
  TENDER_EXCHANGE_IN_EVENT,
  TENDER_EXCHANGE_IN_LINE_TYPE,
  TENDER_EXCHANGE_OUT_EVENT,
  UiInputKey,
  Usage,
  VOID_TENDER_CONTROL_TRANSACTION_EVENT
} from "@aptos-scp/scp-component-store-selling-features";
import {
  TenderType as PaymentTenderType
} from "@aptos-scp/scp-types-commerce-devices";

import I18n from "../../../../config/I18n";
import {
  ActionCreator,
  balanceInquiry as balanceInquiryOperation,
  businessOperation,
  dataEvent,
  DataEventType,
  feedbackNoteAction,
  IDataEventData,
  IKeyListenerData,
  sceneTitle,
  updateUiMode
} from "../../../actions";
import {
  AppState,
  BalanceInquiryState,
  BusinessState,
  DataEventState,
  FeedbackNoteState,
  SettingsState,
  UiState,
  UI_MODE_WAITING_FOR_INPUT
} from "../../../reducers";
import Theme from "../../../styles";
import FeedbackNote from "../../common/FeedbackNote";
import { renderInputField, renderNumericInputField, RenderSelectOptions } from "../../common/FieldValidation";
import Header from "../../common/Header";
import { InputType } from "../../common/Input";
import {
  getDenominationRoundings,
  getStoreLocale,
  getStoreLocaleCurrencyOptions,
  handleFormSubmission,
  printAmount
} from "../../common/utilities";
import { popTo } from "../../common/utilities/navigationUtils";
import { getActiveGiftTender, getPinUsage } from "../../giftCard/GiftCardUtilities";
import {
  getActiveTenders,
  getActiveTenderTypes,
  getIsGiftCardDeviceFilter,
  getPaymentDevicesAsRenderSelect,
  ITenderType
} from "../../payment/PaymentDevicesUtils";
import { getCurrentRouteNameWithNavigationRef } from "../../RootNavigation";
import { inTransaction } from "../../selfCheckout/common/constants";
import { selfCheckoutConfigured } from "../../selfCheckout/utilities/SelfCheckoutStateCheck";
import { NavigationScreenProps } from "../../StackNavigatorParams";
import { TenderExchangeScreenProps } from "./interfaces";
import { tenderExchangeInScreenStyles } from "./styles";

interface ITenderExchangeDetails {
  displayLine?: ITenderDisplayLine;
  amount: Money;
  roundedBalanceDueTenders?: TenderDenominationRoundings[];
  tenderAuthCategory: TenderAuthCategory;
  accountNumber: string;
  inquiryPerformed: boolean;
}

interface StateProps {
  balanceInquiry: BalanceInquiryState;
  businessState: BusinessState;
  currentScreenName: string;
  dataEvent: DataEventState;
  deviceIdentity: DeviceIdentity;
  feedbackNoteState: FeedbackNoteState;
  pin: string;
  paymentStatus: Map<string, any>;
  settings: SettingsState;
  uiState: UiState;
}

interface DispatchProps {
  clearBalanceInquiry: ActionCreator;
  sceneTitle: ActionCreator;
  businessOperation: ActionCreator;
  clearFeedbackNoteState: ActionCreator;
  dataEventSuccess: ActionCreator;
  updateUiMode: ActionCreator;
}

interface Props extends TenderExchangeScreenProps, StateProps, DispatchProps, NavigationScreenProps<"tenderExchange"> {}

interface State {
  feedbackNote: FeedbackNoteState;
  isSwipeAvailable: boolean;
  selectedExchangeInTenderType: PaymentTenderType;
  selectedExchangeOutTenderType: PaymentTenderType;
  exchangeInDetails: ITenderExchangeDetails;
  needToPrint: boolean;
  primaryGiftDevices: RenderSelectOptions[];
}

interface TenderExchangeScreenForm {
  accountNumber?: string;
  pin?: string;
  uiInputSource?: string;
}

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.tender.tenderExchangeScreen");

class TenderExchangeScreen extends React.PureComponent<Props & InjectedFormProps<TenderExchangeScreenForm, Props> &
  FormInstance<TenderExchangeScreenForm, undefined>, State> {

  private styles: any;
  private disableCardButtonsAuthSessInProgress: boolean;
  private pinRef: any;
  private showPinField: boolean;
  private cashTenderId: string;
  private lastEventProcessed: string;

  public constructor(props: Props & InjectedFormProps<TenderExchangeScreenForm, Props> &
      FormInstance<TenderExchangeScreenForm, undefined>) {
    super(props);
    this.styles = Theme.getStyles(tenderExchangeInScreenStyles());

    const primaryGiftDevices = getPaymentDevicesAsRenderSelect(this.props.paymentStatus,
          getIsGiftCardDeviceFilter(this.props.settings.configurationManager, this.props.settings.deviceIdentity.deviceId));
    const isSwipeAvailable: boolean = !isStoredValueCardServiceAvailable(this.props.settings.configurationManager,
        this.props.businessState.stateValues.get("StoredValueCardSession.state"));

    const activeGiftTender: ITenderType = this.props.businessState.stateValues.get("transaction.accountingCurrency") &&
        getActiveGiftTender(getActiveTenderTypes(this.props.settings.diContainer,
        this.props.businessState.stateValues.get("transaction.accountingCurrency")) as ITenderType[]);
    this.props.change("pinRules", activeGiftTender && activeGiftTender.pinRules);
    const initialPinUsage = getPinUsage({pinRules:  activeGiftTender && activeGiftTender.pinRules});
    this.showPinField = initialPinUsage === Usage.Required || initialPinUsage === Usage.Optional;

    this.props.clearBalanceInquiry();

    // Tender exchange is currently hardcoded to only use cash as the out tender -
    // TODO: Future enhancements should make the tender out tenders configurable by tenderIn TenderType.
    const activeTenders = getActiveTenders(this.props.settings.diContainer,
        this.props.businessState.stateValues.get("transaction.accountingCurrency"));
    const cashTender = activeTenders &&
        activeTenders.find((tender: TenderType) => tender.tenderTypeName === PaymentTenderType.Cash);
    this.cashTenderId = cashTender && cashTender.id;

    this.state = {
      feedbackNote: undefined,
      isSwipeAvailable,
      selectedExchangeInTenderType: PaymentTenderType.Gift, //hardcoded to gift for initial implementation
      selectedExchangeOutTenderType: undefined,
      exchangeInDetails: undefined,
      needToPrint: false,
      primaryGiftDevices
    };
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.feedbackNoteState !== this.props.feedbackNoteState && this.props.feedbackNoteState.message) {
      this.setState({feedbackNote: this.props.feedbackNoteState});
      this.props.clearFeedbackNoteState();
    }

    if (this.state.isSwipeAvailable && prevProps.paymentStatus !== this.props.paymentStatus) {
      this.setState({primaryGiftDevices : getPaymentDevicesAsRenderSelect(this.props.paymentStatus,
          getIsGiftCardDeviceFilter(this.props.settings.configurationManager, this.props.settings.deviceIdentity.deviceId))});
    }

    if (prevProps.businessState.stateValues.get("transaction.id") &&
        !this.props.businessState.stateValues.get("transaction.id")) {
      // transaction closed - return to basket
      this.closeScreen();
    }

    this.handleDataEventUpdate(prevProps);

    if (this.props.accountNumberFieldData !== prevProps.accountNumberFieldData &&
          this.props.accountNumberFieldData !== this.props.accountNumber &&
          this.props.uiInputSource !== UIINPUT_SOURCE_KEYBOARD &&
          !(prevProps.dataEvent.data && !this.props.dataEvent.data)) {
      this.props.change("uiInputSource", UIINPUT_SOURCE_KEYBOARD);
    }

    if (prevProps.balanceInquiry && this.props.balanceInquiry &&
          this.props.balanceInquiry.authResponse && !prevProps.balanceInquiry.authResponse) {
      this.lastEventProcessed = BALANCE_INQUIRY_EVENT;
      this.updateExchangeInDetails();
      this.props.clearBalanceInquiry();
    }

    this.handleWaitingForCashDrawer(prevProps);

    if (!this.props.businessState.inProgress && prevProps.businessState.inProgress && !this.props.businessState.error) {
      this.handleBusinessEventCompleted();
    }
  }

  public componentWillUnmount(): void {
    this.props.updateUiMode(undefined);
  }

  public componentWillMount(): void {
    this.props.updateUiMode(UI_MODE_WAITING_FOR_INPUT);

    if (this.props.businessState && this.props.businessState.displayInfo &&
          this.props.businessState.displayInfo.tenderDisplayLines &&
          this.props.businessState.displayInfo.tenderDisplayLines.length > 0) {
      this.updateExchangeInDetails();
      this.handleWaitingForCashDrawer();
      this.handleWaitingForReceipts();
    }
  }

  public render(): JSX.Element {

    return (
      <>
        <Header
          title={I18n.t("tenderExchange")}
          backButton={{
            name: "Back",
            action: this.leftButtonAction.bind(this)
          }}
          rightButton={{
            title: this.getRightButtonText(),
            action: this.rightButtonAction.bind(this)
          }}
          isVisibleTablet={Theme.isTablet}
        />
        {this.stateRequiresInquiry() &&
          this.renderExchangeInquiry()
        }
        {!this.stateRequiresInquiry() &&
          <KeyboardAwareScrollView contentContainerStyle={this.styles.root}>
            {
              this.renderTenderInDetails()
            }
            { this.tenderExchangeAllowed() &&
              this.renderTenderOutButtons()
            }
          </KeyboardAwareScrollView>
        }
      </>
    );
  }

  private renderTenderInDetails(): JSX.Element {
    if (!this.state.exchangeInDetails) {
      return undefined;
    }

    return (
      <>
        <View style={this.styles.resultsArea} useNativeDriver>
          { this.state.feedbackNote &&
            <FeedbackNote
              style={this.styles}
              message={this.state.feedbackNote.message}
              messageType={this.state.feedbackNote.messageType}
              messageTitle={this.getFeedbackTitle(this.state.feedbackNote.i18nCode)}
            />
          }
          { this.state.exchangeInDetails.amount &&
            !(this.state.feedbackNote &&
            this.state.exchangeInDetails.amount.eq(new Money(0, this.state.exchangeInDetails.amount.currency))) &&
            <View style={this.styles.balanceTextArea} useNativeDriver>
              <Text style={this.styles.balanceTitle}>{I18n.t("balance")}</Text>
              <Text style={this.styles.balanceAmount}>
                {this.state.exchangeInDetails.amount.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions())}
              </Text>
            </View>
          }
          { this.state.exchangeInDetails.accountNumber &&
            <View style={this.styles.textResultsArea} useNativeDriver>
              <Text style={this.styles.descriptionTitle}>
                {I18n.t("giftCardNumber")}
              </Text>
              <Text style={this.styles.descriptionText}>
                {maskAccountNumber(this.state.exchangeInDetails.accountNumber)}
              </Text>
            </View>
          }
        </View>
      </>
    );
  }

  private renderTenderOutButtons(): JSX.Element {
    const amount = this.state.exchangeInDetails.amount;
    const roundedAmount = this.getRoundingBalanceDueTender(this.cashTenderId);
    let buttonStyle = this.styles.closeButton;
    let textLabel = I18n.t("cash");
    let secondRowLabel;

    if (roundedAmount && roundedAmount.roundedValue.compare(amount) !== 0) {
      textLabel = `${I18n.t("cash")}`
      secondRowLabel = printAmount(roundedAmount.roundedValue);
      buttonStyle = this.styles.closeButtonDetailed;
    }

    return (
      <View style={this.styles.buttonContainer} useNativeDriver>
        <TouchableOpacity
            style={[buttonStyle]}
            onPress={() => {this.submitTenderExchange();}}
          >
            <Text style={[this.styles.btnSecondayText]}>
              {textLabel}
            </Text>
            {secondRowLabel &&
              <Text style={this.styles.buttonSubTitle}>
                {secondRowLabel}
              </Text>
            }
          </TouchableOpacity>
      </View>
    );
  }

  private renderExchangeInquiry(): JSX.Element {
    return (
      <>
      <Field
          name="accountNumber"
          placeholder={I18n.t("giftCardNumber")}
          style={this.styles.input}
          inputStyle={this.styles.inputField}
          errorStyle={this.styles.textInputError}
          clearText={false}
          component={renderInputField}
          settings={this.props.settings}
          onSubmitEditing={() => this.pinRef.focus()}
          secureTextEntry={true}
          keyboardType={InputType.numeric}
          inputType={InputType.numeric}
        />
      {this.showPinField &&
        <Field
          name="pin"
          placeholder={I18n.t("giftCardPin")}
          style={this.styles.input}
          inputStyle={this.styles.inputField}
          errorStyle={this.styles.textInputError}
          onRef={(ref: any) => this.pinRef = ref }
          component={renderNumericInputField}
          settings={this.props.settings}
          secureTextEntry={true}
          trimLeadingZeroes={false}
        />
        }
      <View style={this.styles.buttonContainer} useNativeDriver>
        {this.state.isSwipeAvailable &&
          <TouchableOpacity
            onPress={() => submitFormData(this.props, undefined, this.props.pin)}
            disabled={this.swipeIsDisabled}
            style={[this.styles.closeButton, this.swipeIsDisabled && this.styles.btnDisabled]}
          >
            <Text style={[this.styles.btnSecondayText, this.swipeIsDisabled && this.styles.btnTextDisabled]}>
              {I18n.t("swipe")}
            </Text>
          </TouchableOpacity>
        }
      </View>
    </>
    );
  }

  private submitTenderExchange = (): void => {
    if (this.state.exchangeInDetails && (!this.state.exchangeInDetails.displayLine &&
          !getTenderExchangeInLine(this.props.businessState.displayInfo))) {
      // Perform a tender exchange in with the provided inputs
      const inputs: UiInput[] = [];
      inputs.push(new UiInput(UiInputKey.TENDER_AUTH_CATEGORY_NAME, this.state.exchangeInDetails.tenderAuthCategory));
      inputs.push(new UiInput(UiInputKey.TENDER_AMOUNT, this.state.exchangeInDetails.amount));
      this.props.businessOperation(this.props.settings.deviceIdentity, TENDER_EXCHANGE_IN_EVENT, inputs);
    } else {
      const exchangeInLine = (this.state.exchangeInDetails && this.state.exchangeInDetails.displayLine) ||
          getTenderExchangeInLine(this.props.businessState.displayInfo);
      if (exchangeInLine) {
        let amount = exchangeInLine.tenderAmount;
        // TODO: When more than one exchange out tender is supported this will need to be saved on the
        // exchange in submission.
        const roundedTender = this.getRoundingBalanceDueTender(this.cashTenderId, amount);
        const roundedAmount = _.get(roundedTender, "roundedValue");
        let isAmountRounded = false;
        if (roundedAmount && amount.compare(roundedAmount) !== 0) {
          amount = roundedAmount;
          isAmountRounded = true;
        }
        this.setState({feedbackNote: undefined});
        const uiInputs: UiInput[] = [];
        uiInputs.push(new UiInput(UiInputKey.TENDER_AMOUNT, amount));
        if (isAmountRounded) {
          uiInputs.push(new UiInput(UiInputKey.TENDER_AMOUNT_ORIGINAL, exchangeInLine.tenderAmount));
          uiInputs.push(new UiInput(UiInputKey.DENOMINATION_ROUNDING, roundedTender));
        }
        uiInputs.push(new UiInput(UiInputKey.TENDER_ID, this.cashTenderId));
        this.props.businessOperation(this.props.settings.deviceIdentity, TENDER_EXCHANGE_OUT_EVENT, uiInputs);
      }
    }
  }

  private updateExchangeInDetails(): void {
    const latestBalanceDisplayLine = getLastBalanceInquiryDisplayLine(this.props.businessState.displayInfo);
    const amount: Money = latestBalanceDisplayLine && latestBalanceDisplayLine.balance;
    const roundedBalanceDueTenders: TenderDenominationRoundings[] =
        getDenominationRoundings(this.props.settings.configurationManager, amount);

    this.setState({exchangeInDetails: {
      inquiryPerformed: true,
      amount,
      roundedBalanceDueTenders,
      tenderAuthCategory: latestBalanceDisplayLine && latestBalanceDisplayLine.tenderAuthCategory,
      accountNumber: latestBalanceDisplayLine && latestBalanceDisplayLine.accountNumber
    }});
  }

  private getRoundingBalanceDueTender(tenderId: string, amount?: Money): TenderDenominationRoundings {

    const roundedBalanceDueTenders: TenderDenominationRoundings[] = amount ?
        getDenominationRoundings(this.props.settings.configurationManager, amount) :
        _.get(this, "state.exchangeInDetails.roundedBalanceDueTenders");

    return roundedBalanceDueTenders && tenderId &&
        roundedBalanceDueTenders.find((tender) => tender.tenderId === tenderId);
  }

  private getRightButtonText(): string {
    if (this.stateRequiresInquiry()) {
      return I18n.t("continue");
    }
    return I18n.t("cancel");
  }

  private getFeedbackTitle(messageI18nCode?: string): string {

    if (messageI18nCode === SSF_MAXIMUM_EXCHANGE_AMOUNT_EXCEEDED_I18N_CODE) {
      return I18n.t("exchangeAmountNotAllowed");
    } else {
      if (this.lastEventProcessed === BALANCE_INQUIRY_EVENT) {
        return I18n.t("balanceInquiryUnsuccessful");
      } else if (this.lastEventProcessed === TENDER_EXCHANGE_IN_EVENT) {
        return I18n.t("redemptionUnsuccessful");
      }
    }
  }

  private stateRequiresInquiry(): boolean {
    return !this.state.exchangeInDetails || !this.state.exchangeInDetails.inquiryPerformed &&
        !this.state.feedbackNote;
  }

  private tenderExchangeAllowed(): boolean {
    return this.props.uiState.isAllowed(TENDER_EXCHANGE_IN_EVENT) &&
        this.props.uiState.isAllowed(TENDER_EXCHANGE_OUT_EVENT) &&
        !this.stateRequiresInquiry() && this.state.exchangeInDetails && this.state.exchangeInDetails.amount &&
        this.state.exchangeInDetails.amount.gt(new Money(0, this.state.exchangeInDetails.amount.currency)) &&
        this.props.uiState.logicalState === IN_TENDER_CONTROL_TRANSACTION;
  }

  private get swipeIsDisabled(): boolean {
    return !this.isPrimaryGiftDeviceAvailable || this.disableCardButtonsAuthSessInProgress;
  }

  private get isPrimaryGiftDeviceAvailable(): boolean {
    return this.state.primaryGiftDevices.length > 0;
  }

  private leftButtonAction(): void {
    if (this.stateRequiresInquiry()) {
      this.closeScreen();
    } else if (this.state.feedbackNote || (this.state.exchangeInDetails && !this.state.exchangeInDetails.displayLine)) {
      this.setState({feedbackNote: undefined, exchangeInDetails: undefined});
      this.props.initialize({
        accountNumber: undefined,
        pin: undefined,
        uiInputSource: undefined
      });
    } else {
      this.closeScreen();
    }
  }

  private rightButtonAction(): void {
    if (this.stateRequiresInquiry()) {
      handleFormSubmission(logger, this.props.submit);
    } else {
      this.closeScreen();
    }
  }

  private handleBusinessEventCompleted(): void {
    if (this.props.businessState.eventType === TENDER_EXCHANGE_IN_EVENT ||
          this.props.businessState.eventType === TENDER_AUTH_STATUS_EVENT) {
      const tenderExchangeInLine = getTenderExchangeInLine(this.props.businessState.displayInfo);
      if (tenderExchangeInLine) {
        // Exchange in completed successfully perform tender exchange out.
        this.submitTenderExchange();
      }
    } else {
      this.handleWaitingForReceipts();
    }

    if (this.props.businessState.eventType === BALANCE_INQUIRY_EVENT ||
        this.props.businessState.eventType === TENDER_EXCHANGE_IN_EVENT ) {
      this.lastEventProcessed = this.props.businessState.eventType;
    }
  }

  private handleWaitingForCashDrawer(prevProps?: Props): void {
    if (this.props.businessState.stateValues.get("CashDrawerSession.isWaitingForUserToSelectCashDrawer") &&
        !prevProps?.businessState.stateValues.get("CashDrawerSession.isWaitingForUserToSelectCashDrawer")) {
      requestAnimationFrame(() => this.props.navigation.push("scanDrawer", {
        eventType: TENDER_EXCHANGE_EVENT
      }));
    }
  }

  private handleWaitingForReceipts(): void {
    if (this.props.businessState.stateValues.get("transaction.waitingToClose") &&
        this.props.businessState.stateValues.get("TenderAuthorizationSession.state") ===
        TenderAuthorizationState.Completed &&
        this.props.currentScreenName === "tenderExchange") {
      this.setState({needToPrint: true});
      this.props.navigation.replace("receiptSummary", {
        receiptCategory: ReceiptCategory.TenderExchange
      });
    }
  }

  private closeScreen(): void {
    // Voids the tender exchange transaction and return to basket
    const stateValues = this.props.businessState && this.props.businessState.stateValues;
    if (!inTransaction(stateValues)) {
      if (selfCheckoutConfigured(this.props)) {
        this.props.businessOperation(this.props.settings.deviceIdentity, EXIT_ATTENDANT_MODE_EVENT, []);
      }
      this.props.navigation.dispatch(popTo("main"));
    } else {
      if (inTransaction(stateValues)) {
        this.props.businessOperation(this.props.settings.deviceIdentity, VOID_TENDER_CONTROL_TRANSACTION_EVENT, []);
      }
    }
  }

  private handleDataEventUpdate(prevProps: Props): void {
    if (this.props.dataEvent.data !== prevProps.dataEvent.data && this.props.dataEvent.data) {
      if (this.stateRequiresInquiry()) {
        let incomingScannerData: IDataEventData;
        let incomingAccountNumber: string;
        if (!this.props.dataEvent.error) {
          if (this.props.dataEvent.eventType === DataEventType.KeyListenerData) {
            incomingAccountNumber = (this.props.dataEvent.data as IKeyListenerData).inputText;
          } else if (this.props.dataEvent.eventType === DataEventType.ScanData) {
            incomingScannerData = this.props.dataEvent.data ? this.props.dataEvent.data: undefined;
            incomingAccountNumber = incomingScannerData ? incomingScannerData.data : undefined;
          }
          if (incomingAccountNumber) {
            const pinRedeemRules = this.props.pinRules && this.props.pinRules["redeem"];
            const pinScanUsage = pinRedeemRules && pinRedeemRules[UIINPUT_SOURCE_BARCODE] &&
                pinRedeemRules[UIINPUT_SOURCE_BARCODE].usage;
            if (pinScanUsage === Usage.NotUsed) {
              submitFormData(this.props, incomingAccountNumber, undefined, UIINPUT_SOURCE_BARCODE);
            } else {
              this.props.change("accountNumber", incomingAccountNumber);
              this.props.change("uiInputSource", UIINPUT_SOURCE_BARCODE);
            }
          }
        }
        // Clear the props
        this.props.dataEventSuccess(this.props.dataEvent, false);
      }
    }
  }
}

function maskAccountNumber(accountNumber?: string): string {
  if (accountNumber && accountNumber.length > 4) {
    return `${I18n.t("accountNumberMask")}${accountNumber.substring(accountNumber.length - 4)}`;
  }
  return accountNumber;
}

function getTenderExchangeInLine(displayInfo: IDisplayInfo): ITenderDisplayLine {
  const tenderDisplayLines: ITenderDisplayLine[] = displayInfo && displayInfo.tenderDisplayLines;
  return (tenderDisplayLines &&
      tenderDisplayLines.find((line: ITenderDisplayLine) => line.lineType === TENDER_EXCHANGE_IN_LINE_TYPE));
}

function getLastBalanceInquiryDisplayLine(displayInfo: IDisplayInfo): IBalanceInquiryDisplayLine {
  if (displayInfo && displayInfo.balanceInquiryLines && displayInfo.balanceInquiryLines.length > 0) {
    return displayInfo.balanceInquiryLines[displayInfo.balanceInquiryLines.length - 1];
  }
}

const TenderExchangeScreenForm = reduxForm({
  form: "tenderExchange",
  validate: (values: TenderExchangeScreenForm, props: DecoratedFormProps<TenderExchangeScreenForm, Props>) => {
    const errors: FormErrors<TenderExchangeScreenForm> = { accountNumber: undefined,
        pin: undefined};
    if (!values.accountNumber) {
      errors.accountNumber = I18n.t("required");
    }

    if (!values.pin && getPinUsage(props) === Usage.Required) {
      errors.pin = I18n.t("required");
    }
    return errors;
  },
  initialValues: {
    accountNumber: undefined,
    pin: undefined
  },
  onSubmit: (data: TenderExchangeScreenForm, dispatch: Dispatch<any>, props: Props) => {
    submitFormData(props, data.accountNumber, data.pin, data.uiInputSource || UIINPUT_SOURCE_KEYBOARD);
    Keyboard.dismiss();
  }
})(TenderExchangeScreen);

const submitFormData =
    (props: Props, accountNumber?: string, pin?: string, inputSource?: string, amount?: string): void => {
  const uiInputs: UiInput[] = [];
  if (accountNumber) {
    uiInputs.push(new UiInput(UiInputKey.REDEEM_CARD_NUMBER, accountNumber, inputSource));
  }

  if (pin) {
    uiInputs.push(new UiInput(UiInputKey.GIFT_CARD_PIN, pin));
  }

  if (amount) {
    uiInputs.push(new UiInput(UiInputKey.TENDER_AMOUNT, amount));
    props.businessOperation(props.deviceIdentity, TENDER_EXCHANGE_IN_EVENT, uiInputs);
  } else {
    props.businessOperation(props.deviceIdentity, BALANCE_INQUIRY_EVENT, uiInputs);
  }
  Keyboard.dismiss();
};


const mapStateToProps = (state: AppState) => {
  const selector = formValueSelector("tenderExchange");
  return {
    accountNumberFieldData: selector(state, "accountNumber"),
    balanceInquiry: state.balanceInquiry,
    businessState: state.businessState,
    currentScreenName: getCurrentRouteNameWithNavigationRef(),
    dataEvent: state.dataEvent,
    deviceIdentity: state.settings.deviceIdentity,
    feedbackNoteState: state.feedbackNote,
    paymentStatus: state.deviceStatus && state.deviceStatus.paymentStatus,
    pin: selector(state, "pin"),
    pinRules: selector(state, "pinRules"),
    settings: state.settings,
    uiInputSource: selector(state, "uiInputSource"),
    uiState: state.uiState
  };
};

const mapDispatchToProps: DispatchProps = {
  businessOperation: businessOperation.request,
  clearBalanceInquiry: balanceInquiryOperation.success,
  clearFeedbackNoteState: feedbackNoteAction.success,
  dataEventSuccess: dataEvent.success,
  sceneTitle: sceneTitle.request,
  updateUiMode: updateUiMode.request
};

export default connect(mapStateToProps, mapDispatchToProps)
    (withMappedNavigationParams<typeof TenderExchangeScreenForm>()(TenderExchangeScreenForm));
