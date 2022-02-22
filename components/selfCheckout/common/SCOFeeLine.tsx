import * as React from "react";
import { Text, View } from "react-native";

import { IFeeDisplayLine } from "@aptos-scp/scp-component-store-selling-features";
import Theme from "../../../styles";
import { getStoreLocale, getStoreLocaleCurrencyOptions } from "../../common/utilities";
import { scoFeeLineStyles } from "./styles";

interface Props {
  feeDisplayLine: IFeeDisplayLine;
}

export const SCOFeeLine = (props: Props) => {
  const styles = Theme.getStyles(scoFeeLineStyles());
  const line = props.feeDisplayLine;
  const totalPrice = line.extendedAmount.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions());

  return (
    <View style={styles.root}>
      <Text style={styles.bagFeeHeading}>{line.description}</Text>
      <View>
        <Text style={styles.totalPrice}>{totalPrice}</Text>
      </View>
    </View>
  );
};
