import * as React from "react";
import {ScrollView} from "react-native";
import {connect} from "react-redux";

import {
  Associate,
  CustomerOrder,
  TransactionReference
} from "@aptos-scp/scp-types-orders";

import I18n from "../../../config/I18n";
import {AppState} from "../../reducers";
import Theme from "../../styles";
import {DetailHeader, DetailRowAttribute, DefaultBehavior} from "../common/DetailHeader";
import {formatPersonName, getFormattedAssociateName, getFormattedStoreName, inActionMode} from "../common/utilities";
import CustomerOrderFulfillmentGroupDisplay from "../customerOrder/CustomerOrderFulfillmentGroupDisplay";
import {customerOrderDisplayStyles} from "./styles";

interface StateProps {
  uiMode: string;
}

interface Props extends StateProps {
  customerOrder: CustomerOrder;
  preferredLanguage?: string;
}

interface State {
}

class CustomerOrderDisplay extends React.PureComponent<Props, State> {
  private styles: any;
  private testID: string;

  constructor(props: Props) {
    super(props);
    this.testID = "CustomerOrderDisplay";
    this.styles = Theme.getStyles(customerOrderDisplayStyles());
  }

  public render(): JSX.Element {
    return (
      <ScrollView style={this.styles.scroll} horizontal={false}>
        {
          !inActionMode(this.props.uiMode) &&
          this.renderDetailHeader()
        }
        {
          this.props.customerOrder.fulfillmentGroups &&
          this.props.customerOrder.lineItems &&
          <CustomerOrderFulfillmentGroupDisplay
            fulfillmentGroups={this.props.customerOrder.fulfillmentGroups}
            customerOrderItems={this.props.customerOrder.lineItems}
            preferredLanguage={this.props.preferredLanguage}
            orderType={this.props.customerOrder.orderTypeCode}
          />
        }
      </ScrollView>
    );
  }

  private renderDetailHeader(): JSX.Element {
    const orderDetail: DetailRowAttribute[] = [];
    this.getHeaderDetail(orderDetail);
    return (
        <DetailHeader
          topRow={DetailHeader.setDetailRow(
              I18n.t("orderReferenceNumber"),
              this.props.customerOrder.orderRequestId,
              "orderRequestId")}
          rows = {orderDetail}
          testModuleId={this.testID}
          defaultBehavior={DefaultBehavior.expanded}
        />
    );
  }

  private getHeaderDetail(orderDetail: DetailRowAttribute[]): void {
    const transactionReference: TransactionReference = this.props.customerOrder.transactionReference;
    const performingAssociate: Associate = this.props.customerOrder.performingAssociate;
    let storeName: string = "";
    let terminalNumber: string = "";
    let associate: string = "";
    let transactionNumber: string = "";

    if (this.props.customerOrder.customer && this.props.customerOrder.customer.name) {
      orderDetail.push(DetailHeader.setDetailRow(
          I18n.t("customer"),
          formatPersonName(this.props.customerOrder.customer.name),
          "customer"));
    }
    if (this.props.customerOrder.transactionReference &&
        this.props.customerOrder.transactionReference.creationDateTime) {
      orderDetail.push(DetailHeader.setDetailRow(
          I18n.t("transactionDate"),
          this.props.customerOrder.transactionReference.creationDateTime,
          "transactionDate",
          "dateTime"));
    }

    if (transactionReference) {
      if (transactionReference.businessUnit) {
        storeName = getFormattedStoreName(
          transactionReference.businessUnit.name,
          transactionReference.businessUnit.businessUnitId
        );
      }
      terminalNumber = transactionReference.clientDeviceId ? transactionReference.clientDeviceId : "";
      transactionNumber = transactionReference.sequenceNumber ?
          transactionReference.sequenceNumber.toString() : "";
    }

    if (performingAssociate) {
      associate = getFormattedAssociateName(performingAssociate);
    }

    if (storeName.length > 0) {
      orderDetail.push(DetailHeader.setDetailRow(
          I18n.t("storeName"),
          storeName,
          "storeName"));
    }

    if (terminalNumber.length > 0) {
      orderDetail.push(DetailHeader.setDetailRow(
          I18n.t("device"),
          terminalNumber,
          "terminal"));
    }

    if (transactionNumber.length > 0) {
      orderDetail.push(DetailHeader.setDetailRow(
          I18n.t("transaction"),
          transactionNumber,
          "transactionNumber"));
    }

    if (associate.length > 0) {
      orderDetail.push(DetailHeader.setDetailRow(
          I18n.t("associate"),
          associate,
          "associate"));
    }
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    uiMode: state.uiState.mode
  };
};

export default connect(mapStateToProps)(CustomerOrderDisplay);
