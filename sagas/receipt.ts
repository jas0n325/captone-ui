import { Container } from "inversify";
import { SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";

import {ILogEntryMessage, ILogger, LogLevel, LogManager} from "@aptos-scp/scp-component-logging";
import {
  DeviceIdentity,
  DI_TYPES as CORE_DI_TYPES,
  IConfigurationManager,
  IConfigurationValues,
  UiInput
} from "@aptos-scp/scp-component-store-selling-core";
import {
  CollectedDataKey,
  FIND_TAX_CUSTOMER_FROM_HISTORICAL_EVENT,
  IFeatureAccessConfig,
  ReceiptState as ReceiptSessionState,
  ReceiptType,
  TaxCustomer,
  TENDER_EXCHANGE_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";
import {
  IMerchandiseTransaction,
  IReceiptLine,
  isReceiptLine,
  ITransactionLine,
  ReceiptCategory
} from "@aptos-scp/scp-types-commerce-transaction";

import { DI_TYPES } from "../../config";
import { IAppLocalDeviceStorage } from "../../persistence/IAppLocalDeviceStorage";
import {
  getConfiguredPrinters,
  getPrintersFromSearch,
  getReceiptTypes,
  getTaxCustomer,
  GET_CONFIGURED_PRINTERS,
  GET_PRINTER_FROM_SEARCH,
  GET_RECEIPT_TYPES,
  GET_TAX_CUSTOMER,
  ReceiptPrinter,
  setChosenPrinterId,
  StandardAction,
  businessOperation,
  GET_TAX_CUSTOMER_FROM_HISTORICAL,
  getTaxCustomerFromHistorical,
  BUSINESS_OPERATION
} from "../actions";
import {
  getFeatureAccessConfig,
  getReceiptDestinationChoices
} from "../components/common/utilities/configurationUtils";
import {getConfiguredPrintersFromConfig, getPrinterIdList} from "../components/common/utilities/receiptUtils";
import { printSuspendedReceipt } from "../components/common/utilities/suspendUtilities";
import { printPostVoidTransactionReceipt } from "../components/common/utilities/transactionVoidUtilities";
import { BusinessState, ReceiptState, SettingsState } from "../reducers";
import { getAppSettingsState, getBusinessState, getReceiptState } from "../selectors";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.receipt");

interface ConsolidatedMerchandiseTransaction extends IMerchandiseTransaction {
  taxCustomerInfo?: TaxCustomer;
}

function* getConfiguredPrintersForReceipts(action: StandardAction): IterableIterator<{}> {
  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer: Container = settings.diContainer;
  const configurationManager: IConfigurationManager = diContainer.get(CORE_DI_TYPES.IConfigurationManager);

  const deviceIdentity: DeviceIdentity = settings.deviceIdentity;

  const peripheralsConfig: IConfigurationValues = configurationManager.getPeripheralsValues();
  const printerIdList: string[] = getPrinterIdList(peripheralsConfig.printerType, deviceIdentity);

  const configuredPrinters: ReceiptPrinter[] = getConfiguredPrintersFromConfig(
      peripheralsConfig.printerType.deviceDefinitions,
      printerIdList
  );
  if (action.payload.resetChosenPrinterId) {
    yield put(setChosenPrinterId.request(undefined));
  }

  yield put(getConfiguredPrinters.success(configuredPrinters));
}

/**
 * Filter out user options for certain ReceiptTypes based upon the 'ReceiptCategory' of the receipt being printed.
 * Currently (3/14/2019) this isn't handled by config, but the expectation is receipts with a 'ReceiptCategory' of
 * 'Suspended' or 'BalanceInquiry' are only allowed to be printed, not emailed, nor both, not .
 *
 * Updated (02/10/2020) to filter for MA/CA flow based on promptForCustomerAfterTransactionReceipts config.
 * Updated (DSS-6157) to handle the receipt for till in/till out
 */

const isPrintTransaction = (configurationManager: IConfigurationManager,
                            receiptCategory: ReceiptCategory) => {
  let featureConfig;
  if (receiptCategory && (receiptCategory === ReceiptCategory.Suspend)) {
    featureConfig = printSuspendedReceipt(configurationManager);
  } else if (receiptCategory && (receiptCategory === ReceiptCategory.PostVoid)) {
    featureConfig = printPostVoidTransactionReceipt(configurationManager);
  } else if (receiptCategory && receiptCategory === ReceiptCategory.TenderExchange) {
    featureConfig = printTenderExchangeReceipt(configurationManager);
  }
  return [featureConfig ? ReceiptType.Print : ReceiptType.None];
};

export const isMatchableReceiptCategory = (receiptCategory: ReceiptCategory) => {
  return receiptCategory === ReceiptCategory.Suspend || receiptCategory === ReceiptCategory.PostVoid ||
    receiptCategory === ReceiptCategory.TenderExchange;
};

function reduceReceiptTypesIfNecessary(configuredReceiptTypes: ReceiptType[],
                                       configurationManager: IConfigurationManager,
                                       businessState: BusinessState,
                                       receiptCategory?: ReceiptCategory,
                                       eventTypeForReceipt?: string,
                                       transaction?: IMerchandiseTransaction,
                                       originalReceiptCategory?: ReceiptCategory): ReceiptType[] {

  let reducedReceiptTypes: ReceiptType[] = configuredReceiptTypes;

  const printOnlyReceiptCategory: boolean = isPrintOnlyCategory(receiptCategory, configurationManager) ||
      originalTransactionIsPrintOnly(transaction, receiptCategory, originalReceiptCategory, configurationManager);

  const printedReceiptRequired: boolean = configurationManager.getFunctionalBehaviorValues().customerFunctionChoices
      .promptForCustomerAfterTransactionReceipts && receiptCategory !== ReceiptCategory.ReprintReceipt;

  const receiptPrinted = (businessState.stateValues.get("ReceiptSession.state") === ReceiptSessionState.Completed);

  if (printOnlyReceiptCategory || (printedReceiptRequired && !receiptPrinted)) {
    reducedReceiptTypes = [ReceiptType.Print];
    if (receiptCategoryAllowsCancel(receiptCategory)) {
      reducedReceiptTypes.push(ReceiptType.None);
    }
  } else if (printedReceiptRequired && receiptPrinted) {
    reducedReceiptTypes = configuredReceiptTypes.filter((receiptType) => {
      return receiptType !== ReceiptType.Print && receiptType !== ReceiptType.Both;
    });
    if (!reducedReceiptTypes.length) {
      reducedReceiptTypes = [ReceiptType.None];
    }
  } else if (receiptCategory) {
    //Print receipt config behaviour for till and paid opration is same
    if ((receiptCategory === ReceiptCategory.Till || receiptCategory === ReceiptCategory.PaidOperation)
        && !receiptPrinted) {
      const featureConfig = getFeatureAccessConfig(configurationManager, eventTypeForReceipt);
      const printReceipt =
          !!featureConfig.printReceipt ? featureConfig.printReceipt : featureConfig.printReceipt === undefined;

      reducedReceiptTypes = [printReceipt ? ReceiptType.Print : ReceiptType.None];
    } else if (isMatchableReceiptCategory(receiptCategory)) {
      reducedReceiptTypes = isPrintTransaction(configurationManager,
        receiptCategory);
    }
  }

  return reducedReceiptTypes;
}

function isPrintOnlyCategory(receiptCategory: ReceiptCategory, configurationManager: IConfigurationManager): boolean {
  return receiptCategory &&
      receiptCategory === ReceiptCategory.NoSale ||
      receiptCategory === ReceiptCategory.BalanceInquiry ||
      receiptCategory === ReceiptCategory.TenderExchange && printTenderExchangeReceipt(configurationManager)||
      (receiptCategory === ReceiptCategory.Suspend && printSuspendedReceipt(configurationManager)) ||
      (receiptCategory === ReceiptCategory.PostVoid && printPostVoidTransactionReceipt(configurationManager));
}

function receiptCategoryAllowsCancel(receiptCategory: ReceiptCategory): boolean {
  return receiptCategory === ReceiptCategory.BalanceInquiry ||
      receiptCategory === ReceiptCategory.TenderExchange ||
      receiptCategory === ReceiptCategory.ReprintReceipt;
}

export function printTenderExchangeReceipt(configurationManager: IConfigurationManager): boolean {
  const event: IFeatureAccessConfig = getFeatureAccessConfig(configurationManager, TENDER_EXCHANGE_EVENT);
  return event && event.printReceipt;
}

function originalTransactionIsPrintOnly(transaction: IMerchandiseTransaction, receiptCategory: ReceiptCategory,
                                        originalReceiptCategory: ReceiptCategory,
                                        configurationManager: IConfigurationManager): boolean {
  if (receiptCategory === ReceiptCategory.ReprintReceipt) {
    // Check if the originalReceiptCategory (for reprint last receipt)
    // or the original transactions category (for reprint from sales history)
    // should only allow print.
    return isPrintOnlyCategory(originalReceiptCategory || getTransactionReceiptCategory(transaction), configurationManager);
  }
}

function getTransactionReceiptCategory(transaction: IMerchandiseTransaction): ReceiptCategory {
  const receiptLine = transaction && transaction.lines &&
      transaction.lines.find((line: ITransactionLine) => isReceiptLine) as IReceiptLine;
  return receiptLine && (receiptLine.receiptCategory || receiptLine.originalReceiptCategory);
}

function* getReceiptTypesFromConfig(action: StandardAction): IterableIterator<{}> {
  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer: Container = settings.diContainer;
  const configurationManager: IConfigurationManager = diContainer.get(CORE_DI_TYPES.IConfigurationManager);
  const businessState: BusinessState = yield select(getBusinessState);

  const configuredReceiptTypes = getReceiptDestinationChoices(configurationManager);

  const receiptChoicesToReturn: ReceiptType[] = [];

  if (configuredReceiptTypes.noReceipt) {
    receiptChoicesToReturn.push(ReceiptType.None);
  }

  if (configuredReceiptTypes.printer) {
    receiptChoicesToReturn.push(ReceiptType.Print);
  }

  if (configuredReceiptTypes.email) {
    receiptChoicesToReturn.push(ReceiptType.Email);
  }

  if (configuredReceiptTypes.sms) {
    receiptChoicesToReturn.push(ReceiptType.SMS);
  }

  if (configuredReceiptTypes.emailAndPrinter) {
    receiptChoicesToReturn.push(ReceiptType.Both);
  }

  yield put(getReceiptTypes.success(reduceReceiptTypesIfNecessary(
    receiptChoicesToReturn,
    configurationManager,
    businessState,
    action.payload.receiptCategory,
    action.payload.eventTypeForReceipt,
    action.payload.transactionToReprint,
    action.payload.originalReceiptCategory
  )));
}

function* handleStorageOfTaxCustomer(action: StandardAction): IterableIterator<{}> {
  if (action.payload && action.payload.taxCustomer) {
    yield put(getTaxCustomer.success(action.payload.taxCustomer));
  } else {
    const receiptState: ReceiptState = yield select(getReceiptState);
    const isReprintLastReceipt: boolean = receiptState.isReprintLastReceipt;
    const receiptCategory: ReceiptCategory = receiptState.receiptCategory;
    const transactionToReprint: IMerchandiseTransaction = receiptState.transactionToReprint;

    const settings: SettingsState = yield select(getAppSettingsState);
    const diContainer: Container = settings.diContainer;
    const appLocalDeviceStorage: IAppLocalDeviceStorage = diContainer.get(DI_TYPES.IAppLocalDeviceStorage);

    if (receiptCategory === ReceiptCategory.ReprintReceipt) {
      let taxCustomer: TaxCustomer;

      if (isReprintLastReceipt) {
        try {
          yield call(async () => {
            taxCustomer = await appLocalDeviceStorage.loadTaxCustomerInfo();
          });
        } catch (error) {
          throw logger.throwing(error, "loadTaxCustomerInfo", LogLevel.WARN);
        }
      } else {
        appLocalDeviceStorage.removeTaxCustomerInfo().catch((error: Error) => {
          throw logger.throwing(error, "removeTaxCustomerInfo", LogLevel.WARN);
        });

        taxCustomer = transactionToReprint && (transactionToReprint as ConsolidatedMerchandiseTransaction).
            taxCustomerInfo;
      }

      yield put(getTaxCustomer.success(taxCustomer));
    } else {
      appLocalDeviceStorage.removeTaxCustomerInfo().catch((error: Error) => {
        throw logger.throwing(error, "removeTaxCustomerInfo", LogLevel.WARN);
      });
    }
  }
}

function* handleTaxCustomerFromHistorical(action: StandardAction): IterableIterator<{}> {
  const entryMessage: ILogEntryMessage = logger.traceEntry("handleTaxCustomerFromHistorical");
  const settings: SettingsState = yield select(getAppSettingsState);
  const { historicalTransactionId } = action.payload;
  const uiInputs: UiInput[] = [];

  const deviceIdentity: DeviceIdentity = settings.deviceIdentity;
  if (historicalTransactionId) {
    uiInputs.push(new UiInput(UiInputKey.ORIGINAL_TRANSACTION_ID, historicalTransactionId));
  }

  logger.debug(() => `In handleTaxCustomerFromHistorical: Calling performBusinessOperation with `
      + `${FIND_TAX_CUSTOMER_FROM_HISTORICAL_EVENT} `
      + `and params: ${JSON.stringify(uiInputs)}`);
  yield put(businessOperation.request(deviceIdentity, FIND_TAX_CUSTOMER_FROM_HISTORICAL_EVENT, uiInputs));
  logger.traceExit(entryMessage);

}

function* getPrintersFromSearchForReceipts(action: StandardAction): IterableIterator<{}> {
  const settings: SettingsState = yield select(getAppSettingsState);
  const diContainer: Container = settings.diContainer;
  const configurationManager: IConfigurationManager = diContainer.get(CORE_DI_TYPES.IConfigurationManager);

  const deviceIdentity: DeviceIdentity = settings.deviceIdentity;

  const peripheralsConfig: IConfigurationValues = configurationManager.getPeripheralsValues();
  const printerIdList: string[] = getPrinterIdList(peripheralsConfig.printerType, deviceIdentity);

  const configuredPrinters: ReceiptPrinter[] = getConfiguredPrintersFromConfig(
      peripheralsConfig.printerType.deviceDefinitions,
      printerIdList,
      action.payload.printerId
  );

  if (!configuredPrinters.length && action.payload.isSubmitting) {
    yield put(getPrintersFromSearch.failure(getConfiguredPrintersFromConfig(
        peripheralsConfig.printerType.deviceDefinitions,
        printerIdList
    )));
  } else if (configuredPrinters.length === 1) {
    yield put(getPrintersFromSearch.success(configuredPrinters, configuredPrinters[0].id));
  } else {
    yield put(getPrintersFromSearch.success(configuredPrinters));
  }
}

export function* businessOperationSuccess(action: any): IterableIterator<{}> {
  if (action.payload.eventType ===  FIND_TAX_CUSTOMER_FROM_HISTORICAL_EVENT) {
    const { nonContextualData } = action.payload;

    if (nonContextualData && nonContextualData.has(CollectedDataKey.TaxCustomer)) {
      const taxCustomer: TaxCustomer = action.payload.nonContextualData
          .get(CollectedDataKey.TaxCustomer);
      yield put(getTaxCustomerFromHistorical.success(taxCustomer));
    }
  }
}

export function* watchGetConfiguredPrinters(): SagaIterator {
  yield takeEvery(GET_CONFIGURED_PRINTERS.REQUEST, getConfiguredPrintersForReceipts);
}

export function* watchGetReceiptTypes(): SagaIterator {
  yield takeEvery(GET_RECEIPT_TYPES.REQUEST, getReceiptTypesFromConfig);
}

export function* watchGetTaxCustomer(): SagaIterator {
  yield takeEvery(GET_TAX_CUSTOMER.REQUEST, handleStorageOfTaxCustomer);
}

export function* watchGetPrintersFromSearch(): SagaIterator {
  yield takeEvery(GET_PRINTER_FROM_SEARCH.REQUEST, getPrintersFromSearchForReceipts);
}

export function* watchGetTaxCustomerFromHistorical(): SagaIterator {
  yield takeEvery(GET_TAX_CUSTOMER_FROM_HISTORICAL.REQUEST, handleTaxCustomerFromHistorical);
  yield takeEvery(BUSINESS_OPERATION.SUCCESS, businessOperationSuccess);
}
