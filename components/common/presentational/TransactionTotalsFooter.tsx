import * as React from "react";
import { Text, View } from "react-native";

import { Money } from "@aptos-scp/scp-component-business-core";

import I18n from "../../../../config/I18n";
import Theme from "../../../styles";
import { StyleGroup } from "../constants";
import { printAmount } from "../utilities/itemLineUtils";
import VectorIcon from "../VectorIcon";
import { transactionTotalsFooterStyles as transactionTotalsFooterStylesPhone} from "./phone/styles";
import { transactionTotalsFooterStyles as transactionTotalsFooterStylesTablet} from "./tablet/styles";


interface Props {
  transactionNumber: string;
  subtotal: Money;
  totalDiscounts: Money;
  tax: Money;
  total: Money;
  referenceNumber?: string;
  orderReferenceNumber?: string;
  donation?: Money;
  style?: StyleGroup;
  totalFee?: Money;
}

export default class TransactionTotalsFooter extends React.PureComponent<Props> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(Theme.isTablet ? transactionTotalsFooterStylesTablet() :
        transactionTotalsFooterStylesPhone());
  }

  public render(): JSX.Element {
    return (
      <View style={[this.styles.root, this.props.style || {}]}>
        <View style={this.styles.topSection}>
          <VectorIcon
            name={"Transaction"}
            fill={this.styles.transactionIcon.color}
            height={this.styles.transactionIcon.height}
            width={this.styles.transactionIcon.width}
          />
          <Text style={this.styles.transactionNumber} numberOfLines={1} ellipsizeMode={"tail"}>
            {this.renderReferenceNumber()}
          </Text>
        </View>
        { this.renderLabelAndAmount("subTotal", this.props.subtotal) }
        { this.renderLabelAndAmount("discounts", this.props.totalDiscounts?.times(-1), this.styles.discountText) }
        { this.renderLabelAndAmount("estimatedTax", this.props.tax) }
        { this.renderLabelAndAmount("fee", this.props.totalFee) }
        { this.props.donation && this.props.donation.isNotZero() &&
            this.renderLabelAndAmount("donation", this.props.donation)}
        { this.renderLabelAndAmount("total", this.props.total, this.styles.totalText) }
      </View>
    );
  }

  private renderReferenceNumber(): string {
    if (!this.props.orderReferenceNumber) {
      return `${this.props.referenceNumber ? this.props.referenceNumber : this.props.transactionNumber}`;
    } else {
      return `${this.props.orderReferenceNumber}`;
    }
  }

  private renderLabelAndAmount(
    labelI18nCode: string,
    amount: Money,
    textStyle?: StyleGroup
  ): JSX.Element {
    return (
      <View style={this.styles.labelAndAmountRow}>
        <Text style={[this.styles.labelAndAmountText, textStyle || {}]}>
          {I18n.t(labelI18nCode)}
        </Text>
        <Text style={[this.styles.labelAndAmountText, this.styles.amountText, textStyle || {}]}>
          { printAmount(amount) }
        </Text>
      </View>
    );
  }
}
