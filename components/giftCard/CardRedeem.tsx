import * as React from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { connect} from "react-redux";
import { Dispatch } from "redux";
import {
  ConfigProps,
  DecoratedFormProps,
  Field,
  FormErrors,
  FormInstance,
  formValueSelector,
  InjectedFormProps,
  reduxForm
} from "redux-form";
import { isFloat } from "validator";

import { Money } from "@aptos-scp/scp-component-business-core";
import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import {
  UIINPUT_SOURCE_BARCODE,
  UIINPUT_SOURCE_KEYBOARD
} from "@aptos-scp/scp-component-store-selling-core";
import { IPinRules, TenderAuthCategory, Usage } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { AppState, BusinessState, SettingsState } from "../../reducers";
import Theme from "../../styles";
import {
  CurrencyInput,
  renderInputField,
  renderNumericInputField,
  RenderSelectOptions
} from "../common/FieldValidation";
import Header from "../common/Header";
import { InputType } from "../common/Input";
import { handleFormSubmission, printAmount, warnBeforeLosingChanges } from "../common/utilities";
import PaymentDeviceSelection from "../payment/PaymentDeviceSelection";
import {
  businessEventCompletedWithError,
  completedTenderAuthorization,
  tenderAuthorizationInProgress
} from "../payment/PaymentDevicesUtils";
import { getPinUsage, isGiftCategory } from "./GiftCardUtilities";
import { cardRedeemStyles } from "./styles";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.giftCard.CardRedeem");

interface CardRedeemForm {
  tenderAmount: string;
  cardNumber: string;
  pinNumber: string;
}

interface OwnProps {
  amountDue: Money;
  tenderAmount: string;
  currency: string;
  cardNumber: string;
  tenderAuthCategory: TenderAuthCategory;
  settings: SettingsState;
  stateValues: Map<string, any>;
  showPaymentDeviceSelection: boolean;
  walletPaymentDevices: RenderSelectOptions[];
  primaryGiftDevices: RenderSelectOptions[];
  paymentStatus: Map<string, any>;
  pinRules: IPinRules;
  waitingForCustomer: boolean;
  onRedeem: (tenderAmount: string, cardNumber: string, passCodeKey: string,
             giftCardButton?: boolean, tenderAuthCategory?: TenderAuthCategory,
             entryMethod?: string) => void;
  onCancel: () => void;
  resetPaymentDeviceSelection: () => void;
  onCardRedeemDeviceSelected: (deviceId: string) => void;
}

interface StateProps {
  businessState: BusinessState;
  amount: string;
  card: string;
  uiInputSource: string;
}

interface Props extends StateProps, OwnProps {
}

interface State {}

class CardRedeem extends React.Component<Props & InjectedFormProps<CardRedeemForm, Props> &
    FormInstance<CardRedeemForm, undefined>, State> {
  private styles: any;
  private cardNumberRef: any;
  private pinNumberRef: any;
  private disableCardButtonsAuthSessInProgress: boolean;

  public constructor(props: Props & InjectedFormProps<CardRedeemForm, Props> &
      FormInstance<CardRedeemForm, undefined>) {
    super(props);

    this.disableCardButtonsAuthSessInProgress = tenderAuthorizationInProgress(
        this.props.stateValues.get("TenderAuthorizationSession.state"));

    this.styles = Theme.getStyles(cardRedeemStyles());

  }

  public componentDidUpdate(prevProps: Props & InjectedFormProps<CardRedeemForm, Props>): void {
    if (prevProps.card !== this.props.card && this.props.card !== this.props.cardNumber &&
        this.props.uiInputSource !== UIINPUT_SOURCE_KEYBOARD) {
      this.props.change("uiInputSource", UIINPUT_SOURCE_KEYBOARD);
    }
    if (this.props.cardNumber && this.props.cardNumber !== prevProps.cardNumber &&
        !this.props.showPaymentDeviceSelection && !this.props.waitingForCustomer) {
      this.props.change("cardNumber", this.props.cardNumber);
      this.props.change("uiInputSource", UIINPUT_SOURCE_BARCODE);
      if (this.props.tenderAuthCategory === TenderAuthCategory.Wallet ||
            this.props.tenderAuthCategory === TenderAuthCategory.StoredValueCertificateService) {
        //trigger onSubmit funcs after scan, validation and onBlur stops tenderAmount from being invalid
        submitFormData(this.props, this.props.amount, this.props.cardNumber,
           undefined, false, this.props.tenderAuthCategory, UIINPUT_SOURCE_BARCODE);
      }
    }
    if (completedTenderAuthorization(prevProps.stateValues.get("TenderAuthorizationSession.state"),
          this.props.stateValues.get("TenderAuthorizationSession.state")) ||
          businessEventCompletedWithError(prevProps.businessState, this.props.businessState)) {
      this.disableCardButtonsAuthSessInProgress = false;
      this.forceUpdate();
    }
  }

  public render(): JSX.Element {
    const pinUsage: string = getPinUsage(this.props);
    return (
      <KeyboardAwareScrollView contentContainerStyle={this.styles.root}>
        <Header
            title={this.getTitle()}
            backButton={{name: "Back", action: () => warnBeforeLosingChanges(
                  this.props.dirty, this.props.onCancel)}}
            rightButton={!isGiftCategory(this.props.tenderAuthCategory) &&
                { title: I18n.t("continue"), action: () => this.props.submit() }}
        />
        <View style={this.styles.topSection}>
          <View style={this.styles.totalArea}>
            <Text style={this.styles.totalText}>{this.isRefund() ?
                I18n.t("refundDueCaps") : I18n.t("totalDueCaps")}</Text>
            <Text style={this.styles.totalAmountText}>
              {
                this.props.amountDue &&
                printAmount(this.props.amountDue)
              }
            </Text>
          </View>
        </View>
        <View style={this.styles.bottomSection}>
          {!this.isRefund() &&
            <CurrencyInput
              name="tenderAmount"
              placeholder={this.getTenderAmountPlaceHolder()}
              style={this.styles.textInput}
              errorStyle={this.styles.textInputError}
              currency={this.props.currency}
              onFocus={() => this.props.change("tenderAmount", "")}
              onBlur={this.onBlur.bind(this)}
              onSubmitEditing={() => this.cardNumberRef.focus()}
              persistPlaceholder={true}
            />
          }
          <Field
            name="cardNumber"
            placeholder={this.getCardNumberPlaceHolder()}
            style={this.styles.textInput}
            errorStyle={this.styles.textInputError}
            clearText={false}
            onRef={(ref: any) => this.cardNumberRef = ref}
            persistPlaceholder={true}
            overrideOnSubmitEditing={() => this.handleCardNumberSubmit(pinUsage)}
            component={renderInputField}
            settings={this.props.settings}
            onSubmitEditing={() => this.pinNumberRef.focus()}
            secureTextEntry={true}
            keyboardType= {this.props.tenderAuthCategory !== TenderAuthCategory.StoredValueCertificateService ?
                InputType.numeric : "numbers-and-punctuation"}
            inputType= {this.props.tenderAuthCategory !== TenderAuthCategory.StoredValueCertificateService ?
                InputType.numeric : InputType.text}
          />
          {(isGiftCategory(this.props.tenderAuthCategory)) &&
              (pinUsage === Usage.Required || pinUsage === Usage.Optional) &&
            <Field
              name="pinNumber"
              placeholder={I18n.t("giftCardPin")}
              style={this.styles.textInput}
              errorStyle={this.styles.textInputError}
              onRef={(ref: any) => this.pinNumberRef = ref }
              onSubmitEditing={() => handleFormSubmission(logger, this.props.submit, this.props.valid)}
              component={renderNumericInputField}
              settings={this.props.settings}
              secureTextEntry={true}
              trimLeadingZeroes={false}
              persistPlaceholder={true}
            />
          }
          {(isGiftCategory(this.props.tenderAuthCategory) || Theme.isTablet) &&
            <View style={this.styles.buttonsArea}>
              { this.props.tenderAuthCategory === TenderAuthCategory.GiftDevice &&
                <TouchableOpacity
                  style={[this.styles.redeemButton, this.swipeIsDisabled && this.styles.btnDisabled]}
                  disabled={this.swipeIsDisabled }
                  onPress={() => {this.disableCardButtonsAuthSessInProgress = true;
                                  this.props.onRedeem(this.props.amount, undefined, undefined, true); }}
                >
                  <Text style={[this.styles.btnSecondayText, this.swipeIsDisabled && this.styles.btnTextDisabled]}>
                    {I18n.t("swipe")}
                  </Text>
                 </TouchableOpacity>
              }
              <TouchableOpacity
                style={[this.styles.redeemButton, this.allowRedeem ? {} : this.styles.btnDisabled]}
                disabled={!this.allowRedeem}
                onPress={() => this.props.submit()}
              >
                <Text style={[this.styles.btnSecondayText, this.allowRedeem ? {} : this.styles.btnTextDisabled]}>
                  {!isGiftCategory(this.props.tenderAuthCategory) ? I18n.t("continue") : I18n.t("redeem")}
                </Text>
              </TouchableOpacity>
              {
                Theme.isTablet &&
                <TouchableOpacity style={this.styles.redeemButton} onPress={this.props.onCancel} >
                  <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
                </TouchableOpacity>
              }
            </View>
          }
          {this.props.showPaymentDeviceSelection &&
            <PaymentDeviceSelection
                onApplyPaymentDeviceSelected={this.props.onCardRedeemDeviceSelected}
                paymentDevicesOptions={this.getDeviceOptions()}
                resetPaymentDeviceSelection={this.props.resetPaymentDeviceSelection}
            />
          }
        </View>
      </KeyboardAwareScrollView>
    );
  }

  private handleCardNumberSubmit(pinUsage: string): void {
    if (isGiftCategory(this.props.tenderAuthCategory) &&
          (pinUsage === Usage.Required || pinUsage === Usage.Optional)) {
      this.pinNumberRef.focus();
    } else {
      handleFormSubmission(logger, this.props.submit, this.props.valid);
    }
  }

  private getDeviceOptions(): RenderSelectOptions[] {
    switch (this.props.tenderAuthCategory) {
      case TenderAuthCategory.Wallet:
        return this.props.walletPaymentDevices;
      case TenderAuthCategory.GiftDevice:
        return this.props.primaryGiftDevices;
      default:
        return undefined;
    }
  }

  private getTitle(): string {
    switch (this.props.tenderAuthCategory) {
      case TenderAuthCategory.Wallet:
        return I18n.t("wallet");
      case TenderAuthCategory.StoredValueCertificateService:
        return I18n.t("valueCertificate");
      default:
        return I18n.t("payment");
    }
  }

  private getTenderAmountPlaceHolder(): string {
    switch (this.props.tenderAuthCategory) {
      case TenderAuthCategory.Wallet:
        return I18n.t("walletAmount");
      case TenderAuthCategory.StoredValueCertificateService:
        return I18n.t("amount");
      default:
        return I18n.t("giftCardAmount");
    }
  }

  private getCardNumberPlaceHolder(): string {
    switch (this.props.tenderAuthCategory) {
      case TenderAuthCategory.Wallet:
        return I18n.t("walletNumber");
      case TenderAuthCategory.StoredValueCertificateService:
        return I18n.t("valueCertificateNumber");
      default:
        return I18n.t("giftCardNumber");
    }
  }

  private isRefund(): boolean {
    return this.props.stateValues.get("transaction.balanceDue") &&
        this.props.stateValues.get("transaction.balanceDue").isNegative();
  }

  private get isPrimaryDeviceAvailable(): boolean {
    return this.props.tenderAuthCategory === TenderAuthCategory.GiftDevice ?
        this.props.primaryGiftDevices.length > 0 : this.props.walletPaymentDevices.length > 0;
  }

  private get swipeIsDisabled(): boolean {
    return !this.isPrimaryDeviceAvailable || this.disableCardButtonsAuthSessInProgress;
  }

  private onBlur(): void {
    if (this.props.tenderAuthCategory !== TenderAuthCategory.StoredValueCertificateService) {
      setTimeout(() => {
        if (!this.props.amount || (this.props.amountDue &&
              parseFloat(this.props.amount) > parseFloat(this.props.amountDue.amount))) {
          this.props.change("tenderAmount", this.props.amountDue.amount);
        }
      }, 100);
    }
  }

  private get allowRedeem(): boolean {
    return this.props.tenderAuthCategory === TenderAuthCategory.StoredValueCardService ||
        this.props.tenderAuthCategory === TenderAuthCategory.StoredValueCertificateService ||
        this.isPrimaryDeviceAvailable && this.props.valid;
  }
}

const CardRedeemForm = reduxForm<CardRedeemForm, Props>({
  form: "redeem",
  validate: (values: CardRedeemForm, props: DecoratedFormProps<CardRedeemForm, Props>) => {
    const errors: FormErrors<CardRedeemForm, string> = {
      tenderAmount: undefined,
      cardNumber: undefined
    };

    if (isFloat(`${values.tenderAmount}`)) {
      const amountDue: number = props.amountDue && parseFloat(props.amountDue.amount);
      const newTenderNumber: number = parseFloat(values.tenderAmount);
      if (!(newTenderNumber > 0 && (newTenderNumber <= amountDue ||
            props.tenderAuthCategory === TenderAuthCategory.StoredValueCertificateService))) {
        errors.tenderAmount = I18n.t("invalidTenderAmount");
      }
    }

    if (!values.cardNumber) {
      errors.cardNumber = I18n.t("required");
    }

    if (!values.pinNumber && isGiftCategory(props.tenderAuthCategory) &&
        getPinUsage(props) === Usage.Required) {
      errors.pinNumber = I18n.t("pinNumberRequired");
    }

    return errors;
  },
  onSubmit(data: CardRedeemForm, dispatch: Dispatch<any>, props: Props): void {
    submitFormData(props, data.tenderAmount, data.cardNumber, data.pinNumber, false, props.tenderAuthCategory,
        props.uiInputSource);
  }
})(CardRedeem);

const submitFormData = (props: Props, tenderAmount: string, cardNumber: string, passCodeKey: string,
                        giftCardButton?: boolean, tenderAuthCategory?: TenderAuthCategory,
                        inputSource?: string): void => {
  props.onRedeem(tenderAmount, cardNumber, passCodeKey, giftCardButton, tenderAuthCategory, inputSource);
  Keyboard.dismiss();
};

const mapStateToProps = (state: AppState, ownProps: Props) => {
  const selector = formValueSelector("redeem");
  return {
    amount: selector(state, "tenderAmount"),
    card: selector(state, "cardNumber"),
    businessState: state.businessState,
    uiInputSource: selector(state, "uiInputSource"),
    initialValues: {
      cardNumber: undefined as string,
      pinNumber: undefined as string,
      tenderAmount: ownProps.tenderAmount,
      uiInputSource: undefined as string
    }
  };
};

export default connect<StateProps & Partial<ConfigProps<CardRedeemForm, Props, string>>>(
    mapStateToProps)(CardRedeemForm);
