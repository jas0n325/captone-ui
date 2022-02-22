import * as React from "react";
import { Image, InteractionManager, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Menu, { MenuItem } from "react-native-material-menu";
import * as _ from "lodash";

import { Money } from "@aptos-scp/scp-component-business-core";
import {
  Coupon,
  Customer,
  IDisplayInfo,
  IItemDisplayLine,
  ILoyaltyMembershipActivity,
  ITenderDisplayLine,
  MERCHANDISE_TRANSACTION_TYPE,
  Order,
  ReceiptCategory,
  ReceiptState,
  TenderAdjustmentType,
  TenderAuthCategory,
  TENDER_EXCHANGE_OUT_LINE_TYPE
} from "@aptos-scp/scp-component-store-selling-features";
import { FulfillmentType, LineType } from "@aptos-scp/scp-types-commerce-transaction";
import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";

import I18n from "../../../../config/I18n";
import Theme from "../../../styles";
import LoyaltyMembershipList from "../../common/LoyaltyMembershipList";
import TenderLineList from "../../common/TenderLineList";
import { printAmount, updateScroll } from "../../common/utilities";
import { getItemAttributesOrder } from "../../common/utilities/productInquiry";
import UnusedCouponsScreen from "../../discounts/UnusedCouponsScreen";
import ChangeDueChoice from "../receiptFlow/ChangeDueChoice";
import ReceiptOptionForm from "../ReceiptOptionForm";
import { receiptSummaryScreenStyle } from "./styles";
import VectorIcon from "../../common/VectorIcon";
import { getDisplayLoyaltyBalancesWithoutRTP } from "../../customer/CustomerUtilities";
import { NavigationProp } from "../../StackNavigatorParams";
import FeeLineList from "../../common/FeeLineList";
import OfflineNotice from "../../common/OfflineNotice";

interface Props {
  appLogo: any;
  currency: string;
  displayInfo: IDisplayInfo;
  hasDonations: boolean;
  displayRoundingAdjustment: boolean;
  itemAttributesOrder: Set<string>;
  loyaltyActivities: ILoyaltyMembershipActivity[];
  promptForCustomerAfterTransactionReceipts: boolean;
  receiptCategory: ReceiptCategory;
  renderUnusedCoupons: boolean;
  retailLocationLocale: string;
  shouldPromptAdditionalDestinations: boolean;
  stateValues: Map<string, any>;
  taxFreeEnabled: boolean;
  unusedCouponPrompt: string;
  unusedCoupons: Coupon[];
  configuration: IConfigurationManager;
  handleAddCustomerOnChangeDueScreen: () => void;
  handleContinueOnChangeDueScreen: () => void;
  handleTaxFree: () => void;
  onClose: () => void;
  onCloseUnusedCoupons: () => void;
  promptForCustomer: () => void;
  navigation: NavigationProp;
}

interface State {
  closedChangeDueScreen: boolean;
  isScrolling: boolean;
}

export default class ReceiptSummary extends React.Component<Props, State> {
  private styles: any;
  private menu: any;
  private displayLoyaltyBalancesWithoutRTP: boolean;
  private customer: Customer;

  constructor(props: Props) {
    super(props);

    this.state = {
      closedChangeDueScreen: false,
      isScrolling: false
    };

    this.styles = Theme.getStyles(receiptSummaryScreenStyle());

    this.customer = this.props.stateValues.get("transaction.customer");
    this.displayLoyaltyBalancesWithoutRTP = getDisplayLoyaltyBalancesWithoutRTP(props.configuration, this.customer);
  }

  public render(): JSX.Element {
    const customer: Customer = this.props.stateValues.get("transaction.customer");

    const changeDueAsMoney = this.determineChangeDue();

    const showAddCustomerButton = !this.props.stateValues.get("ReceiptSession.printingFailed") &&
        !this.props.stateValues.get("transaction.customer");

    const tenderLines = this.props.displayInfo.tenderDisplayLines.filter((value) =>
        (value.lineType !== LineType.TenderChange || value.tenderAuthCategory !== TenderAuthCategory.None) &&
         value.lineType !==  LineType.TenderAdjustment);
    return (
      <View style={this.styles.root}>
        <View style={this.styles.leftPanel}>
          <View style={this.styles.header}>
            <Image source={this.props.appLogo} style={this.styles.headerLogo} resizeMode="contain" />
          </View>
          <View style={this.styles.transaction}>
            <View style={this.styles.transactionLeft}>
              <Text style={[this.styles.transactionTextTitle, this.styles.tal]}>{I18n.t("transaction")}</Text>
              <Text style={[this.styles.transactionTextValue, this.styles.tal]}>
                {this.props.stateValues.get("transaction.number")}
              </Text>
            </View>
            <View style={this.styles.transactionRight}>
              {customer &&
              <View style={this.styles.transactionPanel}>
                <Text style={[this.styles.transactionTextTitle, this.styles.tar]}>{I18n.t("customerName")}</Text>
                <Text style={[this.styles.transactionTextValue, this.styles.tar]}>{customer.fullName}</Text>
              </View>
              }
            </View>
          </View>
          <OfflineNotice isScrolling={this.state.isScrolling}/>
          <ScrollView onScrollEndDrag={this.handleScroll.bind(this)}
           style={this.styles.fill}>
            { this.props.stateValues.get("transaction.type") === MERCHANDISE_TRANSACTION_TYPE &&
            <View style={this.styles.detailsArea}>
              {this.renderDetailsTitleArea()}
              {this.renderDetailsValueArea()}
            </View>
            }
            <View style={this.styles.bottomSection}>
              {this.props.displayInfo.transactionFeeDisplayLines &&
                <FeeLineList
                  feeDisplayLines={this.props.displayInfo.transactionFeeDisplayLines}
                />
              }
              <TenderLineList
                  allowTenderVoid={false}
                  preventScroll={true}
                  tenderDisplayLines={tenderLines}
              />
              { this.customer?.loyaltyMemberships && ((this.props.loyaltyActivities && this.props.loyaltyActivities.length > 0)
                  || this.displayLoyaltyBalancesWithoutRTP) &&
                <LoyaltyMembershipList
                    estimated={false}
                    preventScroll={true}
                    loyaltyActivities={this.props.loyaltyActivities}
                    configuration={this.props.configuration}
                    loyaltyMemberships={this.customer && this.customer.loyaltyMemberships}
                    displayLoyaltyBalancesWithoutRTP={this.displayLoyaltyBalancesWithoutRTP}
                />
              }
               { this.props.stateValues.get("transaction.type") === MERCHANDISE_TRANSACTION_TYPE &&
              <View style={this.styles.transactionArea}>
                <View style={[this.styles.subtitleArea, this.styles.itemsTitle]}>
                  <Text style={this.styles.subtitleText}>{I18n.t("itemsCaps")}</Text>
                </View>
                {this.props.displayInfo.itemDisplayLines.map((item) => {
                  const unitPrice: string = printAmount(item.unitPrice.amount);
                  // There should always be an extendedAmount.
                  const extendedAmount: string = printAmount(item.extendedAmount);
                  const itemIdKeyType = item.itemIdKeyType.toLowerCase();

                  const itemAttributesDisplayOrder = (this.props.itemAttributesOrder)
                      ? [...this.props.itemAttributesOrder] : [];
                  return (
                      <View style={this.styles.itemLine}>
                        <View style={this.styles.itemLineValue}>
                          <Text style={this.styles.itemDescriptionText} ellipsizeMode={"middle"} numberOfLines={1}>
                            {item.itemShortDescription}
                          </Text>
                        </View>
                        <View style={this.styles.itemLineValue}>
                          <Text style={this.styles.itemText} ellipsizeMode={"middle"} numberOfLines={1}>
                            {I18n.t(itemIdKeyType, {defaultValue: itemIdKeyType})}: {item.itemIdKey}
                          </Text>
                          <Text style={this.styles.itemAmount}>
                            {`${I18n.t("quantityAbbreviation")}: `}{item.quantity}
                          </Text>
                        </View>
                        <View style={this.styles.itemLineValue}>
                          <View>
                            {(item.itemAdditionalDescription !== undefined &&
                                item.itemAdditionalDescription.trim().length > 0) &&
                            <Text style={this.styles.itemText} numberOfLines={1} ellipsizeMode={"tail"}>
                              {item.itemAdditionalDescription}
                            </Text>
                            }
                            {itemAttributesDisplayOrder.length > 0 &&
                            itemAttributesDisplayOrder.map((attribute: string) =>
                                this.getItemAttributes(attribute, item, this.styles.itemText)
                            )
                            }
                            {(item.annotationDescription !== undefined &&
                                item.annotationDescription.trim().length > 0) &&
                            <Text style={this.styles.itemText} numberOfLines={1} ellipsizeMode={"tail"}>
                              {item.annotationDescription}
                            </Text>
                            }
                          </View>
                          <View style={this.styles.detailsRightSide}>
                            <Text style={this.styles.itemText}>
                              {unitPrice}
                            </Text>
                            <Text style={this.styles.itemAmount}>{extendedAmount}</Text>
                          </View>
                        </View>
                      </View>
                  );
                })}
              </View>
              }
            </View>
          </ScrollView>
        </View>
        <View style={this.styles.rightPanel}>
          <View style={this.styles.fill}>
            <View style={this.styles.titleArea}>
              <View style={this.styles.buttonArea}>
                <View style={this.styles.rightButton}>
                  { this.getRightButton() }
                </View>
              </View>
              <Text style={this.styles.titleText}>
                {I18n.t(!this.props.renderUnusedCoupons ? "receipt" : "unusedCoupons")}
              </Text>
            </View>
            {!this.props.renderUnusedCoupons &&
            <View>
              <View style={this.styles.changeDueArea}>
                <Text style={this.styles.changeDueTitle}>
                  {this.props.stateValues.get("transaction.isTenderExchangeTransaction") ? I18n.t("amountDue") : I18n.t("changeDueCaps")}
                </Text>
                <Text style={this.styles.changeDueAmount}>
                  {changeDueAsMoney}
                </Text>
              </View>
              <View style={this.styles.receiptMethodContainer}>
                <View style={this.styles.receiptArea}>
                  {!this.shouldDisplayChangeDueScreen() &&
                    <ReceiptOptionForm
                      styles={this.styles.receiptOptions}
                      customer={customer}
                      providedReceiptCategory={this.props.receiptCategory}
                      handlePromptForCustomerLogic={this.props.promptForCustomer}
                      onClose={this.props.onClose}
                      shouldPromptAdditionalDestinations={this.props.shouldPromptAdditionalDestinations}
                      navigation={this.props.navigation}
                    />
                  }
                  {this.shouldDisplayChangeDueScreen() &&
                    <ChangeDueChoice
                      handleAddCustomerOnChangeDueScreen={this.handleAddCustomerOnChangeDueScreen.bind(this)}
                      handleContinueOnChangeDueScreen={this.handleContinueOnChangeDueScreen.bind(this)}
                      showAddCustomerButton={showAddCustomerButton}
                    />
                  }
                </View>
              </View>
            </View>
            }
            {this.props.renderUnusedCoupons &&
            <UnusedCouponsScreen
                onCloseScreen={this.props.onCloseUnusedCoupons}
                promptText={this.props.unusedCouponPrompt || I18n.t("unusedCouponsExplanation")}
                unusedCoupons={this.props.unusedCoupons}
            />
            }
          </View>
        </View>
      </View>
    );
  }

  private renderDetailsTitleArea(): JSX.Element {
    const tenderAdjustmentLine: ITenderDisplayLine = this.props.displayInfo &&
    this.props.displayInfo.tenderDisplayLines.find((value) =>
      value.lineType === LineType.TenderAdjustment && value.tenderAdjustmentType
        === TenderAdjustmentType.DenominationRounding);
    return (
      <View style={this.styles.detailsSide}>
        { this.renderDetailTitle("subTotalCaps") }
        { this.renderDetailTitle("totalTaxCaps") }
        { this.renderDetailTitle("feeCaps") }
        { this.renderDetailTitle("discountsCaps") }
        { this.renderShippingTitle() && this.renderDetailTitle("shippingCaps")}
        { this.props.hasDonations && this.renderDetailTitle("donationCaps") }
        { this.renderDetailTitle("totalCaps") }
        { this.props.displayRoundingAdjustment && tenderAdjustmentLine &&
            this.renderDetailTitle("roundingAdjustmentCaps")}
        { this.renderDetailTitle("totalTenderedCaps") }
    </View>
    );
  }

  private shouldDisplayChangeDueScreen(): boolean {
    return !this.state.closedChangeDueScreen &&
        this.props.stateValues.get("ReceiptSession.state") === ReceiptState.Completed &&
        this.props.promptForCustomerAfterTransactionReceipts &&
        this.props.stateValues.get("CashDrawerSession.cashDrawerKey");
  }

  private handleScroll(scrollEvent: any): void {
    this.setState({ isScrolling: updateScroll(scrollEvent, this.state.isScrolling)  });
  }

  private renderDetailsValueArea(): JSX.Element {
    const tenderAdjustmentLine: ITenderDisplayLine = this.props.displayInfo &&
    this.props.displayInfo.tenderDisplayLines.find((value) =>
      value.lineType === LineType.TenderAdjustment && value.tenderAdjustmentType
        === TenderAdjustmentType.DenominationRounding);
    return (
      <View style={[this.styles.detailsSide, this.styles.detailsRightSide]}>
        { this.renderDetailValue(this.props.stateValues.get("transaction.subTotal")) }
        { this.renderDetailValue(this.props.stateValues.get("transaction.tax")) }
        { this.renderDetailValue(this.props.stateValues.get("transaction.totalFee")) }
        { this.renderDetailValue(this.props.stateValues.get("transaction.totalSavings")) }
        { this.renderShippingTitle() && this.renderDetailValue(this.props.stateValues.get("transaction.shippingFee")) }
        { this.props.hasDonations && this.renderDetailValue(this.props.stateValues.get("transaction.donation")) }
        { this.renderDetailValue(this.props.stateValues.get("transaction.total")) }
        { this.props.displayRoundingAdjustment && tenderAdjustmentLine &&
            this.renderDetailValue(tenderAdjustmentLine.tenderAmount)}
        { this.renderDetailValue(this.props.stateValues.get("transaction.totalTendered")) }
    </View>
    );
  }

  private determineChangeDue(): string {
    if (this.props.stateValues.get("transaction.isTenderExchangeTransaction")) {
      const tenderExchangeOutDisplayLine = this.props.displayInfo && this.props.displayInfo.tenderDisplayLines &&
          this.props.displayInfo.tenderDisplayLines.find((line: ITenderDisplayLine) => line.lineType === TENDER_EXCHANGE_OUT_LINE_TYPE);
      if (tenderExchangeOutDisplayLine && tenderExchangeOutDisplayLine.tenderAmount) {
        return printAmount(tenderExchangeOutDisplayLine.tenderAmount);
      }
    } else if (this.props.stateValues.get("transaction.type") === MERCHANDISE_TRANSACTION_TYPE) {
      const changeDueLineList: ITenderDisplayLine[] = this.props.displayInfo.tenderDisplayLines.filter(
        (tenderDisplayLine) => tenderDisplayLine.lineType === LineType.TenderChange &&
        tenderDisplayLine.tenderAuthCategory === TenderAuthCategory.None
      );
      let changeDueAsNumber: number = 0.00;
      if (changeDueLineList && changeDueLineList.length > 0) {
        changeDueLineList.forEach((tenderDisplayLine) => {
          changeDueAsNumber = changeDueAsNumber + parseFloat(tenderDisplayLine.tenderAmount.amount);
        });
      }

      return printAmount(
        new Money(changeDueAsNumber, this.props.currency) ||
        this.props.stateValues.get("transaction.totalChangeTendered")
      );
    }
  }

  private renderDetailTitle(textToTranslate: string): JSX.Element {
    return (
      <Text style={this.styles.detailsText} adjustsFontSizeToFit numberOfLines={1}>{I18n.t(textToTranslate)}</Text>
    );
  }

  private renderDetailValue(amount: Money): JSX.Element {
    return (
      <Text style={this.styles.detailsText} adjustsFontSizeToFit numberOfLines={1}>
        {printAmount(amount)}
      </Text>
    );
  }

  private getItemAttributes(attribute: string, line: IItemDisplayLine, styles: any): JSX.Element {
    const getItemAttributesOrders = getItemAttributesOrder(attribute, line, this.props.retailLocationLocale);
    if (getItemAttributesOrders.attributes) {
      return (
        <Text style={styles} numberOfLines={1} ellipsizeMode={"tail"}>
          {`${getItemAttributesOrders.attributename}: ${getItemAttributesOrders.attributes}`}
        </Text>
      );
    } else {
      return null;
    }
  }

  private handleContinueOnChangeDueScreen(): void {
    this.setState({closedChangeDueScreen: true});
    this.props.handleContinueOnChangeDueScreen();
  }

  private handleAddCustomerOnChangeDueScreen(): void {
    this.setState({closedChangeDueScreen: true});
    this.props.handleAddCustomerOnChangeDueScreen();
  }

  private getRightButton(): JSX.Element | { title: string; action: () => void } {
    if (this.props.taxFreeEnabled) {
      return this.getKebabMenu();
    }

    return null;
  }

  private getKebabMenu(): JSX.Element {
    return (
        <View>
          <Menu
              ref={this.setMenuRef}
              button={
                <TouchableOpacity style={this.styles.menuIcon} onPress={() => this.showMenu()} >
                  <VectorIcon name={"Kebab"} fill={this.styles.menuIcon.color} height={this.styles.menuIcon.fontSize} />
                </TouchableOpacity>
              }
          >
            {
              this.props.taxFreeEnabled &&
              <MenuItem onPress={this.handleTaxFree}>
                { I18n.t("taxFree") }
              </MenuItem>
            }
          </Menu>
        </View>
    );
  }

  private renderShippingTitle(): boolean {
    const order = this.props.stateValues.has("transaction.order") && this.props.stateValues.get("transaction.order");
    if (order && Order.getFulfillmentGroupByType(order, FulfillmentType.shipToCustomer)) {
      return true;
    }
    return false;
  }

  private handleTaxFree = (): void => {
    this.hideMenu();
    InteractionManager.runAfterInteractions(this.props.handleTaxFree);
  }

  private setMenuRef = (ref: any) => {
    this.menu = ref;
  };

  private hideMenu = (): void => {
    this.menu.hide();
  };

  private showMenu = (): void => {
    this.menu.show();
  };
}
