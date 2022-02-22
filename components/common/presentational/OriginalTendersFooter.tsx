import * as React from "react";
import { Text, View } from "react-native";

import { Money } from "@aptos-scp/scp-component-business-core";

import Theme from "../../../styles";
import { originalTendersFooterStyles as originalTendersFooterStylesTablet} from "./tablet/styles";
import { originalTendersFooterStyles as originalTendersFooterStylesPhone} from "./phone/styles";
import { StyleGroup } from "../constants";
import I18n from "../../../../config/I18n";
import { IOriginalTender, IOriginalTransactionDetails } from "../../payment/PaymentDevicesUtils";
import { printAmount } from "../utilities";


interface Props {
  style?: any;
  originalTransactions: IOriginalTransactionDetails[];
}

export default class OriginalTendersFooter extends React.PureComponent<Props> {
  private styles: any;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(Theme.isTablet ? originalTendersFooterStylesTablet() : originalTendersFooterStylesPhone());
  }

  public render(): JSX.Element {
    return (
      <View style={[this.styles.root, this.props.style || {}]}>
        { this.props.originalTransactions && this.props.originalTransactions.length > 0 &&
              this.props.originalTransactions.map((originalTransaction) => {
            return (
              <View style={this.styles.section}>
                <View style={this.styles.returnLabelSection}>
                  <Text style={this.styles.tenderText} numberOfLines={1} adjustsFontSizeToFit={true}>
                    {I18n.t("return")}: {originalTransaction.originalTransactionReferenceNumber}
                  </Text>
                </View>
                {this.renderOriginalTransactionTenders(originalTransaction)}
              </View>
            );
          })
        }
      </View>
    );
  }

  private renderOriginalTransactionTenders(originalTransaction: IOriginalTransactionDetails): JSX.Element[] {
    return originalTransaction && originalTransaction.originalTenders && originalTransaction.originalTenders.length > 0 &&
        originalTransaction.originalTenders.map(this.renderOriginalTenderSummary.bind(this));
  }

  private renderOriginalTenderSummary(originalTender: IOriginalTender): JSX.Element {
    const totalRefundedAmount: Money = getTotalRefundedAmount(originalTender);
    return (
      <View>
        { this.renderLabelAndAmount(originalTender.tenderName, originalTender.originalTenderAmount) }
        { totalRefundedAmount && totalRefundedAmount.isPositive() &&
          this.renderLabelAndAmount(I18n.t("refunded"), totalRefundedAmount.times(-1))
        }
      </View>
    );
  }


  private renderLabelAndAmount(
    label: string,
    amount: Money,
    textStyle?: StyleGroup
  ): JSX.Element {
    return (
      <View style={this.styles.labelAndAmountRow}>
        <Text style={[this.styles.labelAndAmountText, textStyle || {}]}>
          {label}
        </Text>
        {
          amount &&
          <Text style={[this.styles.labelAndAmountText, this.styles.amountText, textStyle || {}]}>
            {printAmount(amount)}
          </Text>
        }
      </View>
    );
  }
}

function getTotalRefundedAmount(originalTender: IOriginalTender): Money {
  if (originalTender.previouslyRefundedAmount && originalTender.refundedAmount) {
    return (originalTender.refundedAmount.plus(originalTender.previouslyRefundedAmount));
  }
  return originalTender.refundedAmount;
}
