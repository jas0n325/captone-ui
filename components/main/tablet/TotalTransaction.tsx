import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { Money } from "@aptos-scp/scp-component-business-core";

import I18n from "../../../../config/I18n";
import { AppState } from "../../../reducers";
import Theme from "../../../styles";
import { getStoreLocale, getStoreLocaleCurrencyOptions, getTestIdProperties, getTransactionIsOpen } from "../../common/utilities";
import { printAmount } from "../../common/utilities/itemLineUtils";
import { RADIX } from "../constants";
import { totalTransactionStyle } from "./styles";

interface StateProps {
  stateValues: Map<string, any>;
  currency: string;
}

interface Props extends StateProps {
  mixedBasketAllowed: boolean;
  onTotal: () => void;
  resetOnTotalPressed: () => void;
  totalTransactionIsAllowed: boolean;
}

class TotalTransaction extends React.PureComponent<Props> {
  private styles: any;
  private zeroAmount: string;
  private zeroCurrency: Money;
  private testID: string;

  public constructor(props: Props) {
    super(props);
    const locale = getStoreLocale();
    this.styles = Theme.getStyles(totalTransactionStyle());
    this.testID = "TotalTransaction";
    if (this.props.currency) {
      this.zeroAmount = new Money(0, this.props.currency).toLocaleString
        (getStoreLocale(), getStoreLocaleCurrencyOptions());
    } else {
      this.zeroAmount = I18n.toCurrency(0, {delimiter: "", separator: I18n.t("currency.format.decimalSeparator"),
          precision: Number.parseInt(I18n.t("currency.format.precision", {locale}), RADIX)});
    }

    if (this.props.stateValues.get("transaction.accountingCurrency")) {
      this.zeroCurrency = new Money(0.00, this.props.stateValues.get("transaction.accountingCurrency"));
    }
  }

  public render(): JSX.Element {
    const transactionNotOpen: boolean = !getTransactionIsOpen(this.props.stateValues) ||
        !this.props.totalTransactionIsAllowed;

    const transactionSubTotal: Money = this.getStateValueMoney("transaction.subTotal");
    const transactionTax: Money = this.getStateValueMoney("transaction.tax");
    const transactionTotalSavings: Money = this.getStateValueMoney("transaction.totalSavings");
    const transactionBalanceDue: Money = this.getStateValueMoney("transaction.balanceDue");

    const returnMode: boolean = this.props.stateValues &&
        this.props.stateValues.get("ItemHandlingSession.isReturning");
    const returnSubTotal: Money = this.getStateValueMoney("transaction.returnSubTotal");
    const returnTax: Money = this.getStateValueMoney("transaction.returnTax");
    const returnTotalSavings: Money = this.getStateValueMoney("transaction.returnTotalSavings");
    const returnTotal: Money = this.getStateValueMoney("transaction.returnTotal");

    return (
        <View style={this.styles.root}>
          <View style={this.styles.totals}>
            <View style={this.styles.row}>
              <Text style={this.styles.text}>{I18n.t("totalTax")}:</Text>
              <Text style={[this.styles.text, this.styles.totalText]}>
                {this.printAmountOrZeroAmount(returnMode ? returnTax : transactionTax)}
              </Text>
            </View>
            <View style={this.styles.row}>
              <Text style={this.styles.text}>{I18n.t("discounts")}:</Text>
              <Text style={[this.styles.text, this.styles.totalText]}>
                {this.printAmountOrZeroAmount(returnMode ? returnTotalSavings : transactionTotalSavings)}
              </Text>
            </View>
            <View style={this.styles.row}>
              <Text style={this.styles.text}>{I18n.t("subTotal")}:</Text>
              <Text style={[this.styles.text, this.styles.totalText]}>
                {this.printAmountOrZeroAmount(returnMode ? returnSubTotal : transactionSubTotal)}
              </Text>
            </View>
          </View>
          {!returnMode || !this.props.mixedBasketAllowed ?
          <TouchableOpacity
              {...getTestIdProperties(this.testID, "total-button")}
              style={[this.styles.btnPrimary, this.styles.btnTotal, transactionNotOpen && this.styles.btnDisabled]}
              onPress={this.props.onTotal}
              onPressIn={this.props.resetOnTotalPressed}
              disabled={transactionNotOpen}
          >
            {
              transactionBalanceDue && transactionBalanceDue.isPositive() &&
              <Text
                  style={[this.styles.btnPrimaryText, this.styles.btnTotalText, transactionNotOpen &&
                  this.styles.btnTextDisabled]}
              >
                {I18n.t("pay")}
              </Text>
            }
            <Text
                style={[this.styles.btnPrimaryText, this.styles.btnTotalAmountText, transactionNotOpen &&
                this.styles.btnTextDisabled]}
            >
              {transactionBalanceDue && printAmount(transactionBalanceDue) || this.zeroAmount}
            </Text>
          </TouchableOpacity> :
          <View style={this.styles.returnTotal}>
            <Text style={this.styles.returnText}>
              {I18n.t("refundTotal")}
            </Text>
            <Text style={this.styles.returnTotalText}>
              {printAmount(returnTotal) || this.zeroAmount}
            </Text>
          </View>
          }
        </View>
    );
  }

  private getStateValueMoney(tranKey: string): Money {
    return this.props.stateValues && this.props.stateValues.get(tranKey) || this.zeroCurrency;
  }

  private printAmountOrZeroAmount(amount: Money): string {
    return printAmount(amount) || this.zeroAmount;
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    stateValues: state.businessState.stateValues,
    currency: state.settings.retailLocationCurrency
  };
};

export default connect(mapStateToProps)(TotalTransaction);
