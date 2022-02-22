import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { SSF_PAYMENT_DEVICE_AUTH_VOID_FAILED_ALLOW_REFUND } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import BaseView from "./BaseView";
import { retryVoidAsRefundStyles } from "./styles";

interface Props {
  onAccept: () => void;
  onCancel: () => void;
}

const RetryVoidAsRefund = (props: Props): JSX.Element => {
  const styles = Theme.getStyles(retryVoidAsRefundStyles());
  return (
    <BaseView style={styles.modalContainer}>
      <View style={styles.modalView}>
        <View style={styles.textPanel}>
          <Text style={styles.errorText}>{I18n.t(SSF_PAYMENT_DEVICE_AUTH_VOID_FAILED_ALLOW_REFUND)}</Text>
        </View>
        <View style={styles.closeButtonContainer}>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => props.onCancel()} >
            <Text style={styles.btnSecondaryText}>{I18n.t("cancel")} </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => { props.onAccept(); }} >
            <Text style={styles.btnPrimaryText}>{I18n.t("refund")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BaseView>
  );
};

export default RetryVoidAsRefund;
