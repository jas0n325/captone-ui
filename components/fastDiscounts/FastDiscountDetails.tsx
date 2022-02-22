import * as React from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { MaskService } from "react-native-masked-text";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { DecoratedFormProps, FormInstance, InjectedFormProps, reduxForm } from "redux-form";

import { Money, Price } from "@aptos-scp/scp-component-business-core";
import { ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import {
  IFastDiscountButton
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import { AppState } from "../../reducers";
import Theme from "../../styles";
import Header from "../common/Header";
import ItemLine from "../common/ItemLine";
import {
  getCurrencyMask,
  getFixedPriceDisplayText,
  getItemDisplayLine,
  getStoreLocale,
  getStoreLocaleCurrencyOptions,
  handleFormSubmission,
  isValidCurrencyMinimumValue,
  printAmount,
  warnBeforeLosingChanges
} from "../common/utilities";
import { getItemAttributeDisplayOrderConfig } from "../common/utilities/configurationUtils";
import { fastDiscountStyles } from "../fastDiscounts/styles";
import { NavigationProp } from "../StackNavigatorParams";
import FastDiscountFixedPrice from "./FastDiscountFixedPrice";
import FastDiscountPriceChange from "./FastDiscountPriceChange";
import FastDiscountSelection from "./FastDiscountSelection";
import { FastDiscountDetailsScreenProps } from "./interfaces";

const logger: ILogger =
    LogManager.getLogger("com.aptos.storeselling.ui.components.fastDiscounts.fastDiscountDetails");

interface FastDiscountSelectionForm {
  price: string;
  hasPriceChangePrice: boolean;
  fixedPrice: string;
}

interface StateProps {
  initialValues: FastDiscountSelectionForm;
  configurationManager: IConfigurationManager;
  stateValues?: Readonly<Map<string, any>>;
  nonContextualData: Readonly<Map<string, any>>;
  retailLocationLocale: string;
}

interface Props extends FastDiscountDetailsScreenProps, StateProps {
  navigation: NavigationProp;
}

interface State {
  fixedPrice: boolean;
  hasNewPrice: boolean;
}

type FastDiscountDetailsProps = Props & InjectedFormProps<FastDiscountSelectionForm, Props> &
    FormInstance<FastDiscountSelectionForm, undefined>;

class FastDiscountDetails extends React.Component<FastDiscountDetailsProps, State> {
  private priceRef: any;
  private fixedPriceRef: any;
  private maskedPrice: string;
  private currencyMask: any;
  private styles: any;
  private readonly itemAttributesDisplayOrder?: Set<string>;
  private currency: string;

  public constructor(props: FastDiscountDetailsProps) {
    super(props);

    this.state = {
      fixedPrice: false,
      hasNewPrice: false
    };

    this.itemAttributesDisplayOrder = getItemAttributeDisplayOrderConfig(this.props.configurationManager);
    this.styles = Theme.getStyles(fastDiscountStyles());
    this.currency = this.props.stateValues.get("transaction.accountingCurrency")
      ? this.props.stateValues.get("transaction.accountingCurrency")
      : this.props.nonContextualData.get("accountingCurrency");

    this.handleFixedPriceVisibilityChange = this.handleFixedPriceVisibilityChange.bind(this);
  }

  public render(): JSX.Element {
    const itemAttributesDisplayOrder = [...this.itemAttributesDisplayOrder];

    return (
      this.state.fixedPrice
        ? this.getFixedPriceScreen()
        : this.getDiscountSelectionScreen(itemAttributesDisplayOrder)
    );
  }

  private getNewPrice(): Price {
    const priceAsString: string = this.getPriceAsString(this.maskedPrice);
    return this.currency && new Price(new Money(priceAsString, this.currency));
  }

  private handleFixedPriceVisibilityChange(visible: boolean): void {
    if (this.props.onFixedPriceVisibilityChanged) {
      this.props.onFixedPriceVisibilityChanged(visible);
    }
  }

  private getFixedPriceScreen(): JSX.Element {
    const fixedPriceDisplayText: string =
        getFixedPriceDisplayText(this.props.fastDiscountFeature.fastDiscountButtonRows);
    const price: Price = this.getNewPrice();

    return (
      price &&
        <View style={this.styles.root}>
          <Header
            title={ fixedPriceDisplayText }
            backButton={{
              name: "Back",
              action: () => warnBeforeLosingChanges(
                this.props.dirty,
                () => this.setState({ fixedPrice: false }, () => this.handleFixedPriceVisibilityChange(false))
              )
            }}
            rightButton={{
              title: I18n.t("apply"),
              action: () => handleFormSubmission(logger, this.props.submit)
            }}
          />
          <FastDiscountFixedPrice
            priceChangeDisplayText={this.priceChangeDisplayText}
            price={price ? getUnitPrice(price) : getUnitPrice(this.props.storeItem.price)}
            currency={this.currency}
            onFocus={() => this.props.change("fixedPrice", "")}
            onBlur={ undefined }
            onSubmitEditing={() => this.fixedPriceRef.focus()}
            onRef={(ref: any) => this.fixedPriceRef = ref}
          />
          {
            Theme.isTablet &&
              <View style={this.styles.actions}>
                <TouchableOpacity
                  style={[this.styles.btnPrimary, this.styles.button]}
                  onPress={() => handleFormSubmission(logger, this.props.submit)}
                >
                  <Text style={[this.styles.btnPrimaryText]}>
                    {I18n.t("apply")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[this.styles.btnSeconday, this.styles.button]}
                  onPress={() => warnBeforeLosingChanges(
                    this.props.dirty,
                    () => this.setState({ fixedPrice: false }, () => this.handleFixedPriceVisibilityChange(false))
                  )}
                >
                  <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
                </TouchableOpacity>
              </View>
          }
        </View>
    );
  }

  private onFixedPrice(): void {
    this.setState({ fixedPrice: true }, () => this.handleFixedPriceVisibilityChange(true));
  }

  private onPriceChangeBlur = (): void => {
    const price: Price = this.getNewPrice();

    if (price && this.props.storeItem.price.amount.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions())
        !== price.amount.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions())) {
      this.setState({hasNewPrice: true});
      this.props.change("hasPriceChangePrice", true);
    }
  }

  private onPriceChange = (maskedPrice: string): void => {
    // currently onPriceChange is called once with onChange and once with onChangeText
    if (maskedPrice && typeof(maskedPrice) === "string") {
      this.maskedPrice = maskedPrice;
    }
  }

  private getPriceAsString(maskedPrice: string): string {
    if (maskedPrice && maskedPrice.trim().length > 0) {
      if (!this.currencyMask) {
        this.currencyMask = getCurrencyMask(this.currency);
      }
      return MaskService.toRawValue("money", maskedPrice, this.currencyMask)?.toString();
    } else {
      return this.props.storeItem.price.amount.amount;
    }
  }

  private get priceChangeDisplayText(): string {
    if (this.props.fastDiscountFeature.originalPriceDisplayText) {
      const { originalPriceDisplayText } = this.props.fastDiscountFeature;
      return originalPriceDisplayText[I18n.currentLocale()] || originalPriceDisplayText[I18n.defaultLocale || "en"];
    } else {
      return I18n.t("price");
    }
  }

  private getDiscountSelectionScreen(itemAttributesDisplayOrder: string[]): JSX.Element {
    const priceVal: string = this.maskedPrice && this.getPriceAsString(this.maskedPrice);
    const fastDiscountButtons: IFastDiscountButton[][] = this.props.fastDiscountFeature.fastDiscountButtonRows;

    return (
      <View style={this.styles.root}>
        <Header
          title={this.props.fastDiscountFeature.discountNameDisplayText[I18n.currentLocale()] || I18n.t("fastDiscount")}
          backButton={{
            name: "Back",
            action: () => warnBeforeLosingChanges(this.props.dirty, this.props.onCancel)
          }}
        />
        <KeyboardAwareScrollView contentContainerStyle={this.styles.formArea}>
          <ItemLine line={getItemDisplayLine(this.props.storeItem)} hidePrice={ true } hideQuantity={ true }/>
          <FastDiscountPriceChange
            priceChangeDisplayText={this.priceChangeDisplayText}
            price={getUnitPrice(this.props.storeItem.price)}
            newPriceDisplayText={I18n.t("newPrice")}
            currency={this.currency}
            onFocus={() => this.props.change("price", "")}
            onBlur={this.onPriceChangeBlur}
            onChange={this.onPriceChange}
            onSubmitEditing={() => this.priceRef.focus()}
            onRef={(ref: any) => this.priceRef = ref}
          />
          <FastDiscountSelection
            titleText={I18n.t("selectDiscount")}
            fastDiscountButtons={ fastDiscountButtons }
            onFixedPrice={this.onFixedPrice.bind(this)}
            onFastDiscount={(fastDiscountButton: IFastDiscountButton) =>
              this.props.onFastDiscount(fastDiscountButton, this.state.hasNewPrice && priceVal)
            }
          />
          {
            Theme.isTablet &&
              <View style={this.styles.actions}>
                <TouchableOpacity
                  style={[this.styles.btnSeconday, this.styles.button]}
                  onPress={() => warnBeforeLosingChanges(
                    this.props.dirty,
                    this.props.onCancel
                  )}
                >
                  <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
                </TouchableOpacity>
              </View>
          }
        </KeyboardAwareScrollView>
      </View>
    );
  }
}

const getUnitPrice = (price: Price) => {
  return price && price.amount && price.amount.toLocaleString(getStoreLocale(),
    getStoreLocaleCurrencyOptions());
};

const FastDiscountSelectionForm = reduxForm<FastDiscountSelectionForm, Props>({
  form: "fastDiscountSelection",
  validate: (values: any, props: DecoratedFormProps<FastDiscountSelectionForm, Props>) => {
    const errors: { price: string, quantity: string, fixedPrice: string } =
        { price: undefined, quantity: undefined, fixedPrice: undefined };

    if (!values.price || Number.parseFloat(values.price) === 0) {
      errors.price = I18n.t("required", {field: I18n.t("price")});
    } else if (values.price && !isNaN(values.price)) {
      const currency = props.stateValues.get("transaction.accountingCurrency")
          ? props.stateValues.get("transaction.accountingCurrency")
          : props.nonContextualData.get("accountingCurrency");
      if (values.price && props.minimumDenomination && props.minimumDenomination.minimumValue &&
        !isValidCurrencyMinimumValue(values.price, currency, props.minimumDenomination.minimumValue)) {
        errors.price = I18n.t("invalidRoundedAmount", { amount: printAmount(
              new Money(props.minimumDenomination.minimumValue, currency)) });
      }
    }

    if (values.fixedPrice && !isNaN(values.fixedPrice)) {
      const currency = props.stateValues.get("transaction.accountingCurrency")
          ? props.stateValues.get("transaction.accountingCurrency")
          : props.nonContextualData.get("accountingCurrency");
      if (values.fixedPrice && props.minimumDenomination && props.minimumDenomination.minimumValue &&
        !isValidCurrencyMinimumValue(values.fixedPrice, currency, props.minimumDenomination.minimumValue)) {
        errors.fixedPrice = I18n.t("invalidRoundedAmount", { amount: printAmount(
              new Money(props.minimumDenomination.minimumValue, currency)) });
      }
    }

    return errors;
  },
  onSubmit: (data: FastDiscountSelectionForm, dispatch: Dispatch<any>, props: Props) => {
    props.onFastDiscount(props.fixedPriceButton, data.hasPriceChangePrice
      && data.price.toString(), data.fixedPrice.toString());

    Keyboard.dismiss();
  }
})(FastDiscountDetails);

const mapStateToProps = (state: AppState, ownProps: Props) => {
  return {
    initialValues: {
      price: getUnitPrice(ownProps.storeItem.price),
      hasPriceChangePrice: false,
      fixedPrice: ""
    },
    configurationManager: state.settings.configurationManager,
    stateValues: state.businessState.stateValues,
    nonContextualData: state.businessState.nonContextualData,
    retailLocationLocale: state.settings.primaryLanguage
  };
};

export default connect<StateProps, {}, Omit<Props, keyof (StateProps)>>(mapStateToProps, {})(FastDiscountSelectionForm);
