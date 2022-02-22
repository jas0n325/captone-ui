import * as React from "react";

import { Money } from "@aptos-scp/scp-component-business-core";
import { ILogger, LogLevel, LogManager } from "@aptos-scp/scp-component-logging";
import {
  DI_TYPES as CORE_DI_TYPES,
  ITransaction,
  ITransactionRepository,
  UiInput,
  UIINPUT_SOURCE_BARCODE,
  UIINPUT_SOURCE_KEYBOARD
} from "@aptos-scp/scp-component-store-selling-core";
import {
  BALANCE_INQUIRY_RECEIPT_EVENT,
  Customer,
  getFeatureAccessConfig,
  IItemDisplayLine,
  isMerchandiseTransaction,
  isReceiptLine,
  isReprintTransactionLine,
  MERCHANDISE_TRANSACTION_TYPE,
  PRINT_NO_SALE_RECEIPT_EVENT,
  PRINT_PAID_OPERATION_RECEIPT_EVENT,
  PRINT_TILL_RECEIPT_EVENT,
  REPRINT_LAST_RECEIPT_EVENT,
  REPRINT_LAST_TRANSACTION_RECEIPTS_EVENT,
  REPRINT_RECEIPT_EVENT,
  REPRINT_RECEIPT_TRANSACTION_TYPE,
  REPRINT_TRANSACTION_RECEIPTS_EVENT,
  TaxCustomer,
  TRANSACTION_RECEIPTS_EVENT,
  UiInputKey,
  I18nLocationValues,
  isTransactionReferenceLine
} from "@aptos-scp/scp-component-store-selling-features";
import {
  CustomerType,
  ICustomer,
  IMerchandiseTransaction,
  isReceiptLine as isPostedReceiptLine,
  MerchandiseTransactionClosingState,
  ReceiptCategory,
  ReceiptType,
  TransactionType
} from "@aptos-scp/scp-types-commerce-transaction";

import { DI_TYPES } from "../../../config";
import { IAppLocalDeviceStorage } from "../../../persistence/IAppLocalDeviceStorage";
import { ActionCreator, DataEventType, IAvailableReceiptCategoryButtons, ReceiptPrinter } from "../../actions";
import {BusinessState, DataEventState, SettingsState} from "../../reducers";
import { JAPANRSS_RECEIPT_MAXIMUM_REPRINTS_ALLOWED } from "../common/utilities";
import { getEInvoiceForBusinessCustomerFlag, isFullTaxInvoiceAllowedForReprint } from "../customer/CustomerUtilities";


export interface BaseReceiptScreenStateProps {
  availableReceiptTypes: ReceiptType[];
  businessState: BusinessState;
  chosenPrinterId: string;
  chosenReceiptType: ReceiptType;
  configuredPrinters: ReceiptPrinter[];
  isReprintLastReceipt: boolean;
  receiptCategory: ReceiptCategory;
  receiptEmail: string;
  receiptPhoneNumber: string;
  settings: SettingsState;
  taxCustomer: TaxCustomer;
  i18nLocation: string;
}

export interface BaseReceiptScreenDispatchProps {
  getConfiguredPrinters: ActionCreator;
  getReceiptTypes: ActionCreator;
  performBusinessOperation: ActionCreator;
  resetReceiptState: ActionCreator;
  setAvailableReceiptCategoryButtons: ActionCreator;
  setChosenPrinterId: ActionCreator;
  setIsReprintLastReceipt: ActionCreator;
  setReceiptCategory: ActionCreator;
  setReceiptEmail: ActionCreator;
  setReceiptType: ActionCreator;
  getTaxCustomer: ActionCreator;
}

export interface BaseReceiptScreenOwnProps {
  customer?: ICustomer;
  eventTypeForReceipt?: string;
  incomingDataEvent?: DataEventState;
  reprintLastReceipt?: boolean;
  lastTransactionType?: string;
  handlePromptForCustomerLogic?: () => void;
  providedReceiptCategory: ReceiptCategory;
  transactionToReprint?: IMerchandiseTransaction;
}

export interface BaseReceiptScreenProps extends BaseReceiptScreenOwnProps, BaseReceiptScreenStateProps,
    BaseReceiptScreenDispatchProps {}

export interface BaseReceiptScreenState {
  receiptSubmitted: boolean;
  showEmailButton?: boolean;
  showPrintButton?: boolean;
}

interface ReceiptCount {
  sale: number;
  vatReceipt: number;
  invoice: number;
  fullPageInvoice: number;
  japanRSS: number;
  postVoid: number;
}

export interface ReprintReceiptCount {
  transactionType: string;
  print: ReceiptCount;
  email: ReceiptCount;
}

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.components.receipt.BaseReceiptScreen");

export abstract class BaseReceiptScreen<P extends BaseReceiptScreenProps, S extends BaseReceiptScreenState>
    extends React.Component<P, S> {
  protected printerRequired: boolean;
  protected reprintStandardReceiptAvailable: boolean;
  protected reprintFullTaxInvoiceAvailable: boolean;
  protected reprintFullPageInvoiceAvailable: boolean;
  protected reprintVATReceiptAvailable: boolean;
  protected reprintJapanRSSReceiptAvailable: boolean;
  protected reprintPostVoidReceiptAvailable: boolean;
  protected emailPostVoidReceiptAvailable: boolean;
  protected emailStandardReceiptAvailable: boolean;
  protected emailFullTaxInvoiceAvailable: boolean;
  protected emailFullPageInvoiceAvailable: boolean;
  protected emailVATInvoiceAvailable: boolean;
  protected emailJapanRSSReceiptAvailable: boolean;
  protected reprintReceiptCount: ReprintReceiptCount;
  protected reprintLastReceiptTransactionType: string;
  protected reprintLastReceiptTransactionClosingState: MerchandiseTransactionClosingState;
  protected reprintLastReceiptCategory: ReceiptCategory;
  private japanRSSReceiptAvailable: boolean;
  private appLocalDeviceStorage: IAppLocalDeviceStorage;

  constructor(props: P) {
    super(props);

    this.handleSetup();

    this.appLocalDeviceStorage = this.props.settings.diContainer.get<IAppLocalDeviceStorage>(
        DI_TYPES.IAppLocalDeviceStorage);
    this.reprintReceiptCount = this.generateNewReprintReceiptCount();

    if (this.props.providedReceiptCategory === ReceiptCategory.ReprintReceipt) {
      this.loadReprintLastTransactionType();
    }

    //Get printers from configs
    this.getReprintReceiptCount();

    //examine transaction for gift receipt
    if (props.businessState && props.businessState.displayInfo && props.businessState.displayInfo.itemDisplayLines &&
        props.businessState.displayInfo.itemDisplayLines.length > 0) {
      this.printerRequired = !!(props.businessState.displayInfo.itemDisplayLines.find(
        (itemLine: IItemDisplayLine) => itemLine.giftReceipt)
      );
      this.printerRequired = this.printerRequired || this.props.businessState.stateValues.get(
          "ReceiptSession.printerRequired");
    } else if (props.transactionToReprint) {
      this.printerRequired = !!(props.transactionToReprint.lines.find((line) =>
          isPostedReceiptLine(line) && !line.preventReprint &&
          (line.receiptCategory === ReceiptCategory.Gift || line.receiptCategory === ReceiptCategory.StoreTender ||
          line.receiptCategory === ReceiptCategory.StoreReturns || line.receiptCategory === ReceiptCategory.StoreInvoice
          || line.receiptCategory === ReceiptCategory.StoreReceipt)));
    } else if (props.businessState && props.businessState.lastPrintableTransactionInfo &&
        this.props.providedReceiptCategory === ReceiptCategory.ReprintReceipt) {
      this.printerRequired = props.businessState.lastPrintableTransactionInfo.reprintRequiresPrinter;
    }
  }

  protected handleSetup(): void {
    this.props.resetReceiptState(); // Clear out the state on start of a new receipt session

    this.props.getConfiguredPrinters();
    this.props.getReceiptTypes(this.props.providedReceiptCategory, this.props.eventTypeForReceipt,
        this.props.transactionToReprint, this.props.businessState.lastPrintableTransactionInfo &&
            this.props.businessState.lastPrintableTransactionInfo.reprintReceiptCategory);

    if (this.props.providedReceiptCategory) {
      this.props.setReceiptCategory(this.props.providedReceiptCategory);
    }

    this.props.setIsReprintLastReceipt(this.props.reprintLastReceipt);

    const customer: Customer = this.props.customer || this.props.businessState.stateValues.get("transaction.customer");

    if (!!customer) {
      this.props.setReceiptEmail(customer.emailAddress);
    }
    if (this.props.taxCustomer) {
      this.props.getTaxCustomer(this.props.taxCustomer);
    }
  }

  /**
   * Returns true if the given receipt type is allowed based on the application state
   * Valid receipt types must be pre-populated in the state
   */
  protected checkReceiptOptionAllowed(option: ReceiptType): boolean {
    return this.props.availableReceiptTypes && this.props.availableReceiptTypes.findIndex(
      (availableReceiptOption: ReceiptType) => {
        return availableReceiptOption === option;
      }
    ) !== -1;
  }

  /**
   * Returns true if one printer is configured.
   */
  protected get singlePrinterIsConfigured(): boolean {
    return this.props.configuredPrinters && this.props.configuredPrinters.length === 1;
  }

  /**
   * Convenience method for printing a physical receipt.
   * Will not send print event if there is no printer configured.
   */
  protected safePrintReceipt(): void {
    if (this.props.configuredPrinters && this.props.configuredPrinters.length > 0) {
      this.submitReceipt();
    } else {
      logger.info("Tried to print receipt when no printer was configured.");
    }
  }

  /**
   * Submits the print event for features to process
   */
  protected submitReceipt(): void {
    const uiInputs: UiInput[] = [];
    uiInputs.push(new UiInput(UiInputKey.RECEIPT_TYPE, this.props.chosenReceiptType));
    uiInputs.push(new UiInput(UiInputKey.RECEIPT_CATEGORY, this.getReceiptCategory(this.props.receiptCategory)));
    if (this.props.settings.primaryLanguage) {
      uiInputs.push(new UiInput(UiInputKey.PRIMARY_LANGUAGE, this.props.settings.primaryLanguage));
    }

    if (this.isTaxCustomerAllowed()) {
      uiInputs.push(new UiInput(UiInputKey.TAX_CUSTOMER, this.props.taxCustomer));

      this.storeTaxCustomerInfo(this.props.taxCustomer).catch((error) => {
        throw logger.throwing(error, "storeTaxCustomerInfo", LogLevel.WARN);
      });
    }

    if (this.props.chosenReceiptType === ReceiptType.Email || this.props.chosenReceiptType === ReceiptType.Both) {
      uiInputs.push(new UiInput("emailAddress", this.props.receiptEmail));
    }

    if (this.props.chosenReceiptType === ReceiptType.SMS) {
      uiInputs.push(new UiInput(UiInputKey.COUNTRY_CODE, "1")); // TODO: Replace hardcode with user entry
      uiInputs.push(new UiInput(UiInputKey.PHONE_NUMBER, this.props.receiptPhoneNumber));
    }

    const printerInputRequired: boolean = this.props.configuredPrinters && this.props.configuredPrinters.length > 0 && (
      this.props.chosenReceiptType === ReceiptType.Print ||
      this.props.chosenReceiptType === ReceiptType.Both ||
      this.printerRequired
    );

    if (printerInputRequired) {
      uiInputs.push(new UiInput("printer", this.getDefaultPrinterId()));
    }

    if (this.props.transactionToReprint) {
      this.reprintReceiptCount = this.copyReceiptCount(this.props.transactionToReprint);

      const incomingDataEventIsPresent: boolean = this.props.incomingDataEvent &&
          (this.props.incomingDataEvent.eventType === DataEventType.ScanData ||
           this.props.incomingDataEvent.eventType === DataEventType.KeyListenerData);

      uiInputs.push(new UiInput("reprintTransaction", this.props.transactionToReprint, undefined,
          incomingDataEventIsPresent ? UIINPUT_SOURCE_BARCODE : UIINPUT_SOURCE_KEYBOARD));

      this.incrementLastReprintLocalCount().catch((error) => {
        throw logger.throwing(error, "incrementLastReprintLocalCount", LogLevel.WARN);
      });
    }

    if (this.props.reprintLastReceipt) {
      uiInputs.push(new UiInput(UiInputKey.REPRINT_RECEIPT_COUNT, this.reprintReceiptCount));
      this.incrementLastReprintLocalCount().catch((error) => {
        throw logger.throwing(error, "incrementLastReprintLocalCount", LogLevel.WARN);
      });
    }

    this.setState(
      { receiptSubmitted: true },
      () => {
        this.props.performBusinessOperation(this.props.settings.deviceIdentity, this.receiptBusinessEvent, uiInputs);
      }
    );
  }

  protected copyReceiptCount(transaction: IMerchandiseTransaction): ReprintReceiptCount {
    if (transaction["reprintReceiptCount"]) {
      return {
        print: {
          sale: transaction["reprintReceiptCount"].print.sale,
          vatReceipt: transaction["reprintReceiptCount"].print.vatReceipt,
          invoice: transaction["reprintReceiptCount"].print.invoice,
          fullPageInvoice: transaction["reprintReceiptCount"].print.fullPageInvoice,
          japanRSS: transaction["reprintReceiptCount"].print.japanRSS,
          postVoid: transaction["reprintReceiptCount"].print.postVoid
        },
        email: {
          sale: transaction["reprintReceiptCount"].email.sale,
          vatReceipt: transaction["reprintReceiptCount"].email.vatReceipt,
          invoice: transaction["reprintReceiptCount"].email.invoice,
          fullPageInvoice: transaction["reprintReceiptCount"].email.fullPageInvoice,
          japanRSS: transaction["reprintReceiptCount"].email.japanRSS,
          postVoid: transaction["reprintReceiptCount"].email.postVoid
        },
        transactionType: REPRINT_RECEIPT_TRANSACTION_TYPE
      };
    } else {
      return {
        print: {
          sale: 0,
          vatReceipt: 0,
          invoice: 0,
          fullPageInvoice: 0,
          japanRSS: 0,
          postVoid: 0
        },
        email: {
          sale: 0,
          vatReceipt: 0,
          invoice: 0,
          fullPageInvoice: 0,
          japanRSS: 0,
          postVoid: 0
        },
        transactionType: REPRINT_RECEIPT_TRANSACTION_TYPE
      };
    }
  }

  protected async loadLastTransactionType(): Promise<ITransaction> {
    const transactionRepository: ITransactionRepository = this.props.settings.
        diContainer.get(CORE_DI_TYPES.ITransactionRepository) as ITransactionRepository;
    return transactionRepository.loadLastTransaction();
  }

  protected loadReprintLastTransactionType(): void {
    if (this.props.reprintLastReceipt) {
      if (this.props.lastTransactionType === TransactionType.ReprintReceiptTransaction) {
        // get the type from appLocalDeviceStorage
        this.loadLastTransactionType()
            .then((transaction: ITransaction) => {
              const reprintTransactionLine = transaction.lines.find(isReprintTransactionLine);
              if (reprintTransactionLine && reprintTransactionLine.originalTransactionReference) {
                this.reprintLastReceiptTransactionType =
                    reprintTransactionLine.originalTransactionReference.transactionType;
                this.reprintLastReceiptTransactionClosingState =
                    reprintTransactionLine.originalTransactionReference["closingState"];
                this.setJapanRSSReceiptAvailable(transaction);
              }
              if (this.reprintLastReceiptTransactionType !== MERCHANDISE_TRANSACTION_TYPE) {
                const receiptLine = transaction.lines.find(isReceiptLine);
                this.reprintLastReceiptCategory = receiptLine?.originalReceiptCategory || receiptLine?.receiptCategory;
              }
            })
            .catch((error) => {
              throw logger.throwing(error, "loadReprintLastTransactionTypeFromLocal", LogLevel.WARN);
            });
      } else {
        // get the type from lastTransactionType and store it in appLocalDeviceStorage
        this.loadLastTransactionType()
            .then((transaction: ITransaction) => {
              this.reprintLastReceiptTransactionType = transaction.transactionType;
              if (isMerchandiseTransaction(transaction)) {
                this.reprintLastReceiptTransactionClosingState = transaction.closingState;
                this.setJapanRSSReceiptAvailable(transaction);
              } else {
                const receiptLine = transaction.lines.find(isReceiptLine);
                this.reprintLastReceiptCategory = receiptLine?.receiptCategory;
              }
            })
            .catch((error) => {
              throw logger.throwing(error, "loadReprintLastTransactionTypeFromLocal", LogLevel.WARN);
            });
      }
    } else if (this.props.transactionToReprint) {
      // get the type from lastTransactionType and store it in appLocalDeviceStorage
      this.reprintLastReceiptTransactionType = this.props.transactionToReprint.transactionType;
      this.reprintLastReceiptTransactionClosingState = this.props.transactionToReprint.closingState;
    }
  }

  protected get receiptBusinessEvent(): string {
    let receiptEvent: string;

    if (this.props.providedReceiptCategory === ReceiptCategory.ReprintReceipt &&
        (this.props.isReprintLastReceipt || !this.props.transactionToReprint)) {
      receiptEvent = REPRINT_LAST_TRANSACTION_RECEIPTS_EVENT;
    } else if (this.props.providedReceiptCategory === ReceiptCategory.ReprintReceipt && this.props.transactionToReprint) {
      receiptEvent = REPRINT_TRANSACTION_RECEIPTS_EVENT;
    } else if (this.props.providedReceiptCategory === ReceiptCategory.BalanceInquiry) {
      receiptEvent = BALANCE_INQUIRY_RECEIPT_EVENT;
    } else if (this.props.providedReceiptCategory === ReceiptCategory.Till) {
      receiptEvent = PRINT_TILL_RECEIPT_EVENT;
    } else if (this.props.providedReceiptCategory === ReceiptCategory.PaidOperation) {
      receiptEvent = PRINT_PAID_OPERATION_RECEIPT_EVENT;
    } else if (this.props.providedReceiptCategory === ReceiptCategory.NoSale) {
      receiptEvent = PRINT_NO_SALE_RECEIPT_EVENT;
    } else {
      receiptEvent = TRANSACTION_RECEIPTS_EVENT;
    }

    return receiptEvent;
  }

  private async incrementLastReprintLocalCount(): Promise<void> {
    if (!this.reprintReceiptCount) {
      this.reprintReceiptCount = this.generateNewReprintReceiptCount();
    }

    switch (this.props.chosenReceiptType) {
      case ReceiptType.Print: {
        this.incrementPrintReceiptCount();
        break;
      }
      case ReceiptType.Email: {
        this.incrementEmailReceiptCount();
        break;
      }
      case ReceiptType.Both: {
        this.incrementEmailPrintReceiptCount();
        break;
      }
      default: {
        break;
      }
    }

    await this.appLocalDeviceStorage.storeReprinReceiptCount(this.reprintReceiptCount);
  }

  private getReceiptCategory(receiptCategory: ReceiptCategory): ReceiptCategory {
    return (this.props.reprintLastReceipt && this.reprintLastReceiptCategory &&
        this.reprintLastReceiptCategory !== ReceiptCategory.ReprintReceipt) ?
        this.reprintLastReceiptCategory : receiptCategory;
  }

  private getReprintReceiptCount(): void {
    this.appLocalDeviceStorage.loadReprinReceiptCount()
        .then(async (rePrintReceiptCountObject: ReprintReceiptCount) => {
          if (this.props.reprintLastReceipt) {
            if (rePrintReceiptCountObject && (rePrintReceiptCountObject.transactionType === this.props.businessState.
                lastPrintableTransactionInfo.transactionType)) {
              this.reprintReceiptCount = rePrintReceiptCountObject;
            } else {
              await this.appLocalDeviceStorage.storeReprinReceiptCount(this.reprintReceiptCount);
            }
          }
        })
        .then(() => {
          this.showHideReceiptCategoryButtons();
        })
        .catch((error) => { throw logger.throwing(error, "loadLastReprintReceiptCountFromLocal", LogLevel.WARN); });
  }

  private showHideReceiptCategoryButtons(): void {
    if (this.props.providedReceiptCategory === ReceiptCategory.ReprintReceipt) {
      let receiptCount: ReprintReceiptCount;
      if (this.props.reprintLastReceipt) {
        receiptCount = {
          transactionType: undefined,
          print: {
            sale: this.reprintReceiptCount ? this.reprintReceiptCount.print.sale : 0,
            vatReceipt: this.reprintReceiptCount
                ? this.reprintReceiptCount.print.vatReceipt
                : 0,
            invoice: this.reprintReceiptCount ? this.reprintReceiptCount.print.invoice : 0,
            fullPageInvoice: this.reprintReceiptCount
                ? this.reprintReceiptCount.print.fullPageInvoice
                : 0,
            japanRSS: this.reprintReceiptCount ? this.reprintReceiptCount.print.japanRSS : 0,
            postVoid: this.reprintReceiptCount ? this.reprintReceiptCount.print.postVoid : 0
          },
          email: {
            sale: this.reprintReceiptCount ? this.reprintReceiptCount.email.sale : 0,
            vatReceipt: this.reprintReceiptCount
                ? this.reprintReceiptCount.email.vatReceipt
                : 0,
            invoice: this.reprintReceiptCount ? this.reprintReceiptCount.email.invoice : 0,
            fullPageInvoice: this.reprintReceiptCount
                ? this.reprintReceiptCount.email.fullPageInvoice
                : 0,
            japanRSS: this.reprintReceiptCount ? this.reprintReceiptCount.email.japanRSS : 0,
            postVoid: this.reprintReceiptCount ? this.reprintReceiptCount.email.postVoid : 0
          }
        };
      } else {
        receiptCount = this.props.transactionToReprint && this.props.transactionToReprint["reprintReceiptCount"];

        if (!receiptCount) {
          receiptCount = {
            transactionType: undefined,
            print: { sale: 0, vatReceipt: 0, invoice: 0, fullPageInvoice: 0, japanRSS: 0, postVoid: 0  },
            email: { sale: 0, vatReceipt: 0, invoice: 0, fullPageInvoice: 0, japanRSS: 0, postVoid: 0  }
          };
        }
      }
      this.setmaximumReprintsAllowedConfig(receiptCount);
      this.showEmailPrintButton();
    } else {
      this.reprintStandardReceiptAvailable = true;
      this.reprintFullTaxInvoiceAvailable = true;
      this.reprintFullPageInvoiceAvailable = true;
      this.reprintVATReceiptAvailable = true;
      this.reprintJapanRSSReceiptAvailable = true;
      this.reprintPostVoidReceiptAvailable = true;
      this.emailStandardReceiptAvailable = true;
      this.emailFullTaxInvoiceAvailable = true;
      this.emailVATInvoiceAvailable = true;
      this.emailFullPageInvoiceAvailable = true;
      this.emailJapanRSSReceiptAvailable = true;
      this.emailPostVoidReceiptAvailable = true;
      this.setState({ showEmailButton: true, showPrintButton: true });
    }
    this.setAvailableReceiptCategoryButtons();
  }

  private setmaximumReprintsAllowedConfig(receiptCount: ReprintReceiptCount): void {
    const reprintReceiptFeatureConfig = getFeatureAccessConfig(
      this.props.settings.configurationManager,
      this.props.reprintLastReceipt ? REPRINT_LAST_RECEIPT_EVENT : REPRINT_RECEIPT_EVENT
    );
    const maximumReprintsAllowedConfig = reprintReceiptFeatureConfig &&
      reprintReceiptFeatureConfig.maximumReprintsAllowed;
    this.reprintStandardReceiptAvailable =
      !maximumReprintsAllowedConfig || receiptCount.print.sale < maximumReprintsAllowedConfig;
    this.reprintFullTaxInvoiceAvailable =
      !maximumReprintsAllowedConfig || receiptCount.print.invoice < maximumReprintsAllowedConfig;
    this.reprintFullPageInvoiceAvailable =
      !maximumReprintsAllowedConfig || receiptCount.print.fullPageInvoice < maximumReprintsAllowedConfig;
    this.reprintVATReceiptAvailable =
      !maximumReprintsAllowedConfig || receiptCount.print.vatReceipt < maximumReprintsAllowedConfig;
    this.reprintJapanRSSReceiptAvailable =
      receiptCount.print.japanRSS < JAPANRSS_RECEIPT_MAXIMUM_REPRINTS_ALLOWED;
    this.reprintPostVoidReceiptAvailable =
      !maximumReprintsAllowedConfig || receiptCount.print.postVoid < maximumReprintsAllowedConfig;

    this.emailStandardReceiptAvailable =
      !maximumReprintsAllowedConfig || receiptCount.email.sale < maximumReprintsAllowedConfig;
    this.emailFullTaxInvoiceAvailable =
      !maximumReprintsAllowedConfig || receiptCount.email.invoice < maximumReprintsAllowedConfig;
    this.emailFullPageInvoiceAvailable =
      !maximumReprintsAllowedConfig || receiptCount.email.fullPageInvoice < maximumReprintsAllowedConfig;
    this.emailVATInvoiceAvailable =
      !maximumReprintsAllowedConfig || receiptCount.email.vatReceipt < maximumReprintsAllowedConfig;
    this.emailJapanRSSReceiptAvailable =
      receiptCount.email.japanRSS < JAPANRSS_RECEIPT_MAXIMUM_REPRINTS_ALLOWED;
    this.emailPostVoidReceiptAvailable =
      !maximumReprintsAllowedConfig || receiptCount.email.postVoid < maximumReprintsAllowedConfig;

    if (this.props.reprintLastReceipt) {
      this.reprintJapanRSSReceiptAvailable =
        this.japanRSSReceiptAvailable && (receiptCount.print.japanRSS < JAPANRSS_RECEIPT_MAXIMUM_REPRINTS_ALLOWED);
      this.emailJapanRSSReceiptAvailable =
        this.japanRSSReceiptAvailable && (receiptCount.email.japanRSS < JAPANRSS_RECEIPT_MAXIMUM_REPRINTS_ALLOWED);
    }
  }

  private setAvailableReceiptCategoryButtons(): void{
    this.props.setAvailableReceiptCategoryButtons({
      reprintStandardReceiptAvailable: this.reprintStandardReceiptAvailable,
      reprintVATReceiptAvailable: this.reprintVATReceiptAvailable,
      reprintFullTaxInvoiceAvailable: this.reprintFullTaxInvoiceAvailable,
      reprintFullPageInvoiceAvailable: this.reprintFullPageInvoiceAvailable,
      reprintJapanRSSReceiptAvailable: this.reprintJapanRSSReceiptAvailable,
      reprintPostVoidReceiptAvailable: this.reprintPostVoidReceiptAvailable,
      emailStandardReceiptAvailable: this.emailStandardReceiptAvailable,
      emailVATInvoiceAvailable: this.emailVATInvoiceAvailable,
      emailFullTaxInvoiceAvailable: this.emailFullTaxInvoiceAvailable,
      emailFullPageInvoiceAvailable: this.emailFullPageInvoiceAvailable,
      emailJapanRSSReceiptAvailable: this.emailJapanRSSReceiptAvailable,
      emailPostVoidReceiptAvailable: this.emailPostVoidReceiptAvailable
    } as IAvailableReceiptCategoryButtons);
  }

  private incrementPrintReceiptCount(): void {
    const transactionReceiptPrintedSuccessfully =
      this.props.businessState?.lastPrintableTransactionInfo?.transactionReceiptPrintedSuccessfully;
    if (this.props.receiptCategory === ReceiptCategory.Receipt) {
      this.reprintReceiptCount.print.sale++;
    } else if (this.props.receiptCategory === ReceiptCategory.Invoice) {
      this.reprintReceiptCount.print.invoice++;
    } else if (this.props.receiptCategory === ReceiptCategory.VatReceipt) {
      this.reprintReceiptCount.print.vatReceipt++;
    } else if (this.props.receiptCategory === ReceiptCategory.FullPageInvoice) {
      this.reprintReceiptCount.print.fullPageInvoice++;
    } else if (this.props.receiptCategory === ReceiptCategory.JapanRSSReceipt && transactionReceiptPrintedSuccessfully) {
      this.reprintReceiptCount.print.japanRSS++;
    } else if (this.props.receiptCategory === ReceiptCategory.PostVoid) {
      this.reprintReceiptCount.print.postVoid++;
    }
  }

  private incrementEmailReceiptCount(): void {
    if (this.props.receiptCategory === ReceiptCategory.Receipt) {
      this.reprintReceiptCount.email.sale++;
    } else if (this.props.receiptCategory === ReceiptCategory.Invoice) {
      this.reprintReceiptCount.email.invoice++;
    } else if (this.props.receiptCategory === ReceiptCategory.VatReceipt) {
      this.reprintReceiptCount.email.vatReceipt++;
    } else if (this.props.receiptCategory === ReceiptCategory.FullPageInvoice) {
      this.reprintReceiptCount.email.fullPageInvoice++;
    } else if (this.props.receiptCategory === ReceiptCategory.JapanRSSReceipt) {
      this.reprintReceiptCount.email.japanRSS++;
    } else if (this.props.receiptCategory === ReceiptCategory.PostVoid) {
      this.reprintReceiptCount.email.postVoid++;
    }
  }

  private incrementEmailPrintReceiptCount(): void {
    const transactionReceiptPrintedSuccessfully =
      this.props.businessState?.lastPrintableTransactionInfo?.transactionReceiptPrintedSuccessfully;
    if (this.props.receiptCategory === ReceiptCategory.Receipt) {
      this.reprintReceiptCount.print.sale++;
      this.reprintReceiptCount.email.sale++;
    } else if (this.props.receiptCategory === ReceiptCategory.Invoice) {
      this.reprintReceiptCount.print.invoice++;
      this.reprintReceiptCount.email.invoice++;
    } else if (this.props.receiptCategory === ReceiptCategory.VatReceipt) {
      this.reprintReceiptCount.print.vatReceipt++;
      this.reprintReceiptCount.email.vatReceipt++;
    } else if (this.props.receiptCategory === ReceiptCategory.FullPageInvoice) {
      this.reprintReceiptCount.print.fullPageInvoice++;
      this.reprintReceiptCount.email.fullPageInvoice++;
    } else if (this.props.receiptCategory === ReceiptCategory.JapanRSSReceipt && transactionReceiptPrintedSuccessfully) {
      this.reprintReceiptCount.print.japanRSS++;
      this.reprintReceiptCount.email.japanRSS++;
    } else if (this.props.receiptCategory === ReceiptCategory.PostVoid) {
      this.reprintReceiptCount.print.postVoid++;
      this.reprintReceiptCount.email.postVoid++;
    }
  }

  private showEmailPrintButton(): void {
    if (this.emailStandardReceiptAvailable || this.emailFullTaxInvoiceAvailable ||
        this.emailVATInvoiceAvailable || this.emailFullPageInvoiceAvailable ||
        this.emailJapanRSSReceiptAvailable || this.emailPostVoidReceiptAvailable) {
      this.setState({showEmailButton: true});
    }
    if (this.reprintStandardReceiptAvailable || this.reprintFullTaxInvoiceAvailable ||
        this.reprintVATReceiptAvailable || this.reprintFullPageInvoiceAvailable ||
        this.reprintJapanRSSReceiptAvailable || this.emailPostVoidReceiptAvailable) {
      this.setState({showPrintButton: true});
    }
  }

  private async storeTaxCustomerInfo(taxCustomer: TaxCustomer): Promise<void> {
    if (taxCustomer) {
      await this.appLocalDeviceStorage.storeTaxCustomerInfo(taxCustomer);
    }
  }

  private generateNewReprintReceiptCount(): ReprintReceiptCount {
    return {
      transactionType: REPRINT_RECEIPT_TRANSACTION_TYPE,
      print: {
        sale: 0,
        vatReceipt: 0,
        invoice: 0,
        fullPageInvoice: 0,
        japanRSS: 0,
        postVoid: 0
      },
      email: {
        sale: 0,
        vatReceipt: 0,
        invoice: 0,
        fullPageInvoice: 0,
        japanRSS: 0,
        postVoid: 0
      }
    };
  }

  private getDefaultPrinterId(): string {
    return this.props.chosenPrinterId || (this.props.configuredPrinters && this.props.configuredPrinters[0].id);
  }

  private isTaxCustomerAllowed(): boolean {
    const eInvoiceFlagForBusinessCustomer =
        getEInvoiceForBusinessCustomerFlag(this.props.settings.configurationManager, this.props.i18nLocation);
    const isFullTaxInvoiceAllowedOnReprint = isFullTaxInvoiceAllowedForReprint(this.props.settings.configurationManager);
    const customer = this.props.customer || this.props.taxCustomer;
    return this.props.receiptCategory === ReceiptCategory.Invoice
        || this.props.receiptCategory === ReceiptCategory.FullPageInvoice
        || this.props.receiptCategory === ReceiptCategory.JapanRSSReceipt
        || (eInvoiceFlagForBusinessCustomer && (customer && customer.customerType === CustomerType.Business))
        || (!eInvoiceFlagForBusinessCustomer && isFullTaxInvoiceAllowedOnReprint
            && this.props.receiptCategory === ReceiptCategory.VatReceipt && (customer &&
            customer.customerType === CustomerType.Business)
        || (!eInvoiceFlagForBusinessCustomer && this.props.i18nLocation === I18nLocationValues.CostaRica));
  }

  /**
   * If transaction total is greater than zero then Japan RSS receipt type is allowed
   */
  private setJapanRSSReceiptAvailable(transaction: ITransaction): void {
    const functionalBehaviourConfig = this.props.settings.configurationManager?.getFunctionalBehaviorValues();
    const typeChoicesConfig = functionalBehaviourConfig?.receipt?.typeChoices;
    if (typeChoicesConfig?.japanRSSReceipt) {
      let transactionTotal: Money;
      let duplicateCopy: boolean = false;
      if (isMerchandiseTransaction(transaction)) {
        duplicateCopy = transaction.lines.some((line) =>
            (isReceiptLine(line) && line.receiptCategory === ReceiptCategory.JapanRSSReceipt &&
              line.receipt && !line.receipt.isTemplate && line.receiptType !== ReceiptType.None));
        transactionTotal = transaction.transactionTotal;
      } else {
        transactionTotal = transaction.lines.find(isTransactionReferenceLine)?.transactionTotal as Money;
      }
      if (transactionTotal && !duplicateCopy) {
        this.japanRSSReceiptAvailable =
            new Money(transactionTotal.amount, transactionTotal.currency).gt(new Money(0, transactionTotal.currency));
      }
    }
  }
}
