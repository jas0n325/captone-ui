import {isEmpty} from "lodash";
import * as React from "react";
import { Text, View } from "react-native";

import { Money } from "@aptos-scp/scp-component-business-core";

import Theme from "../../styles";
import NumericInput from "../common/customInputs/NumericInput";
import { RADIX } from "../main/constants";
import { currencyCalculatorStyles } from "./styles";
import { getStoreLocale, getStoreLocaleCurrencyOptions } from "./utilities";

export interface Denomination {
  value: number;
  qty: number;
  total: number;
  index: number;
}

interface Props {
  currency: string;
  item: Denomination;
  setDenomination?: (item: Denomination) => void;
}

interface State {
  denominationTotal: number;
}

export default class CurrencyCalculator extends React.Component<Props, State> {
  private styles: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      denominationTotal : 0.00
    };
    this.styles = Theme.getStyles(currencyCalculatorStyles());
  }

  public render(): JSX.Element {
    const denominationValue: Money = new Money(this.props.item.value, this.props.currency);
    const denominationTotal: Money = new Money(this.props.item.total, this.props.currency);

    return (
      <View style={this.styles.root}>
        <Text style={this.styles.currency}>
          {denominationValue.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions())}
        </Text>
        <NumericInput
          style={this.styles.input}
          precision={0}
          negative={false}
          returnKeyType={"done"}
          secureTextEntry={false}
          trimLeadingZeroes={true}
          clearOnFocus={true}
          value={this.props.item.qty.toString()}
          onChangeText={this.updateDenomination.bind(this)}
        />
        <Text style={this.styles.total}>
          {denominationTotal.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions())}
        </Text>
      </View>
    );
  }

  private updateDenomination(newQuantity: string): void {
    if (isEmpty(newQuantity)) {
      newQuantity = "0";
    }
    const qty = parseInt(newQuantity, RADIX);
    const total = this.props.item.value * qty;
    this.props.setDenomination({...this.props.item, qty, total});
    this.setState({denominationTotal: total});
  }
}
