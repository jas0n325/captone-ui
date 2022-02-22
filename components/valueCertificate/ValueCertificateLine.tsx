import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { Money } from "@aptos-scp/scp-component-business-core";
import { IValueCertificateResult } from "@aptos-scp/scp-component-store-selling-features";

import Theme from "../../styles";
import { getStoreLocale, getStoreLocaleCurrencyOptions } from "../common/utilities";
import { valueCertificateLineStyles } from "./styles";
import Icon from "../common/Icon";
import { getTypeDisplayText } from "./common";

interface Props {
  valueCertificate: IValueCertificateResult;
  isVoidable: boolean;
  isReversalInProgress: boolean;
  onApply: (valueCertificate: IValueCertificateResult) => void;
  onVoid?: (valueCertificate: IValueCertificateResult) => void;
}

const ValueCertificateLine = (props: Props): JSX.Element => {
  const styles: any = Theme.getStyles(valueCertificateLineStyles());
  const balance: Money = props.valueCertificate.appliedAmount || props.valueCertificate.balance;
  const disabled: boolean = props.isReversalInProgress ||
      (!props.isVoidable && !!props.valueCertificate.tenderLineNumber);

  return (
      <TouchableOpacity
        style={[styles.row, props.isReversalInProgress && styles.disabled]}
        activeOpacity={1}
        onPress={() => props.isVoidable ? props.onVoid(props.valueCertificate) :
            props.onApply(props.valueCertificate)}
        disabled={disabled}
        >
          <View style={styles.details}>
            <Text style={[styles.amountText, props.isReversalInProgress && styles.disabledAmountText]} adjustsFontSizeToFit={true} numberOfLines={1}>
              {balance.toLocaleString(getStoreLocale(), getStoreLocaleCurrencyOptions())}
            </Text>
            <Text style={[styles.text, props.isReversalInProgress && styles.disabledText]} adjustsFontSizeToFit={true} numberOfLines={1}>
              {props.valueCertificate.accountNumber}
            </Text>
            <Text style={[styles.typeText, props.isReversalInProgress && styles.disabledText]} adjustsFontSizeToFit={true} numberOfLines={1}>
              {getTypeDisplayText(props.valueCertificate.valueCertificateType)}
            </Text>
          </View>
          {
            props.isVoidable &&
            <View style={[styles.voidIcon, props.isReversalInProgress && styles.disabled]}>
              <Icon name={"Clear"}
                underlayColor="transparent"
                color={styles.voidIcon.color}
                size={styles.voidIcon.fontSize}
              />
            </View>
          }
          {
            !props.isVoidable && !!props.valueCertificate.tenderLineNumber &&
            <View style={styles.statusIcon}>
              <Icon
                name="Checkmark"
                underlayColor="transparent"
                color={styles.statusIcon.color}
                size={styles.statusIcon.fontSize}
              />
            </View>
          }
      </TouchableOpacity>
  );
};

export default ValueCertificateLine;
