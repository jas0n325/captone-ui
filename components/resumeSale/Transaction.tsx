import * as _ from "lodash";

import * as React from "react";
import { Alert, Text, TouchableWithoutFeedback, View } from "react-native";

import {
  IItemLine,
  IMerchandiseTransaction as SuspendedTransactions,
  isSuspendTransactionLine,
  ISuspendTransactionLine,
  ITransactionLine,
  LineType
} from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import Theme from "../../styles";
import { formattedAmountFromPosted, getCustomerDisplayText, getDisplayableDate } from "../common/utilities";
import VectorIcon from "../common/VectorIcon";
import { transactionStyles as phoneStyles } from "./phone/styles";
import { transactionStyles as tabletStyles } from "./tablet/styles";

interface StateProps {
}

interface Props extends StateProps {
  transaction: SuspendedTransactions;
  onTransactionChosen: (transaction: SuspendedTransactions) => void;
  loadAllItems: () => void;
}

interface State {
}

interface IDisplayFields {
  transactionNumberField: string;
  referenceNumberField: string;
  totalAmountField: string;
  itemCntField: string;
  cashierNameField: string;
  customerNameField: string;
  customerNameExists: boolean;
  referenceNumberExists: boolean;
  dateTimeField: string;
  terminalNumber: string;
}

class Transaction extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);
    if (Theme.isTablet) {
      this.styles = Theme.getStyles(tabletStyles());
    } else {
      this.styles = Theme.getStyles(phoneStyles());
    }
  }

  public render(): JSX.Element {
    const transaction = this.props.transaction;
    const display = this.extractTransactionAttributes(transaction);

    return (
      <TouchableWithoutFeedback
        onPress={() => this.handleResumeConfirmation(transaction)}
      >
        <View style={this.styles.transaction}>
          <View style={this.styles.details}>
            <View style={this.styles.transactionRow}>
              <Text style={this.styles.transactionText} numberOfLines={1} ellipsizeMode={"tail"}>
                {display.transactionNumberField}
              </Text>
            </View>
            <View style={this.styles.transactionRow}>
              <Text style={this.styles.attributeText}>
                {display.dateTimeField}
              </Text>
              <Text style={this.styles.attributeText} numberOfLines={1} ellipsizeMode={"tail"}>
                {display.totalAmountField}
              </Text>
            </View>
            <View style={this.styles.transactionRow}>
              <Text style={this.styles.attributeText} numberOfLines={1} ellipsizeMode={"tail"}>
                {display.terminalNumber}
              </Text>
              <Text style={this.styles.attributeText} numberOfLines={1} ellipsizeMode={"tail"}>
                {display.itemCntField}
              </Text>
            </View>
            {display.customerNameExists &&
              <React.Fragment>
                <View style={this.styles.transactionRow}>
                  <Text style={this.styles.attributeText} numberOfLines={1} ellipsizeMode={"tail"}>
                    {display.customerNameField}
                  </Text>
                </View>
                <View style={this.styles.transactionRow}>
                  <Text style={this.styles.attributeText} numberOfLines={1} ellipsizeMode={"tail"}>
                    {display.cashierNameField}
                  </Text>
                </View>
              </React.Fragment>
            }
            {!display.customerNameExists &&
              <View style={this.styles.transactionRow}>
                <Text style={this.styles.attributeText} numberOfLines={1} ellipsizeMode={"tail"}>
                  {display.cashierNameField}
                </Text>
              </View>
            }
            {display.referenceNumberExists &&
              <View style={this.styles.transactionRow}>
                <Text style={this.styles.referenceNumberField}>
                  {display.referenceNumberField}
                </Text>
              </View>
            }
          </View>
          <View style={this.styles.arrowArea}>
            <VectorIcon
              stroke={this.styles.svgIcon.color}
              height={this.styles.svgIcon.height}
              width={this.styles.svgIcon.width}
              name="Forward"
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  private extractTransactionAttributes(transaction: SuspendedTransactions): IDisplayFields {
    let transactionNumberField: string = "";
    let customerNameExists: boolean;
    let referenceNumberExists: boolean;
    let referenceNumberField: string = "";
    let totalAmountField: string = "";
    let itemCntField: string = `${I18n.t("items")}: ${0}`;
    let customerNameField: string = "";
    let cashierNameField: string = "";
    let dateTimeField: string = "";
    let terminalNumberField: string = "";

    if (transaction) {
      if (transaction.transactionNumber) {
        transactionNumberField = `${I18n.t("transaction")}: ${transaction.transactionNumber}`;
      }

      const resumeToken: string = _.first(transaction.lines
          .filter((line: ITransactionLine) => line.lineType === LineType.SuspendTransaction &&
              isSuspendTransactionLine(line))
          .map((line: ISuspendTransactionLine) => line.resumeToken));
      if (resumeToken) {
        referenceNumberField = `${I18n.t("refID")}: ${resumeToken}`;
        referenceNumberExists = true;
      }

      if (transaction.transactionTotal) {
        totalAmountField = formattedAmountFromPosted(transaction.transactionTotal);
      }

      let itemCnt: number = 0;
      transaction.lines
          .filter((line: ITransactionLine) => (
              line.lineType === LineType.ItemSale ||
              line.lineType === LineType.ItemReturn ||
              line.lineType === LineType.ItemCancel ||
              line.lineType === LineType.ItemOrder ||
              line.lineType === LineType.ItemFulfillment))
          .map((line: IItemLine) => parseInt(line.quantity.amount, 0))
          .forEach((quantity: number) => {
            itemCnt += quantity;
          });
      itemCntField = `${I18n.t("items")}: ${itemCnt}`;

      if (transaction.customer) {
        customerNameField = getCustomerDisplayText(transaction.customer);
        customerNameExists = true;
      }

      if (transaction.performingUser) {
        cashierNameField = `${I18n.t("cashier")}: ${transaction.performingUser.firstName} ` +
          `${transaction.performingUser.lastName}`;
      }

      if (transaction.startDateTime) {
        dateTimeField = getDisplayableDate(transaction.startDateTime);

      }

      if (transaction.deviceId) {
        terminalNumberField = `${I18n.t("terminal")}: ${transaction.deviceId}`;
      }
    }
    return {
      "transactionNumberField": transactionNumberField,
      "referenceNumberField": referenceNumberField,
      "dateTimeField": dateTimeField,
      "totalAmountField": totalAmountField,
      "itemCntField": itemCntField,
      "cashierNameField": cashierNameField,
      "customerNameField": customerNameField,
      "customerNameExists": customerNameExists,
      "referenceNumberExists": referenceNumberExists,
      "terminalNumber": terminalNumberField
    };
  }

  private handleResumeConfirmation = (transaction: SuspendedTransactions): void => {
    Alert.alert(I18n.t("resumeSuspendedTransactions"), I18n.t("resumeConfirmationMessage"),
      [
        { text: I18n.t("cancel"), style: "cancel" },
        {
          text: I18n.t("resumeTransaction"),
          onPress: () => this.props.onTransactionChosen(transaction)
        }
      ],
      { cancelable: true }
    );
  }
}

export default Transaction;
