import * as React from "react";
import { Text, TouchableOpacity, View, ViewStyle} from "react-native";
import { connect } from "react-redux";

import { Money } from "@aptos-scp/scp-component-business-core";
import { IPrintResult } from "@aptos-scp/scp-component-rn-device-services";
import { DeviceIdentity, IConfigurationManager, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  CollectedDataKey,
  Customer,
  EXIT_ATTENDANT_MODE_EVENT,
  fiscalConfigValidationRequired,
  getFeatureAccessConfig,
  I18nLocationValues,
  IReceiptTypeChoices,
  isFeatureConfigPresentAndEnabled,
  ITaxIdentifier,
  MERCHANDISE_TRANSACTION_TYPE,
  POST_VOID_TRANSACTION_EVENT,
  PRINT_FISCAL_PRINTER_CHANGE_RETRY_EVENT,
  ReceiptState,
  ReceiptTypeAllowedTransactionType,
  SKIP_TAX_REFUND_EVENT,
  START_TAX_REFUND_DEFERRED_EVENT,
  START_TAX_REFUND_REPRINT_EVENT,
  TaxCustomer,
  TaxRefundState,
  TAX_REFUND_DEFERRED_EVENT,
  TAX_REFUND_PRINT_STATUS_EVENT,
  TAX_REFUND_REPRINT_EVENT,
  UiInputKey,
  VALIDATE_VAT_NUMBER_EVENT
} from "@aptos-scp/scp-component-store-selling-features";
import { FiscalResponseCode } from "@aptos-scp/scp-types-commerce-devices/lib/constants/FiscalDevice";
import {
  CustomerType,
  IMerchandiseTransaction,
  MerchandiseTransactionClosingState,
  MerchandiseTransactionTradeType,
  ReceiptCategory,
  ReceiptType
} from "@aptos-scp/scp-types-commerce-transaction";

import I18n from "../../../config/I18n";
import {
  ActionCreator,
  businessOperation,
  getConfiguredPrinters,
  getReceiptTypes,
  getTaxCustomer,
  isSelectPrinterFlow,
  ReceiptPrinter,
  resetFiscalDeviceStatus,
  resetReceiptState,
  resetTaxRefundState,
  sceneTitle,
  setAvailableReceiptCategoryButtons,
  setChosenPrinterId,
  setIsReprintLastReceipt,
  setReceiptCategory,
  setReceiptEmail,
  setReceiptPhoneNumber,
  setReceiptType,
  setTransactionToReprint,
  showFiscalErrorScreen
} from "../../actions";
import { AppState, DeviceStatusState, RetailLocationsState, UiState } from "../../reducers";
import { isMatchableReceiptCategory } from "../../sagas/receipt";
import Theme from "../../styles";
import Header from "../common/Header";
import Spinner from "../common/Spinner";
import { promptForCustomerAfterTransactionReceipts } from "../common/utilities/configurationUtils";
import { popTo } from "../common/utilities/navigationUtils";
import { getPrintStatusFromPrintResult } from "../common/utilities/printerUtils";
import { postVoidedFiscalPrinter } from "../common/utilities/receiptUtils";
import { printVoidTransactionReceipt } from "../common/utilities/transactionVoidUtilities";
import {
  getFiscalPrinterResponseCode,
  getPrinterStatus,
  hideBackAndCancelButton,
  isConfirmCustomerDetailsPageAllowed,
  isCostaRicaLocation,
  isFiscalPrinter,
  isFiscalPrintForNoSale,
  isFranceLocation
} from "../common/utilities/utils";
import { getEInvoiceForBusinessCustomerFlag } from "../customer/CustomerUtilities";
import { FiscalPrinterSpinnerTimeout, FiscalReportStatus } from "../fiscalPrinter/constants";
import { selfCheckoutConfigured } from "../selfCheckout/utilities/SelfCheckoutStateCheck";
import { NavigationProp } from "../StackNavigatorParams";
import {
  BaseReceiptScreen,
  BaseReceiptScreenDispatchProps,
  BaseReceiptScreenProps,
  BaseReceiptScreenState,
  BaseReceiptScreenStateProps
} from "./BaseReceiptScreen";
import ReceiptCategoryChoice from "./receiptFlow/ReceiptCategoryChoice";
import ReceiptEmailForm from "./receiptFlow/ReceiptEmailForm";
import ReceiptPhoneNumberForm from "./receiptFlow/ReceiptPhoneNumberForm";
import ReceiptPrinterChoice from "./receiptFlow/ReceiptPrinterChoice";
import { receiptOptionFormStyle } from "./styles";

enum ReceiptFlowComponent {
  ReceiptTypeButtons = "ReceiptTypeButtons",
  ReceiptCategoryChoice = "ReceiptCategoryChoice",
  EmailForm = "EmailForm",
  PhoneNumberForm = "PhoneNumberForm",
  PrinterChoice = "PrinterChoice"
}

interface StateProps extends BaseReceiptScreenStateProps {
  uiState: UiState;
  deviceIdentity: DeviceIdentity;
  isSelectPrinter: boolean;
  deviceStatus: DeviceStatusState;
  retailLocations: RetailLocationsState;
  hideFiscalPrinterErrorScreen: boolean;
  i18nLocation: string;
}

interface DispatchProps extends BaseReceiptScreenDispatchProps {
  setIsReprintLastReceipt: ActionCreator;
  setReceiptEmail: ActionCreator;
  setReceiptPhoneNumber: ActionCreator;
  setTransactionToReprint: ActionCreator;
  getTaxCustomer: ActionCreator;
  resetTaxRefundState: ActionCreator;
  sceneTitle: ActionCreator;
  isSelectPrinterFlow: ActionCreator;
  resetFiscalDeviceStatus: ActionCreator;
  showFiscalErrorScreen: ActionCreator;
}

interface Props extends StateProps, DispatchProps, BaseReceiptScreenProps {
  onClose: () => void;
  allowCancel?: boolean;
  handlePromptForCustomerLogic?: () => void;
  styles?: ViewStyle;
  shouldPromptAdditionalDestinations?: boolean;
  hideBackButton?: () => void;
  navigation: NavigationProp;
}

interface State extends BaseReceiptScreenState {
  visibleReceiptFlowComponent: ReceiptFlowComponent;
  continueFromChangeDue: boolean;
  vatNumberRequired: boolean;
}

class ReceiptOptionForm extends BaseReceiptScreen<Props, State> {
  private styles: any;
  private receiptTypeChoicesConfig: any;
  private promptForCustomerAfterReceipts: boolean;
  private taxFreeReprintEnabled: boolean;
  private taxFreeDeferredEnabled: boolean;
  /**
   * Fixme: transactions are not always posted or cleared from the state
   * so we are checking for a closed transaction or a lack of transaction id for the leave condition
   * this is used to stop us from calling close twice when things work properly
   */
  private leavingScreen: boolean;
  private movingToFiscalPrinterErrorScreen: boolean;
  private isReceiptPrinterChoiceSelected: boolean;

  constructor(props: Props) {
    super(props);

    this.styles = Theme.getStyles(receiptOptionFormStyle());

    const { stateValues } = props.businessState;
    const chosenReceiptType = stateValues.get("transaction.id")
        ? stateValues.get("ReceiptSession.receiptType")
        : (this.isReprintStoreOperations() ? ReceiptType.Print : undefined);
    const receiptCompleted = stateValues.get("transaction.id") &&
        stateValues.get("ReceiptSession.state") === "Completed";

    if (chosenReceiptType) {
      this.props.setReceiptType(chosenReceiptType);
    }

    if (this.props.transactionToReprint) {
      this.props.setTransactionToReprint(this.props.transactionToReprint);
    }

    this.receiptTypeChoicesConfig = this.props.settings.configurationManager.getFunctionalBehaviorValues().receipt.
        typeChoices;
    this.promptForCustomerAfterReceipts = promptForCustomerAfterTransactionReceipts(
        this.props.settings.configurationManager);

    this.taxFreeReprintEnabled = isFeatureConfigPresentAndEnabled(TAX_REFUND_REPRINT_EVENT,
        this.props.settings.configurationManager);

    this.taxFreeDeferredEnabled = isFeatureConfigPresentAndEnabled(TAX_REFUND_DEFERRED_EVENT,
        this.props.settings.configurationManager);

    const changeDue: Money = this.props.businessState.stateValues.get("transaction.totalChangeTendered");
    const i18nLocationValue = this.props.i18nLocation;
    if (i18nLocationValue === I18nLocationValues.France &&
        this.props.businessState.stateValues.get("transaction.type") === MERCHANDISE_TRANSACTION_TYPE &&
        this.props.customer?.customerType ) {
      this.validateVatNumberEvent( this.props.customer?.customerType, undefined);
    }
    this.state = {
      receiptSubmitted: chosenReceiptType && receiptCompleted,
      showEmailButton: false,
      showPrintButton: false,
      visibleReceiptFlowComponent: (this.props.providedReceiptCategory === ReceiptCategory.PostVoid ||
          (this.isPrintReceiptAllowedForStoreOperation() && (this.isTillReceiptFlow() || this.isReprintStoreOperations())) ) ?
          ReceiptFlowComponent.PrinterChoice : ReceiptFlowComponent.ReceiptTypeButtons,
      continueFromChangeDue: !changeDue || (changeDue && changeDue.isZero()),
      vatNumberRequired: undefined
    };

    this.movingToFiscalPrinterErrorScreen = false;
    this.isReceiptPrinterChoiceSelected = false;
  }

  public componentDidMount(): void {
    this.handlePromptForCustomerLogic();
    this.props.getTaxCustomer();
    if (this.mainReceiptPrinted && this.props.shouldPromptAdditionalDestinations) {
      this.handleSetup();
    }
    this.checkAndHandleOnlyFullTaxEnabled();
  }

  public componentDidUpdate(prevProps: Props): void {
    const prevStateValues = prevProps.businessState.stateValues;
    const stateValues = this.props.businessState.stateValues;

    const transactionClosed: boolean = prevProps.businessState.inProgress && !this.props.businessState.inProgress &&
                                       !!stateValues.get("transaction.closed");

    const transactionCleared: boolean = prevStateValues.get("transaction.id") && !stateValues.get("transaction.id");
    const printerStatus: UiInput = getPrinterStatus(this.props.businessState.inputs);
    const closingState: MerchandiseTransactionClosingState = stateValues.get("transaction.closingState");
    if (transactionClosed || transactionCleared && !this.leavingScreen) {
      this.leavingScreen = true;
      this.props.resetTaxRefundState();
      if (this.shouldProceedToFiscalPrinterError(printerStatus, closingState)) {
        this.props.navigation.push("fiscalPrinterError");
      } else {
        this.onClose();
      }
    } else if (this.mainReceiptPrinted && this.props.shouldPromptAdditionalDestinations) {
        this.handleSetup();
    } else if (this.isFiscalPrintFailedForRetailTransaction(this.props.settings.configurationManager)) {
      if (this.props.isSelectPrinter) {
        this.moveToReceiptPrinterChoice();
        this.props.isSelectPrinterFlow(false);
      } else {
        this.showFiscalPrinterReportErrorScreen(stateValues, prevStateValues);
      }
    } else if (this.props.businessState.eventType === POST_VOID_TRANSACTION_EVENT &&
          fiscalConfigValidationRequired(this.props.settings.configurationManager,
                this.props.i18nLocation) &&
          !this.movingToFiscalPrinterErrorScreen) {
        const printerList: ReceiptPrinter[] = postVoidedFiscalPrinter(this.props.businessState.inputs,
            this.props.settings.configurationManager);
        if (!printerList || printerList.length < 1) {
          this.movingToFiscalPrinterErrorScreen = true;
          this.props.navigation.push("fiscalPrinterError", {
            noPrinterExistsToPostVoid: true
          });
        } else {
          this.moveToReceiptPrinterChoice();
        }
    }

    this.saveState(prevProps);

    this.handleSingleReceiptTypeAvailable(prevProps);

    this.checkAndHandleReceiptTypeChosen(prevProps);

    this.handleTaxFree(prevStateValues, stateValues);
  }

  public render(): JSX.Element {
    return (
      <View style={[this.styles.root, this.props.styles || {}]} >
        {
          Theme.isTablet &&
          this.renderTabletReceiptFlow()
        }
        {
          !Theme.isTablet &&
          !this.state.receiptSubmitted && !this.isTillReceiptFlow() && !this.isReprintStoreOperations() &&
          this.renderReceiptTypeButtons()
        }
        {
          this.state.receiptSubmitted && !this.props.isSelectPrinter &&
            <Spinner size={0} containerStyle={this.styles.spinnerContainer}/>
        }
      </View>
    );
  }

  protected submitReceipt(): void {
    if (!this.state.receiptSubmitted) {
      if (this.isPostVoidReprintReceipt()){
        this.props.setReceiptCategory(ReceiptCategory.PostVoid);
      } else if (this.isReturnReprintReceiptFlow()) {
        this.props.setReceiptCategory(ReceiptCategory.VatReceipt);
      }
      super.submitReceipt();
    }
  }


  protected handleSetup(): void {
    super.handleSetup();
    this.setState({
      receiptSubmitted: false,
      showPrintButton: false,
      visibleReceiptFlowComponent: (this.props.providedReceiptCategory === ReceiptCategory.PostVoid
          || this.isTillReceiptFlow() || this.isReprintStoreOperations()) ?
          ReceiptFlowComponent.PrinterChoice : ReceiptFlowComponent.ReceiptTypeButtons
    });
  }


  private  isPostVoidReprintReceipt(): boolean {
    return this.props.receiptCategory === ReceiptCategory.ReprintReceipt
        && this.props.businessState?.lastPrintableTransactionInfo?.reprintReceiptCategory === ReceiptCategory.PostVoid;
  }

  private validateVatNumberEvent = (customerType: string, vatNumber: string): void => {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.CUSTOMER_TYPE, customerType));
    uiInputs.push(new UiInput(UiInputKey.VAT_NUMBER, vatNumber));
    this.props.performBusinessOperation(this.props.settings.deviceIdentity,
        VALIDATE_VAT_NUMBER_EVENT, uiInputs);
  }
  private showFiscalPrinterReportErrorScreen(stateValues: Map<string, any>,
                                            prevStatevalues: Map<string, any>): void {
    if (stateValues !== prevStatevalues) {
     this.moveToFiscalReceiptPrinterErrorScreen();
    }
  }

  private onClose(): void {
    if (selfCheckoutConfigured(this.props)) {
      this.props.performBusinessOperation(this.props.settings.deviceIdentity, EXIT_ATTENDANT_MODE_EVENT, []);
    } else {
      this.props.onClose();
    }
  }

  private isTillReceiptFlow(): boolean {
    return this.props.providedReceiptCategory === ReceiptCategory.Till ||
        this.props.providedReceiptCategory === ReceiptCategory.PaidOperation;
  }

  private isPrintReceiptAllowedForStoreOperation(): boolean {
    let printReceipt: boolean = true;
    if(!!this.props.eventTypeForReceipt) {
      const featureConfig = getFeatureAccessConfig(this.props.settings.configurationManager, this.props.eventTypeForReceipt);
      printReceipt = !!featureConfig?.printReceipt ? featureConfig?.printReceipt :
          featureConfig?.printReceipt === undefined;
    }
    return printReceipt;
  }

  private isReprintStoreOperations(): boolean {
    const reprintReceiptCategory = this.props.businessState?.lastPrintableTransactionInfo?.reprintReceiptCategory;
    return this.props.providedReceiptCategory === ReceiptCategory.ReprintReceipt &&
        (reprintReceiptCategory === ReceiptCategory.Till || reprintReceiptCategory === ReceiptCategory.PaidOperation);
  }

  private isPostVoidReprintReceiptFlow(): boolean {
    return this.props.providedReceiptCategory === ReceiptCategory.ReprintReceipt && this.props.reprintLastReceipt &&
        this.props.businessState.lastPrintableTransactionInfo.reprintReceiptCategory === ReceiptCategory.PostVoid;
  }

  private isReturnReprintReceiptFlow(): boolean {
    const isReturnReprint: boolean = isCostaRicaLocation(this.props.retailLocations, this.props.settings.configurationManager) &&
        ((this.props.transactionToReprint?.tradeType === MerchandiseTransactionTradeType.Return ||
         this.props.reprintLastReceipt) &&
        this.props.providedReceiptCategory === ReceiptCategory.ReprintReceipt &&
        this.props.businessState.lastPrintableTransactionInfo.reprintReceiptCategory === ReceiptCategory.VatReceipt);
    return isReturnReprint ? true : false;
  }

  private isNoSaleReprintReceiptFlow(): boolean {
    return this.props.providedReceiptCategory === ReceiptCategory.ReprintReceipt && this.props.reprintLastReceipt &&
        this.props.businessState.lastPrintableTransactionInfo.reprintReceiptCategory === ReceiptCategory.NoSale;
  }

  private isTenderExchangeReprintReceiptFlow(): boolean {
    return this.props.providedReceiptCategory === ReceiptCategory.ReprintReceipt && this.props.reprintLastReceipt &&
        this.props.businessState.lastPrintableTransactionInfo.reprintReceiptCategory === ReceiptCategory.TenderExchange;
  }

  private isBalanceInquiryReceiptFlow(): boolean {
    return this.props.providedReceiptCategory === ReceiptCategory.BalanceInquiry;
  }

  private isSuspendReceiptFlow(): boolean {
    return this.props.providedReceiptCategory === ReceiptCategory.Suspend;
  }

  private isPostVoidReceiptFlow(): boolean {
    return this.props.providedReceiptCategory === ReceiptCategory.PostVoid;
  }

  private isNoSaleReceiptFlow(): boolean {
    return this.props.providedReceiptCategory === ReceiptCategory.NoSale;
  }

  private isTenderExchangeReceiptFlow(): boolean {
    return this.props.providedReceiptCategory === ReceiptCategory.TenderExchange;
  }

  private renderTabletReceiptFlow(): JSX.Element {
    const printerResponseCode: FiscalResponseCode = getFiscalPrinterResponseCode(this.props.deviceStatus);
    return (
      <>
        {
          this.state.visibleReceiptFlowComponent === ReceiptFlowComponent.ReceiptTypeButtons &&
          !this.state.receiptSubmitted &&
          this.renderReceiptTypeButtons()
        }
        {
          this.state.visibleReceiptFlowComponent === ReceiptFlowComponent.ReceiptCategoryChoice &&
          !this.state.receiptSubmitted &&
          <ReceiptCategoryChoice
            onContinue={this.receiptCategoryChoiceContinue}
            onCancel={this.receiptCategoryChoiceCancel}
            originalReceiptCategory={this.props.providedReceiptCategory}
            transactionToReprint={this.props.transactionToReprint}
            navigation={this.props.navigation}
          />
        }
        {
          this.state.visibleReceiptFlowComponent === ReceiptFlowComponent.EmailForm &&
          !this.state.receiptSubmitted &&
          <ReceiptEmailForm
            onContinue={this.receiptEmailFormContinue}
            onCancel={this.receiptEmailFormCancel}
            navigation={this.props.navigation}
          />
        }
        {
          this.state.visibleReceiptFlowComponent === ReceiptFlowComponent.PhoneNumberForm &&
          !this.state.receiptSubmitted &&
          <ReceiptPhoneNumberForm
            navigation={this.props.navigation}
            onContinue={this.phoneNumberContinue}
            onCancel={this.phoneNumberCancel}
          />
        }
        {
          this.state.visibleReceiptFlowComponent === ReceiptFlowComponent.PrinterChoice &&
          (!this.state.receiptSubmitted || (printerResponseCode &&
          (printerResponseCode === FiscalResponseCode.NotConnected ||
          printerResponseCode === FiscalResponseCode.Rejected ||
          printerResponseCode === FiscalResponseCode.Timeout ||
          printerResponseCode === FiscalResponseCode.NotRefundable))) &&
          !this.isReceiptPrinterChoiceSelected &&
          <ReceiptPrinterChoice
            onContinue={this.receiptPrinterChoiceContinue}
            onCancel={this.receiptPrinterChoiceCancel}
            isTillReceiptFlow={this.isTillReceiptFlow()}
            uiMode={this.props.uiState.mode}
            navigation={this.props.navigation}
            hideBackButton={hideBackAndCancelButton(this.props.receiptCategory)}
          />
        }
      </>
    );
  }

  private renderReceiptTypeButtons(): JSX.Element {
    const disableOptionExceptPrint: boolean = this.disableReceiptTypeExceptPrint();
    const disableButtonStyle = disableOptionExceptPrint && this.styles.btnDisabled;
    const disableButtonText = disableOptionExceptPrint && this.styles.btnTextDisabled;
    const eInvoiceFlagForBusinessCustomer =
        getEInvoiceForBusinessCustomerFlag(this.props.settings.configurationManager,
            this.props?.i18nLocation);
    const printDisabled: boolean = !this.props.uiState.isAllowed(this.receiptBusinessEvent);

    return (
      <View style={this.styles.receiptOptionsArea}>
        { this.renderTaxFreeButton(disableButtonStyle, disableButtonText) }
        {
          this.checkReceiptOptionAllowed(ReceiptType.Email) &&
          this.state.showEmailButton &&
          <TouchableOpacity
            style={[this.styles.btnSeconday, this.styles.receiptButton, disableButtonStyle]}
            onPress={this.handleEmailChosen}
            disabled={disableOptionExceptPrint}
          >
            <Text style={[this.styles.btnSecondayText, disableButtonText]}>{I18n.t("email")}</Text>
          </TouchableOpacity>
        }
        {
          this.checkReceiptOptionAllowed(ReceiptType.Print) &&
          this.state.showPrintButton &&
          <TouchableOpacity
            style={[this.printButtonStyle(), this.styles.receiptButton, printDisabled && this.styles.btnDisabled ]}
            onPress={!printDisabled && this.handlePrintChosen}
            disabled={printDisabled}
          >
            <Text style={[this.printButtonTextStyle(), printDisabled && this.styles.btnTextDisabled]}>
              {I18n.t("print")}
            </Text>
          </TouchableOpacity>
        }
        {
          this.checkReceiptOptionAllowed(ReceiptType.Both) &&
          this.state.showEmailButton &&
          this.state.showPrintButton &&
          <TouchableOpacity
            style={[this.styles.btnSeconday, this.styles.receiptButton, disableButtonStyle]}
            onPress={this.handlePrintAndEmailChosen}
            disabled={disableOptionExceptPrint}
          >
            <Text style={[this.styles.btnSecondayText, disableButtonText]}>
              {I18n.t("emailAndPrintReceipt")}
            </Text>
          </TouchableOpacity>
        }
        {
          this.checkReceiptOptionAllowed(ReceiptType.SMS) &&
          /**
           * TODO: SMS Receipts are only to be allowed for standard end of transaction flow for now
           *       https://jira.aptos.com/browse/DSS-4674
           */
          this.props.providedReceiptCategory === ReceiptCategory.Receipt &&
          <TouchableOpacity
            style={[this.styles.btnSeconday, this.styles.receiptButton, disableButtonStyle]}
            onPress={this.handleSMSReceiptChosen}
            disabled={disableOptionExceptPrint}
          >
            <Text style={[this.styles.btnSecondayText, disableButtonText]}>{I18n.t("sms")}</Text>
          </TouchableOpacity>
        }
        {
          this.shouldDisplayNoReceiptOption() &&
          <TouchableOpacity
            style={[this.styles.btnSeconday, this.styles.receiptButton,
                this.styles.bottomMostReceiptButton, disableButtonStyle]}
            onPress={(eInvoiceFlagForBusinessCustomer &&
                (this.props.customer && this.props.customer.customerType === CustomerType.Business))
                ? this.handleTaxCustomer : this.handleNoReceiptChosen}
            disabled={disableOptionExceptPrint}
          >
            <Text style={[this.styles.btnSecondayText, disableButtonText]}>{I18n.t("noReceipt")}</Text>
          </TouchableOpacity>
        }
        {
          this.props.allowCancel &&
          <TouchableOpacity
            style={[this.styles.btnSeconday, this.styles.receiptButton, this.styles.bottomMostReceiptButton]}
            onPress={this.handleCancelReceipt}
          >
            <Text style={this.styles.btnSecondayText}>{I18n.t("cancel")}</Text>
          </TouchableOpacity>
        }
      </View>
    );
  }

  private renderTaxFreeButton(disableButtonStyle: any, disableButtonText: any): JSX.Element {
    return (
      this.shouldDisplayTaxFree() &&
      <TouchableOpacity
        style={[this.styles.btnSeconday, this.styles.receiptButton, disableButtonStyle]}
        onPress={this.handleTaxFreeChosen}
      >
        <Text style={[this.styles.btnSecondayText, disableButtonText]}>{I18n.t("taxFree")}</Text>
      </TouchableOpacity>
    );
  }

  private shouldDisplayNoReceiptOption(): boolean {
    return this.props.providedReceiptCategory !== ReceiptCategory.BalanceInquiry &&
        this.checkReceiptOptionAllowed(ReceiptType.None) && !this.props.allowCancel;
  }

  private printButtonStyle(): any {
    return this.props.providedReceiptCategory === ReceiptCategory.BalanceInquiry ?
        this.styles.btnPrimary : this.styles.btnSeconday;
  }

  private printButtonTextStyle(): any {
    return this.props.providedReceiptCategory === ReceiptCategory.BalanceInquiry ?
        this.styles.btnPrimaryText : this.styles.btnSecondayText;
  }

  private disableReceiptTypeExceptPrint = (): boolean => {
    if (!this.promptForCustomerAfterReceipts) {
      // The config was not provided, DONT disable the buttons.
      return false;
    } else if (this.props.reprintLastReceipt) {
      return this.props.businessState.lastPrintableTransactionInfo &&
        !this.props.businessState.lastPrintableTransactionInfo.transactionReceiptPrintedSuccessfully;
    } else {
      return this.props.providedReceiptCategory === ReceiptCategory.ReprintReceipt &&
        !this.props.transactionToReprint ||
        (this.props.transactionToReprint && !this.props.transactionToReprint["transactionReceiptPrintedSuccessfully"]);
    }
  }

  private handlePromptForCustomerLogic = (): void => {
    if (!!this.props.handlePromptForCustomerLogic) {
      this.props.handlePromptForCustomerLogic();
    }
  }

  private get userNeedsToChooseReceiptFormat(): boolean {
    return this.receiptTypeChoicesConfig && (
      this.receiptTypeChoicesConfig.standardReceipt ||
      this.receiptTypeChoicesConfig.vatReceipt ||
      this.receiptTypeChoicesConfig.fullTaxInvoice ||
      this.receiptTypeChoicesConfig.fullPageInvoice ||
      this.receiptTypeChoicesConfig.japanRSSReceipt
    );
  }

  private shouldDisplayTaxFree = (): boolean => {
    const shouldDisplayForDeferred = this.taxFreeDeferredEnabled && this.props.transactionToReprint &&
        !this.props.transactionToReprint.taxFreeFormKey &&
        this.props.transactionToReprint.tradeType === MerchandiseTransactionTradeType.Sale;
    const shouldDisplayForReprint = this.taxFreeReprintEnabled && this.props.transactionToReprint &&
        this.props.transactionToReprint.taxFreeFormKey;
    return this.props.receiptCategory === ReceiptCategory.ReprintReceipt && !this.props.reprintLastReceipt &&
        (shouldDisplayForDeferred || shouldDisplayForReprint) && this.props.businessState.stateValues &&
        this.props.businessState.stateValues.get("TaxRefundSession.state") === TaxRefundState.Inactive;
  }

  private handleTaxFree(prevStateValues: Map<string, any>, stateValues: Map<string, any>): void {
    if (!prevStateValues.get("TaxRefundSession.isActive") && stateValues.get("TaxRefundSession.isActive")) {
      this.processTaxFree();
    } else if (!prevStateValues.get("TaxRefundSession.isPrinting") && stateValues.get("TaxRefundSession.isPrinting")) {
      this.startPrintingTaxFree(stateValues);
    } else if (this.props.receiptCategory === ReceiptCategory.ReprintReceipt &&
        prevStateValues.get("TaxRefundSession.state") === TaxRefundState.Inactive &&
        stateValues.get("TaxRefundSession.isCompleted")) {
      // trigger event to finish out the transaction when it errors while starting the tax free process
      this.processTaxFree();
    } else if (!prevStateValues.get("TaxRefundSession.isConnected") &&
        stateValues.get("TaxRefundSession.isConnected")) {
      this.proceedToTaxFreeScreen(this.props.transactionToReprint);
    } else if (!prevStateValues.get("TaxRefundSession.error") && !!stateValues.get("TaxRefundSession.error")) {
      this.skipErroredTaxFree();
      this.props.navigation.pop();
    }
  }

  private proceedToTaxFreeScreen = (originalTransaction: IMerchandiseTransaction): void => {
    // pass original transaction so that it can be passed as input for opening the ui and such
    this.props.navigation.replace("taxFree", {
      originalTransaction
    });
  }

  private handleTaxFreeChosen = (): void => {
    this.setState({receiptSubmitted: true});
    if (this.props.hideBackButton) {
      this.props.hideBackButton();
    }
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.RETRIEVED_TRANSACTION, this.props.transactionToReprint));
    const event = this.props.transactionToReprint.taxFreeFormKey ? START_TAX_REFUND_REPRINT_EVENT :
        START_TAX_REFUND_DEFERRED_EVENT;
    this.props.performBusinessOperation(this.props.settings.deviceIdentity, event, uiInputs);
  }

  private processTaxFree = (): void => {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.RETRIEVED_TRANSACTION, this.props.transactionToReprint));
    const event = this.props.transactionToReprint.taxFreeFormKey ? TAX_REFUND_REPRINT_EVENT :
        TAX_REFUND_DEFERRED_EVENT;
    this.props.performBusinessOperation(this.props.settings.deviceIdentity, event, uiInputs);
  }

  private skipErroredTaxFree = (): void => {
    this.props.performBusinessOperation(this.props.deviceIdentity, SKIP_TAX_REFUND_EVENT, []);
  }

  private startPrintingTaxFree = (stateValues: Map<string, any>): void => {
    const documentIdentifier: string = stateValues.get("TaxRefundSession.documentIdentifier");
    this.props.navigation.push("genericPrinter", {
      onFinish: this.handleTaxFreePrintResult.bind(this),
      header: this.renderHeaderForPrintScreen(),
      dataUrl: stateValues.get("TaxRefundSession.contentAsDataUrl"),
      documentName: `${documentIdentifier}.pdf` || "TaxFreeForm.pdf"
    });
  }

  private renderHeaderForPrintScreen(): JSX.Element {
    return (<Header title={I18n.t("taxFree")} isVisibleTablet={Theme.isTablet} />);
  }

  private handleTaxFreePrintResult(result: IPrintResult): void {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.PRINT_STATUS, getPrintStatusFromPrintResult(result)));
    this.props.performBusinessOperation(this.props.deviceIdentity, TAX_REFUND_PRINT_STATUS_EVENT, uiInputs);
    this.props.navigation.pop();
  }

  private saveState = (prevProps: Props): void => {
    if (prevProps.businessState !== this.props.businessState &&
        this.props.businessState.eventType === VALIDATE_VAT_NUMBER_EVENT) {
      this.setState({
        vatNumberRequired: this.props.businessState.nonContextualData.get(CollectedDataKey.VatNumberIsRequired)
      });
    }
  }

  private handleReceiptTypeChosen = (receiptType: ReceiptType): void => {
    this.setState({ continueFromChangeDue: true }, () => this.props.setReceiptType(receiptType));
  }

  private handlePrintChosen = (): void => {
    this.handleReceiptTypeChosen(ReceiptType.Print);
  }

  private handleEmailChosen = (): void => {
    this.handleReceiptTypeChosen(ReceiptType.Email);
  }

  private handlePrintAndEmailChosen = (): void => {
    this.handleReceiptTypeChosen(ReceiptType.Both);
  }

  private handleSMSReceiptChosen = (): void => {
    this.handleReceiptTypeChosen(ReceiptType.SMS);
  }

  private handleNoReceiptChosen = (): void => {
    this.handleReceiptTypeChosen(ReceiptType.None);
  }

  private handleTaxCustomer = (): void => {
    this.handleTaxCustomerAssignment();
  }

  private handleCancelReceipt = (): void => {
    this.props.navigation.pop();
  }

  private get emailNeeded(): boolean {
    return this.props.chosenReceiptType === ReceiptType.Email || this.props.chosenReceiptType === ReceiptType.Both;
  }

  private get isTransactionVoidReceipt(): boolean {
    return this.props.providedReceiptCategory === ReceiptCategory.Void;
  }

  private get isPrintVoidReceipt(): boolean {
    return printVoidTransactionReceipt(this.props.settings.configurationManager);
  }

  private get mainReceiptPrinted(): boolean {
    return this.props.businessState.stateValues.get("ReceiptSession.receiptCategory") === ReceiptCategory.Receipt &&
        this.props.businessState.stateValues.get("ReceiptSession.state") === ReceiptState.Completed;
  }

  private handleSingleReceiptTypeAvailable(prevProps: Props): void {
    const availableReceiptTypesChanged: boolean = prevProps.availableReceiptTypes !== this.props.availableReceiptTypes;

    if (availableReceiptTypesChanged && this.onlyOneReceiptTypeAvailable && !this.shouldDisplayTaxFree()) {
      this.props.setReceiptType(this.props.availableReceiptTypes[0]);
    }

    const configuredPrintersNowAvailable: boolean = !prevProps.configuredPrinters && !!this.props.configuredPrinters;

    if ((this.isTransactionVoidReceipt && this.isPrintVoidReceipt) && configuredPrintersNowAvailable) {
      this.props.setReceiptType(ReceiptType.Print);
    } else if (this.isTransactionVoidReceipt && !this.isPrintVoidReceipt) {
      this.props.setReceiptType(ReceiptType.None);
    }
  }

  private moveToReceiptPrinterScreenForReprintFlow(): void {
    const fullTaxInvoiceAllowedFor =
        this.receiptTypeChoicesConfig && this.receiptTypeChoicesConfig.fullTaxInvoiceAllowedFor;
    const isFranceWithReprintFlow =
        isFranceLocation(this.props.retailLocations, this.props.settings.configurationManager)
        && this.props.providedReceiptCategory !== ReceiptCategory.ReprintReceipt
        && fullTaxInvoiceAllowedFor === ReceiptTypeAllowedTransactionType.Reprint;
    if (isFranceWithReprintFlow) {
      this.moveToScreensAfterReceiptCategoryChoice();
    } else {
      this.moveToReceiptCategoryChoice();
    }
  }

  private checkAndHandleReceiptTypeChosen(prevProps: Props): void {
    const receiptTypeChanged: boolean = prevProps.chosenReceiptType !== this.props.chosenReceiptType;

    const receiptTypeWasChosen: boolean = !prevProps.chosenReceiptType && !!this.props.chosenReceiptType;

    const continueFromChangeDue: boolean = this.onlyOneReceiptTypeAvailable && this.state.continueFromChangeDue &&
        !!this.props.chosenReceiptType;

    if ((receiptTypeChanged && receiptTypeWasChosen && !this.onlyOneReceiptTypeAvailable) || continueFromChangeDue) {
      if (this.isNoneChosenReceiptType(this.props.chosenReceiptType,
            prevProps.businessState?.eventType)) {
        this.noReceiptWasChosen();
      } else {
        if (this.isDefaultReprintReceiptFlow()) {
          this.moveToScreensAfterReceiptCategoryChoice();
        } else {
          if (this.userNeedsToChooseReceiptFormat && !this.isTransactionVoidReceipt && !this.isTillReceiptFlow() && !this.isReprintStoreOperations() &&
              !this.isBalanceInquiryReceiptFlow() && !this.isSuspendReceiptFlow() && !this.isPostVoidReceiptFlow() && !this.isNoSaleReceiptFlow() &&
              !this.isReturnReprintReceiptFlow() && !this.isTenderExchangeReceiptFlow()) {
            this.moveToReceiptPrinterScreenForReprintFlow();
          } else {
            this.moveToScreensAfterReceiptCategoryChoice();
          }
        }
      }

      this.setState({ continueFromChangeDue: false });
    }
  }

  private isNoneChosenReceiptType(chosenReceiptType: ReceiptType,
                                  eventType?: string): boolean {
    return chosenReceiptType === ReceiptType.None &&
         eventType !== TAX_REFUND_PRINT_STATUS_EVENT;
  }
  private isDefaultReprintReceiptFlow(): boolean {
    let isDefaultReprintReceiptFlow: boolean;
    if (this.isPostVoidReprintReceiptFlow() || this.isNoSaleReprintReceiptFlow() || this.isTenderExchangeReprintReceiptFlow()) {
          isDefaultReprintReceiptFlow = true;
    }
    return isDefaultReprintReceiptFlow;
  }

  private get onlyOneReceiptTypeAvailable(): boolean {
    return this.props.availableReceiptTypes && this.props.availableReceiptTypes.length &&
        this.props.availableReceiptTypes.length === 1;
  }

  private noReceiptWasChosen(): void {
    if (this.printerRequired && !this.singlePrinterIsConfigured) {
      this.moveToReceiptPrinterChoice();
    } else {
      this.submitReceipt();
    }
  }

  private moveToReceiptCategoryChoice = (): void => {
    if (!Theme.isTablet) {
      this.props.navigation.push("receiptCategoryChoice", {
        onContinue: this.receiptCategoryChoiceContinue,
        onCancel: this.receiptCategoryChoiceCancel,
        originalReceiptCategory: this.props.providedReceiptCategory,
        transactionToReprint: this.props.transactionToReprint
      });
    } else {
      this.setState({ visibleReceiptFlowComponent: ReceiptFlowComponent.ReceiptCategoryChoice });
    }
  }

  private receiptCategoryChoiceContinue = (): void => {
    this.moveToScreensAfterReceiptCategoryChoice();
  }

  private receiptCategoryChoiceCancel = (): void => {
    this.props.setReceiptType(undefined);
    this.props.setReceiptCategory(this.props.providedReceiptCategory);

    if (!Theme.isTablet) {
      this.props.navigation.pop();
    } else {
      this.setState({ visibleReceiptFlowComponent: ReceiptFlowComponent.ReceiptTypeButtons });
    }
  }

  private moveToScreensAfterReceiptCategoryChoice = () => {
    if (this.props.chosenReceiptType === ReceiptType.SMS) {
      this.moveToReceiptPhoneNumberForm();
    } else {
      if (this.emailNeeded) {
        this.moveToReceiptEmailForm();
      } else {
        if (this.props.receiptCategory === ReceiptCategory.FullPageInvoice) {
          this.receiptPrinterChoiceContinue();
        } else {
          this.moveToReceiptPrinterChoice();
        }
      }
    }
  }

  private moveToReceiptPhoneNumberForm = (): void => {
    if (!Theme.isTablet) {
      this.props.navigation.push("receiptPhoneNumberForm", {
        onContinue: this.phoneNumberContinue,
        onCancel: this.phoneNumberCancel
      });
    } else {
      this.setState({ visibleReceiptFlowComponent: ReceiptFlowComponent.PhoneNumberForm });
    }
  }

  private phoneNumberContinue = (): void => {
    if (this.printerRequired || this.isCustomerDetailsPageAllowed()) {
      this.moveToReceiptPrinterChoice();
    } else {
      this.submitReceipt();
    }
  }

  private phoneNumberCancel = (): void => {
    this.props.setReceiptPhoneNumber(undefined);

    if (!this.userNeedsToChooseReceiptFormat ||
        isFranceLocation(this.props.retailLocations, this.props.settings.configurationManager)) {
      this.props.setReceiptType(undefined);
    }

    if (!Theme.isTablet) {
      this.props.navigation.pop();
    } else {
      if (this.userNeedsToChooseReceiptFormat) {
        this.setState({ visibleReceiptFlowComponent: ReceiptFlowComponent.ReceiptCategoryChoice });
      } else {
        this.setState({ visibleReceiptFlowComponent: ReceiptFlowComponent.ReceiptTypeButtons });
      }
    }
  }

  private moveToReceiptEmailForm = (): void => {
    if (!Theme.isTablet) {
      this.props.navigation.push("receiptEmailForm", {
        onContinue: this.receiptEmailFormContinue,
        onCancel: this.receiptEmailFormCancel
      });
    } else {
      this.setState({ visibleReceiptFlowComponent: ReceiptFlowComponent.EmailForm });
    }
  }

  private receiptEmailFormContinue = (): void => {
    if (this.props.chosenReceiptType === ReceiptType.Both) {
      if (this.props.receiptCategory === ReceiptCategory.FullPageInvoice) {
        this.receiptPrinterChoiceContinue();
      } else {
        this.moveToReceiptPrinterChoice();
      }
    } else if (this.props.chosenReceiptType === ReceiptType.Email) {
      if (this.printerRequired || this.isCustomerDetailsPageAllowed()) {
        this.moveToReceiptPrinterChoice();
      } else {
        this.submitReceipt();
      }
    }
  }

  private receiptEmailFormCancel = (): void => {
    if (!this.userNeedsToChooseReceiptFormat ||
        isFranceLocation(this.props.retailLocations, this.props.settings.configurationManager)) {
      this.props.setReceiptType(undefined);
    }

    this.props.setReceiptEmail(undefined);

    if (!Theme.isTablet) {
      this.props.navigation.pop();
    } else {
      if (this.userNeedsToChooseReceiptFormat) {
        this.setState({ visibleReceiptFlowComponent: ReceiptFlowComponent.ReceiptCategoryChoice });
      } else {
        this.setState({ visibleReceiptFlowComponent: ReceiptFlowComponent.ReceiptTypeButtons });
      }
    }
  }

  private isCustomerDetailsPageAllowed(): boolean {
    const transactionTotal: Money  = this.props.businessState.stateValues.get("transaction.total");
    const accountingCurrency: string = this.props.businessState.stateValues.get("transaction.accountingCurrency");
    const i18nLocationValue = this.props.i18nLocation;
    return i18nLocationValue === I18nLocationValues.France &&
        isConfirmCustomerDetailsPageAllowed(this.props.settings.configurationManager, i18nLocationValue,
        transactionTotal, this.props.customer && this.props.customer.customerType, accountingCurrency);
  }

  private moveToReceiptPrinterChoice = (): void => {
    if (!Theme.isTablet) {
      if (this.isCustomerDetailsPageAllowed()) {
        this.handleTaxCustomerAssignment("okCaps");
      } else {
        this.props.navigation.push("receiptPrinterChoice", {
          onContinue: this.receiptPrinterChoiceContinue,
          onCancel: this.receiptPrinterChoiceCancel,
          isTillReceiptFlow: this.isTillReceiptFlow(),
          hideBackButton: hideBackAndCancelButton(this.props.receiptCategory)
        });
      }
    } else {
      if (this.isCustomerDetailsPageAllowed()) {
        this.handleTaxCustomerAssignment("okCaps");
      } else if (this.state.visibleReceiptFlowComponent &&
          this.state.visibleReceiptFlowComponent !== ReceiptFlowComponent.PrinterChoice ) {
        this.setState({ visibleReceiptFlowComponent: ReceiptFlowComponent.PrinterChoice });
      } else if (!this.state.visibleReceiptFlowComponent) {
          this.setState({ visibleReceiptFlowComponent: ReceiptFlowComponent.PrinterChoice });
      }
      if(this.props.providedReceiptCategory === ReceiptCategory.PostVoid ){
         this.hideBackButton();
      }
    }
  }

  private handleTaxCustomerAssignment(taxInvoiceButtonText: string = "fullTaxInvoice"): void {
    this.props.sceneTitle("customerTaxInvoice", "confirmDetails");
    this.props.navigation.push("customerTaxInvoice", {
      taxInvoiceButtonText: I18n.t(taxInvoiceButtonText),
      saveCustomerTaxInformation: this.handleSaveTaxCustomer,
      vatNumberRequired: this.state.vatNumberRequired,
      onExit: () => {
        // intentionally empty
      }
    });
  }

  private handleSaveTaxCustomer = (customer: Customer, taxIdentifier: string,
                                   taxIdentifierName: string,
                                   taxCode: string, taxCodeName: string, pecAddress: string,
                                   pecAddressName: string, addressCode: string, addressCodeName: string): void => {
    const taxCustomer = customer as TaxCustomer;

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
    this.props.getTaxCustomer(taxCustomer);

    if (this.isCustomerDetailsPageAllowed()) {
      if (this.props.chosenReceiptType === ReceiptType.Email) {
        this.submitReceipt();
      } else {
        this.props.navigation.push("receiptPrinterChoice", {
          onContinue: this.receiptPrinterChoiceContinue,
          onCancel: this.receiptPrinterChoiceCancel,
          isTillReceiptFlow: this.isTillReceiptFlow()
        });
      }
    } else {
      this.props.setReceiptType(ReceiptType.None);
      this.props.navigation.pop();
    }
  }

  private receiptPrinterChoiceContinue = (): void => {
    const stateValues = this.props.businessState.stateValues;
    if (!Theme.isTablet) {
      const shouldPopAwayScreen: boolean =
          isFiscalPrintForNoSale(this.props.settings.configurationManager, this.props.businessState.stateValues,
          this.props.providedReceiptCategory, this.props.receiptCategory, this.props.chosenPrinterId);

      const shouldPopToSummary =
          !isFiscalPrinter(this.props.settings.configurationManager, this.props.chosenPrinterId) &&
          (this.props.receiptCategory === ReceiptCategory.Receipt ||
          this.props.receiptCategory === ReceiptCategory.VatReceipt ||
          this.props.receiptCategory === ReceiptCategory.Invoice) &&
          this.props.providedReceiptCategory !== ReceiptCategory.ReprintReceipt;

      if (shouldPopAwayScreen){
        this.props.navigation.pop();
      } else if (shouldPopToSummary) {
        if (isMatchableReceiptCategory(this.props.providedReceiptCategory)) {
          this.props.navigation.dispatch(popTo("main"));
        } else {
          this.props.navigation.dispatch(popTo("receiptSummary"));
        }
      }
    }
    if (isFiscalPrinter(this.props.settings.configurationManager, this.props.chosenPrinterId)) {
      this.props.resetFiscalDeviceStatus();
      this.props.isSelectPrinterFlow(false);
      const receipt = stateValues && stateValues.get("ReceiptSession.receipt");
      this.isReceiptPrinterChoiceSelected = Theme.isTablet;
      if (this.props.chosenPrinterId && receipt) {
        const inputs: UiInput[] = [];
        inputs.push(new UiInput(UiInputKey.PRINTER, this.props.chosenPrinterId));
        setTimeout(() => {
          this.props.performBusinessOperation(this.props.deviceIdentity, PRINT_FISCAL_PRINTER_CHANGE_RETRY_EVENT,
              inputs);
        }, FiscalPrinterSpinnerTimeout);
        return;
      }
    }
    this.submitReceipt();
  }

  private receiptPrinterChoiceCancel = (): void => {
    if (!this.userNeedsToChooseReceiptFormat &&
        (this.props.chosenReceiptType === ReceiptType.Print || this.props.chosenReceiptType === ReceiptType.None)) {
      this.props.setReceiptType(undefined);
    }

    if (isFranceLocation(this.props.retailLocations, this.props.settings.configurationManager)) {
      this.props.setReceiptType(undefined);
    }

    this.props.setChosenPrinterId(undefined);

    if (this.props.chosenReceiptType === ReceiptType.Both) {
      this.props.setReceiptEmail(undefined);
    }

    if (!Theme.isTablet) {
      if (this.isReprintStoreOperations()){
        this.props.setReceiptType(undefined);
        this.props.navigation.dispatch(popTo("main"));
      } else {
        this.props.navigation.pop();
      }
    } else {
      if (this.isTillReceiptFlow()) {
        this.props.navigation.pop();
        return;
      }
      if (this.props.chosenReceiptType === ReceiptType.Both) {
        this.setState({ visibleReceiptFlowComponent: ReceiptFlowComponent.EmailForm });
      } else {
        if (this.userNeedsToChooseReceiptFormat) {
          this.setState({ visibleReceiptFlowComponent: ReceiptFlowComponent.ReceiptCategoryChoice });
        } else {
          this.setState({ visibleReceiptFlowComponent: ReceiptFlowComponent.ReceiptTypeButtons });
        }
      }
    }
  }

  private isFiscalPrintFailedForRetailTransaction(configurationManager: IConfigurationManager): boolean {
    const stateValues = this.props.businessState.stateValues;
    const printerResponseCode: FiscalResponseCode = this.props.deviceStatus && this.props.deviceStatus.fiscalStatus &&
        this.props.deviceStatus.fiscalStatus.responseCode;
    return isFiscalPrinter(this.props.settings.configurationManager, this.props.chosenPrinterId) &&
        stateValues.get("transaction.type") === MERCHANDISE_TRANSACTION_TYPE &&
        stateValues.get("ReceiptSession.receiptCategory") !== ReceiptCategory.BalanceInquiry &&
          !stateValues.get("transaction.voided") &&
          printerResponseCode &&
          ((stateValues.get("ReceiptSession.printingFailed") &&
          (printerResponseCode === FiscalResponseCode.NotConnected ||
          printerResponseCode === FiscalResponseCode.Rejected ||
          printerResponseCode === FiscalResponseCode.Timeout)) ||
          printerResponseCode === FiscalResponseCode.NotRefundable);
  }

  private hideBackButton = (): void => {
    if (this.props.providedReceiptCategory === ReceiptCategory.PostVoid) {
      this.props.hideBackButton();
    }
  }

  private moveToFiscalReceiptPrinterErrorScreen(): void {
    if (!this.props.hideFiscalPrinterErrorScreen) {
      this.props.navigation.push("fiscalPrinterReceiptError", {
        onContinue: this.receiptPrinterChoiceContinue,
        onCancel: this.receiptPrinterChoiceCancel
      });
      this.props.showFiscalErrorScreen(true);
    }
  }

  private checkAndHandleOnlyFullTaxEnabled(): void {
    // When only full tax invoice is enabled, and global blue tax refund was successfully issued, automatically
    // do a no receipt print

    const functionalBehavior = this.props.settings.configurationManager.getFunctionalBehaviorValues();
    const receiptTypeChoices: IReceiptTypeChoices = functionalBehavior.receipt.typeChoices;
    const { stateValues } = this.props.businessState;

    if (receiptTypeChoices && !receiptTypeChoices.vatReceipt && !receiptTypeChoices.fullPageInvoice &&
        !receiptTypeChoices.standardReceipt && !receiptTypeChoices.japanRSSReceipt &&
        !!receiptTypeChoices.fullTaxInvoice && !!stateValues.get("transaction.taxFreeFormKey")
        && stateValues.get("TaxRefundSession.isCompleted")) {
      this.handleNoReceiptChosen();
    }
  }

  private shouldProceedToFiscalPrinterError(printerStatus: UiInput,
                                            closingState: MerchandiseTransactionClosingState): boolean {
    return isFiscalPrinter(this.props.settings.configurationManager, this.props.chosenPrinterId) &&
          printerStatus &&
          printerStatus.inputValue === FiscalReportStatus.Error &&
          (closingState === MerchandiseTransactionClosingState.PostVoidFailed ||
          closingState === MerchandiseTransactionClosingState.PostVoidCompleted);
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    availableReceiptTypes: state.receipt.availableReceiptTypes,
    businessState: state.businessState,
    chosenPrinterId: state.receipt.chosenPrinterId,
    chosenReceiptType: state.receipt.chosenReceiptType,
    configuredPrinters: state.receipt.configuredPrinters,
    isReprintLastReceipt: state.receipt.isReprintLastReceipt,
    isSelectPrinter: state.receipt.isSelectPrinter,
    receiptEmail: state.receipt.receiptEmail,
    receiptCategory: state.receipt.receiptCategory,
    receiptPhoneNumber: state.receipt.receiptPhoneNumber,
    settings: state.settings,
    taxCustomer: state.receipt.taxCustomer,
    uiState: state.uiState,
    deviceStatus: state.deviceStatus,
    deviceIdentity: state.settings.deviceIdentity,
    retailLocations: state.retailLocations,
    hideFiscalPrinterErrorScreen: state.receipt.hideFiscalPrinterErrorScreen,
    i18nLocation: state.i18nLocationState?.i18nLocation
  };
};

export default connect<StateProps, DispatchProps>(mapStateToProps, {
  getConfiguredPrinters: getConfiguredPrinters.request,
  getReceiptTypes: getReceiptTypes.request,
  performBusinessOperation: businessOperation.request,
  resetReceiptState: resetReceiptState.request,
  setAvailableReceiptCategoryButtons: setAvailableReceiptCategoryButtons.request,
  setChosenPrinterId: setChosenPrinterId.request,
  setIsReprintLastReceipt: setIsReprintLastReceipt.request,
  setReceiptCategory: setReceiptCategory.request,
  setReceiptEmail: setReceiptEmail.request,
  setReceiptPhoneNumber: setReceiptPhoneNumber.request,
  setReceiptType: setReceiptType.request,
  resetTaxRefundState: resetTaxRefundState.request,
  setTransactionToReprint: setTransactionToReprint.request,
  getTaxCustomer: getTaxCustomer.request,
  sceneTitle: sceneTitle.request,
  isSelectPrinterFlow: isSelectPrinterFlow.request,
  resetFiscalDeviceStatus: resetFiscalDeviceStatus.request,
  showFiscalErrorScreen: showFiscalErrorScreen.request
})(ReceiptOptionForm);
