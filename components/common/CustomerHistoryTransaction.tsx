import * as React from "react";
import { Text, TouchableWithoutFeedback, View } from "react-native";

import { IMerchandiseTransaction } from "@aptos-scp/scp-types-commerce-transaction";
import {
  IRetailLocation
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import { customerTransactionHistoryStyles} from "./styles";
import {
  formattedAmountFromPosted,
  getDisplayableDate,
  getItemCount,
  getStatusTagInfo
} from "./utilities";
import StatusTag, { STATUS_TAG_NAME_LABEL, StatusType } from "./StatusTag";

export interface Props {
  transaction: IMerchandiseTransaction;
  retailLocations: IRetailLocation[];
  onTransactionSelected: (transaction: IMerchandiseTransaction) => void;
}

const CustomerHistoryTransaction = (props: Props): JSX.Element => {
  const { transaction } = props;
  const itemCount: number = getItemCount(transaction);
  const styles: any = Theme.getStyles(customerTransactionHistoryStyles());
  const taxFreeDocId = transaction.taxFreeFormKey;
  const retailLocation = props.retailLocations && props.retailLocations.find((rl) => rl.retailLocationId === transaction.retailLocationId);
  const { isPickup, isDelivery } = getStatusTagInfo(transaction);
  return (
    <TouchableWithoutFeedback onPress={() => props.onTransactionSelected(transaction)}>
      <View style={styles.transaction}>
        <View style={styles.details}>
          {retailLocation &&
          <View style={[styles.transactionRow, styles.transactionStoreRow]}>
            <Text style={[styles.transactionStore, styles.transactionStoreText]}>
              {`${retailLocation.name} (${retailLocation.retailLocationId})`}
            </Text>
          </View>
          }
          <View style={[styles.transactionRow, styles.transactionRefRow]}>
            <Text style={[styles.transactionRefText]}>
              {transaction.referenceNumber}
            </Text>
          </View>
          <View style={styles.transactionRow}>
            <Text style={styles.attributeText}>
              {getDisplayableDate(transaction.endDateTime, true)}
            </Text>
          </View>
          <View style={styles.transactionRow}>
            <Text style={styles.attributeText}>
              {I18n.t("device")}{`: ${transaction.deviceId}`}
            </Text>
          </View>
          {
            transaction.performingUser &&
            <View style={styles.transactionRow}>
              <Text style={styles.attributeText} numberOfLines={1} ellipsizeMode={"tail"}>
                {`${I18n.t("associate")}: `}{transaction.performingUser.displayName ||
                    `${transaction.performingUser.firstName} ${transaction.performingUser.lastName}`}
              </Text>
            </View>
          }
          {
            taxFreeDocId &&
            <View style={styles.transactionRow}>
              <Text style={styles.attributeText} numberOfLines={1} ellipsizeMode={"tail"}>
                {`${I18n.t("DocId")}: `}{taxFreeDocId}
              </Text>
            </View>
          }
          {
          <View style={styles.transactionRow}>
            <Text style={styles.attributeText}>
              {I18n.t("items")}{`: ${itemCount}`}
            </Text>
            <Text style={styles.attributeText}>
              {formattedAmountFromPosted(transaction.transactionTotal)}
            </Text>
          </View>
          }
          {
            (isPickup || isDelivery)  &&
            <View style={[styles.transactionRow, styles.transactionStoreRow]}>
                {isPickup &&
                  renderStatusTag("Store")
                }
                {isDelivery &&
                  renderStatusTag("DeliveryTruck")
                }
            </View>
          }
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

function renderStatusTag(name: string,
                         iconName?: string,
                         customLabel?: string,
                         customType?: StatusType): React.ReactNode {
  const styles: any = Theme.getStyles(customerTransactionHistoryStyles());
  return (
      <StatusTag
          type={customType || StatusType.Icon}
          name={name}
          labelCode={customLabel ? undefined : STATUS_TAG_NAME_LABEL[name]}
          label={customLabel}
          wrapperStyle={styles.tagCell}
          iconName={iconName}
      />
  );
}

export default CustomerHistoryTransaction;
