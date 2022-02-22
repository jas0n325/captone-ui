import { last } from "lodash";
import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { Status } from "@aptos-scp/scp-component-store-items";
import { IConfigurationManager, QualificationError } from "@aptos-scp/scp-component-store-selling-core";
import {
  APTOS_ITEM_COMMENTS_FORM,
  FAST_DISCOUNT_EVENT,
  GiftCertificateState,
  IDiscountDisplayLine,
  IDisplayInfo,
  IItemDisplayLine,
  IN_MERCHANDISE_TRANSACTION,
  ITEM_RETURN_LINE_TYPE,
  NOT_IN_TRANSACTION,
  SSF_RESTRICTED_SAME_DISCOUNT_EVENT_I18N_CODE
} from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../../config/I18n";
import {
  ActionCreator,
  alert,
  AlertRequest,
  clearSelectedItemLines,
  ItemSelectionMode,
  selectItemLine,
  setSelectionEnabled,
  updateUiMode
} from "../../../actions";
import {
  AppState,
  ISelectedRedemptions,
  UI_MODE_ASSIGN_SALESPERSON_TO_TRANSACTION,
  UI_MODE_ITEM_NOT_FOUND_RETRY_ENTRY,
  UI_MODE_PRODUCT_DETAIL,
  UiState
} from "../../../reducers";
import Theme from "../../../styles";
import ItemSelectionActionPanel from "../../common/ItemSelectionActionPanel";
import ItemComments from "../../common/screens/Comments";
import FreeTextComment from "../../common/screens/FreeTextComment";
import {
  countOfAllItems,
  getCurrentValueOfField,
  getEmployeeDiscountDisplayText,
  getFeatureAccessConfig,
  getFixedPriceDisplayText,
  getTransactionIsOpen,
  GiftCertificateAction,
  IDiscountGroupInformation,
  promptForCustomerAfterTransactionReceipts
} from "../../common/utilities";
import { popTo } from "../../common/utilities/navigationUtils";
import CouponComponent from "../../coupon/CouponComponent";
import { DiscountLevel, DiscountType } from "../../discounts/constants";
import DiscountComponent from "../../discounts/DiscountComponent";
import DiscountTypeSelection from "../../discounts/DiscountTypeSelection";
import PreConfiguredDiscountsComponent from "../../discounts/PreConfiguredDiscounts";
import FastDiscountComponent from "../../fastDiscounts/FastDiscount";
import IssueGiftCardComponent from "../../giftCard/IssueGiftCardComponent";
import ScanLotteryComponent from "../../lottery/ScanLottery";
import LoyaltyDiscountComponent from "../../loyaltyMembership/LoyaltyDiscountComponent";
import NonMerchComponent from "../../nonMerch/NonMerch";
import PriceComponent from "../../price/PriceComponent";
import Product from "../../product/Product";
import QuantityComponent from "../../quantity/Quantity";
import ReceiptOptionForm from "../../receipt/ReceiptOptionForm";
import AssignSalespersonComponent from "../../salesperson/AssignSalespersonComponent";
import StoppedItemComponent from "../../stoppedItem/StoppedItem";
import ItemSubscription from "../../subscriptions/ItemSubscription";
import TaxExemptComponent from "../../taxExempt/TaxExemptComponent";
import TaxActionPanel from "../../taxModifiers/TaxActionPanel";
import TaxOverrideComponent from "../../taxModifiers/taxOverride/TaxOverrideComponent";
import IssueGiftCertificateComponent from "../../valueCertificate/IssueGiftCertificateComponent";
import { MainComponentCommonProps } from "../constants";
import ActionPanel from "./ActionPanel";
import ActionWrapper from "./ActionWrapper";
import { getCurrentRouteNameWithNavigationRef } from "../../RootNavigation";
import { mainStyle } from "./styles";


export interface IActionPanel {
  header: string;
  ChildComponent: React.ReactNode;
}

interface StateProps {
  businessStateError: Error;
  businessStateInProgress: boolean;
  currentScreenName: string;
  displayInfo: IDisplayInfo;
  itemSelectionMode: ItemSelectionMode;
  selectedItems: number[];
  selectedRedemptions: ISelectedRedemptions[];
  stateValues: Map<string, any>;
  uiState: UiState;
  configurationManager: IConfigurationManager;
}

interface DispatchProps {
  clearSelectedItemLines: ActionCreator;
  setSelectionEnabled: ActionCreator;
  updateUiMode: ActionCreator;
  alert: AlertRequest;
  selectItemLine: ActionCreator;
}

export interface Props extends MainComponentCommonProps, StateProps, DispatchProps {
  shouldPromptForCustomer: boolean;
  stoppedItem?: IItemDisplayLine;
  stoppedItemStatus?: string;
  stoppedItemStatusMessage?: string;
  totalTransactionIsAllowed: boolean;
  shouldPromptForAdditionalInfo: boolean;
  onResetFromStoppedItem?: () => void;
  onSellSoftStoppedItem?: (itemKey: string, itemKeyType: string) => void;
  onFreeTextItemCommentProvided: (lineNumber: number, freeText?: string) => void;
  togglePromptForAdditionalInfo: () => void;
  onAdditionalInfoProvided: (lineNumber: number, formName: string, fields?: object) => void;
  onSalespersonSkipped: (skipped?: boolean) => void;
}

export interface State {
  applyToTransaction: boolean;
  changeQuantity: boolean;
  changePrice: boolean;
  line: IItemDisplayLine;
  assignSalesperson: boolean;
  isTransactionStarting: boolean;
  issueGiftCard: boolean;
  issueGiftCertificate: boolean;
  discount: boolean;
  discountLevel: DiscountLevel;
  discountType: DiscountType;
  discountDisplayLine: IDiscountDisplayLine;
  fastDiscount: boolean;
  isFastDiscountFixedPrice: boolean;
  coupon: boolean;
  taxExempt: boolean;
  taxOverrideItem: boolean;
  taxOverride: boolean;
  resumeSuspendedTransactions: boolean;
  returnMode: boolean;
  isItemComments: boolean;
  taxDetail: boolean;
  isFreeTextItemComments: boolean;
  itemCommentIsFreeText: boolean;
  nonMerch: boolean;
  lottery: boolean;
  preConfiguredDiscounts: boolean;
  transactionDiscountGroup: IDiscountGroupInformation;
  subscription: boolean;
  isAdditionalInfo: boolean;
  formName: string;
}

export const withActionPanel = (MainComponent: React.ComponentType<any>) => {
  const WrapperComponent = class extends React.Component<Props, State> {
    public styles: any;

    constructor(props: Props) {
      super(props);

      this.styles = Theme.getStyles(mainStyle());

      this.state = {
        applyToTransaction: false,
        changeQuantity: false,
        changePrice: false,
        line: undefined,
        assignSalesperson: false,
        isTransactionStarting: false,
        issueGiftCard: false,
        issueGiftCertificate: false,
        discount: false,
        discountLevel: undefined,
        discountType: undefined,
        discountDisplayLine: undefined,
        fastDiscount: false,
        isFastDiscountFixedPrice: false,
        coupon: false,
        taxExempt: false,
        taxOverrideItem: false,
        taxOverride: false,
        resumeSuspendedTransactions: false,
        returnMode: this.props.stateValues?.get("ItemHandlingSession.isReturning"),
        isItemComments: false,
        taxDetail: false,
        nonMerch: false,
        isFreeTextItemComments: false,
        itemCommentIsFreeText: false,
        lottery: false,
        preConfiguredDiscounts: false,
        transactionDiscountGroup: undefined,
        subscription: false,
        isAdditionalInfo: false,
        formName: undefined
      };
    }

    public componentDidUpdate(prevProps: Props, prevState: State): void {
      if (
          this.props.stateValues.get("transaction.id") &&
          this.props.stateValues.get("transaction.open") &&
          prevProps.uiState.logicalState === NOT_IN_TRANSACTION &&
          this.props.uiState.logicalState === IN_MERCHANDISE_TRANSACTION
      ) {
        this.setState({ isTransactionStarting: true });
      }

      if ((this.enteredMode(UI_MODE_ASSIGN_SALESPERSON_TO_TRANSACTION, prevProps) ||
          this.returnedToMainInMode(UI_MODE_ASSIGN_SALESPERSON_TO_TRANSACTION, prevProps)) &&
          !this.state.assignSalesperson) {
        this.setState({ assignSalesperson: true });
      }

      this.checkAndHandleItemSelectionChanges(prevProps, prevState);

      this.handleShouldPromptForAdditionalInfo(prevProps, prevState);

      const returnMode: boolean = this.props.stateValues.get("ItemHandlingSession.isReturning");
      if (returnMode !== this.state.returnMode) {
        this.setState({ returnMode });
      }

      const giftCertificateState : GiftCertificateState = this.props.stateValues.get("CashDrawerSession.giftCertificateState");
      if (!this.state.issueGiftCertificate && giftCertificateState?.action === GiftCertificateAction.Sale &&
          this.props.stateValues.get("CashDrawerSession.isOpen")) {
        this.setState({issueGiftCertificate: true, applyToTransaction: true});
      }
    }

    public get isTransactionTaxExempt(): boolean {
      return this.state.taxExempt && this.state.applyToTransaction;
    }

    public get isLineTaxExempt(): boolean {
      return this.state.taxExempt && !this.state.applyToTransaction;
    }

    public get isTransactionTaxDetail(): boolean {
      return this.state.taxDetail && this.state.applyToTransaction;
    }

    public get isLineTaxDetail(): boolean {
      return this.state.taxDetail && !this.state.applyToTransaction;
    }

    public get noLinesSelected(): boolean {
      return this.props.selectedItems.length === 0 && this.props.itemSelectionMode === ItemSelectionMode.None;
    }

    public get oneLineSelected(): boolean {
      return this.props.selectedItems.length === 1 && this.props.itemSelectionMode === ItemSelectionMode.Single;
    }

    public get multipleOrAllLinesSelected(): boolean {
      return this.props.itemSelectionMode === ItemSelectionMode.Multiple ||
          this.props.itemSelectionMode === ItemSelectionMode.All;
    }

    public get selectedItemLines(): IItemDisplayLine[] {
      let itemLines: IItemDisplayLine[];
      if (this.state.line) {
        itemLines = [this.state.line];
      } else if (this.props.selectedItems?.length > 0) {
        itemLines = this.props.displayInfo.itemDisplayLines.filter((line) => this.props.selectedItems.indexOf(line.lineNumber) > -1);
      }
      return itemLines;
    }

    public get stoppedItemStatusKey(): string {
      return this.props.stoppedItemStatus === Status.HardStop ? "hardStopItem" : "softStopItem";
    }

    public get isDiscount(): boolean {
      return this.state.discount || !!this.state.discountType;
    }

    public get discountTitle(): string {
      if (this.state.discountType === DiscountType.Manual) {
        return I18n.t("discount");
      } else if (this.state.discountType === DiscountType.Coupon) {
        return I18n.t("couponDiscount");
      } else if (this.state.discountType === DiscountType.Employee) {
        const employeeDiscountDisplayText = getEmployeeDiscountDisplayText(
          this.state.discountType,
          this.state.discountLevel,
          this.props.configurationManager
        );
        const employeeDiscountTitle = employeeDiscountDisplayText ? I18n.t(employeeDiscountDisplayText.i18nCode, {
          defaultValue: employeeDiscountDisplayText.default
        }) : I18n.t("employeeDiscount");

        return employeeDiscountTitle;
      } else if (this.state.discountType === DiscountType.CompetitivePrice) {
        return I18n.t("priceMatch");
      } else if (this.state.discountType === DiscountType.Loyalty) {
        return I18n.t("loyalty");
      }
      return I18n.t("priceDiscount");
    }

    public get shouldShowTransactionSummary(): boolean {
      return (
        this.props.stateValues.get("transaction.id") &&
        this.state.applyToTransaction &&
        !this.props.stateValues.get("transaction.closed") &&
        (this.state.discount ||
          this.state.coupon ||
          this.state.taxDetail ||
          this.state.assignSalesperson ||
          this.state.fastDiscount ||
          this.state.issueGiftCard ||
          this.state.issueGiftCertificate ||
          this.state.nonMerch ||
          this.state.lottery)
      );
    }

    public get chosenMultiSelectAction(): boolean {
      return this.state.assignSalesperson || this.state.discount || this.state.taxDetail;
    }

    public handleCloseDiscount = () => {
      this.setState({ discount: false, line: undefined, applyToTransaction: false }, this.props.clearSelectedItemLines);
    }

    public handleCancelDiscountScreen = () => {
      this.setState({
        discount: false,
        line: undefined,
        discountLevel: undefined,
        discountType: undefined,
        discountDisplayLine: undefined,
        applyToTransaction: false
      }, this.props.clearSelectedItemLines);
    }

    public handleExitQuantityScreen = () => {
      this.setState({ changeQuantity: false, line: undefined }, this.props.clearSelectedItemLines);
    }

    public handleExitPriceScreen = () => {
      this.setState({ changePrice: false, line: undefined }, this.props.clearSelectedItemLines);
    }

    public handleGiftCardIssue = (
      cardNumber: string,
      amount: string,
      inputSource: string,
      useSwipe?: boolean,
      existingCard?: boolean
    ) => {
      this.props.onIssueGC(cardNumber, amount, inputSource, useSwipe, existingCard);
    }

    public handleExitIssueGiftCardScreen = () => {
      this.setState({ issueGiftCard: false, applyToTransaction: false }, this.props.clearSelectedItemLines);
    }

    public handleGiftCertificateIssue = (certificateNumber: string, amount: string, inputSource: string) => {
      this.props.onIssueGCert(certificateNumber, amount, inputSource);
    }

    public handleExitIssueGiftCertificateScreen = () => {
      this.setState({ issueGiftCertificate: false, applyToTransaction: false }, this.props.clearSelectedItemLines);
    }

    public onAdditionalInfo = (line: IItemDisplayLine, formName: string) => {
      this.setState({ isAdditionalInfo: true, formName, line });
    }

    public handleFreeTextItemCommentProvided = (lineNumber: number, freeText?: string) => {
      this.props.onFreeTextItemCommentProvided(lineNumber, freeText);
    }

    public handleItemCommentsScreen = (line: IItemDisplayLine): void => {
      this.setState((state) => ({
        isItemComments: !state.isItemComments,
        line
      }), () => line === undefined && this.props.clearSelectedItemLines());
    }

    public handleTaxScreen = (): void => {
      this.setState({ taxDetail: true, applyToTransaction: false });
    }

    public handleFreeTextItemCommentsScreen = (line: IItemDisplayLine, itemCommentIsFreeText: boolean): void => {
      this.setState({ isFreeTextItemComments: true, itemCommentIsFreeText, line });
    }

    public onTotalPressed = (): void => {
      this.props.handleOnTotalPressed();
    }

    public handleDiscount = (
        discountLevel: DiscountLevel,
        discountType: DiscountType,
        discountDisplayLine: IDiscountDisplayLine
    ) => {
      this.setState({ discountLevel, discountType, discountDisplayLine });
    }

    public handleCustomerUpdate = () => {
      this.props.onCustomerUpdate(false);
    }

    public handleAssignSalesperson = () => {
      this.setState({ assignSalesperson: true, applyToTransaction: true });
    }

    public handleCoupon = () => {
      this.setState({ coupon: true, applyToTransaction: true });
    }

    public handleItemSelectionAssignSalesperson = () => {
      this.setState({ assignSalesperson: true });
    }

    public handleIssueGiftCard = () => {
      this.setState({ issueGiftCard: true, applyToTransaction: true });
    }

    public handleIssueGiftCertificate = () => {
      this.setState({ issueGiftCertificate: true, applyToTransaction: true });
    }

    public handleTransactionDiscount = () => {
      this.setState({ discount: true, line: undefined, applyToTransaction: true });
    }

    public handleFastDiscount = () => {
      this.setState({ fastDiscount: true, applyToTransaction: true });
    }

    public handleExitFastDiscountScreen = () => {
      this.setState({ fastDiscount: false, applyToTransaction: false });
    }

    public handleNonMerch = () => {
      this.setState({ nonMerch: true, applyToTransaction: true });
    }

    public handleExitNonMerchScreen = () => {
      this.setState({ nonMerch: false, applyToTransaction: false });
    }
    public handleLottery = () => {
      this.setState({ lottery: true, applyToTransaction: true });
    }

    public handleExitLotteryScreen = () => {
      this.setState({ lottery: false, applyToTransaction: false });
    }

    public handlePreConfiguredDiscounts = (transactionDiscountGroup: IDiscountGroupInformation) => {
      this.setState({ preConfiguredDiscounts: true, applyToTransaction: true, transactionDiscountGroup });
    }

    public handleExitPreConfiguredDiscountsScreen = () => {
      this.setState({ preConfiguredDiscounts: false, applyToTransaction: false, transactionDiscountGroup: undefined });
    }

    public handleTransactionTaxExempt = () => {
      this.setState({ taxExempt: true, applyToTransaction: true });
    }

    public handleTransactionTaxOverride = () => {
      this.setState({ taxOverride: true, applyToTransaction: true });
    }

    public handleTransactionTaxDetailScreen = () => {
      this.setState({ taxDetail: true, applyToTransaction: true });
    }

    public handleProductInformation = (line: IItemDisplayLine) => {
      this.props.updateUiMode(UI_MODE_PRODUCT_DETAIL);
      this.props.navigation.push("productInquiryDetail", {line});
    }

    public handleChangeQuantity = (line: IItemDisplayLine) => {
      this.setState({ changeQuantity: true, line });
    }

    public handleChangePrice = (line: IItemDisplayLine) => {
      this.setState({ changePrice: true, line });
    }

    public handleItemDiscount = (line: IItemDisplayLine) => {
      this.setState({ discount: true, line });
    }

    public handleItemSubscription = (line: IItemDisplayLine) => {
      this.setState({ subscription: true, line });
    }

    public onItemTaxExempt = (line: IItemDisplayLine) => {
      this.setState({ taxExempt: true, applyToTransaction: false });
    }

    public onItemTaxOverride = ( line: IItemDisplayLine ) => {
      this.setState({taxOverrideItem: true, line});
    }

    public handleExitAssignSalespersonScreen = (skipped?: boolean) => {
      const isTransactionStarting = this.state.isTransactionStarting;
      if (isTransactionStarting && skipped) {
        this.props.onSalespersonSkipped(skipped);
      }
      this.setState({ assignSalesperson: false, isTransactionStarting: false, applyToTransaction: false }, () => {
        if (isTransactionStarting && this.props.shouldPromptForCustomer &&
            !this.props.stateValues.get("transaction.customer")) {
          this.props.onCustomerUpdate(true);
          this.props.setSelectionEnabled(true);
        } else {
          this.props.clearSelectedItemLines();
        }
      });
    }

    public handleExitCouponScreen = () => {
      this.setState({ coupon: false, applyToTransaction: false });
    }

    public handleExitTaxExemptScreen = () => {
      this.setState({ taxDetail: false, taxExempt: false, applyToTransaction: false });
    }

    public handleExitTaxOverrideScreen = () => {
      this.setState({ taxDetail: false, taxOverride: false, applyToTransaction: false });
    }

    public handleExitTaxScreen = () => {
      this.setState({ taxDetail: false, applyToTransaction: false });
    }

    public handleItemSelectionItemDiscount = () => {
      this.setState({ discount: true });
    }

    public handleExitItemSubscription = () => {
      this.setState({ subscription: false, line: undefined }, this.props.clearSelectedItemLines);
    }

    public handleItemSelectionTaxDetail = (): void => {
      this.setState({ taxDetail: true, applyToTransaction: false });
    }

    public handleProductScreenAssignSalesperson = (line: IItemDisplayLine) => {
      this.setState({ assignSalesperson: true, line });
    }

    public handleProductScreenExit = () => {
      this.setState({ changeQuantity: false, line: undefined }, this.props.clearSelectedItemLines);
    }

    public handleTaxScreenExit = () => {
      this.setState({ taxDetail: false, applyToTransaction: false }, this.props.clearSelectedItemLines);
    }

    public handleItemTaxExemptScreenExit = () => {
      this.setState({ taxDetail: false, taxExempt: false, applyToTransaction: false, line: undefined },
          this.props.clearSelectedItemLines);
    }

    public handleItemTaxOverrideScreenExit = () => {
      this.setState({ taxDetail: false, taxOverrideItem: false, applyToTransaction: false, line: undefined },
          this.props.clearSelectedItemLines);
    }

    public clearSelectedItemLines = (): void => {
      if (this.multipleOrAllLinesSelected) {
        this.props.clearSelectedItemLines();
      }
      this.props.navigation.dispatch(popTo("main"));
    }

    public onResumeOfSuspendedTransactions = (): void => {
      this.props.navigation.push("resumeSuspendedTransactions");
    }

    public get totalNumberOfItems(): number {
      return ((getTransactionIsOpen(this.props.stateValues) && countOfAllItems(this.props.displayInfo)) || 0);
    }

    public get totalNumberOfReturnItems(): number {
      return (getTransactionIsOpen(this.props.stateValues) && countOfAllItems(this.props.displayInfo,
          (line: IItemDisplayLine) => line.lineType === ITEM_RETURN_LINE_TYPE)) || 0;
    }

    public checkAndHandleItemSelectionChanges(prevProps: Props, prevState: State): void {
      const multiSelectionRouteChosen: boolean =
          (!prevState.assignSalesperson || !prevState.discount || !prevState.taxDetail) &&
          !this.state.applyToTransaction && this.chosenMultiSelectAction;

      if (!this.props.businessStateInProgress && prevProps.businessStateInProgress &&
          this.props.businessStateError instanceof QualificationError) {
        const error: QualificationError = this.props.businessStateError;
        const errorCode: string = error.localizableMessage.i18nCode;

        if (errorCode === SSF_RESTRICTED_SAME_DISCOUNT_EVENT_I18N_CODE) {
          this.setState({ discount: false, discountType: undefined }, () => this.props.setSelectionEnabled(true));
        }
      } else if (multiSelectionRouteChosen) {
        this.props.setSelectionEnabled(false);
      }
    }

    public enteredMode(uiMode: string, prevProps: Props): boolean {
      return this.props.uiState.mode === uiMode && prevProps.uiState.mode !== uiMode;
    }

    public returnedToMainInMode(uiMode: string, prevProps: Props): boolean {
      return this.props.uiState.mode === uiMode && prevProps.currentScreenName !== "main" &&
          this.props.currentScreenName === "main";
    }

    public handleShouldPromptForAdditionalInfo(prevProps: Props, prevState: State): void {
      if (this.props.shouldPromptForAdditionalInfo && !prevProps.shouldPromptForAdditionalInfo) {
        const lastAddedItem = last(this.props.displayInfo.itemDisplayLines);
        this.props.selectItemLine(lastAddedItem.lineNumber);
        this.setState({isAdditionalInfo: true, formName: APTOS_ITEM_COMMENTS_FORM, line: lastAddedItem});
      }

      if (this.props.shouldPromptForAdditionalInfo && !this.state.isAdditionalInfo && prevState.isAdditionalInfo) {
        this.props.togglePromptForAdditionalInfo();
      }
    }

    // tslint:disable-next-line:cyclomatic-complexity
    public getActionPanel(): IActionPanel {
      let header: string = undefined;
      let ChildComponent: React.ReactNode = undefined;

      if (this.props.stoppedItem) {
        header = I18n.t(this.stoppedItemStatusKey);
        ChildComponent = (
          <ActionWrapper>
            <StoppedItemComponent
              onResetFromStoppedItem={this.props.onResetFromStoppedItem}
              onSellSoftStoppedItem={this.props.onSellSoftStoppedItem}
              stoppedItem={this.props.stoppedItem}
              stoppedItemStatus={this.props.stoppedItemStatus}
              stoppedItemStatusMessage={this.props.stoppedItemStatusMessage}
              navigation={this.props.navigation}
            />
          </ActionWrapper>
        );
      } else if (this.state.changeQuantity) {
        header = I18n.t("quantity");
        ChildComponent = (
          <ActionWrapper>
            <QuantityComponent
              line={this.state.line}
              showLine={false}
              onExit={this.handleExitQuantityScreen}
              navigation={this.props.navigation}
            />
          </ActionWrapper>
        );
      } else if (this.state.changePrice) {
        header = I18n.t("overridePrice");
        ChildComponent = (
          <ActionWrapper>
            <PriceComponent
              line={this.state.line}
              showLine={false}
              onExit={this.handleExitPriceScreen}
              navigation={this.props.navigation}
            />
          </ActionWrapper>
        );
      } else if (this.state.issueGiftCard) {
        header = I18n.t("issueGiftCard");
        ChildComponent = (
          <ActionWrapper>
            <IssueGiftCardComponent
              onGCIssue={this.handleGiftCardIssue}
              onExit={this.handleExitIssueGiftCardScreen}
              navigation={this.props.navigation}
            />
          </ActionWrapper>
        )
      } else if (this.state.issueGiftCertificate) {
        header = I18n.t("giftCertificate");
        ChildComponent = (
          <ActionWrapper>
            <IssueGiftCertificateComponent
              onIssue={(certificateNumber: string, amount: string, inputSource: string) => {
                this.handleGiftCertificateIssue(certificateNumber, amount, inputSource);
                this.handleExitIssueGiftCertificateScreen();
              }}
              onExit={this.handleExitIssueGiftCertificateScreen}
              navigation={this.props.navigation}
            />
          </ActionWrapper>
        )
      } else if (this.isDiscount) {
        if (!this.state.discountType) {
          header = this.selectedItemLines ? I18n.t("itemDiscount") : I18n.t("transactionDiscount");
          ChildComponent = (
            <ActionWrapper>
              <DiscountTypeSelection
                discountLevel={this.selectedItemLines ? DiscountLevel.Item : DiscountLevel.Transaction}
                itemLines={this.selectedItemLines}
                isLoyaltyDiscountEnable={this.selectedItemLines ? false : this.props.isLoyaltyDiscountEnable}
                transactionDiscountDisplayLines={this.selectedItemLines ? undefined :
                    this.props.displayInfo.transactionDiscountDisplayLines}
                onDiscount={this.handleDiscount}
                onExit={this.handleCloseDiscount}
                navigation={this.props.navigation}
              />
            </ActionWrapper>
          )
        } else {
          header = this.discountTitle;
          ChildComponent = (
            <ActionWrapper>
              {
                this.state.discountType !== DiscountType.Loyalty && (
                  <DiscountComponent
                    discountLevel={this.state.discountLevel}
                    discountType={this.state.discountType}
                    itemLines={this.selectedItemLines}
                    discountDisplayLine={this.state.discountDisplayLine}
                    showLine={false}
                    onCancel={this.handleCancelDiscountScreen}
                    navigation={this.props.navigation}
                  />
                )
              }
              {
                this.state.discountType === DiscountType.Loyalty && (
                  <LoyaltyDiscountComponent
                    onCancel={this.handleCancelDiscountScreen}
                    navigation={this.props.navigation}
                  />
                )
              }
            </ActionWrapper>
          )
        }
      } else if (this.state.fastDiscount) {
        const fastDiscountFeature = getFeatureAccessConfig(this.props.configurationManager, FAST_DISCOUNT_EVENT);
        const fixedPriceDisplayText: string = getFixedPriceDisplayText(fastDiscountFeature.fastDiscountButtonRows);
        header = this.state.isFastDiscountFixedPrice && fixedPriceDisplayText ? fixedPriceDisplayText : I18n.t("fastDiscount");
        ChildComponent = (
          <ActionWrapper>
            <FastDiscountComponent
              onExit={this.handleExitFastDiscountScreen}
              onFixedPriceVisibilityChanged={(visible: boolean) => this.setState({isFastDiscountFixedPrice: visible})}
              navigation={this.props.navigation}
            />
          </ActionWrapper>
        );
      } else if (this.state.assignSalesperson) {
        header = I18n.t("salesperson");
        ChildComponent = (
          <ActionWrapper>
            <AssignSalespersonComponent
              isTransactionStarting={this.state.isTransactionStarting}
              assignToTransaction={this.state.applyToTransaction || !this.props.selectedItems ||
                this.props.selectedItems.length === 0}
              lineNumbers={this.state.applyToTransaction ? undefined :
                this.state.line ? [this.state.line.lineNumber] : this.props.selectedItems}
              onExit={this.handleExitAssignSalespersonScreen}
              navigation={this.props.navigation}
            />
          </ActionWrapper>
        );
      } else if (this.state.coupon) {
        header = I18n.t("coupons");
        ChildComponent = (
          <ActionWrapper>
            <CouponComponent onExit={this.handleExitCouponScreen} navigation={this.props.navigation} />
          </ActionWrapper>
        );
      } else if (this.state.nonMerch) {
        header = I18n.t("nonMerch");
        ChildComponent = (
          <ActionWrapper>
            <NonMerchComponent onExit={this.handleExitNonMerchScreen} navigation={this.props.navigation} />
          </ActionWrapper>
        );
      } else if (this.state.lottery) {
        header = I18n.t("lottery");
        ChildComponent = (
          <ActionWrapper>
            <ScanLotteryComponent onExit={this.handleExitLotteryScreen} navigation={this.props.navigation} />
          </ActionWrapper>
        );
      } else if (this.state.preConfiguredDiscounts) {
        const transactionGroup = this.state.transactionDiscountGroup;

        header = I18n.t(transactionGroup.groupButtonText.i18nCode, {
          defaultValue: transactionGroup.groupButtonText.default
        });
        ChildComponent = (
          <ActionWrapper>
            <PreConfiguredDiscountsComponent
              transactionDiscountGroup={transactionGroup}
              onDiscount={this.handleDiscount}
              onExit={this.handleExitPreConfiguredDiscountsScreen}
              navigation={this.props.navigation}
            />
          </ActionWrapper>
        );
      } else if (this.isTransactionTaxExempt) {
        header = I18n.t("taxExempt");
        ChildComponent = (
          <ActionWrapper>
            <TaxExemptComponent onExit={this.handleExitTaxExemptScreen} navigation={this.props.navigation} />
          </ActionWrapper>
        );
      } else if (this.state.subscription) {
        if (promptForCustomerAfterTransactionReceipts(this.props.configurationManager) &&
            !this.props.stateValues.get("transaction.customer")) {
          this.props.alert(
            I18n.t("warning"),
            I18n.t("actionRequiresTransactionCustomer"),
            [{
              text: I18n.t("ok"),
              onPress: () => {
                this.handleExitItemSubscription();
              }
            }]
          )
        } else {
          header = I18n.t("subscribe");
          ChildComponent = (
            <ActionWrapper>
              <ItemSubscription
                lines={[this.state.line]}
                onExit={this.handleExitItemSubscription}
                onContinue={this.handleExitItemSubscription}
                navigation={this.props.navigation}
              />
            </ActionWrapper>
          );
        }
      } else if (this.isLineTaxExempt) {
        header = I18n.t("taxExempt");
        ChildComponent = (
          <ActionWrapper>
            <TaxExemptComponent
              onExit={this.handleItemTaxExemptScreenExit}
              showLine={true}
              itemLines={this.selectedItemLines}
              navigation={this.props.navigation}
            />
          </ActionWrapper>
        );
      } else if (this.state.taxOverride) {
        let itemLines;
        if (this.selectedItemLines) {
          itemLines = this.selectedItemLines;
        } else if (this.props.displayInfo?.itemDisplayLines?.length) {
          itemLines = this.props.displayInfo.itemDisplayLines.map((line: IItemDisplayLine) => line);
        }

        header = I18n.t("taxOverride");
        ChildComponent = (
          <ActionWrapper>
            <TaxOverrideComponent
              showLine={false}
              isItemLevel={false}
              lines={itemLines || [this.state.line]}
              onExit={this.handleExitTaxOverrideScreen}
              navigation={this.props.navigation}
            />
          </ActionWrapper>
        );
      } else if (this.state.taxOverrideItem) {
        const itemLines = this.props.displayInfo?.itemDisplayLines
            ?.filter((itemLine) => this.props.selectedItems.indexOf(itemLine.lineNumber) > -1);

        header = I18n.t("taxOverride");
        ChildComponent = (
          <ActionWrapper>
            <TaxOverrideComponent
              onExit={this.handleItemTaxOverrideScreenExit}
              showLine={true}
              lines={itemLines || [this.state.line]}
              isItemLevel={true}
              navigation={this.props.navigation}
            />
          </ActionWrapper>
        );
      } else if (this.isTransactionTaxDetail) {
        header = I18n.t("tax");
        ChildComponent = (
          <ActionWrapper>
            <TaxActionPanel
              onExit={this.handleExitTaxScreen}
              onTransactionTaxExempt={this.handleTransactionTaxExempt}
              onTransactionTaxOverride={this.handleTransactionTaxOverride}
              navigation={this.props.navigation}
            >
              <View style={this.styles.cancelProductActionsBtn}>
                <TouchableOpacity style={this.styles.btnSeconday} onPress={this.handleExitTaxScreen}>
                  <Text style={this.styles.btnSecondayText}>
                    { I18n.t("cancel") }
                  </Text>
                </TouchableOpacity>
              </View>
            </TaxActionPanel>
          </ActionWrapper>
        );
      } else if (this.state.isFreeTextItemComments) {
        const handleOnExit = (): void => {
          this.setState({
            isItemComments: false,
            isFreeTextItemComments: false
          });
          this.props.navigation.dispatch(popTo("main"));
          this.props.clearSelectedItemLines();
        };

        header = I18n.t("comment");
        ChildComponent = (
          <ActionWrapper>
            <FreeTextComment
              freeTextCommentValue={this.state.itemCommentIsFreeText && this.state.line.comment}
              lineNumber={this.state.line.lineNumber}
              onExit={handleOnExit}
              navigation={this.props.navigation}
              onDone={this.handleFreeTextItemCommentProvided}
            />
          </ActionWrapper>
        );
      } else if (this.state.isAdditionalInfo) {
        const handleOnExit = (): void => {
          this.props.clearSelectedItemLines();
          this.setState({
            isAdditionalInfo: false,
            formName: undefined,
            line: undefined
          });
        };
        const freeTextCommentValue: string = getCurrentValueOfField(this.state.line, "comment");
        header = I18n.t("comment");
        ChildComponent = (
          <ActionWrapper>
            <FreeTextComment
              freeTextCommentValue={freeTextCommentValue}
              lineNumber={this.state.line.lineNumber}
              onExit={handleOnExit}
              navigation={this.props.navigation}
              onDone={(lineNumber: number, comment?: string) => {
                this.props.onAdditionalInfoProvided(lineNumber, this.state.formName, comment && {comment});
              }}
            />
          </ActionWrapper>
        );
      } else if (this.state.isItemComments) {
        header = I18n.t("comments");
        ChildComponent = (
          <ActionWrapper>
            <ItemComments
              line={this.state.line}
              onItemFreeTextComment={this.handleFreeTextItemCommentsScreen}
              onExit={this.handleItemCommentsScreen}
              navigation={this.props.navigation}
            />
          </ActionWrapper>
        );
      } else if (this.isLineTaxDetail) {
        header = I18n.t("tax");
        ChildComponent = (
          <ActionWrapper>
            <TaxActionPanel
              onItemTaxOverride={this.onItemTaxOverride}
              lineNumber={this.props.selectedItems[0]}
              isItemLevel={true}
              onItemTaxExempt={this.onItemTaxExempt}
              onExit={this.handleTaxScreenExit}
              navigation={this.props.navigation}
            >
              <View style={this.styles.cancelProductActionsBtn}>
                <TouchableOpacity style={this.styles.btnSeconday} onPress={this.handleTaxScreenExit}>
                  <Text style={this.styles.btnSecondayText}>
                    { I18n.t("cancel") }
                  </Text>
                </TouchableOpacity>
              </View>
            </TaxActionPanel>
          </ActionWrapper>
        );
      } else if (this.multipleOrAllLinesSelected) {
        header = I18n.t("groupLineItemActions");
        ChildComponent = (
          <ActionWrapper>
            <ItemSelectionActionPanel
              horizontal={false}
              clearSelectedItemLines={this.clearSelectedItemLines}
              onItemDiscount={this.handleItemSelectionItemDiscount}
              onAssignSalesperson={this.handleItemSelectionAssignSalesperson}
              onTaxPress={this.handleItemSelectionTaxDetail}
              navigation={this.props.navigation}
            />
          </ActionWrapper>
        );
      } else if (this.props.printReceipt) {
        header = I18n.t("receipt");
        ChildComponent = (
          <ActionWrapper>
            <ReceiptOptionForm
              customer={this.props.customer}
              providedReceiptCategory={this.props.receiptCategory}
              onClose={this.props.onResetAfterReceiptPrint}
              navigation={this.props.navigation}
            />
          </ActionWrapper>
        );
      } else if (this.noLinesSelected) {
        ChildComponent = (
          <ActionPanel
            returnMode={this.state.returnMode}
            mixedBasketAllowed={this.props.mixedBasketAllowed}
            customerBannerButtonClickable={this.props.customerBannerButtonClickable}
            customerBannerButtonVisible={this.props.customerBannerButtonVisible}
            customer={this.props.customer}
            error={this.props.uiState.mode === UI_MODE_ITEM_NOT_FOUND_RETRY_ENTRY ?
                this.props.businessStateError : undefined}
            shouldDisplayCustomerNumber={this.props.shouldDisplayCustomerNumber}
            shouldDisplayLoyaltyIndicator={this.props.shouldDisplayLoyaltyIndicator}
            onCustomerUpdate={this.handleCustomerUpdate}
            onSuspendTransaction={this.props.onSuspendTransaction}
            onAssignSalesperson={this.handleAssignSalesperson}
            onCoupon={this.handleCoupon}
            onIssueGiftCard={this.handleIssueGiftCard}
            onIssueGiftCertificate={this.handleIssueGiftCertificate}
            onResumeOfSuspendedTransactions={this.onResumeOfSuspendedTransactions}
            onTransactionDiscount={this.handleTransactionDiscount}
            onFastDiscount={this.handleFastDiscount}
            onTransactionTaxExempt={this.handleTransactionTaxExempt}
            onTransactionTaxDetails={this.handleTransactionTaxDetailScreen}
            onNonMerch={this.handleNonMerch}
            onLottery={this.handleLottery}
            onPreConfiguredDiscounts={this.handlePreConfiguredDiscounts}
            onTotal={this.onTotalPressed}
            onEnterReturnMode={this.props.onEnterReturnMode}
            onVoidTransaction={this.props.onVoidTransaction}
            numberOfReturnItems={this.totalNumberOfReturnItems}
            totalTransactionIsAllowed={this.props.totalTransactionIsAllowed}
          />
        );
      } else if (this.oneLineSelected) {
        header = I18n.t("lineItemActions");
        ChildComponent = (
          <ActionWrapper>
            <Product
              lineNumber={this.props.selectedItems[0]}
              showLine={false}
              onProductInformation={this.handleProductInformation}
              onChangeQuantity={this.handleChangeQuantity}
              onChangePrice={this.handleChangePrice}
              onItemDiscount={this.handleItemDiscount}
              onAssignSalesperson={this.handleProductScreenAssignSalesperson}
              onExit={this.handleProductScreenExit}
              onItemComments={this.handleItemCommentsScreen}
              onItemTaxPress={this.handleTaxScreen}
              onReturnReasonChange={this.props.handleReturnReasonChange}
              onItemSubscription={this.handleItemSubscription}
              onAdditionalInfo={this.onAdditionalInfo}
              navigation={this.props.navigation}
            >
              <View style={this.styles.cancelProductActionsBtn}>
                <TouchableOpacity style={this.styles.btnSeconday} onPress={this.handleProductScreenExit}>
                  <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
                </TouchableOpacity>
              </View>
            </Product>
          </ActionWrapper>
        );
      } else if (this.state.returnMode) {
        header = I18n.t("returnMode");
      }

      return { header, ChildComponent };
    }

    public render(): React.ReactNode {
      const { ChildComponent, header } = this.getActionPanel();

      return (
        <MainComponent
          {...this.props}
          headerTitle={header}
          discount={this.state.discount}
          discountType={this.state.discountType}
          returnMode={this.state.returnMode}
          chosenMultiSelectAction={this.chosenMultiSelectAction}
          shouldShowTransactionSummary={this.shouldShowTransactionSummary}
          totalNumberOfItems={this.totalNumberOfItems}
          multipleOrAllLinesSelected={this.multipleOrAllLinesSelected}
          noLinesSelected={this.noLinesSelected}
        >
          { ChildComponent }
        </MainComponent>
      );
    }
  }

  const mapStateToProps = (state: AppState): StateProps => ({
    businessStateError: state.businessState.error,
    businessStateInProgress: state.businessState.inProgress,
    currentScreenName: getCurrentRouteNameWithNavigationRef(),
    displayInfo: state.businessState.displayInfo,
    itemSelectionMode: state.itemSelectionState.itemSelectionMode,
    selectedItems: state.itemSelectionState.selectedItems,
    selectedRedemptions: state.loyaltyMembershipState.selectedRedemptions,
    stateValues: state.businessState.stateValues,
    uiState: state.uiState,
    configurationManager: state.settings.configurationManager
  });

  const mapDispatchToProps: DispatchProps = {
    clearSelectedItemLines: clearSelectedItemLines.request,
    setSelectionEnabled: setSelectionEnabled.request,
    updateUiMode: updateUiMode.request,
    alert: alert.request,
    selectItemLine: selectItemLine.request
  };

  return connect(mapStateToProps, mapDispatchToProps)(WrapperComponent);
}
