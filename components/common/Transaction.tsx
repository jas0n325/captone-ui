import * as React from "react";
import { Text, TouchableWithoutFeedback, View } from "react-native";

import { IMerchandiseTransaction } from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import { transactionStyles } from "./styles";
import { formattedAmountFromPosted, getCustomerDisplayText, getDisplayableDate, getItemCount } from "./utilities";
import VectorIcon from "./VectorIcon";


export interface Props {
  displayTaxFreeDocId?: boolean;
  transaction: IMerchandiseTransaction;
  onTransactionChosen: (transaction: IMerchandiseTransaction) => void;
}

const Transaction = (props: Props): JSX.Element => {
  const { transaction } = props;
  const itemCount: number = getItemCount(transaction);
  const styles: any = Theme.getStyles(transactionStyles());
  const taxFreeDocId = transaction.taxFreeFormKey;
  return (
    <TouchableWithoutFeedback onPress={() => props.onTransactionChosen(transaction)}>
      <View style={styles.transaction}>
        <View style={styles.details}>
           {/* transaction.transactionNumber is non mandatory field if order originated at external OMS*/}
          {transaction.transactionNumber && <View style={styles.transactionRow}>
            <Text style={styles.transactionText}>
              {`${I18n.t("transactionNumberSummary")}${transaction.transactionNumber}`}
            </Text>
          </View>}
          <View style={styles.transactionRow}>
            <Text style={styles.attributeText}>
              {getDisplayableDate(transaction.endDateTime)}
            </Text>
            <Text style={styles.attributeText}>
              {formattedAmountFromPosted(transaction.transactionTotal)}
            </Text>
          </View>
          <View style={styles.transactionRow}>
            {/* transaction.deviceId is non mandatory field if order originated at external OMS*/}
            {transaction.deviceId && <Text style={styles.attributeText}>
              {I18n.t("device")}{`: ${transaction.deviceId}`}
            </Text>}
            <Text style={styles.attributeText}>
              {I18n.t("items")}{`: ${itemCount}`}
            </Text>
          </View>
          {transaction && transaction.customer &&
          <View style={styles.transactionRow}>
            <Text style={styles.attributeText} numberOfLines={1} ellipsizeMode={"tail"}>
              {getCustomerDisplayText(transaction.customer)}
            </Text>
          </View>
          }
          {transaction.performingUser &&
          <View style={styles.transactionRow}>
            <Text style={styles.attributeText} numberOfLines={1} ellipsizeMode={"tail"}>
              {`${I18n.t("associate")}: `}{transaction.performingUser.displayName ||
                `${transaction.performingUser.firstName} ${transaction.performingUser.lastName}`}
            </Text>
          </View>
          }
          {
            props.displayTaxFreeDocId && taxFreeDocId &&
            <View style={styles.transactionRow}>
              <Text style={styles.attributeText} numberOfLines={1} ellipsizeMode={"tail"}>
                {`${I18n.t("taxFreeDocId")}: `}{taxFreeDocId}
              </Text>
            </View>
          }
        </View>
        <View style={styles.arrowArea}>
          <VectorIcon name="Forward" height={styles.icon.fontSize} fill={styles.icon.color} />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Transaction;
