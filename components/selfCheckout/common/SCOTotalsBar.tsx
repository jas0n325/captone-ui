import * as React from "react";
import { Text, View } from "react-native";

import { Money } from "@aptos-scp/scp-component-business-core";

import Theme from "../../../styles";
import { getStoreLocale, getStoreLocaleCurrencyOptions } from "../../common/utilities";
import { scoTotalBarStyles } from "./styles";
import I18n from "../../../../config/I18n";


interface Props {
  isOnShoppingBagScreen: boolean;
  transactionSubTotal: Money;
  transactionSavings: Money;
  transactionTotalTendered: Money;
}

const SCOTotalsBar: React.FunctionComponent<Props> = (props): JSX.Element => {
    const styles = Theme.getStyles(scoTotalBarStyles());
    return(
      <View style={styles.totalArea}>
        <View style={[styles.total, styles.firstTotal]}>
          <Text style={styles.mainTotalText}>{I18n.t("totalBeforeTax")}</Text>
          <Text style={styles.mainAmountText}>{props.transactionSubTotal.toLocaleString(getStoreLocale(),
            getStoreLocaleCurrencyOptions())}</Text>
        </View>
        <View style={styles.totalSeparator}/>
        <View style={styles.total}>
          <Text style={styles.secondaryTotalText}>{I18n.t("totalSavings")}</Text>
          <Text style={styles.secondaryAmountText}>
            {props.transactionSavings.toLocaleString(getStoreLocale(),
            getStoreLocaleCurrencyOptions())}
          </Text>
        </View>
        {
          !props.isOnShoppingBagScreen &&
          <View style={styles.total}>
            <Text style={styles.secondaryTotalText}>{I18n.t("totalTendered")}</Text>
            <Text style={styles.secondaryAmountText}>
              {props.transactionTotalTendered.toLocaleString(getStoreLocale()
                , getStoreLocaleCurrencyOptions())}
            </Text>
          </View>
        }
      </View>
    );
  };
export default SCOTotalsBar;
