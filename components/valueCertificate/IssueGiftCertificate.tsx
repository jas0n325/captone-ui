import * as React from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";
import { Dispatch } from "redux";
import { Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";

import { Money } from "@aptos-scp/scp-component-business-core";
import { UIINPUT_SOURCE_BARCODE, UIINPUT_SOURCE_KEYBOARD, UiInput } from '@aptos-scp/scp-component-store-selling-core';

import I18n from "../../../config/I18n";
import { SettingsState } from "../../reducers";
import Theme from "../../styles";
import { CurrencyInput, renderInputField } from "../common/FieldValidation";
import Header from "../common/Header";
import { InputType } from "../common/Input";
import {
  getLocaleAmount,
  getStoreLocale,
  handleFormSubmission,
  printAmount,
  translateWithStoreLocale,
  warnBeforeLosingChanges
} from "../common/utilities";
import { DEFAULT_DECIMAL_PRECISION, RADIX } from "../main/constants";
import { issueGiftCertificateStyles } from "./styles";
import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import QuickChoiceAmounts from "../common/QuickChoiceAmounts";
import FeedbackNote from "../common/FeedbackNote";
import { FeedbackNoteType } from "../../reducers/feedbackNote";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.valueCertificate.IssueGiftCertificate");

export interface IssueGiftCertificateForm {
  certificateNumber: string;
  amount: string;
}

export interface LocaleCurrencyOptions {
  thousandsSeparator: "";
  decimalSeparator: "";
  precision: 0;
}

export interface Props {
  settings: SettingsState;
  minimumIssueAmount: Money;
  maximumIssueAmount: Money;
  quickChoiceAmounts: Money[];
  scan: boolean;
  scanButtonEnabled: boolean;
  scannedCertificateNumber: string;
  isReversalInProgress: boolean;
  issueEnabled: boolean;
  isChange?: boolean;
  amount?: Money;
  onScan: () => void;
  onIssue: (cardNumber: string, amount: string, inputSource: string, inputs?: UiInput[]) => void;
  onCancel: () => void;
  isRefund?: boolean;
}

export interface State {
  activeChoice: Money;
}

class IssueGiftCertificate extends React.Component<Props & InjectedFormProps<IssueGiftCertificateForm, Props> &
    FormInstance<IssueGiftCertificateForm, Props>, State> {
  private amount: any;
  private styles: any;
  public constructor(props: Props & InjectedFormProps<IssueGiftCertificateForm, Props> &
      FormInstance<IssueGiftCertificateForm, Props>) {
    super(props);

    this.state = {
      activeChoice: undefined
    };

    this.styles = Theme.getStyles(issueGiftCertificateStyles());
  }

  public componentDidUpdate(prevProps: Props & InjectedFormProps<IssueGiftCertificateForm, Props>  &
      FormInstance<IssueGiftCertificateForm, Props>): void {
    if (this.props.scannedCertificateNumber !== prevProps.scannedCertificateNumber) {
      this.props.change("certificateNumber", this.props.scannedCertificateNumber);
    }
    if (this.props.scan) {
      this.props.change("scan", this.props.scan);
    }
  }

  public componentDidMount(): void {
    if (this.props.amount) {
      this.props.change("amount", getLocaleAmount(this.props.amount));
    }
  }

  public render(): JSX.Element {
    return (
        <View style={this.styles.root}>
          <Header
              title={I18n.t("giftCertificate")}
              backButton={{ name: "Back", action:  () => warnBeforeLosingChanges(
                    this.props.dirty, this.props.onCancel)
              }}
              rightButton={this.props.valid && !this.props.isReversalInProgress ? {
                title: I18n.t("issue"),
                action: () => handleFormSubmission(logger, this.props.submit)
              } : <View/>}
          />
          {
            this.props.isChange && this.props.amount &&
            <View style={this.styles.topSection}>
              <View style={this.styles.totalArea}>
                <Text style={this.styles.totalText}>{I18n.t("changeDue")}</Text>
                <Text style={this.styles.totalAmountText}>
                  {
                    this.props.amount &&
                    printAmount(this.props.amount)
                  }
                </Text>
              </View>
              {
                  this.props.isReversalInProgress &&
                  <View style={this.styles.totalAreaFeedbackNote}>
                    <FeedbackNote
                        messageType={FeedbackNoteType.Error}
                        message={I18n.t("pendingReversalChangeInstructions")}
                        messageTitle={I18n.t("pendingReversal")}
                    />
                  </View>
                }
            </View>
          }
          <Field name="certificateNumber" settings={this.props.settings} placeholder={I18n.t("giftCertificateNumber")} clearText={false}
                 style={this.styles.textInput} component={renderInputField} errorStyle={this.styles.textInputError}
                 overrideOnSubmitEditing={() => {
                    this.amount.focus();
                    handleFormSubmission(logger, this.props.submit);
                  }
                 } keyboardType="numbers-and-punctuation" inputType={InputType.text} onSave={() => this.amount.focus()} secureTextEntry={true}/>
          <CurrencyInput
              name="amount"
              onRef={(ref: any) => this.amount = ref}
              placeholder={I18n.t("giftCertificateAmount")}
              style={this.styles.textInput}
              containerStyle={this.props.isChange || this.props.isRefund ? this.styles.inputDisabled : {}}
              inputStyle={this.props.isChange || this.props.isRefund ? this.styles.inputDisabled : {}}
              errorStyle={this.styles.textInputError}
              onChange={this.updateActiveChoice.bind(this)}
              editable={!this.props.isChange && !this.props.isRefund}
              currency={this.props.amount?.currency || this.props.settings.retailLocationCurrency}
              onSubmitEditing={() => this.props.submit()}
              persistPlaceholder={true}
              persistPlaceholderStyle={this.props.isRefund ? this.styles.inputDisabled : {}}
          />
          {
            this.props.isChange &&
            <View style={this.styles.paddingBottom}/>
          }
          { this.props.quickChoiceAmounts && this.props.quickChoiceAmounts.length > 0 && !this.props.isRefund &&
            <QuickChoiceAmounts
                quickChoiceAmounts={this.props.quickChoiceAmounts}
                currency={this.props.settings.retailLocationCurrency}
                onSelect={(amount: Money) => {
                  this.props.change("amount", getLocaleAmount(amount));
                  this.setState({activeChoice: amount});
                }}
                selectedAmount={this.state.activeChoice}
            />
          }
          { Theme.isTablet && this.renderButtons() }
        </View>
    );
  }

  private renderButtons(): JSX.Element {
    return  (
      <View style={this.styles.actions}>
        <TouchableOpacity
            style={[this.styles.btnPrimary, this.styles.button,
              this.props.issueEnabled && this.props.valid ? {} : this.styles.btnDisabled]}
            disabled={!this.props.issueEnabled || !this.props.valid}
            onPress={() => this.props.submit()}
        >
          <Text style={[this.styles.btnPrimaryText,
            this.props.issueEnabled && this.props.valid ? {} : this.styles.btnTextDisabled]}>
            {I18n.t("issue")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[this.styles.btnSeconday, this.styles.button]}
            onPress={this.props.onCancel}
        >
          <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
        </TouchableOpacity>
      </View>
    );
  }
  private updateActiveChoice(newAmount: string): void {
    const activeChoice =  this.props.quickChoiceAmounts && this.props.quickChoiceAmounts.find(
        (amount) => (new Money(amount).toLocaleString(I18n.currentLocale()) === newAmount));
    this.setState({activeChoice});
  }
}

function getMaxMinValue(amount: string): string {
  const amountValue: number = Number(amount);
  const locale = getStoreLocale();
  const decimalPrecision = I18n.t("currency.format.precision", { locale });
  const delimiter = translateWithStoreLocale("currency.format.thousandsSeparator");
  const separator = translateWithStoreLocale("currency.format.decimalSeparator");
  const localeSpecificPrecision =
      decimalPrecision ? Number.parseInt(decimalPrecision, RADIX) : DEFAULT_DECIMAL_PRECISION;
  const finalAmount = I18n.toNumber(amountValue, { delimiter, separator, precision: localeSpecificPrecision });
  return finalAmount;
}

export default reduxForm<IssueGiftCertificateForm, Props>({
  form: "issueGiftCertificate",
  validate: (values: IssueGiftCertificateForm, props: Props) => {
    const errors: { certificateNumber: string; amount: string } = { certificateNumber: undefined, amount: undefined };
    if (!values.certificateNumber) {
      errors.certificateNumber = I18n.t("required", {field: I18n.t("giftCertificateNumber")});
    }
    if (!values.amount) {
      errors.amount = I18n.t("required", {field: I18n.t("giftCertificateAmount")});
    } else {
      if (!props.isRefund && (props.minimumIssueAmount && props.maximumIssueAmount) &&
          (+values.amount < +props.minimumIssueAmount.amount || +values.amount > +props.maximumIssueAmount.amount)) {
        errors.amount = I18n.t("giftCertificateAmountRange", {minimum: getMaxMinValue(props.minimumIssueAmount.amount),
          maximum: getMaxMinValue(props.maximumIssueAmount.amount),
          currencyUnits: props.settings.retailLocationCurrency});
      }
    }
    return errors;
  },
  initialValues: {
    certificateNumber: undefined,
    amount: undefined
  },
  onSubmit: (data: IssueGiftCertificateForm, dispatch: Dispatch<any>, props: Props) => {
    props.onIssue(data.certificateNumber, data.amount, data.certificateNumber === props.scannedCertificateNumber ?
        UIINPUT_SOURCE_BARCODE : UIINPUT_SOURCE_KEYBOARD);
    Keyboard.dismiss();
  }
})(IssueGiftCertificate);
