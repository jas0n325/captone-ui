import * as React from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";
import SegmentedControlTab from "react-native-segmented-control-tab";
import { Dispatch } from "redux";
import { Field, FormInstance, InjectedFormProps, reduxForm } from "redux-form";

import { Money } from "@aptos-scp/scp-component-business-core";
import { UiInput, UIINPUT_SOURCE_BARCODE, UIINPUT_SOURCE_KEYBOARD } from "@aptos-scp/scp-component-store-selling-core";

import I18n from "../../../config/I18n";
import { SettingsState } from "../../reducers";
import Theme from "../../styles";
import { CurrencyInput, renderInputField, RenderSelectOptions } from "../common/FieldValidation";
import Header from "../common/Header";
import { InputType } from "../common/Input";
import {
  getLocaleAmount,
  getStoreLocale,
  printAmount,
  translateWithStoreLocale,
  warnBeforeLosingChanges
} from "../common/utilities";
import { DEFAULT_DECIMAL_PRECISION, RADIX } from "../main/constants";
import { issueGiftCardStyle } from "./styles";
import QuickChoiceAmounts from "../common/QuickChoiceAmounts";

export interface IssueGiftCardForm {
  cardNumber: string;
  amount: string;
}

export interface LocaleCurrencyOptions {
  thousandsSeparator: "";
  decimalSeparator: "";
  precision: 0;
}

export interface Props {
  currency: string;
  settings: SettingsState;
  primaryGiftDevices: RenderSelectOptions[];
  minimumIssueAmount: Money;
  maximumIssueAmount: Money;
  quickChoiceAmounts: Money[];
  configuredCurrency: string;
  scannedCardNumber: string;
  swipe: boolean;
  swipeButtonEnabled: boolean;
  reloadEnabledGCService: boolean;
  issueEnabledGCService: boolean;
  isRefund?: boolean;
  isChange?: boolean;
  amount?: string;
  onSwipe: () => void;
  onIssue: (cardNumber: string, amount: string, inputSource: string, useSwipe?: boolean, inputs?: UiInput[]) => void;
  onCancel: () => void;
  onChangeExistingCard: (existingCard: boolean) => void;
  toggleSwipeButton: (swipeButtonEnabled: boolean) => void;
}

export interface State {
  segmentedControlSelectedIndex: number;
  activeChoice: Money;
}

class IssueGiftCard extends React.Component<Props & InjectedFormProps<IssueGiftCardForm, Props> &
    FormInstance<IssueGiftCardForm, Props>, State> {
  private amount: any;
  private styles: any;
  public constructor(props: Props & InjectedFormProps<IssueGiftCardForm, Props> &
      FormInstance<IssueGiftCardForm, Props>) {
    super(props);

    let segmentedControlSelectedIndex: number = 0;
    if (this.props.reloadEnabledGCService && !this.props.issueEnabledGCService) {
      segmentedControlSelectedIndex = 1;
    }

    this.state = {
      segmentedControlSelectedIndex,
      activeChoice: undefined
    };

    this.styles = Theme.getStyles(issueGiftCardStyle());
  }

  public componentDidUpdate(prevProps: Props & InjectedFormProps<IssueGiftCardForm, Props>  &
      FormInstance<IssueGiftCardForm, Props>): void {
    if (this.props.scannedCardNumber !== prevProps.scannedCardNumber) {
      this.props.change("cardNumber", this.props.scannedCardNumber);
    }
    if (this.props.swipe) {
      this.props.change("swipe", this.props.swipe);
    }
  }

  public componentDidMount(): void {
    if (this.props.isRefund || this.props.isChange) {
      this.props.initialize({
        amount: this.props.amount
      });
    }
  }

  // tslint:disable-next-line: cyclomatic-complexity
  public render(): JSX.Element {
    const isGiftEnabled: boolean = this.isGCServiceEnabled() || this.props.primaryGiftDevices.length > 0;
    return (
      <View style={this.styles.root}>
        <Header
            title={I18n.t("issueGiftCard")}
            backButton={{name: "Back", action:  () => warnBeforeLosingChanges(
                this.props.dirty, this.props.onCancel)
            }}
        />
        {
          this.props.isChange && this.props.amount &&
            <View style={this.styles.topSection}>
              <View style={this.styles.totalArea}>
                <Text style={this.styles.totalText}>{I18n.t("changeDue")}</Text>
                <Text style={this.styles.totalAmountText}>
                  {
                    this.props.amount &&
                    printAmount(new Money(this.props.amount, this.props.currency))
                  }
                </Text>
              </View>
            </View>
        }
        <View style={this.styles.controlArea}>
          {!this.hideControlTab() &&
            <SegmentedControlTab
              activeTabStyle={this.styles.activeTabStyle}
              activeTabTextStyle={this.styles.activeTabTextStyle}
              tabStyle={this.styles.tabStyle}
              tabTextStyle={this.styles.tabTextStyle}
              values={[I18n.t("newCard"), I18n.t("existingCard")]}
              selectedIndex={this.state.segmentedControlSelectedIndex}
              onTabPress={(index: number) => { this.setState({ segmentedControlSelectedIndex: index });
                                               this.props.onChangeExistingCard(index === 1); }} />
          }
        </View>
        <Field name="cardNumber" settings={this.props.settings} placeholder={I18n.t("giftCardNumber")} clearText={false}
            style={this.styles.textInput} component={renderInputField} errorStyle={this.styles.textInputError}
            onSubmitEditing={() => this.amount.focus()} keyboardType={InputType.numeric}
            inputType={InputType.numeric} onSave={() => this.amount.focus()} secureTextEntry={true}/>
        <CurrencyInput
            name="amount"
            onRef={(ref: any) => this.amount = ref}
            placeholder={I18n.t("giftCardAmount")}
            style={this.styles.textInput}
            containerStyle={this.props.isRefund || this.props.isChange ? this.styles.inputDisabled : {}}
            inputStyle={this.props.isRefund || this.props.isChange ? this.styles.inputDisabled : {}}
            errorStyle={this.styles.textInputError}
            onChange={this.updateActiveChoice.bind(this)}
            editable={!(this.props.isRefund || this.props.isChange )}
            currency={this.props.settings.retailLocationCurrency}
            onSubmitEditing={() => this.props.submit()}
            persistPlaceholder={true}
            persistPlaceholderStyle={this.props.isRefund || this.props.isChange ? this.styles.inputDisabled : {}}
        />
        { this.props.quickChoiceAmounts && this.props.quickChoiceAmounts.length > 0 &&
            !this.props.isRefund && !this.props.isChange &&
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
        <View style={this.styles.actions}>
          <TouchableOpacity
            style={[this.styles.btnPrimary, this.styles.button,
              isGiftEnabled && this.props.valid ? {} : this.styles.btnDisabled]}
            disabled={!isGiftEnabled || !this.props.valid}
            onPress={() => this.props.submit()}
          >
            <Text style={[this.styles.btnPrimaryText,
                  isGiftEnabled && this.props.valid ? {} : this.styles.btnTextDisabled]}>
              {this.state.segmentedControlSelectedIndex === 0 ? I18n.t("issue") : I18n.t("addValue")}
            </Text>
          </TouchableOpacity>
          { !this.isGCServiceEnabled() &&
            <TouchableOpacity
              style={[!Theme.isTablet ? this.styles.btnSeconday : this.styles.btnPrimary, this.styles.button,
                  isGiftEnabled && this.props.swipeButtonEnabled ? {} : this.styles.btnDisabled]}
              onPress={() => {
                this.props.onSwipe();
                setTimeout(() => this.props.submit());
              }}
              disabled={!isGiftEnabled || !this.props.swipeButtonEnabled}
            >
              <Text style={[!Theme.isTablet ? this.styles.btnSecondayText : this.styles.btnPrimaryText,
                isGiftEnabled && this.props.swipeButtonEnabled ? {} : this.styles.btnTextDisabled]}>
                {I18n.t("swipe")}
              </Text>
            </TouchableOpacity>
          }
          {
            Theme.isTablet &&
            <TouchableOpacity
              style={[this.styles.btnSeconday, this.styles.button]}
              onPress={this.props.onCancel}
            >
              <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
            </TouchableOpacity>
          }
        </View>
      </View>
    );
  }

  private isGCServiceEnabled(): boolean {
    return this.props.issueEnabledGCService || this.props.reloadEnabledGCService;
  }

  private hideControlTab(): boolean {
    return this.isGCServiceEnabled() && !(this.props.reloadEnabledGCService && this.props.issueEnabledGCService);
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

export default reduxForm<IssueGiftCardForm, Props>({
  form: "issueGiftCard",
  validate: (values: IssueGiftCardForm, props: Props) => {
    const errors: { cardNumber: string; amount: string } = { cardNumber: undefined, amount: undefined };
    let swipeButtonEnabled: boolean = true;
    if (!values.cardNumber && !props.swipe) {
      errors.cardNumber = I18n.t("required", {field: I18n.t("giftCardNumber")});
    }
    if (!values.amount) {
      errors.amount = I18n.t("required", {field: I18n.t("giftCardAmount")});
      swipeButtonEnabled = false;
    } else {
      const currency: string = props.configuredCurrency || props.currency;
      const amount: Money = new Money(values.amount, currency);
      if (!props.isChange && (props.minimumIssueAmount && props.maximumIssueAmount) &&
            (amount.lt(props.minimumIssueAmount) ||
            amount.gt(props.maximumIssueAmount))) {
          errors.amount = I18n.t("giftCardAmountRange", {minimum: getMaxMinValue(props.minimumIssueAmount.amount),
              maximum: getMaxMinValue(props.maximumIssueAmount.amount),
              currencyUnits: props.currency || props.settings.retailLocationCurrency});
          swipeButtonEnabled = false;
        }
    }
    props.toggleSwipeButton(swipeButtonEnabled);
    return errors;
  },
  initialValues: {
    cardNumber: undefined,
    amount: undefined
  },
  onSubmit: (data: IssueGiftCardForm, dispatch: Dispatch<any>, props: Props) => {
    props.onIssue(data.cardNumber, data.amount, data.cardNumber === props.scannedCardNumber ?
        UIINPUT_SOURCE_BARCODE : UIINPUT_SOURCE_KEYBOARD, props.swipe);
    Keyboard.dismiss();
  }
})(IssueGiftCard);
