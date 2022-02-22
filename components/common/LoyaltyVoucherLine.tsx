import * as React from "react";
import {Text, TouchableOpacity, View} from "react-native";

import {ILoyaltyVoucher, LoyaltyVoucherStatus} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import { getStoreLocale, getStoreLocaleCurrencyOptions } from "../common/utilities";
import {loyaltyVoucherLineStyles} from "./styles";

interface Props {
  loyaltyVoucher: ILoyaltyVoucher;
  onApply: () => void;
}

const LoyaltyResultLine = (props: Props): JSX.Element => {
  const styles: any = Theme.getStyles(loyaltyVoucherLineStyles());

  const { loyaltyVoucher } = props;

  return (
    <TouchableOpacity style={styles.row} activeOpacity={1}>
      <View style={styles.loyaltyDetails}>
        <Text style={styles.loyaltyAmountText} adjustsFontSizeToFit={true} numberOfLines={1}>
          {loyaltyVoucher.amount.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions())}
        </Text>
        <Text style={styles.loyaltyText} adjustsFontSizeToFit={true} numberOfLines={1}>
          {loyaltyVoucher.voucherKey}
        </Text>
      </View>
      <View style={styles.applyLoyalty}>
        {loyaltyVoucher.status === LoyaltyVoucherStatus.active &&
        <Text onPress={() => props.onApply()} style={styles.applyLoyaltyText}
              adjustsFontSizeToFit={true} numberOfLines={1}>
          {I18n.t("apply")}
        </Text>
        }
        {loyaltyVoucher.status !== LoyaltyVoucherStatus.active &&
        <Text style={styles.appliedLoyaltyText} adjustsFontSizeToFit={true} numberOfLines={1}>
          {I18n.t("applied")}
        </Text>
        }
      </View>
    </TouchableOpacity>
  );
};

export default LoyaltyResultLine;
