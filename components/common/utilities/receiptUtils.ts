import { DeviceIdentity,
  IConfigurationManager, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import { UiInputKey } from "@aptos-scp/scp-component-store-selling-features";
import { IConfigurableDeviceSettings } from "@aptos-scp/scp-types-commerce-devices";
import { IReceiptLine, isReceiptLine, ITransactionLine } from "@aptos-scp/scp-types-commerce-transaction";
import { ReceiptPrinter } from "../../../actions";

export const JAPANRSS_RECEIPT_MAXIMUM_REPRINTS_ALLOWED = 1;

export const getConfiguredPrintersFromConfig = (
    deviceDefinitions: any,
    printerIdList: string[],
    printerId?: string
): ReceiptPrinter[] => {
  return deviceDefinitions.filter((printer: any) => filterPrinters(printer, printerIdList, printerId))
      .map((printer: any): ReceiptPrinter => ({
        id: printer.id,
        description: printer.description,
        printerType: printer.printerType,
        printerSerialNumber: printer.printerSerialNumber
      }));
};

export const filterPrinters = (printer: any, printerIdList: string[], printerId?: string) => {
  const inPrinterIdList: boolean = !printerIdList ||
      printerIdList.length === 0 ||
      printerIdList.indexOf(printer.id) > -1;

  let includesPrinterId: boolean = true;

  // Only change when printerId is provided
  if (printerId) {
    includesPrinterId = printer.id.toString() === printerId;
  }

  return inPrinterIdList && includesPrinterId;
};

export const getPrinterIdList = (printerType: any, deviceIdentity: DeviceIdentity) => {
  return printerType.printersByTerminalId && printerType.printersByTerminalId[deviceIdentity.deviceId] ||
      printerType.defaultPrinterIdList;
};

export const postVoidedFiscalPrinter = (uiInputs: UiInput[],
                                        configurationManager: IConfigurationManager): ReceiptPrinter[] => {
  const transactionInput: UiInput = uiInputs && uiInputs.find((uiInput: UiInput) =>
      uiInput.inputKey === UiInputKey.RETRIEVED_TRANSACTION);

  if (transactionInput && transactionInput.inputValue && transactionInput.inputValue.lines) {
    const lineItem =
        transactionInput.inputValue.lines.find((line: ITransactionLine) =>
        isReceiptLine(line) &&
        line.printerSerialNumber &&
        line.fiscalYReceiptNumber
        ) as IReceiptLine;

    if (lineItem && lineItem.printerSerialNumber) {
      return retrievePrinterWithSerialNumber(configurationManager, lineItem.printerSerialNumber);
    }
  }
  return undefined;
};

function retrievePrinterWithSerialNumber(configurationManager: IConfigurationManager,
                                         printerSerialNumber: string): ReceiptPrinter[] {
  const peripheralsConfig =
      configurationManager.getPeripheralsValues() as IConfigurableDeviceSettings;
  const printerDefinitions = peripheralsConfig && peripheralsConfig.printerType &&
      peripheralsConfig.printerType.deviceDefinitions;

  if (printerDefinitions && printerDefinitions.length) {
    const printerData = printerDefinitions && printerDefinitions
        .find((printer: any) => (printer.printerSerialNumber &&
        printer.printerSerialNumber === printerSerialNumber));

    if (printerData) {
      const fiscalPrinter: ReceiptPrinter = printerData as ReceiptPrinter;
      return [fiscalPrinter];
    }
  }
  return undefined;
}
