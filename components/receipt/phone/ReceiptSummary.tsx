import _ from "lodash";
import * as React from "react";
import { InteractionManager, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Menu, { MenuItem } from "react-native-material-menu";

import { Money } from "@aptos-scp/scp-component-business-core";
import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import {
  Coupon,
  Customer,
  IDisplayInfo,
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

import I18n from "../../../../config/I18n";
import Theme from "../../../styles";
import FeeLineList from "../../common/FeeLineList";
import Header from "../../common/Header";
import LoyaltyMembershipList from "../../common/LoyaltyMembershipList";
import TenderLineList from "../../common/TenderLineList";
import { printAmount, updateScroll } from "../../common/utilities";
import VectorIcon from "../../common/VectorIcon";
import { getDisplayLoyaltyBalancesWithoutRTP } from "../../customer/CustomerUtilities";
import UnusedCouponsScreen from "../../discounts/UnusedCouponsScreen";
import { NavigationProp } from "../../StackNavigatorParams";
import ChangeDueChoice from "../receiptFlow/ChangeDueChoice";
import ReceiptOptionForm from "../ReceiptOptionForm";
import { receiptSummaryStyle } from "./styles";
import OfflineNotice from "../../common/OfflineNotice";

interface Props {
  receiptCategory: ReceiptCategory;
  currency: string;
  displayInfo: IDisplayInfo;
  hasDonations: boolean;
  onCloseUnusedCoupons: () => void;
  promptForCustomer: () => void;
  onClose: () => void;
  renderUnusedCoupons: boolean;
  shouldPromptAdditionalDestinations: boolean;
  stateValues: Map<string, any>;
  loyaltyActivities: ILoyaltyMembershipActivity[];
  unusedCoupons: Coupon[];
  unusedCouponPrompt: string;
  displayRoundingAdjustment: boolean;
  promptForCustomerAfterTransactionReceipts: boolean;
  handleAddCustomerOnChangeDueScreen: () => void;
  handleContinueOnChangeDueScreen: () => void;
  taxFreeEnabled: boolean;
  handleTaxFree: () => void;
  configuration: IConfigurationManager;
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

    this.styles = Theme.getStyles(receiptSummaryStyle());

    this.customer = this.props.stateValues.get("transaction.customer");
    this.displayLoyaltyBalancesWithoutRTP = getDisplayLoyaltyBalancesWithoutRTP(props.configuration, this.customer);
  }

  public render(): JSX.Element {
    return (
      <View style={this.styles.root}>
        <Header
          title={I18n.t(this.props.renderUnusedCoupons ? "unusedCoupons" : "receipt")}
          backButton={<View />}
          rightButton={this.getRightButton()}
        />
        <OfflineNotice isScrolling={this.state.isScrolling}/>
        { !this.props.renderUnusedCoupons && this.renderReceiptSummary() }
        {
          this.props.renderUnusedCoupons &&
          <UnusedCouponsScreen
            onCloseScreen={this.props.onCloseUnusedCoupons}
            promptText={this.props.unusedCouponPrompt || I18n.t("unusedCouponsExplanation")}
            unusedCoupons={this.props.unusedCoupons}
          />
        }
      </View>
    );
  }

  private renderReceiptSummary(): JSX.Element {
    const receiptDonePrinting = this.props.stateValues.get("ReceiptSession.state") === ReceiptState.Completed;

    const printableChangeDue = this.getPrintableChangeDue();

    const displayChangeDueScreen = !this.state.closedChangeDueScreen &&
        !!this.props.stateValues.get("CashDrawerSession.cashDrawerKey") &&
        receiptDonePrinting && this.props.promptForCustomerAfterTransactionReceipts;
    const showAddCustomerButton = !this.props.stateValues.get("ReceiptSession.printingFailed") &&
        !this.props.stateValues.get("transaction.customer");

    return (
      <ScrollView onScrollEndDrag={this.handleScroll.bind(this)}
       style={this.styles.fill} contentContainerStyle={this.styles.fill}>
        <View style={this.styles.topArea}>
          {
            printableChangeDue &&
            <View style={this.styles.changeDueArea}>
              <Text style={this.styles.changeDueTitle}>
                {this.props.stateValues.get("transaction.isTenderExchangeTransaction") ? I18n.t("amountDue") : I18n.t("changeDueCaps")}
              </Text>
              <Text style={this.styles.changeDueText}>{printableChangeDue}</Text>
            </View>
          }
          {!displayChangeDueScreen &&
            <ReceiptOptionForm
              customer={this.customer}
              providedReceiptCategory={this.props.receiptCategory}
              handlePromptForCustomerLogic={this.props.promptForCustomer}
              onClose={this.props.onClose}
              shouldPromptAdditionalDestinations={this.props.shouldPromptAdditionalDestinations}
              navigation={this.props.navigation}
            />
          }
          {displayChangeDueScreen &&
            <ChangeDueChoice
              handleAddCustomerOnChangeDueScreen={this.handleAddCustomerOnChangeDueScreen.bind(this)}
              handleContinueOnChangeDueScreen={this.handleContinueOnChangeDueScreen.bind(this)}
              showAddCustomerButton={showAddCustomerButton}
            />
          }
        </View>
        { this.props.stateValues.get("transaction.type") === MERCHANDISE_TRANSACTION_TYPE &&
          <View style={this.styles.detailsArea}>
            {this.renderDetailsTitleArea()}
            {this.renderDetailsValueArea()}
          </View>
        }
        {this.props.displayInfo.transactionFeeDisplayLines &&
          <FeeLineList
            preventScroll={true}
            feeDisplayLines={this.props.displayInfo.transactionFeeDisplayLines}
          />
        }
        <TenderLineList
          allowTenderVoid={false}
          preventScroll={true}
          tenderDisplayLines={this.props.displayInfo && this.props.displayInfo.tenderDisplayLines}
        />
        { this.customer?.loyaltyMemberships && ((this.props.loyaltyActivities && this.props.loyaltyActivities.length > 0) ||
          this.displayLoyaltyBalancesWithoutRTP) &&
          <LoyaltyMembershipList
              estimated={false}
              preventScroll={true}
              loyaltyActivities={this.props.loyaltyActivities}
              configuration={this.props.configuration}
              loyaltyMemberships={this.customer && this.customer.loyaltyMemberships}
              displayLoyaltyBalancesWithoutRTP={this.displayLoyaltyBalancesWithoutRTP}
          />
        }
      </ScrollView>
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

  private handleScroll(scrollEvent: any): void {
    this.setState({ isScrolling: updateScroll(scrollEvent, this.state.isScrolling)  });
  }

  private renderShippingTitle(): boolean {
    const order = this.props.stateValues.has("transaction.order") && this.props.stateValues.get("transaction.order");
    if (order && Order.getFulfillmentGroupByType(order, FulfillmentType.shipToCustomer)) {
      return true;
    }
    return false;
  }

  private renderDetailTitle(textToTranslate: string): JSX.Element {
    return (
      <Text style={this.styles.detailsText} adjustsFontSizeToFit numberOfLines={1}>{I18n.t(textToTranslate)}</Text>
    );
  }

  private renderDetailValue(amount: Money): JSX.Element {
    return (
      <Text style={this.styles.detailsText} adjustsFontSizeToFit numberOfLines={1}>{printAmount(amount)}</Text>
    );
  }

  private getPrintableChangeDue(): string {

    if (this.props.stateValues.get("transaction.isTenderExchangeTransaction")) {
      const tenderExchangeOutDisplayLine = this.props.displayInfo && this.props.displayInfo.tenderDisplayLines &&
          this.props.displayInfo.tenderDisplayLines.find((line: ITenderDisplayLine) =>
          line.lineType === TENDER_EXCHANGE_OUT_LINE_TYPE);
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
          this.props.currency && new Money(changeDueAsNumber, this.props.currency) ||
          this.props.stateValues.get("transaction.totalChangeTendered"));
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
    if (this.props.renderUnusedCoupons) {
      return {
        title: I18n.t("ok"),
        action: this.props.onCloseUnusedCoupons
      };
    } else if (this.props.taxFreeEnabled) {
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

  private handleTaxFree = (): void => {
    this.hideMenu();
    InteractionManager.runAfterInteractions(this.props.handleTaxFree);
  }

  private setMenuRef = (ref: any) => {
    this.menu = ref;
  }

  private hideMenu = (): void => {
    this.menu.hide();
  }

  private showMenu = (): void => {
    this.menu.show();
  }
}
