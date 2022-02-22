import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import {
  IDiscountDisplayLine,
  LOYALTY_DISCOUNT_LINE_TYPE,
  TRANSACTION_MANUAL_DISCOUNT_LINE_TYPE
} from "@aptos-scp/scp-component-store-selling-features";
import { ManualDiscountType } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import { getStoreLocale, getStoreLocaleCurrencyOptions } from "../common/utilities";
import { DiscountLevel, DiscountType } from "../discounts/constants";
import { discountLineStyles } from "./styles";
import VectorIcon from "./VectorIcon";


interface Props {
  discountLine: IDiscountDisplayLine;
  onDiscount: (discountLevel: DiscountLevel, discountType: DiscountType,
               discountDisplayLine: IDiscountDisplayLine) => void;
  onVoid: (discountLineNumber: number) => void;
}

interface State {}

export default class DiscountLine extends React.Component<Props, State> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(discountLineStyles());
  }

  public render(): JSX.Element {
    const discountLevel: DiscountLevel = (this.props.discountLine.lineType === TRANSACTION_MANUAL_DISCOUNT_LINE_TYPE ||
    this.props.discountLine.lineType === LOYALTY_DISCOUNT_LINE_TYPE) ? DiscountLevel.Transaction : DiscountLevel.Item;
    const discountType: DiscountType = (this.props.discountLine.isEmployeeDiscount && DiscountType.Employee) ||
        (this.props.discountLine.couponCode && DiscountType.Coupon) ||
        (this.props.discountLine.isLoyaltyDiscount && DiscountType.Loyalty) ||
        (this.props.discountLine.competitivePrice && DiscountType.CompetitivePrice) ||
        (this.props.discountLine.discountType === ManualDiscountType.ReplacementUnitPrice ? DiscountType.NewPrice :
            DiscountType.Manual);
    return (
      <View style={this.styles.root}>
        <TouchableOpacity
          style={this.styles.detailsArea}
          onPress={() => this.props.onDiscount(discountLevel, discountType, this.props.discountLine)}
        >
          <View style={this.styles.detailsRow}>
            <View style={this.styles.textCell}>
              { this.renderDiscountTypeTitle() }
            </View>
            <View style={this.styles.amountCell}>
              { this.renderDiscountValue() }
            </View>
          </View>
          <View style={this.styles.detailsRow}>
            <View style={this.styles.textCell}>
              <Text style={this.styles.bottomRowText} numberOfLines={2} ellipsizeMode={"tail"}>
                {this.isCompetitivePriceDiscount ? this.props.discountLine.competitor :
                    this.props.discountLine.reasonCodeDescription || this.props.discountLine.couponCode}
              </Text>
            </View>
            <View style={this.styles.amountCell}>
              { this.renderDiscountDifference() }
            </View>
          </View>
        </TouchableOpacity>
        <View style={this.styles.voidIconArea}>
          <TouchableOpacity style={this.styles.voidIcon} onPress={() => this.voidDiscountLine()}>
            <VectorIcon
              name="Clear"
              height={this.styles.icon.fontSize}
              width={this.styles.icon.fontSize}
              fill={this.styles.icon.color}
              stroke={this.styles.icon.color}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  private renderDiscountTypeTitle(): JSX.Element {
    let discountTitle: string = "";

    if (this.isEmployeeDiscount) {
      discountTitle += I18n.t("employeeDiscount");
    } else if (this.isNewPriceDiscount) {
      discountTitle += I18n.t("priceDiscount");
    } else if (this.isLoyaltyDiscount) {
      discountTitle += I18n.t("loyaltyDiscount");
    } else if (this.isCompetitivePriceDiscount) {
      discountTitle += I18n.t("priceMatch");
    } else {
      if (this.props.discountLine.couponCode) {
        discountTitle += I18n.t("coupon") + " ";
      }
      if (this.isAmountDiscount) {
        discountTitle += I18n.t("amountDiscount");
      } else if (this.isPercentDiscount) {
        discountTitle += I18n.t("percentDiscount");
      }
    }

    return ( <Text style={this.styles.topRowText} numberOfLines={2} ellipsizeMode={"tail"}>{discountTitle}</Text> );
  }

  private renderDiscountValue(): JSX.Element {
    let discountValue: string = "";

    if (this.isAmountDiscount) {
      discountValue += this.props.discountLine.amount.toLocaleString(getStoreLocale()
        , getStoreLocaleCurrencyOptions());
    } else if (this.isPercentDiscount) {
      discountValue += this.props.discountLine.percent + "%";
    } else if (this.isNewPriceDiscount) {
      discountValue += this.props.discountLine.replacementUnitPrice.amount.toLocaleString(getStoreLocale()
        , getStoreLocaleCurrencyOptions());
    } else if (this.isCompetitivePriceDiscount) {
      discountValue += this.props.discountLine.competitivePrice.amount.toLocaleString(getStoreLocale()
        , getStoreLocaleCurrencyOptions());
    }

    return ( <Text style={this.styles.topRowText}>{discountValue}</Text> );
  }

  private renderDiscountDifference(): JSX.Element {
    if (this.isPercentDiscount) {
      return (
          <Text style={this.styles.bottomRowText}>({
            this.props.discountLine.totalDiscount &&
            this.props.discountLine.totalDiscount.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions())
          })</Text>
      );
    } else {
      return (
        <View />
      );
    }
  }

  private get isAmountDiscount(): boolean {
    return this.props.discountLine.discountType === ManualDiscountType.AmountOff || this.isLoyaltyDiscount;
  }

  private get isPercentDiscount(): boolean {
    return this.props.discountLine.discountType === ManualDiscountType.PercentOff;
  }

  private get isNewPriceDiscount(): boolean {
    return this.props.discountLine.discountType === ManualDiscountType.ReplacementUnitPrice &&
        !(this.props.discountLine.competitivePrice);
  }

  private get isCompetitivePriceDiscount(): boolean {
    return !!(this.props.discountLine.competitivePrice && this.props.discountLine.competitor);
  }

  private get isEmployeeDiscount(): boolean {
    return this.props.discountLine.isEmployeeDiscount;
  }

  private get isLoyaltyDiscount(): boolean {
    return this.props.discountLine.isLoyaltyDiscount;
  }

  private voidDiscountLine(): void {
    this.props.onVoid(this.props.discountLine.lineNumber);
  }
}
