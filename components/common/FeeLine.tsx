import * as React from "react";
import { Text, View, ViewStyle } from "react-native";

import { IFeeDisplayLine } from "@aptos-scp/scp-component-store-selling-features";
import Theme from "../../styles";
import { getStoreLocale, getStoreLocaleCurrencyOptions } from "../common/utilities";
import { feeLineStyles } from "./styles";


export interface Props {
  line: IFeeDisplayLine;
  style?: ViewStyle;
}

export interface State {}

export default class FeeLine extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(feeLineStyles());
  }

  public render(): JSX.Element {
    const feeAmountStr: string = this.props.line.extendedAmount.toLocaleString
      (getStoreLocale(), getStoreLocaleCurrencyOptions());
    return (
        <View style={[this.styles.row, this.props.style ? this.props.style : {}]}>
          <View style={this.styles.textArea}>
            <Text
              style={[this.styles.textStyle, this.styles.feeTypeText]}
              ellipsizeMode={"middle"}
              numberOfLines={1}
            >
              { this.getFeeDescriptionText() }
            </Text>
            <Text
              style={[this.styles.textStyle, this.styles.feeAmountText]}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              { feeAmountStr }
            </Text>
          </View>
        </View>
    );
  }

  private getFeeDescriptionText(): string {
    let feeDescriptionText: string = this.props.line.description.toUpperCase();

    if (this.props.line.quantity && this.props.line.unitAmount) {
      const feeUnitCostStr: string = this.props.line.unitAmount.toLocaleString
        (getStoreLocale(), getStoreLocaleCurrencyOptions());
      const formatedQuantityText: string = this.props.line.quantity + " " + "x" + " " + feeUnitCostStr ;
      feeDescriptionText = `${feeDescriptionText} (${formatedQuantityText})`;
    }
    return feeDescriptionText;
  }
}

