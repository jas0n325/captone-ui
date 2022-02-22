import * as React from "react";
import { FlatList, ScrollView, Text, View } from "react-native";

import { IMoney, Money } from "@aptos-scp/scp-component-business-core";
import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import { FormattedAmountSuffix, FulfillmentGroup, Order } from "@aptos-scp/scp-component-store-selling-features";

import {
  FulfillmentType,
  IItemLine,
  IItemPriceChangeLine,
  IMerchandiseTransaction,
  IOrderReferenceLine,
  IPricingAdjustment,
  isItemLine,
  isItemPriceChangeLine,
  isMerchandiseTransaction,
  isOrderReferenceLine,
  ITenderLine,
  ITransactionLine,
  LineType,
  OrderType,
  TenderAdjustmentType
} from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import StatusTag, { STATUS_TAG_NAME_LABEL, StatusType } from "../common/StatusTag";
import Theme from "../../styles";
import {
  formattedAmountFromPosted,
  getDisplayableDate,
  getFormattedAssociateName,
  getFormattedStoreName,
  getItemCount,
  getPricingAdjustmentLabel,
  getTransactionLines,
  isItemFulfillmentType,
  printAmount
} from "../common/utilities";
import { transactionDisplayStyles } from "./styles";
import { DefaultBehavior, DetailHeader, DetailRowAttribute } from "../common/DetailHeader";

interface Props {
  checkIsTendered: (line: ITransactionLine) => line is ITenderLine;
  checkIsTenderChange: (line: ITransactionLine) => line is ITenderLine;
  checkIsTenderAdjustment: (line: ITransactionLine) => line is ITenderLine;
  transaction: IMerchandiseTransaction;
  displayRoundingAdjustment: boolean;
  displayReturnValue: boolean;
  configManager: IConfigurationManager;
  handleScroll?: any;
}

interface State {
}

export default class TransactionDisplay extends React.Component<Props, State> {
  private testID: string;
  private styles: any;
  private transactionLines: (IItemLine | ITenderLine)[];

  constructor(props: Props) {
    super(props);

    this.testID = "TransactionDisplay";
    this.styles = Theme.getStyles(transactionDisplayStyles());
    this.transactionLines = getTransactionLines(this.props.transaction);
  }

  public render(): JSX.Element {
    let displayTenderLines: boolean = true;

    if (this.isPickupFulfillment() && !this.isPickupReservationOrderFulfillment()) {
      displayTenderLines = false;
    }

    return (
      <ScrollView style={this.styles.scroll} horizontal={false}>
        {this.renderDetailHeader()}
        {this.renderItemList()}
        {this.renderTotals()}
        {displayTenderLines  && this.renderTenderLines()}
        {this.transactionLines && this.transactionLines.find(this.props.checkIsTenderChange) && this.renderTenderChangeLines()}
      </ScrollView>
    );
  }

  private static lineHasValidAdjustments(line: IItemLine): boolean {

    if (line.pricingAdjustments && line.pricingAdjustments.length > 0) {
      let transactionDiscounts: number = 0;
      for (const pricingAdjustment of line.pricingAdjustments) {
        if (pricingAdjustment.adjustmentScope === "Transaction") {
          transactionDiscounts++;
        }
      }
      return transactionDiscounts === 0 ||
          (transactionDiscounts > 0 && line.pricingAdjustments.length > transactionDiscounts);
    } else {
      return false;
    }
  }

  private static getTenderDescriptionText(line: ITenderLine): string {
    let tenderNameText: string = I18n.t(line.tenderName.toLowerCase(),
        { defaultValue: line.tenderName }).toUpperCase();

    if (line.tenderDetails && line.tenderDetails.cardNumber) {
      const shortenedCardNumber: string = "..." + line.tenderDetails.cardNumber.substring(
          line.tenderDetails.cardNumber.length - 4,
          line.tenderDetails.cardNumber.length
      );
      tenderNameText = `${tenderNameText} (${shortenedCardNumber})`;
    }

    return tenderNameText;
  }

  private renderDetailHeader(): JSX.Element {
    const salesDetail: DetailRowAttribute[] = [];
    this.getHeaderDetail(salesDetail);
    return (
        <DetailHeader
            topRow={DetailHeader.setDetailRow(
                I18n.t("transaction"),
                this.props.transaction.transactionNumber.toString(),
                "transaction")}
            rows = {salesDetail}
            testModuleId={this.testID}
            defaultBehavior={DefaultBehavior.expanded}
        />
    );
  }

  private getHeaderDetail(salesDetail: DetailRowAttribute[]): void {
    const { transaction } = this.props;
    const customer = transaction.customer;
    let storeName: string = "";
    let associate: string = "";
    const taxFreeDocId = transaction.taxFreeFormKey;

    if (customer) {
      if (customer.firstName && customer.lastName) {
        salesDetail.push(DetailHeader.setDetailRow(
            I18n.t("customerName"),
            customer.firstName + " " + customer.lastName,
            "customerName"));
      } else {
        salesDetail.push(DetailHeader.setDetailRow(
            I18n.t("customer"),
            customer.customerNumber,
            "customer"));
      }
    }

    salesDetail.push(DetailHeader.setDetailRow(
        I18n.t("transactionDate"),
        getDisplayableDate(transaction.endDateTime),
        "transactionDate"));

    storeName = getFormattedStoreName(transaction.storeName, transaction.retailLocationId);
    if (storeName.length > 0) {
      salesDetail.push(DetailHeader.setDetailRow(
          I18n.t("storeName"),
          storeName,
          "storeName"));
    }

    salesDetail.push(DetailHeader.setDetailRow(
        I18n.t("device"),
        transaction.deviceId,
        "terminal"));

    associate = getFormattedAssociateName(transaction.performingUser);
    if (associate.length > 0) {
      salesDetail.push(DetailHeader.setDetailRow(
          I18n.t("associate"),
          associate,
          "associate"));
    }

    if (taxFreeDocId) {
      salesDetail.push(DetailHeader.setDetailRow(
          I18n.t("taxDocumentId"),
          taxFreeDocId,
          "taxDocumentId"));
    }
  }

  private renderItemList(): JSX.Element {
    const totalItems: number = getItemCount(this.props.transaction);
    return (
      <FlatList
        data={this.transactionLines?.filter((line) => isItemLine(line) &&
          line.lineType !== LineType.ItemFulfillment)}
        keyExtractor={(item) => item.lineNumber.toString()}
        renderItem={({ item }) => this.renderItemRow(item as IItemLine)}
        ListHeaderComponent={this.renderSectionHeader(totalItems.toString() + " " +
          `${totalItems > 1 ? I18n.t("items").toUpperCase() : I18n.t("item").toUpperCase()}`)}
      />
    );
  }

  private renderItemRow(line: IItemLine): JSX.Element {
    const hasAdjustments: boolean = TransactionDisplay.lineHasValidAdjustments(line);
    const adjustedUnitPrice: string = hasAdjustments ? formattedAmountFromPosted(
        line.lineType === LineType.ItemReturn ? Money.fromIMoney(line.originalUnitPrice).times(-1).toIMoney() :
            line.originalUnitPrice) : undefined;
    const extendedAmount: IMoney = line.extendedPresentationAmount ? line.extendedPresentationAmount :
        line.extendedAmount;
    const returnExtendedAmount: IMoney = line.extendedPresentationAmount ? line.extendedAmount : undefined;
    const amount: string = formattedAmountFromPosted(extendedAmount);
    const unitPrice: string = extendedAmount && formattedAmountFromPosted(Money.fromIMoney(extendedAmount)
            .div(Number(line.quantity.amount)).toIMoney());
    const returnUnitPrice: string = returnExtendedAmount && formattedAmountFromPosted(Money
        .fromIMoney(returnExtendedAmount).div(Number(line.quantity.amount)).toIMoney());

    const priceOverrideLines: IItemPriceChangeLine[] = line.unitPriceBeforePriceOverride &&
        this.props.transaction.lines.filter((overrideLine: ITransactionLine) =>
          isItemPriceChangeLine(overrideLine) && overrideLine.changeLineNumber === line.lineNumber) as IItemPriceChangeLine[];
    const overridePrice: string = priceOverrideLines && formattedAmountFromPosted(priceOverrideLines.pop().unitPrice);

    const lookupKey = this.getLookupKey(line);

    let isPickup: boolean = false;
    let isDelivery: boolean = false;
    if (isMerchandiseTransaction(this.props.transaction)) {
      const fulfillmentGroup = this.getFulfillmentGroup(line);
      isPickup = this.displayPickupIcon(fulfillmentGroup);
      isDelivery = isItemFulfillmentType(fulfillmentGroup, FulfillmentType.shipToCustomer);
    }

    return (
      <View style={this.styles.descriptionCell}>
        {(line.itemShortDescription !== undefined && line.itemShortDescription.trim().length > 0) &&
          <View style={this.styles.descriptionCellLine}>
            <Text style={[this.styles.fill, this.styles.itemDescriptionText]} numberOfLines={1} ellipsizeMode={"tail"}>
              {line.itemShortDescription}
            </Text>
          </View>
        }
        <View style={this.styles.descriptionCellLine}>
          <Text style={this.styles.itemDetailsText}>
            {lookupKey}
          </Text>
          <Text style={[this.styles.fill, this.styles.itemQuantityText]}>
            {`${I18n.t("quantityAbbreviation")}: `}{line.quantity.amount}
          </Text>
        </View>
        <View style={[this.styles.descriptionCellLine, this.styles.amountCell]}>
          <Text style={[this.styles.itemAmountCell, this.styles.itemDetailsText, this.styles.tar]}>
            {overridePrice ? overridePrice :
              hasAdjustments ? adjustedUnitPrice : unitPrice }
          </Text>
        </View>
        {hasAdjustments && this.getPriceAdjustments(line, unitPrice, returnUnitPrice)}
        {!!line.taxOverride && this.getTaxOverrideWithExtendedAmount(line, amount)}
        {(isPickup || isDelivery) &&
        <View style={this.styles.tagLine}>
          { isPickup && this.renderStatusTag("Store") }
          { isDelivery && this.renderStatusTag("DeliveryTruck") }
        </View>
        }
      </View>
    );
  }

  private displayPickupIcon(fulfillmentGroup: FulfillmentGroup): boolean {
    return isItemFulfillmentType(fulfillmentGroup, FulfillmentType.shipToStore) &&
           !this.isPickupReservationOrderFulfillment()
  }

  private getLookupKey(line: IItemLine): string {
    const functionalBehaviorValues = this.props.configManager.getFunctionalBehaviorValues();
    const preferredDisplayKeyOrder = functionalBehaviorValues?.itemDisplayBehaviors?.preferredDisplayKeyOrder;
    if (preferredDisplayKeyOrder) {
      for (const displayKey of preferredDisplayKeyOrder) {
        if (displayKey === "EnteredItemKey"){
          return `${I18n.t(line.enteredLookupKey.keyType.toLowerCase())}: ${line.enteredLookupKey.value}`;
        } else {
          const lookupResult = line.itemLookupKeys && line.itemLookupKeys.find((value) => value.keyType === displayKey);
          if (lookupResult) {
            return `${I18n.t(lookupResult.keyType.toLowerCase())}: ${lookupResult.value}`;
          }
        }
      }
    }
    // if preferredDisplayKeyOrder config is not set, return enteredLookupKey
    return `${I18n.t(line.enteredLookupKey.keyType.toLowerCase())}: ${line.enteredLookupKey.value}`;
  }

  private getFulfillmentGroup(line: IItemLine): FulfillmentGroup {
    let order: Order = this.props.transaction.order as Order;

    if (this.isPickupFulfillment() || this.hasCanceledItems()) {
      const orderRererenceLine = this.props.transaction.lines.find((transactionLine: ITransactionLine) =>
        transactionLine.lineType === LineType.OrderReference) as IOrderReferenceLine;
      order = orderRererenceLine.orderReference.order as Order;
    }

    const fulfillmentGroup: FulfillmentGroup = order &&
        Order.getFulfillmentGroupById(order, line && line.fulfillmentGroupId);
    return fulfillmentGroup;
  }

  private renderStatusTag(name: string): React.ReactNode {
    return (
      <StatusTag
        type={StatusType.Icon}
        name={name}
        labelCode={STATUS_TAG_NAME_LABEL[name]}
        wrapperStyle={this.styles.tagCell}
      />
    );
  }

  private getPriceAdjustments(itemLine: IItemLine, unitPrice: string, returnUnitPrice: string): JSX.Element {
    return (
      <View style={this.styles.discountCellLine}>
        {itemLine.pricingAdjustments.map((pricingAdjustment: IPricingAdjustment) => {
          if (pricingAdjustment.adjustmentScope !== "Transaction") {
            const adjustmentAmount = formattedAmountFromPosted(Money.fromIMoney(
                pricingAdjustment.presentation? pricingAdjustment.presentation.lineAdjustment :
                    pricingAdjustment.lineAdjustment).div(Number(itemLine.quantity.amount)).toIMoney());

            return (
                <View style={this.styles.descriptionCellLine}>
                  <Text style={[this.styles.fill, this.styles.itemDetailsText, this.styles.discountText]}>
                    { getPricingAdjustmentLabel(pricingAdjustment, this.props.transaction) }
                  </Text>
                  <Text style={[this.styles.itemDetailsText]}>
                    {adjustmentAmount}
                  </Text>
                </View>
            );
          }
        })}
        {this.props.displayReturnValue && itemLine.lineType !== LineType.ItemReturn && returnUnitPrice &&
        <View style={this.styles.descriptionCellLine}>
          <View style={this.styles.itemReturnPrice}>
            <Text style={this.styles.itemReturnPriceText}>
              {I18n.t("returnPrice")}: {returnUnitPrice}
            </Text>
          </View>
        </View>
        }
        <View style={[this.styles.descriptionCellLine, this.styles.amountCell]}>
          <Text style={[this.styles.itemAmountCell, this.styles.itemDetailsText, this.styles.discountText,
            this.styles.tar]}>{unitPrice}</Text>
        </View>
      </View>
    );
  }

  private renderTotals(): JSX.Element {
    const tenderTransferFromAccountLine: ITenderLine = this.props.transaction.lines.find((transactionLine: ITransactionLine) =>
        transactionLine.lineType === LineType.TenderTransferFromAccount) as ITenderLine;

    return (
      <View>
        {this.renderSectionHeader(I18n.t("totals").toUpperCase())}
        <View style={this.styles.row}>
          <Text style={this.styles.descriptionText}>{I18n.t("subTotal").toUpperCase()}</Text>
          <Text style={this.styles.amountText}>
            {formattedAmountFromPosted(this.props.transaction.transactionSubTotal)}
          </Text>
        </View>
        <View style={this.styles.row}>
          <Text style={this.styles.descriptionText}>{I18n.t("totalTaxCaps")}</Text>
          <Text style={this.styles.amountText}>
            {formattedAmountFromPosted(this.props.transaction.transactionTax)}
          </Text>
        </View>
        <View style={this.styles.row}>
          <Text style={this.styles.descriptionText}>{I18n.t("feeCaps")}</Text>
          <Text style={this.styles.amountText}>
            {formattedAmountFromPosted(this.props.transaction.transactionTotalFee)}
          </Text>
        </View>
        <View style={this.styles.row}>
          <Text style={this.styles.descriptionText}>{I18n.t("discounts").toUpperCase()}</Text>
          <Text style={this.styles.amountText}>
            {formattedAmountFromPosted(this.props.transaction.transactionTotalSavings)}
          </Text>
        </View>
        {(this.isPickupFulfillment() && tenderTransferFromAccountLine) &&
        <View style={this.styles.row}>
          <Text style={this.styles.descriptionText}>{I18n.t("previouslyPaid").toUpperCase()}</Text>
          <Text style={this.styles.amountText}>
            {formattedAmountFromPosted(new Money(tenderTransferFromAccountLine.tenderAmount.amount,
              tenderTransferFromAccountLine.tenderAmount.currency))}
          </Text>
        </View>
        }
        { this.hasDonation() &&
          <View style={this.styles.row}>
            <Text style={this.styles.descriptionText}>{I18n.t("donation").toUpperCase()}</Text>
            <Text style={this.styles.amountText}>
              {formattedAmountFromPosted(this.props.transaction.transactionTotalDonations)}
            </Text>
          </View>
        }
        <View style={this.styles.row}>
          <Text style={this.styles.descriptionText}>{I18n.t("receiptTotal").toUpperCase()}</Text>
          <Text style={this.styles.amountText}>
            {formattedAmountFromPosted(this.props.transaction.transactionTotal)}
          </Text>
        </View>
        {this.renderTenderAdjustmentLine()}
        <View style={this.styles.row}>
          <Text style={this.styles.descriptionText}>{I18n.t("totalTenderedCaps")}</Text>
          <Text style={this.styles.amountText}>
            {formattedAmountFromPosted(this.props.transaction.transactionTotalTendered)}
          </Text>
        </View>
      </View>
    );
  }

  private renderTenderLines(): JSX.Element {
    const tenderData = this.transactionLines?.filter(this.props.checkIsTendered);
    return tenderData && tenderData.length > 0 && (
      <FlatList
        data={tenderData}
        keyExtractor={(item) => item.lineNumber.toString()}
        renderItem={({ item }) => this.renderTenderRow(item)}
        ListHeaderComponent={this.renderSectionHeader(I18n.t("tenderLine"))}
      />
    );
  }

  private renderTenderChangeLines(): JSX.Element {
    const tenderChangeData = this.transactionLines?.filter(this.props.checkIsTenderChange);
    return tenderChangeData && tenderChangeData.length > 0 && (
      <FlatList
        data={tenderChangeData}
        keyExtractor={(item) => item.lineNumber.toString()}
        renderItem={({ item }) => this.renderTenderRow(item)}
        ListHeaderComponent={this.renderSectionHeader(I18n.t("changeLine"))}
      />
    );
  }

  private renderTenderAdjustmentLine(): JSX.Element {
    const adjustmentLine = this.transactionLines?.filter(this.props.checkIsTenderAdjustment);
    if (this.props.displayRoundingAdjustment && adjustmentLine && adjustmentLine.length > 0) {
      const line: ITenderLine = adjustmentLine.find((tempLine) => tempLine.adjustmentType
        === TenderAdjustmentType.DenominationRounding);
      if (line) {
        return (
          <View style={this.styles.row}>
            <Text style={this.styles.descriptionText}>{I18n.t("roundingAdjustmentCaps")}</Text>
            <Text style={this.styles.amountText}>
              {formattedAmountFromPosted(line.tenderAmount)}
            </Text>
          </View>
        );
      }
    }
  }

  private renderTenderRow(line: ITenderLine): JSX.Element {
    const tenderAmount = line.lineType === LineType.TenderRefund ? `(${formattedAmountFromPosted(line.tenderAmount)})` :
        formattedAmountFromPosted(line.tenderAmount);
    return (
      <>
        <View style={this.styles.row}>
          <Text style={this.styles.descriptionText}>
            { TransactionDisplay.getTenderDescriptionText(line) }
          </Text>
          <Text style={this.styles.amountText}>
            { tenderAmount }
          </Text>
        </View>
        {
          line.foreignTenderAmount &&
          <View style={this.styles.row}>
            <Text style={this.styles.foreignDescriptionText}>
              { `${formattedAmountFromPosted(line.foreignTenderAmount)}`}
            </Text>
          </View>
        }
      </>
    );
  }

  private hasCanceledItems(): boolean {
    const cancelledOrderItems = this.props.transaction.lines.filter((x) =>
      x.lineType === LineType.ItemCancel);
    return cancelledOrderItems && cancelledOrderItems.length > 0;
  }

  private renderSectionHeader(textForHeader: string): JSX.Element {
    return (
      <View style={this.styles.listHeader}>
        <Text style={this.styles.listHeaderText}>{textForHeader}</Text>
      </View>
    );
  }

  private isPickupFulfillment(): boolean {
    const saleItems = this.props.transaction.lines.filter((x) => x.lineType === LineType.ItemSale);
    let fulfillmentLine: ITransactionLine;
    if (saleItems) {
      fulfillmentLine = this.props.transaction.lines.find((transactionLine: ITransactionLine) =>
        transactionLine.lineType === LineType.ItemFulfillment) as ITransactionLine;
    }
    return !!fulfillmentLine;
  }

  private isPickupReservationOrderFulfillment(): boolean {
    const saleItems = this.props.transaction.lines.filter((x) => x.lineType === LineType.ItemSale);
    const orderReferenceLines = this.props.transaction.lines.find(isOrderReferenceLine);

    if (orderReferenceLines?.orderReference?.order?.orderType &&
      orderReferenceLines.orderReference.order.orderType === OrderType.Reservation &&
      !!saleItems &&
      this.containsItemFulfillmentLine()) {
      return true;
    }

    return false;
  }

  private containsItemFulfillmentLine(): boolean {
    const fulfillmentLine = this.props.transaction.lines.find((line) => line.lineType === LineType.ItemFulfillment);
    return !!fulfillmentLine;
  }

  private hasDonation(): boolean {
    return this.props.transaction.transactionTotalDonations &&
        Money.fromIMoney(this.props.transaction.transactionTotalDonations).isNotZero();
  }

  private getTaxOverrideWithExtendedAmount(line: IItemLine,
                                           extendedAmountExcludingTransactionDiscounts: string): JSX.Element {
    const label = I18n.t("taxOverrideRate", { taxRate: line.taxOverride.taxRate });
    const totalLineTax = Money.fromIMoney(line.extendedAmountIncludingTax)
      .minus(Money.fromIMoney(line.extendedAmountExcludingTax));
    const taxAmount = printAmount(totalLineTax);

    return (
      <View style={this.styles.taxOverrideLine}>
        <View style={[this.styles.leftColumn, this.styles.taxOverrideColumnAlign]}>
          <View style={this.styles.textCell}>
            <Text style={[this.styles.itemDetailsText, this.styles.discountText]}
                  numberOfLines={1}
                  ellipsizeMode={"middle"}>
              {label}
            </Text>
          </View>
          <View style={this.styles.amountCell}>
            <Text style={[this.styles.itemDetailsText]}>
              {taxAmount}
            </Text>
          </View>
        </View>
        <View style={this.styles.rightColumn}>
          <Text style={[this.styles.itemPriceText]}>
            {extendedAmountExcludingTransactionDiscounts} {I18n.t("taxOverrideSuffix", { defaultValue: FormattedAmountSuffix.TAX_OVERRIDE })}
          </Text>
        </View>
      </View>
    );
  }
}
