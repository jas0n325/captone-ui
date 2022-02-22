import { isEmpty } from "lodash";
import * as React from "react";
import { Text, TouchableWithoutFeedback, View } from "react-native";

import {
  IPaidOperationLine,
  isPaidOperationLine,
  ITenderControlTransaction
} from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import { DataEventType } from "../../actions";
import Theme from "../../styles";
import { formattedAmountFromPosted, getDisplayableDate } from "../common/utilities";
import VectorIcon from "../common/VectorIcon";
import { transactionStyles } from "./styles";

interface StateProps {
}

interface Props extends StateProps {
  dataEventType: DataEventType;
  transaction: ITenderControlTransaction;
  onTransactionChosen: (transaction: ITenderControlTransaction, dataEventType: DataEventType) => void;
}

interface State {}

interface IDisplayFields {
  transactionNumberField: string;
  dateTimeField: string;
  reasonField: string;
  paidAmountField: string;
}

class Transaction extends React.Component<Props, State> {
  private styles: any;

  public constructor(props: Props) {
    super(props);
    this.styles = Theme.getStyles(transactionStyles());
  }

  public render(): JSX.Element {
    const transaction = this.props.transaction;
    const dataEventType = this.props.dataEventType;
    const display = Transaction.extractTransactionAttributes(transaction);

    return (
        <TouchableWithoutFeedback
            onPress={() => this.props.onTransactionChosen(transaction, dataEventType)}
        >
          <View style={this.styles.transaction}>
            <View style={this.styles.details}>
              {
                !isEmpty(display.transactionNumberField) &&
                <View style={this.styles.transactionRow}>
                  <Text style={this.styles.transactionText} numberOfLines={1} ellipsizeMode={"tail"}>
                    {display.transactionNumberField}
                  </Text>
                </View>
              }
              {
                !isEmpty(display.dateTimeField) &&
                <View style={this.styles.transactionRow}>
                  <Text style={this.styles.attributeText}>
                    {display.dateTimeField}
                  </Text>
                </View>
              }
              {
                !isEmpty(display.reasonField) &&
                <View style={this.styles.transactionRow}>
                  <Text style={this.styles.attributeText}>
                    {display.reasonField}
                  </Text>
                </View>
              }
              {
                !isEmpty(display.paidAmountField) &&
                <View style={this.styles.transactionRow}>
                  <Text style={this.styles.attributeText}>
                    {display.paidAmountField}
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

  private static extractTransactionAttributes(transaction: ITenderControlTransaction): IDisplayFields {
    let transactionNumberField: string = "";
    let dateTimeField: string = "";
    let reasonField: string = "";
    let paidAmountField: string = "";

    if (transaction) {
      if (transaction.transactionNumber) {
        transactionNumberField = `${transaction.transactionNumber}`;
      }

      if (transaction.startDateTime) {
        dateTimeField = `${I18n.t("dateHeader")}: ${getDisplayableDate(transaction.startDateTime)}`;
      }

      const paidOutLine: IPaidOperationLine = transaction.lines.find(isPaidOperationLine);
      if (paidOutLine) {
        reasonField = paidOutLine.paidReason && paidOutLine.paidReason.reasonDescription &&
            `${I18n.t("reasonCode")}: ${paidOutLine.paidReason.reasonDescription}`;
        paidAmountField = paidOutLine.paidAmount &&
            `${I18n.t("paidOut")}: ${formattedAmountFromPosted(paidOutLine.paidAmount)}`;
      }
    }
    return {
      transactionNumberField,
      dateTimeField,
      reasonField,
      paidAmountField
    };
  }
}

export default Transaction;
