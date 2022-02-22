import * as React from "react";
import { Text, View } from "react-native";

import { Money } from "@aptos-scp/scp-component-business-core";
import { IDiscountDisplayLine } from "@aptos-scp/scp-component-store-selling-features";
import { ManualDiscountType } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../../config/I18n";
import Theme from "../../../styles";
import { getStoreLocale, getStoreLocaleCurrencyOptions } from "../../common/utilities";
import { scoDiscountDisplayLinesStyles } from "./styles";

interface Props {
  discountDisplayLines: Array<IDiscountDisplayLine>;
  currency: string;
}

export const SCODiscountLine = (props: Props) => {
  const styles = Theme.getStyles(scoDiscountDisplayLinesStyles());
  const lines = props.discountDisplayLines;

  const getPercentOff = (line: IDiscountDisplayLine): string => {
    let percent: string = "";

    if (line.discountType === ManualDiscountType.PercentOff) {
      percent = ` - ${line.percent}%`;
    }

    return percent;
  };

  const getReasonCodeDescription = (line: IDiscountDisplayLine): string => {
    let reasonCodeDescription: string = "";

    if (line.reasonCodeDescription) {
      reasonCodeDescription = `: ${line.reasonCodeDescription}`;
    }

    return reasonCodeDescription;
  };

  const renderDiscountLine = (line: IDiscountDisplayLine, index: number): JSX.Element => {
    const discountTitle: string = getDiscountTitle(line);
    return (
        <View style={styles.discountLine}>
          <Text style={styles.discountLineLabel}>
            {`${discountTitle}${getPercentOff(line)}${getReasonCodeDescription(line)}`}
          </Text>
          <Text style={styles.discountLineTotal}>
          {`(${line.totalDiscount && line.totalDiscount.toLocaleString(getStoreLocale()
            , getStoreLocaleCurrencyOptions())})`}
          </Text>
        </View>
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.discountLine}>
        <Text style={styles.discountHeader}>{I18n.t("transactionDiscount")}</Text>
        <Text style={styles.totalAmount}>{`(${getTotalDiscountedAmount(lines, props.currency)})`}</Text>
      </View>
      {
        lines.map(renderDiscountLine)
      }
    </View>
  );
};

function getDiscountTitle(line: IDiscountDisplayLine): string {
  let discountTitle: string;

  if (line.discountType === ManualDiscountType.ReplacementUnitPrice) {
    discountTitle = `${I18n.t("newPrice")} `;
  } else if (line.discountType === ManualDiscountType.AmountOff) {
    discountTitle = ` ${I18n.t("amount")} `;
  } else if (line.discountType === ManualDiscountType.PercentOff) {
    discountTitle = ` ${I18n.t("percent")} `;
  }

  if (line.couponCode) {
    discountTitle = discountTitle + I18n.t("couponLowerCase");
  } else if (line.isEmployeeDiscount) {
    discountTitle = discountTitle + I18n.t("employeeLowerCase");
  } else {
    discountTitle = discountTitle + I18n.t("discountLowerCase");
  }


  return discountTitle;
}

function getTotalDiscountedAmount(lines: IDiscountDisplayLine[], currency: string): string {
  let totalDiscounts: Money = new Money("0", currency);
  lines.forEach((discountLine) => {
    totalDiscounts = totalDiscounts.plus(discountLine.totalDiscount);
  });
  return totalDiscounts.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions());
}
