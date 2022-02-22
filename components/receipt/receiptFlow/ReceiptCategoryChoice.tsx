import * as React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";

import { Money } from "@aptos-scp/scp-component-business-core";
import {
  DeviceIdentity,
  IConfigurationManager,
  ITransaction,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  CAPTURE_LOTTERY_CODE_EVENT,
  Customer,
  I18nLocationValues,
  I18nTaxFreeConfig,
  IItemDisplayLine,
  ILabel,
  ITaxIdentifier,
  ITEM_ORDER_LINE_TYPE,
  ITEM_RETURN_LINE_TYPE,
  ITEM_SALE_LINE_TYPE,
  LotteryVoidDescription,
  LotteryVoidReason,
  MERCHANDISE_TRANSACTION_TYPE,
  ReceiptCategory,
  ReceiptTypeAllowedTransactionType,
  REPRINT_RECEIPT_TRANSACTION_TYPE,
  TaxCustomer,
  TAX_CUSTOMER_LINE_TYPE,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import {
  CustomerType,
  IMerchandiseTransaction,
  IReceiptLine,
  isReceiptLine,
  ITaxCustomerLine,
  ItemType,
  ITransactionLine,
  LineType,
  MerchandiseTransactionTradeType,
  ReceiptType
} from "@aptos-scp/scp-types-commerce-transaction";
import { TransactionWithAdditionalData } from "@aptos-scp/scp-types-ss-transaction-history";

import I18n from "../../../../config/I18n";
import {
  ActionCreator,
  alert,
  AlertRequest,
  businessOperation,
  getTaxCustomer,
  IAvailableReceiptCategoryButtons,
  sceneTitle,
  setIsInvoice,
  setReceiptCategory
} from "../../../actions";
import { AppState, BusinessState, RetailLocationsState } from "../../../reducers";
import Theme from "../../../styles";
import { AlertModalButton } from "../../common/AlertModal";
import BaseView from "../../common/BaseView";
import Header from "../../common/Header";
import {
  getCustomerDetailsThresholdValdiation,
  getTaxationValdiation,
  getTaxidentifierValdiation,
  ICustomerValidation,
  isConfirmCustomerDetailsDuringReprint,
  isFullTaxInvoiceReprint,
  isTaxCustomerRequiredConfigExists,
  ITaxationValidation,
  ITaxIdentifierValidation,
  updateScroll
} from "../../common/utilities";
import { getEInvoiceForBusinessCustomerFlag } from "../../customer/CustomerUtilities";
import { NavigationProp } from "../../StackNavigatorParams";
import { ReceiptCategoryChoiceProps } from "./interfaces";
import { receiptCategoryChoiceStyles } from "./styles";
import {
  createFromTransaction,
  fullPageInvoiceIsAvailable,
  fullTaxInvoiceIsAvailable,
  japanRSSReceiptIsAvailable,
  standardReceiptIsAvailable,
  vatReceiptIsAvailable
} from "./utils";
import VectorIcon from "../../common/VectorIcon";
import OfflineNotice from "../../common/OfflineNotice";

interface ReceiptTypeChoiceConfigButton {
  text: string;
  receiptCategory: ReceiptCategory;
}

interface StateProps {
  configurationManager: IConfigurationManager;
  chosenReceiptType: ReceiptType;
  isReprintLastReceipt: boolean;
  businessState: BusinessState;
  receiptCategory: ReceiptCategory;
  availableReceiptCategoryButtons: IAvailableReceiptCategoryButtons;
  taxCustomer: TaxCustomer;
  deviceIdentity: DeviceIdentity;
  retailLocations: RetailLocationsState;
  itemDisplayLines?: IItemDisplayLine[];
  returnTransaction?: IMerchandiseTransaction;
  chosenPrinterId: string;
  i18nLocation: string;
}

interface DispatchProps {
  getTaxCustomer: ActionCreator;
  sceneTitle: ActionCreator;
  setReceiptCategory: ActionCreator;
  performBusinessOperation: ActionCreator;
  alert: AlertRequest;
  setIsInvoice: ActionCreator;
}

interface Props extends ReceiptCategoryChoiceProps, StateProps, DispatchProps {
  navigation: NavigationProp;
}

export interface State {
  showSelectedReceiptCategory: boolean;
  isVoidLotteryCode: boolean;
  isShowVoidAlert: boolean;
  handleSingleReceiptType: boolean;
  isScrolling: boolean;
}

export interface ITransactionInfo {
  transactionTotal: Money;
  accountingCurrency: string;
}

class ReceiptCategoryChoice extends React.Component<Props, State> {
  private customer: Customer;
  private styles: any;
  private formattedReceiptTypeChoices: ReceiptTypeChoiceConfigButton[] = [];
  private typeChoicesConfig: any;

  public constructor(props: Props) {
    super(props);

    this.typeChoicesConfig = this.props.configurationManager.getFunctionalBehaviorValues().receipt.typeChoices;

    if (this.props.taxCustomer) {
      this.customer = this.props.taxCustomer;
    } else if (this.props.isReprintLastReceipt && this.props.businessState.lastPrintableTransactionInfo.customer) {
      this.customer = this.props.businessState.lastPrintableTransactionInfo.customer;
    } else {
      this.customer = this.props.businessState.stateValues.get("transaction.customer") as Customer;
    }

    this.formatReceiptTypeChoicesConfig();

    this.styles = Theme.getStyles(receiptCategoryChoiceStyles());

    this.state = {
      showSelectedReceiptCategory: false,
      isVoidLotteryCode: false,
      isShowVoidAlert: false,
      handleSingleReceiptType: true,
      isScrolling: false
    };
  }

  public componentDidMount(): void {
    this.props.getTaxCustomer();
    this.handleReceiptTypeChoices();
  }
  public componentDidUpdate(prevProps: Props): void {
    const prevStateValues = prevProps.businessState.stateValues;
    const stateValues = this.props.businessState.stateValues;
    const hasLotteryCode: boolean = !!this.props.businessState.stateValues.get("transaction.taxLotteryCustomerCode");
    if (!this.props.chosenPrinterId) {
      this.handleReceiptTypeChoices();
    }
    if (prevStateValues !== stateValues) {
      if (this.state.isVoidLotteryCode && !hasLotteryCode) {
        this.setState({isVoidLotteryCode: false});
        this.handleTaxCustomerAssignment();
      }
    }
  }

  public render(): JSX.Element {
    return (
      <BaseView style={this.styles.root}>
        <Header
          title={I18n.t("receipt")}
          backButton={this.props.onCancel && { name: "Back", action: this.props.onCancel }}
          rightButton={(!Theme.isTablet &&
              (this.state.showSelectedReceiptCategory || this.showReceiptTypeChoiceIcon()))
              && { title: I18n.t("continue"), action: this.handleContinue }}
        />
        {!Theme.isTablet &&
        <OfflineNotice isScrolling={this.state.isScrolling}/>}
        <FlatList
          onScrollEndDrag={this.handleScroll.bind(this)}
          data={this.formattedReceiptTypeChoices}
          renderItem={this.renderReceiptFormatButton}
          keyExtractor={this.keyExtractor}
          extraData={[this.props.receiptCategory, this.state.showSelectedReceiptCategory]}
        />
        {
          Theme.isTablet &&
          <View style={this.styles.buttonArea}>
            <TouchableOpacity
              style={[this.styles.btnPrimary, this.styles.progressionButton]}
              onPress={this.handleContinue}
            >
              <Text style={this.styles.btnPrimaryText}>{I18n.t("continue")}</Text>
            </TouchableOpacity>
            {
              this.props.onCancel &&
              <TouchableOpacity
                style={[this.styles.btnSeconday, this.styles.progressionButton]}
                onPress={this.props.onCancel}
              >
                <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
              </TouchableOpacity>
            }
          </View>
        }
      </BaseView>
    );
  }

  private handleScroll(scrollEvent: any): void {
    if (!Theme.isTablet) {
      this.setState({ isScrolling: updateScroll(scrollEvent, this.state.isScrolling)  });
    }
  }

  private renderReceiptFormatButton = ({ item }: { item: ReceiptTypeChoiceConfigButton }): JSX.Element => {
    const i18nLocation = this.props.i18nLocation;

    const eInvoiceFlagForBusinessCustomer =
        getEInvoiceForBusinessCustomerFlag(this.props.configurationManager, i18nLocation);
    const customerType = (this.customer) ? (this.customer.customerType || CustomerType.Personal ) : undefined;

    const isReceiptTypeReprintChoice = isFullTaxInvoiceReprint(this.props.configurationManager, i18nLocation);
    const isInvoicingConfigDuringReprint =
        isConfirmCustomerDetailsDuringReprint(this.props.configurationManager, i18nLocation);
    const disableButtonText = isReceiptTypeReprintChoice && item.receiptCategory === ReceiptCategory.Invoice &&
        this.props.originalReceiptCategory === ReceiptCategory.ReprintReceipt && !(this.customer);

    const i18nTaxFreeConfig: I18nTaxFreeConfig = i18nLocation && this.props.configurationManager.getI18nCountryConfigValues(i18nLocation)?.taxFree;
    const invoiceMixDisabled: boolean = i18nTaxFreeConfig?.mixWithInvoiceAllowed === false;
    const isInvoiceHiddenDuringReprint = invoiceMixDisabled && this.props.businessState.lastPrintableTransactionInfo?.taxFreeFormKey;
    if (item.receiptCategory !== ReceiptCategory.Invoice && item.receiptCategory !== ReceiptCategory.FullPageInvoice ||
        (!this.props.isReprintLastReceipt || !isInvoiceHiddenDuringReprint)) {
      return (
        <TouchableOpacity
          style={this.styles.receiptTypeChoiceButton}
          disabled={disableButtonText}
          onPress={() => {
            this.props.setReceiptCategory(item.receiptCategory);

            if (item.receiptCategory === ReceiptCategory.Invoice) {
              if (isInvoicingConfigDuringReprint) {
                this.props.originalReceiptCategory !== ReceiptCategory.ReprintReceipt ? this.handleLotteryInvoiceFlow() : this.handleTaxCustomerDetails();
              } else if (!this.props.taxCustomer || this.props.originalReceiptCategory === ReceiptCategory.ReprintReceipt) {
                this.handleLotteryInvoiceFlow();
              }
            } else if(item.receiptCategory === ReceiptCategory.JapanRSSReceipt) {
              this.handleJapanRSSReceiptFlow();
            }
            else if (eInvoiceFlagForBusinessCustomer && customerType === CustomerType.Business && item.receiptCategory !== ReceiptCategory.FullPageInvoice) {
              this.handleTaxCustomerAssignment();
            } else if(item.receiptCategory === ReceiptCategory.FullPageInvoice)
            {
              this.handleTaxCustomerAssignmentForFullPageInvoice();
            }
          }}
        >
          <Text style={disableButtonText ? this.styles.receiptTypeChoiceButtonTextDisable : this.styles.receiptTypeChoiceButtonText}>{item.text}</Text>
          {
            this.props.receiptCategory === item.receiptCategory &&
              (this.state.showSelectedReceiptCategory || this.showReceiptTypeChoiceIcon()) &&
            <VectorIcon
              name="Checkmark"
              fill={this.styles.receiptTypeChoiceButtonText.color}
              height={this.styles.checkIcon.fontSize}
            />
          }
        </TouchableOpacity>
      );
    }
    return;
  }

  private getTransactionDetails(): ITransactionInfo {
    let transactionTotal: Money = undefined;
    let accountingCurrency: string = undefined;
    if (this.props.businessState.stateValues.get("transaction.type") === MERCHANDISE_TRANSACTION_TYPE) {
      accountingCurrency = this.props.businessState.stateValues.get("transaction.accountingCurrency");
      if (this.props.returnTransaction) {
        const totalAmount = this.props.returnTransaction.transactionTotal?.amount;
        transactionTotal = new Money(totalAmount || 0.00, accountingCurrency);
      } else {
        transactionTotal = this.props.businessState.stateValues.get("transaction.total");
      }
    } else if (this.props.originalReceiptCategory === ReceiptCategory.ReprintReceipt &&
      this.props.transactionToReprint &&
      this.props.transactionToReprint.transactionType === MERCHANDISE_TRANSACTION_TYPE &&
      this.props.transactionToReprint.transactionTotal) {
      transactionTotal = new Money(this.props.transactionToReprint.transactionTotal.amount,
          this.props.transactionToReprint.transactionTotal.currency);
      accountingCurrency = this.props.transactionToReprint.accountingCurrency;
    }
    const transactionTotalVal = transactionTotal?.amount?.replace(/[-]/g, "");
    transactionTotal = transactionTotalVal && new Money(transactionTotalVal, accountingCurrency);
    const transactionDetails: ITransactionInfo = {
      transactionTotal,
      accountingCurrency
    };
    return transactionDetails;
  }

  private handleTaxIdentifiersThreshold(): boolean {
    let isIdNumberRequired: boolean = false;
    let isRucRequired: boolean = false;
    const taxCustomer = this.customer && this.customer as TaxCustomer;
    if (this.props.itemDisplayLines &&
        this.props.itemDisplayLines.some((line: IItemDisplayLine) => line.lineType === ITEM_RETURN_LINE_TYPE)) {
      isRucRequired = this.props.returnTransaction &&
        this.props.returnTransaction.lines.some((line: ITaxCustomerLine) => line.lineType === TAX_CUSTOMER_LINE_TYPE &&
          line.ruc?.value);
      isIdNumberRequired = this.props.returnTransaction &&
        this.props.returnTransaction.lines.some((line: ITaxCustomerLine) => line.lineType === TAX_CUSTOMER_LINE_TYPE &&
          line.idNumber?.value);
    } else if (this.typeChoicesConfig.fullTaxInvoice && fullTaxInvoiceIsAvailable(this.props.originalReceiptCategory,
      this.props.chosenReceiptType, this.props.availableReceiptCategoryButtons)) {
      const transactionDetails: ITransactionInfo = this.getTransactionDetails();
      const transactionTotal: Money = transactionDetails.transactionTotal;
      const accountingCurrency: string = transactionDetails.accountingCurrency;
      if (transactionTotal && accountingCurrency) {
        const i18nLocation = this.props.i18nLocation;
        if (i18nLocation && i18nLocation === I18nLocationValues.Peru) {
          const taxIdentifiersThreshold: ITaxIdentifierValidation =
              getTaxidentifierValdiation(this.props.configurationManager, i18nLocation,
              transactionTotal, accountingCurrency);
          isRucRequired = taxIdentifiersThreshold.ruc;
          isIdNumberRequired = taxIdentifiersThreshold.idNumber;
        }
      } else if (taxCustomer) {
        if (taxCustomer.ruc && taxCustomer.ruc.value) {
          isRucRequired = true;
        } else if (taxCustomer.idNumber && taxCustomer.idNumber.value) {
          isIdNumberRequired = true;
        }
      }
    }
    return  isRucRequired && !isIdNumberRequired;
  }

  private handleTaxationThreshold(): boolean {
    let isVatNumberRequired: boolean = false;
    if (this.typeChoicesConfig.fullTaxInvoice && fullTaxInvoiceIsAvailable(this.props.originalReceiptCategory,
      this.props.chosenReceiptType, this.props.availableReceiptCategoryButtons)) {
      const transactionDetails: ITransactionInfo = this.getTransactionDetails();
      const transactionTotal: Money = transactionDetails.transactionTotal;
      const accountingCurrency: string = transactionDetails.accountingCurrency;
      if (transactionTotal && accountingCurrency) {
        const i18nLocation = this.props.i18nLocation;
        if (i18nLocation && i18nLocation === I18nLocationValues.Portugal) {
          const taxIdentifiersThreshold: ITaxationValidation =
              getTaxationValdiation(this.props.configurationManager, i18nLocation,
              transactionTotal, accountingCurrency);
          isVatNumberRequired = taxIdentifiersThreshold.vatNumber? false : true;
        }
      }
    }
    return  isVatNumberRequired;
  }

  private handleCustomerDetailsThreshold(): ICustomerValidation {
    let customerValidationDetails: ICustomerValidation = {};

    if (this.props.returnTransaction) {
      customerValidationDetails = {
        firstName: false,
        lastName: false,
        companyName: false,
        countryCode: false,
        phoneNumber: false,
        address: false
      };
    } else {
      if (this.typeChoicesConfig.fullTaxInvoice && fullTaxInvoiceIsAvailable(this.props.originalReceiptCategory,
        this.props.chosenReceiptType, this.props.availableReceiptCategoryButtons)) {
        const transactionDetails: ITransactionInfo = this.getTransactionDetails();
        const transactionTotal: Money = transactionDetails.transactionTotal;
        const accountingCurrency: string = transactionDetails.accountingCurrency;
        if (transactionTotal && accountingCurrency) {
          const i18nLocation = this.props.i18nLocation;
          if (i18nLocation &&
              (i18nLocation === I18nLocationValues.Peru || i18nLocation === I18nLocationValues.Portugal)) {
            customerValidationDetails = getCustomerDetailsThresholdValdiation(this.props.configurationManager,
                i18nLocation, transactionTotal, accountingCurrency);
          }
        }
      } else {
        customerValidationDetails = {
          firstName: false,
          lastName: false,
          companyName: false,
          countryCode: false,
          phoneNumber: false,
          address: false
        };
      }
    }
    return customerValidationDetails;
  }

  private handleTaxCustomerDetails(): void {
    const taxCustomer = this.customer && this.customer as TaxCustomer;
    this.props.getTaxCustomer(taxCustomer);
    this.setState({ showSelectedReceiptCategory: true });
  }

  private showReceiptTypeChoiceIcon(): boolean {
    const i18nLocation = this.props.i18nLocation;
    const eInvoiceFlagForBusinessCustomer =
        getEInvoiceForBusinessCustomerFlag(this.props.configurationManager, i18nLocation);
    const customerType = (this.customer) ? (this.customer.customerType || CustomerType.Personal ) : undefined;
    let showReceiptTypeChoiceIcon: boolean = false;

    if (!eInvoiceFlagForBusinessCustomer
        || (eInvoiceFlagForBusinessCustomer && customerType === CustomerType.Business)
        || customerType !== CustomerType.Business) {
      showReceiptTypeChoiceIcon = true;
    }
    return showReceiptTypeChoiceIcon;
  }

  private keyExtractor = (item: ReceiptTypeChoiceConfigButton, index: number): string => index.toString();

  private get fullTaxInvoiceText(): string {
    return this.typeChoicesConfig.fullTaxInvoiceButtonText[I18n.currentLocale()] || I18n.t("fullTaxInvoice");
  }

  private get vatReceiptText(): string {
    return this.typeChoicesConfig.vatReceiptButtonText[I18n.currentLocale()] || I18n.t("vatReceipt");
  }

  private get japanRSSReceiptButtonText(): string {
    const i18nLabels: ILabel = this.typeChoicesConfig.japanRSSReceiptButtonText;
    return I18n.t(i18nLabels.i18nCode, { defaultValue: i18nLabels.default }) || I18n.t("japanRSSReceipt");
  }

  private get fullPageInvoiceText(): string {
    const returnValue = this.props.itemDisplayLines?.filter(item =>
        item.lineType === LineType.ItemReturn && item.itemType === ItemType.Merchandise);
    const reprintAfterReturn = this.props.businessState.lastPrintableTransactionInfo;
    if (returnValue && returnValue.length > 0 ||
        (this.props.isReprintLastReceipt && reprintAfterReturn.tradeType === MerchandiseTransactionTradeType.Return &&
        (reprintAfterReturn.transactionType === MERCHANDISE_TRANSACTION_TYPE ||
        reprintAfterReturn.transactionType === REPRINT_RECEIPT_TRANSACTION_TYPE)) ||
        (this.props.transactionToReprint &&
        this.props.transactionToReprint.tradeType === MerchandiseTransactionTradeType.Return &&
        this.props.transactionToReprint.transactionType === MERCHANDISE_TRANSACTION_TYPE)) {
      return this.typeChoicesConfig.fullPageCreditNoteButtonText[I18n.currentLocale()] || I18n.t("fullPageInvoice");
    } else {
      return this.typeChoicesConfig.fullPageInvoiceButtonText[I18n.currentLocale()] || I18n.t("fullPageInvoice");
    }
  }

  // tslint:disable-next-line:cyclomatic-complexity
  private formatReceiptTypeChoicesConfig(): void {
    const i18nLocation = this.props.i18nLocation;
    const i18nTaxFreeConfig: I18nTaxFreeConfig = i18nLocation &&
        this.props.configurationManager.getI18nCountryConfigValues(i18nLocation)?.taxFree;
    const invoiceMixDisabled: boolean = i18nTaxFreeConfig?.mixWithInvoiceAllowed === false;
    const fullTaxInvoiceDisabledforOrderTransaction = this.isFullTaxInvoiceDisabledforOrderTransaction();
    const fullTaxInvoiceHidden = invoiceMixDisabled && (!!this.props.businessState.stateValues.get("TaxRefundSession.documentIdentifier") ||
        !!(this.props.transactionToReprint && this.props.transactionToReprint.taxFreeFormKey));
    const fullTaxInvoiceAllowed = this.isFullTaxInvoiceAllowed();
    const fullPageInvoiceHidden = invoiceMixDisabled && (!!this.props.businessState.stateValues.get("TaxRefundSession.documentIdentifier") ||
        !!(this.props.transactionToReprint && this.props.transactionToReprint.taxFreeFormKey));
    const fullPageInvoiceAllowed = this.isFullPageInvoiceAllowed();
    const receiptCategoryForReturnWithTransaction =
        this.getReceiptCategoryForReturnWithTransaction(fullTaxInvoiceHidden, fullTaxInvoiceAllowed,
        fullPageInvoiceHidden, fullPageInvoiceAllowed);
    const restrictReturnWithTransactionReceiptOptionsToOriginal = !!receiptCategoryForReturnWithTransaction;
    const fullTaxInvoiceRequired = !fullTaxInvoiceHidden && !restrictReturnWithTransactionReceiptOptionsToOriginal &&
        !fullTaxInvoiceDisabledforOrderTransaction && fullTaxInvoiceAllowed && this.isFullTaxInvoiceRequired();
    const japanRSSReceiptAllowed = this.isJapanRSSReceiptAllowed();

    if (this.typeChoicesConfig.standardReceipt && standardReceiptIsAvailable(this.props.originalReceiptCategory,
        this.props.chosenReceiptType, this.props.availableReceiptCategoryButtons) && !fullTaxInvoiceRequired &&
        this.isReceiptCategoryValid(ReceiptCategory.Receipt, receiptCategoryForReturnWithTransaction)) {
      this.formattedReceiptTypeChoices.push({
        text: this.typeChoicesConfig.standardReceiptButtonText[I18n.currentLocale()] || I18n.t("standardReceipt"),
        receiptCategory: ReceiptCategory.Receipt
      });
    }

    if (this.typeChoicesConfig.vatReceipt && vatReceiptIsAvailable(this.props.originalReceiptCategory,
        this.props.chosenReceiptType, this.props.availableReceiptCategoryButtons) && !fullTaxInvoiceRequired &&
        this.isReceiptCategoryValid(ReceiptCategory.VatReceipt, receiptCategoryForReturnWithTransaction)) {
      this.formattedReceiptTypeChoices.push({
        text: this.typeChoicesConfig.vatReceiptButtonText[I18n.currentLocale()] || I18n.t("vatReceipt"),
        receiptCategory: ReceiptCategory.VatReceipt
      });
    }

    if (this.typeChoicesConfig.fullTaxInvoice && fullTaxInvoiceIsAvailable(this.props.originalReceiptCategory,
        this.props.chosenReceiptType, this.props.availableReceiptCategoryButtons) && !fullTaxInvoiceHidden &&
        !fullTaxInvoiceDisabledforOrderTransaction && fullTaxInvoiceAllowed &&
        this.isReceiptCategoryValid(ReceiptCategory.Invoice, receiptCategoryForReturnWithTransaction)) {
      this.formattedReceiptTypeChoices.push({
        text: this.fullTaxInvoiceText,
        receiptCategory: ReceiptCategory.Invoice
      });
      if (!this.props.taxCustomer) {
        this.handleTaxCustomerForReturnWithTransaction();
      }
    }

    this.formatFullPageInvoiceConfig(receiptCategoryForReturnWithTransaction, fullPageInvoiceHidden,
        fullPageInvoiceAllowed);
    this.formatJapanRSSReceiptConfig(japanRSSReceiptAllowed);
  }

  private formatFullPageInvoiceConfig(receiptCategoryForReturnWithTransaction: ReceiptCategory,
      fullPageInvoiceHidden: boolean, fullPageInvoiceAllowed: boolean): void {
    if (this.typeChoicesConfig.fullPageInvoice && fullPageInvoiceIsAvailable(this.props.originalReceiptCategory,
        this.props.chosenReceiptType, this.props.availableReceiptCategoryButtons) && !fullPageInvoiceHidden &&
        fullPageInvoiceAllowed &&
        this.isReceiptCategoryValid(ReceiptCategory.FullPageInvoice, receiptCategoryForReturnWithTransaction)) {
      this.formattedReceiptTypeChoices.push({
        text: this.fullPageInvoiceText,
        receiptCategory: ReceiptCategory.FullPageInvoice
      });
      this.handleTaxCustomerForReturnWithTransaction();
    }
  }

  private formatJapanRSSReceiptConfig(japanRSSReceiptAllowed: boolean): void {
    if (this.typeChoicesConfig.japanRSSReceipt &&
        japanRSSReceiptIsAvailable(this.props.originalReceiptCategory, this.props.chosenReceiptType,
        this.props.availableReceiptCategoryButtons) && japanRSSReceiptAllowed) {
      let transactionTotal: Money = undefined;
      let accountingCurrency: string = undefined;
      let showJapanRSSReceipt: boolean = false;
      if (this.props.businessState.stateValues.get("transaction.type") === MERCHANDISE_TRANSACTION_TYPE) {
        transactionTotal = this.props.businessState.stateValues.get("transaction.total");
        accountingCurrency = this.props.businessState.stateValues.get("transaction.accountingCurrency");
      } else if (this.props.originalReceiptCategory === ReceiptCategory.ReprintReceipt &&
          this.props.transactionToReprint &&
          this.props.transactionToReprint.transactionType === MERCHANDISE_TRANSACTION_TYPE &&
          this.props.transactionToReprint.transactionTotal) {
        transactionTotal = new Money(this.props.transactionToReprint.transactionTotal.amount,
            this.props.transactionToReprint.transactionTotal.currency);
        accountingCurrency = this.props.transactionToReprint.accountingCurrency;
      }
      if (transactionTotal && accountingCurrency) {
        showJapanRSSReceipt = transactionTotal.gt(new Money(0, accountingCurrency));
      } else if (this.props.isReprintLastReceipt && this.props.businessState.lastPrintableTransactionInfo &&
          (this.props.businessState.lastPrintableTransactionInfo.transactionType === MERCHANDISE_TRANSACTION_TYPE ||
            this.props.businessState.lastPrintableTransactionInfo.transactionType === REPRINT_RECEIPT_TRANSACTION_TYPE)) {
        showJapanRSSReceipt = true;
      }
      if (showJapanRSSReceipt) {
        const i18nLabels: ILabel = this.typeChoicesConfig.japanRSSReceiptButtonText;
        this.formattedReceiptTypeChoices.push({
          text: i18nLabels && I18n.t(i18nLabels.i18nCode, { defaultValue: i18nLabels.default }) || I18n.t("japanRSSReceipt"),
          receiptCategory: ReceiptCategory.JapanRSSReceipt
        });
      }
    }
  }

  private isFullTaxInvoiceRequired(): boolean {
    let fullTaxInvoiceRequired: boolean = false;

    if (this.typeChoicesConfig.fullTaxInvoice && fullTaxInvoiceIsAvailable(this.props.originalReceiptCategory,
        this.props.chosenReceiptType, this.props.availableReceiptCategoryButtons) &&
        this.props.businessState.stateValues.get("transaction.type") === MERCHANDISE_TRANSACTION_TYPE) {
      const transactionTotal: Money = this.props.businessState.stateValues.get("transaction.total");
      const accountingCurrency: string = this.props.businessState.stateValues.get("transaction.accountingCurrency");
      if (transactionTotal && accountingCurrency) {
        const i18nLocation = this.props.i18nLocation;
        const invoicingConfig = this.props.configurationManager.getI18nCountryConfigValues(i18nLocation).invoicing;
        if (invoicingConfig && invoicingConfig.transactionAmountToMandateInvoice) {
          if (i18nLocation && i18nLocation === I18nLocationValues.Peru) {
            fullTaxInvoiceRequired = transactionTotal
              .gte(new Money(invoicingConfig.transactionAmountToMandateInvoice, accountingCurrency));
          } else {
            fullTaxInvoiceRequired = transactionTotal
              .gt(new Money(invoicingConfig.transactionAmountToMandateInvoice, accountingCurrency));
          }
        }
      }
    }
    return fullTaxInvoiceRequired;
  }

  private isFullTaxInvoiceDisabledforOrderTransaction(): boolean {
    let fullTaxInvoiceDisabled: boolean = false;
    if (this.typeChoicesConfig.fullTaxInvoice && fullTaxInvoiceIsAvailable(this.props.originalReceiptCategory,
        this.props.chosenReceiptType, this.props.availableReceiptCategoryButtons) &&
        this.props.businessState.stateValues.get("transaction.type") === MERCHANDISE_TRANSACTION_TYPE) {

      const hasOrderReferenceId: boolean =
          !!this.props.businessState.stateValues.get("transaction.order")?.orderReferenceId;
      const isPickingUpItems: boolean = this.props.businessState.stateValues.get("transaction.isPickingUpItems");
      const transactionTradeType: string = this.props.businessState.stateValues.get("transaction.transactionTradeType");

      const returnWithTransaction: boolean = this.props.businessState.stateValues.get("ItemHandlingSession.returnWithTransaction");
      const transactionInformationForReturn: IMerchandiseTransaction =
          this.props.businessState.stateValues.get("ItemHandlingSession.transactionInformationForReturn")?.transaction;

      fullTaxInvoiceDisabled = hasOrderReferenceId ||
          isPickingUpItems ||
          transactionTradeType === MerchandiseTransactionTradeType.Account ||
          (returnWithTransaction && !!transactionInformationForReturn?.order?.orderReferenceId);
    }
    return fullTaxInvoiceDisabled;
  }

  private isFullTaxInvoiceAllowed(): boolean {
    if (this.typeChoicesConfig.fullTaxInvoice && fullTaxInvoiceIsAvailable(this.props.originalReceiptCategory,
        this.props.chosenReceiptType, this.props.availableReceiptCategoryButtons)) {
      const invoiceAllowedTransactionTypeConfig: ReceiptTypeAllowedTransactionType =
          this.typeChoicesConfig.fullTaxInvoiceAllowedFor as ReceiptTypeAllowedTransactionType;
      if (!invoiceAllowedTransactionTypeConfig) {
        return true;
      }
      if (invoiceAllowedTransactionTypeConfig === ReceiptTypeAllowedTransactionType.Both) {
        return true;
      }
      if (invoiceAllowedTransactionTypeConfig === ReceiptTypeAllowedTransactionType.Original) {
        return this.props.originalReceiptCategory !== ReceiptCategory.ReprintReceipt;
      }
      if (invoiceAllowedTransactionTypeConfig === ReceiptTypeAllowedTransactionType.Reprint) {
        return this.props.originalReceiptCategory === ReceiptCategory.ReprintReceipt;
      }
    }
    return true;
  }

  private isFullPageInvoiceAllowed(): boolean {
    if (this.typeChoicesConfig.fullPageInvoice && fullPageInvoiceIsAvailable(this.props.originalReceiptCategory,
        this.props.chosenReceiptType, this.props.availableReceiptCategoryButtons)) {
      const invoiceAllowedTransactionTypeConfig: ReceiptTypeAllowedTransactionType =
          this.typeChoicesConfig.fullPageInvoiceAllowedFor as ReceiptTypeAllowedTransactionType;
      if (!invoiceAllowedTransactionTypeConfig) {
        return true;
      }
      if (invoiceAllowedTransactionTypeConfig === ReceiptTypeAllowedTransactionType.Both) {
        return true;
      }
      if (invoiceAllowedTransactionTypeConfig === ReceiptTypeAllowedTransactionType.Original) {
        return this.props.originalReceiptCategory !== ReceiptCategory.ReprintReceipt;
      }
      if (invoiceAllowedTransactionTypeConfig === ReceiptTypeAllowedTransactionType.Reprint) {
        return this.props.originalReceiptCategory === ReceiptCategory.ReprintReceipt;
      }
    }
    return true;
  }

  private isJapanRSSReceiptAllowed(): boolean {
    if (this.typeChoicesConfig.japanRSSReceipt && japanRSSReceiptIsAvailable(this.props.originalReceiptCategory,
        this.props.chosenReceiptType, this.props.availableReceiptCategoryButtons)
      ) {
      const japanRSSReceiptAllowedTransactionTypeConfig: ReceiptTypeAllowedTransactionType =
          this.typeChoicesConfig.japanRSSReceiptAllowedFor as ReceiptTypeAllowedTransactionType;
      if (!japanRSSReceiptAllowedTransactionTypeConfig) {
        return true;
      }
      if (japanRSSReceiptAllowedTransactionTypeConfig === ReceiptTypeAllowedTransactionType.Both) {
        return true;
      }
      if (japanRSSReceiptAllowedTransactionTypeConfig === ReceiptTypeAllowedTransactionType.Original) {
        return this.props.originalReceiptCategory !== ReceiptCategory.ReprintReceipt;
      }
      if (japanRSSReceiptAllowedTransactionTypeConfig === ReceiptTypeAllowedTransactionType.Reprint) {
        return this.props.originalReceiptCategory === ReceiptCategory.ReprintReceipt;
      }
    }
    return true;
  }

  // tslint:disable-next-line:cyclomatic-complexity
  private getReceiptCategoryForReturnWithTransaction(fullTaxInvoiceHidden: boolean, fullTaxInvoiceAllowed: boolean,
                                                     fullPageInvoiceHidden: boolean,
                                                     fullPageInvoiceAllowed: boolean): ReceiptCategory {
    if (this.typeChoicesConfig.restrictReturnWithTransactionReceiptOptionsToOriginal &&
        this.props.businessState.stateValues.get("transaction.type") === MERCHANDISE_TRANSACTION_TYPE) {
      const transactionTradeType: MerchandiseTransactionTradeType =
          this.props.businessState.stateValues.get("transaction.transactionTradeType");
      const returnWithTransaction: boolean =
          this.props.businessState.stateValues.get("ItemHandlingSession.returnWithTransaction");
      const transactionInformationForReturn: IMerchandiseTransaction =
          this.props.businessState.stateValues.get("ItemHandlingSession.transactionInformationForReturn")?.transaction;

      if (transactionTradeType === MerchandiseTransactionTradeType.Return && returnWithTransaction && transactionInformationForReturn) {
        // for StoreTender, the receipt category returned by the reverse converter is Receipt
        // which is not accurate for the internal transactions receipt category
        // so first filtering Invoice & VatReceipt and then Receipt
        const receiptLine: IReceiptLine =
          transactionInformationForReturn.lines.find((line: ITransactionLine) =>
            isReceiptLine(line) && line.lineType === LineType.Receipt && (
              line.receiptCategory === ReceiptCategory.Invoice ||
              line.receiptCategory === ReceiptCategory.VatReceipt)) as IReceiptLine ||
          transactionInformationForReturn.lines.find((line: ITransactionLine) =>
            isReceiptLine(line) && line.lineType === LineType.Receipt &&
            line.receiptCategory === ReceiptCategory.Receipt) as IReceiptLine;

        const receiptCategory = receiptLine && receiptLine.receiptCategory;
        if (receiptCategory) {
          if (receiptCategory === ReceiptCategory.Receipt &&
              this.typeChoicesConfig.standardReceipt && standardReceiptIsAvailable(this.props.originalReceiptCategory,
              this.props.chosenReceiptType, this.props.availableReceiptCategoryButtons)) {
            return receiptCategory;
          }
          if (receiptCategory === ReceiptCategory.VatReceipt &&
              this.typeChoicesConfig.vatReceipt && vatReceiptIsAvailable(this.props.originalReceiptCategory,
              this.props.chosenReceiptType, this.props.availableReceiptCategoryButtons)) {
            return receiptCategory;
          }
          if (receiptCategory === ReceiptCategory.Invoice && !fullTaxInvoiceHidden && fullTaxInvoiceAllowed &&
              this.typeChoicesConfig.fullTaxInvoice && fullTaxInvoiceIsAvailable(this.props.originalReceiptCategory,
              this.props.chosenReceiptType, this.props.availableReceiptCategoryButtons)) {
            return receiptCategory;
          }
          this.getFullPageInvoiceCategoryForReturnWithTransaction(receiptCategory, fullPageInvoiceHidden,
              fullPageInvoiceAllowed);
        }
      }
    }
    return undefined;
  }

  private getFullPageInvoiceCategoryForReturnWithTransaction(receiptCategory: ReceiptCategory,
                                                             fullPageInvoiceHidden: boolean,
                                                             fullPageInvoiceAllowed: boolean): ReceiptCategory {
    if (receiptCategory === ReceiptCategory.FullPageInvoice && !fullPageInvoiceHidden && fullPageInvoiceAllowed &&
        this.typeChoicesConfig.fullPageInvoice && fullPageInvoiceIsAvailable(this.props.originalReceiptCategory,
            this.props.chosenReceiptType, this.props.availableReceiptCategoryButtons)) {
      return receiptCategory;
    }
  }

  private isReceiptCategoryValid(receiptCategory: ReceiptCategory, receiptCategoryForReturn: ReceiptCategory): boolean {
    if (receiptCategoryForReturn) {
      return receiptCategoryForReturn === receiptCategory;
    }
    return true;
  }


  private handleTaxCustomerAssignment(): void {
    const taxCustomerIsValid: boolean = this.isTaxCustomerInfoValid(this.props.taxCustomer);

    if (!taxCustomerIsValid) {
      this.props.sceneTitle("customerTaxInvoice", "confirmDetails");

      const buttonText: string = this.props.chosenReceiptType === ReceiptType.Email ? I18n.t("email") : I18n.t("print");
      const i18nLocation = this.props.i18nLocation;
      this.props.navigation.push("customerTaxInvoice", {
        taxInvoiceButtonText: `${buttonText} ${this.fullTaxInvoiceText}`,
        saveCustomerTaxInformation: this.handleSaveTaxCustomer,
        isRucRequired: i18nLocation && i18nLocation === I18nLocationValues.Peru ?
            this.handleTaxIdentifiersThreshold() : false,
        vatNumberRequired: i18nLocation && i18nLocation === I18nLocationValues.Portugal ?
            this.handleTaxationThreshold() : true,
        customerValidationDetails: this.handleCustomerDetailsThreshold(),
        onExit: () => { return; }
      });
    }
  }

  private handleTaxCustomerAssignmentForReturn(): void {
    const taxCustomerIsValid: boolean = this.isTaxCustomerInfoValid(this.props.taxCustomer);

    if (!taxCustomerIsValid) {
      this.props.sceneTitle("customerTaxInvoice", "confirmDetails");

      const buttonText: string = this.props.chosenReceiptType === ReceiptType.Email ? I18n.t("email") : I18n.t("print");
      const i18nLocation = this.props.i18nLocation;
      this.props.navigation.push("customerTaxInvoice", {
        taxInvoiceButtonText: `${buttonText} ${this.vatReceiptText}`,
        saveCustomerTaxInformation: this.handleSaveTaxCustomer,
        vatNumberRequired: i18nLocation && i18nLocation === I18nLocationValues.Portugal ? this.handleTaxationThreshold() : true,
        onExit: () => {return;}
      });
    }
  }

  private handleLotteryInvoiceFlow(): void {
    const hasLotteryCode: boolean = !!this.props.businessState.stateValues.get("transaction.taxLotteryCustomerCode");
    if (hasLotteryCode) {
      this.showVoidLotteryAlert();
    } else {
      this.handleTaxCustomerAssignment();
    }
  }

  private showVoidLotteryAlert(): void {
    this.showAlert(
      I18n.t("voidLotteryInvoiceWarning"),
      I18n.t("voidInvoiceLotteryMessage"),
      [
        { text: I18n.t("cancel"), style: "cancel" },
        { text: I18n.t("continue"), onPress: this.getAlertOnPress() }
      ]
    );
  }

  private handleJapanRSSReceiptFlow(): void {
    const taxCustomerIsValid: boolean = this.isTaxCustomerInfoValid(this.props.taxCustomer);

    if (!taxCustomerIsValid) {
      this.props.sceneTitle("customerTaxInvoice", "confirmDetails");

      const buttonText: string = this.props.chosenReceiptType === ReceiptType.Email ? I18n.t("email") : I18n.t("print");

      this.props.navigation.push("customerTaxInvoice", {
        taxInvoiceButtonText: `${buttonText} ${this.japanRSSReceiptButtonText}`,
        saveCustomerTaxInformation: this.handleSaveTaxCustomer,
        onExit: () => {
          //intentionally empty
        }
      });
    }
  }

  private showAlert(title: string, message: string, buttons: AlertModalButton[], defaultButtonIndex?: number): void {
    this.setState(
      { isShowVoidAlert: true },
      () => this.props.alert(title, message, buttons, { cancelable: false, defaultButtonIndex })
    );
  }

  private getAlertOnPress = (tillInEventMethod?: () => void): () => void => {
    return (): void => {
      this.setState({ isShowVoidAlert: false });
      this.voidLotteryCode();
    };
  }

  private voidLotteryCode = (): void => {
    const uiInputs: UiInput[] = [];
    this.setState({isVoidLotteryCode: true});
    uiInputs.push(new UiInput(UiInputKey.VOID_REASON, LotteryVoidReason.VOIDED_FOR_INVOICE));
    uiInputs.push(new UiInput(UiInputKey.VOID_REASON_DESC, LotteryVoidDescription.VOIDED_FOR_INVOICE));
    uiInputs.push(new UiInput(UiInputKey.VOID_LOTTERY_CODE, true));
    this.props.performBusinessOperation(this.props.deviceIdentity, CAPTURE_LOTTERY_CODE_EVENT, uiInputs);
  }

  private handleTaxCustomerAssignmentForFullPageInvoice(): void {
    const taxCustomerIsValid: boolean = this.isTaxCustomerInfoValid(this.props.taxCustomer);

    if (!taxCustomerIsValid) {
      this.props.sceneTitle("customerTaxInvoice", "confirmDetails");

      const buttonText: string = this.props.chosenReceiptType === ReceiptType.Email ? I18n.t("email") : I18n.t("print");

      this.props.navigation.push("customerTaxInvoice", {
        taxInvoiceButtonText: `${buttonText} ${this.fullPageInvoiceText}`,
        saveCustomerTaxInformation: this.handleSaveTaxCustomer,
        onExit: () => {
          //intentionally empty
        }
      });
    }
  }

  private isTaxCustomerInfoValid = (taxCustomerInfo: TaxCustomer): boolean => {
    return taxCustomerInfo && (
      !!taxCustomerInfo.firstName &&
      !!taxCustomerInfo.lastName &&
      !!taxCustomerInfo.address1 &&
      !!taxCustomerInfo.address2 &&
      !!(taxCustomerInfo.governmentTaxIdentifier && taxCustomerInfo.governmentTaxIdentifier.value) &&
      !!(taxCustomerInfo.taxCode && taxCustomerInfo.taxCode.value) &&
      !!(taxCustomerInfo.pecAddress && taxCustomerInfo.pecAddress.value) &&
      !!(taxCustomerInfo.addressCode && taxCustomerInfo.addressCode.value) &&
      !!taxCustomerInfo.countryCode &&
      !!taxCustomerInfo.city &&
      !!taxCustomerInfo.state &&
      !!taxCustomerInfo.postalCode &&
      this.isAdditionalCustomerInfoValid(taxCustomerInfo)
    );
  }

  private isAdditionalCustomerInfoValid(taxCustomerInfo: TaxCustomer): boolean {
    return taxCustomerInfo && (
      !!(taxCustomerInfo.idNumber && taxCustomerInfo.idNumber.value) &&
      !!(taxCustomerInfo.ruc && taxCustomerInfo.ruc.value)
    );
  }

  private handleSaveTaxCustomer = (customer: Customer, taxIdentifier: string, taxIdentifierName: string,
                                   taxCode: string, taxCodeName: string, pecAddress: string,
                                   pecAddressName: string, addressCode: string, addressCodeName: string,
                                   idNumber: string, idNumberName: string, ruc: string, rucName: string): void => {
    const taxCustomer = customer as TaxCustomer;
    if (taxCustomer) {
      taxCustomer.governmentTaxIdentifier = {
        name: taxIdentifierName,
        value: taxIdentifier
      } as ITaxIdentifier;

      taxCustomer.taxCode = {
        name: taxCodeName,
        value: taxCode
      } as ITaxIdentifier;

      taxCustomer.pecAddress = {
        name: pecAddressName,
        value: pecAddress
      } as ITaxIdentifier;

      taxCustomer.addressCode = {
        name: addressCodeName,
        value: addressCode
      } as ITaxIdentifier;

      taxCustomer.idNumber = {
        name: idNumberName,
        value: idNumber
      } as ITaxIdentifier;

      taxCustomer.ruc = {
        name: rucName,
        value: ruc
      } as ITaxIdentifier;

      this.props.getTaxCustomer(taxCustomer);
      this.setState({ showSelectedReceiptCategory: true, handleSingleReceiptType: false });
      this.props.navigation.pop();
      this.props.onContinue();
    }
  }

  private handleTaxCustomerForReturnWithTransaction(): void {
    if (this.typeChoicesConfig.restrictReturnWithTransactionReceiptOptionsToOriginal &&
        this.props.businessState.stateValues.get("transaction.type") === MERCHANDISE_TRANSACTION_TYPE) {
      const transactionTradeType: MerchandiseTransactionTradeType =
          this.props.businessState.stateValues.get("transaction.transactionTradeType");
      const returnWithTransaction: boolean =
          this.props.businessState.stateValues.get("ItemHandlingSession.returnWithTransaction");
      const transactionInformationForReturn: ITransaction =
          this.props.businessState.stateValues.get("ItemHandlingSession.transactionInformationForReturn")?.transaction;

      if (transactionTradeType === MerchandiseTransactionTradeType.Return && returnWithTransaction && transactionInformationForReturn) {
        const taxCustomer: TaxCustomer = createFromTransaction(transactionInformationForReturn);
        if (taxCustomer) {
          this.props.getTaxCustomer(taxCustomer);
        }
      }
    }
  }

  private handleContinue = (): void => {
    const receiptFormatButtonWasChosen: boolean = this.formattedReceiptTypeChoices
        .map((formattedChoice: ReceiptTypeChoiceConfigButton) => formattedChoice.receiptCategory)
        .indexOf(this.props.receiptCategory) !== -1;

    if (receiptFormatButtonWasChosen) {
      // for lottery : go through lottery scenario again if customer is not added
      if(this.props.receiptCategory === ReceiptCategory.Invoice && !this.props.taxCustomer) {
        this.handleLotteryInvoiceFlow();
      } else if(this.props.receiptCategory === ReceiptCategory.JapanRSSReceipt && !this.props.taxCustomer) {
        this.handleJapanRSSReceiptFlow();
      } else {
        if (!Theme.isTablet) {
          this.props.navigation.pop();
        }
        this.props.onContinue();
      }
    }
  }

  private handleReceiptTypeChoices(): void {
    if (this.formattedReceiptTypeChoices.length === 1 &&
        (this.props.taxCustomer || !this.state.showSelectedReceiptCategory)) {
      this.handleSingleReceiptTypeChoices();
    } else if (this.formattedReceiptTypeChoices.length > 1 &&
              this.props.taxCustomer &&
              !this.props.isReprintLastReceipt &&
              this.props.originalReceiptCategory !== ReceiptCategory.ReprintReceipt) {
      this.props.setReceiptCategory(ReceiptCategory.Invoice);
      this.props.setIsInvoice(true);
      this.props.onContinue();
    }
  }

  private defaultVatReceiptForReturn(): boolean {
    /// Default to vatReceipt for Cost Rica return. Only full tax invoice will be enabled for that country.
    if (this.props.returnTransaction) {
      const isReturnLineExists: boolean = this.props.itemDisplayLines?.some((line: IItemDisplayLine) => (line.lineType === ITEM_RETURN_LINE_TYPE)) ? true : false;
      const isSaleLineExists: boolean = this.props.itemDisplayLines?.some((line: IItemDisplayLine) => (line.lineType === ITEM_SALE_LINE_TYPE
        || line.lineType === ITEM_ORDER_LINE_TYPE))? true : false;
      return (isReturnLineExists && !isSaleLineExists) ? true : false;
    }
  }

  private handleSingleReceiptTypeChoices(): void {
    let receiptCategory = this.formattedReceiptTypeChoices[0].receiptCategory;
    const i18nLocation = this.props.i18nLocation;
    if (i18nLocation === I18nLocationValues.CostaRica && this.defaultVatReceiptForReturn()) {
      /// Default to vatReceipt for return transaction in CR. Only Invoice is allowed for sale/Exchange.
      receiptCategory = ReceiptCategory.VatReceipt;
    }
    this.props.setReceiptCategory(receiptCategory);
    if (!this.props.taxCustomer &&
        (receiptCategory === ReceiptCategory.Invoice || receiptCategory === ReceiptCategory.FullPageInvoice)) {
      this.handleTaxCustomerAssignment();
    } else if (!this.props.taxCustomer && i18nLocation === I18nLocationValues.CostaRica && receiptCategory === ReceiptCategory.VatReceipt) {
      if (isTaxCustomerRequiredConfigExists(this.props.configurationManager, i18nLocation)) {
        this.handleTaxCustomerAssignmentForReturn();
      } else {
        this.setState({ showSelectedReceiptCategory: true, handleSingleReceiptType: true });
        this.props.onContinue();
      }
    } else if (this.props.taxCustomer && (!this.state.showSelectedReceiptCategory || !this.state.handleSingleReceiptType)) {
      this.setState({ showSelectedReceiptCategory: true, handleSingleReceiptType: true });
      this.props.onContinue();
    } else if ((receiptCategory === ReceiptCategory.VatReceipt || receiptCategory === ReceiptCategory.Receipt)
                && (!this.state.showSelectedReceiptCategory || !this.state.handleSingleReceiptType)) {
      this.setState({ showSelectedReceiptCategory: true, handleSingleReceiptType: true });
      this.props.onContinue();
    }
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  const transactionInformationForReturn: TransactionWithAdditionalData = state.businessState.stateValues.get(
    "ItemHandlingSession.transactionInformationForReturn"
  );
  return {
    availableReceiptCategoryButtons: state.receipt.availableReceiptCategoryButtons,
    configurationManager: state.settings.configurationManager,
    chosenReceiptType: state.receipt.chosenReceiptType,
    isReprintLastReceipt: state.receipt.isReprintLastReceipt,
    receiptCategory: state.receipt.receiptCategory,
    taxCustomer: state.receipt.taxCustomer,
    businessState: state.businessState,
    deviceIdentity: state.settings.deviceIdentity,
    retailLocations: state.retailLocations,
    itemDisplayLines: state.businessState.displayInfo?.itemDisplayLines,
    returnTransaction: transactionInformationForReturn?.transaction as IMerchandiseTransaction,
    chosenPrinterId: state.receipt.chosenPrinterId,
    i18nLocation: state.i18nLocationState?.i18nLocation
  };
};

const mapDispatchToProps: DispatchProps = {
  alert: alert.request,
  performBusinessOperation: businessOperation.request,
  getTaxCustomer: getTaxCustomer.request,
  sceneTitle: sceneTitle.request,
  setIsInvoice: setIsInvoice.request,
  setReceiptCategory: setReceiptCategory.request
};


export default connect<
  StateProps,
  DispatchProps,
  Omit<Props, keyof (StateProps & DispatchProps)>
>(mapStateToProps, mapDispatchToProps)(ReceiptCategoryChoice);
