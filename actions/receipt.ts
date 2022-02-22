import { ReceiptType, TaxCustomer } from "@aptos-scp/scp-component-store-selling-features";
import { IMerchandiseTransaction, ReceiptCategory } from "@aptos-scp/scp-types-commerce-transaction";

import { defineRequestType, RequestType, StandardAction } from "./actions";

export interface ReceiptPrinter {
  id: string;
  description: string;
  printerType?: string;
  printerSerialNumber?: string;
}

export interface IAvailableReceiptCategoryButtons {
  reprintStandardReceiptAvailable: boolean;
  reprintVATReceiptAvailable: boolean;
  reprintFullTaxInvoiceAvailable: boolean;
  reprintFullPageInvoiceAvailable: boolean;
  reprintJapanRSSReceiptAvailable: boolean;
  emailStandardReceiptAvailable: boolean;
  emailVATInvoiceAvailable: boolean;
  emailFullTaxInvoiceAvailable: boolean;
  emailFullPageInvoiceAvailable: boolean;
  emailJapanRSSReceiptAvailable: boolean;
}

export const CLEAR_RECEIPT_ALERT: RequestType = defineRequestType("CLEAR_RECEIPT_ALERT");
export const CLEAR_RECEIPT: RequestType = defineRequestType("CLEAR_RECEIPT");
export const SHOW_FISCAL_ERROR_SCREEN: RequestType = defineRequestType("SHOW_FISCAL_ERROR_SCREEN");
export const GET_CONFIGURED_PRINTERS: RequestType = defineRequestType("GET_CONFIGURED_PRINTERS");
export const GET_RECEIPT_TYPES: RequestType = defineRequestType("GET_RECEIPT_TYPES");
export const GET_TAX_CUSTOMER: RequestType = defineRequestType("GET_TAX_CUSTOMER");
export const GET_TAX_CUSTOMER_FROM_HISTORICAL: RequestType =
    defineRequestType("GET_TAX_CUSTOMER_FROM_HISTORICAL");
export const GET_PRINTER_FROM_SEARCH: RequestType = defineRequestType("GET_PRINTER_FROM_SEARCH");
export const IS_SELECT_PRINTER_FLOW: RequestType = defineRequestType("IS_SELECT_PRINTER_FLOW");
export const RESET_RECEIPT_STATE: RequestType = defineRequestType("RESET_RECEIPT_STATE");
export const SET_AVAILABLE_RECEIPT_CATEGORY_BUTTONS: RequestType = defineRequestType(
    "SET_AVAILABLE_RECEIPT_CATEGORY_BUTTONS");
export const SET_CHOSEN_PRINTER_ID: RequestType = defineRequestType("SET_CHOSEN_PRINTER_ID");
export const SET_IS_REPRINT_LAST_RECEIPT: RequestType = defineRequestType("SET_IS_REPRINT_LAST_RECEIPT");
export const SET_RECEIPT_CATEGORY: RequestType = defineRequestType("SET_RECEIPT_CATEGORY");
export const SET_RECEIPT_EMAIL: RequestType = defineRequestType("SET_RECEIPT_EMAIL");
export const SET_RECEIPT_PHONE_NUMBER: RequestType = defineRequestType("SET_RECEIPT_PHONE_NUMBER");
export const SET_RECEIPT_TYPE: RequestType = defineRequestType("SET_RECEIPT_TYPE");
export const SET_TRANSACTION_TO_REPRINT: RequestType = defineRequestType("SET_TRANSACTION_TO_REPRINT");
export const SET_SELECTED_PRINTER_SERIAL_NUMBER: RequestType = defineRequestType("SET_SELECTED_PRINTER_SERIAL_NUMBER");

export const clearReceiptAlert = {
  request: (): StandardAction => {
    return {
      type: CLEAR_RECEIPT_ALERT.REQUEST
    };
  }
};

export const clearReceipt = {
  request: (transactionNumberToClear: number): StandardAction => {
    return {
      type: CLEAR_RECEIPT.REQUEST,
      payload: {
        transactionNumberToClear
      }
    };
  }
  // Note: The success and failure actions are not used to clear the receipt.
};

export const getConfiguredPrinters = {
  request: (resetChosenPrinterId?: boolean): StandardAction => {
    return {
      type: GET_CONFIGURED_PRINTERS.REQUEST,
      payload: { resetChosenPrinterId }
    };
  },
  success: (configuredPrinters: ReceiptPrinter[]) => {
    return {
      type: GET_CONFIGURED_PRINTERS.SUCCESS,
      payload: { configuredPrinters }
    };
  }
};

export const getReceiptTypes = {
  request: (receiptCategory: ReceiptCategory, eventTypeForReceipt?: string,
            transactionToReprint?: IMerchandiseTransaction,
            originalReceiptCategory?: ReceiptCategory): StandardAction => {
    return {
      type: GET_RECEIPT_TYPES.REQUEST,
      payload: { receiptCategory, eventTypeForReceipt, transactionToReprint, originalReceiptCategory }
    };
  },
  success: (availableReceiptTypes: ReceiptType[]): StandardAction => {
    return {
      type: GET_RECEIPT_TYPES.SUCCESS,
      payload: { availableReceiptTypes }
    };
  }
};

export const getTaxCustomer = {
  request: (taxCustomer?: TaxCustomer): StandardAction => {
    return {
      type: GET_TAX_CUSTOMER.REQUEST,
      payload: { taxCustomer }
    };
  },
  success: (taxCustomer: TaxCustomer): StandardAction => {
    return {
      type: GET_TAX_CUSTOMER.SUCCESS,
      payload: { taxCustomer }
    };
  }
};

export const getTaxCustomerFromHistorical = {
  request: (historicalTransactionId: string): StandardAction => {
    return {
      type: GET_TAX_CUSTOMER_FROM_HISTORICAL.REQUEST,
      payload: { historicalTransactionId }
    };
  },
  success: (taxCustomer: TaxCustomer): StandardAction => {
    return {
      type: GET_TAX_CUSTOMER_FROM_HISTORICAL.SUCCESS,
      payload: { taxCustomer }
    };
  }
};

export const resetReceiptState = {
  request: (): StandardAction => {
    return {
      type: RESET_RECEIPT_STATE.REQUEST
    };
  }
};

export const setChosenPrinterId = {
  request: (chosenPrinterId: string): StandardAction => {
    return {
      type: SET_CHOSEN_PRINTER_ID.REQUEST,
      payload: { chosenPrinterId }
    };
  }
};

export const setIsReprintLastReceipt = {
  request: (isReprintLastReceipt: boolean): StandardAction => {
    return {
      type: SET_IS_REPRINT_LAST_RECEIPT.REQUEST,
      payload: { isReprintLastReceipt }
    };
  }
};

export const setReceiptCategory = {
  request: (receiptCategory: ReceiptCategory): StandardAction => {
    return {
      type: SET_RECEIPT_CATEGORY.REQUEST,
      payload: { receiptCategory }
    };
  }
};

export const setReceiptEmail = {
  request: (receiptEmail: string): StandardAction => {
    return {
      type: SET_RECEIPT_EMAIL.REQUEST,
      payload: { receiptEmail }
    };
  }
};

export const setReceiptPhoneNumber = {
  request: (receiptPhoneNumber: string): StandardAction => {
    return {
      type: SET_RECEIPT_PHONE_NUMBER.REQUEST,
      payload: { receiptPhoneNumber }
    };
  }
};

export const setReceiptType = {
  request: (chosenReceiptType: ReceiptType): StandardAction => {
    return {
      type: SET_RECEIPT_TYPE.REQUEST,
      payload: { chosenReceiptType }
    };
  }
};

export const setAvailableReceiptCategoryButtons = {
  request: (availableReceiptCategoryButtons: IAvailableReceiptCategoryButtons): StandardAction => {
    return {
      type: SET_AVAILABLE_RECEIPT_CATEGORY_BUTTONS.REQUEST,
      payload: { availableReceiptCategoryButtons }
    };
  }
};

export const setTransactionToReprint = {
  request: (transactionToReprint: IMerchandiseTransaction): StandardAction => {
    return {
      type: SET_TRANSACTION_TO_REPRINT.REQUEST,
      payload: { transactionToReprint }
    };
  }
};

export const setSelectedPrinterSerialNumber = {
  request: (selectedPrinterSerialNumber: string): StandardAction => {
    return {
      type: SET_SELECTED_PRINTER_SERIAL_NUMBER.REQUEST,
      payload: { selectedPrinterSerialNumber }
    };
  }
};

export const isSelectPrinterFlow = {
  request: (isSelectPrinter: boolean): StandardAction => {
    return {
      type: IS_SELECT_PRINTER_FLOW.REQUEST,
      payload: { isSelectPrinter }
    };
  }
};

export const getPrintersFromSearch = {
  request: (printerId: string, isSubmitting: boolean): StandardAction => {
    return {
      type: GET_PRINTER_FROM_SEARCH.REQUEST,
      payload: { printerId, isSubmitting }
    };
  },
  success: (configuredPrinters: ReceiptPrinter[], chosenPrinterId?: string): StandardAction => {
    return {
      type: GET_PRINTER_FROM_SEARCH.SUCCESS,
      payload: { configuredPrinters, chosenPrinterId }
    };
  },
  failure: (configuredPrinters: ReceiptPrinter[]): StandardAction => {
    return {
      type: GET_PRINTER_FROM_SEARCH.FAILURE,
      payload: { configuredPrinters }
    };
  }
};

export const showFiscalErrorScreen = {
  request: (hideFiscalPrinterErrorScreen: boolean): StandardAction => {
    return {
      type: SHOW_FISCAL_ERROR_SCREEN.REQUEST,
      payload: {
        hideFiscalPrinterErrorScreen
      }
    };
  }
};