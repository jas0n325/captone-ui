import { ReceiptType, TaxCustomer } from "@aptos-scp/scp-component-store-selling-features";
import { IMerchandiseTransaction, ReceiptCategory } from "@aptos-scp/scp-types-commerce-transaction";

import {
  CLEAR_RECEIPT,
  CLEAR_RECEIPT_ALERT,
  GET_CONFIGURED_PRINTERS,
  GET_PRINTER_FROM_SEARCH,
  GET_RECEIPT_TYPES,
  GET_TAX_CUSTOMER,
  GET_TAX_CUSTOMER_FROM_HISTORICAL,
  IAvailableReceiptCategoryButtons,
  IS_SELECT_PRINTER_FLOW,
  ReceiptPrinter,
  RESET_RECEIPT_STATE,
  SET_AVAILABLE_RECEIPT_CATEGORY_BUTTONS,
  SET_CHOSEN_PRINTER_ID,
  SET_IS_REPRINT_LAST_RECEIPT,
  SET_RECEIPT_CATEGORY,
  SET_RECEIPT_EMAIL,
  SET_RECEIPT_PHONE_NUMBER,
  SET_RECEIPT_TYPE,
  SET_SELECTED_PRINTER_SERIAL_NUMBER,
  SET_TRANSACTION_TO_REPRINT,
  SHOW_FISCAL_ERROR_SCREEN,
  StandardAction
} from "../actions";
import { RequestState } from "./reducers";


export interface ReceiptState extends RequestState {
  availableReceiptCategoryButtons: IAvailableReceiptCategoryButtons;
  availableReceiptTypes: ReceiptType[];
  chosenPrinterId: string;
  selectedPrinterSerialNumber: string;
  chosenReceiptType: ReceiptType;
  configuredPrinters: ReceiptPrinter[];
  isReprintLastReceipt: boolean;
  receiptCategory: ReceiptCategory;
  receiptEmail: string;
  receiptPhoneNumber: string;
  taxCustomer: TaxCustomer;
  transactionToReprint: IMerchandiseTransaction;
  alertNoPrintersFound: boolean;
  isSelectPrinter: boolean;
  originalReceiptCategory: ReceiptCategory;
  hideFiscalPrinterErrorScreen: boolean;
}

const INITIAL_STATE: ReceiptState = {
  availableReceiptCategoryButtons: undefined,
  availableReceiptTypes: undefined,
  chosenPrinterId: undefined,
  selectedPrinterSerialNumber: undefined,
  chosenReceiptType: undefined,
  configuredPrinters: undefined,
  isReprintLastReceipt: undefined,
  receiptCategory: undefined,
  receiptEmail: undefined,
  receiptPhoneNumber: undefined,
  taxCustomer: undefined,
  transactionToReprint: undefined,
  alertNoPrintersFound: false,
  isSelectPrinter: false,
  originalReceiptCategory: undefined,
  hideFiscalPrinterErrorScreen: false
};

export default (state: ReceiptState = INITIAL_STATE, action: StandardAction): ReceiptState => {
  switch (action.type) {
    case GET_CONFIGURED_PRINTERS.SUCCESS:
    case GET_PRINTER_FROM_SEARCH.SUCCESS:
    case GET_RECEIPT_TYPES.SUCCESS:
    case GET_TAX_CUSTOMER.SUCCESS:
    case CLEAR_RECEIPT_ALERT.REQUEST:
    case SET_AVAILABLE_RECEIPT_CATEGORY_BUTTONS.REQUEST:
    case SET_CHOSEN_PRINTER_ID.REQUEST:
    case SET_IS_REPRINT_LAST_RECEIPT.REQUEST:
    case SET_RECEIPT_TYPE.REQUEST:
    case SET_RECEIPT_CATEGORY.REQUEST:
    case SET_RECEIPT_EMAIL.REQUEST:
    case SET_RECEIPT_PHONE_NUMBER.REQUEST:
    case SET_TRANSACTION_TO_REPRINT.REQUEST:
    case IS_SELECT_PRINTER_FLOW.REQUEST:
    case SET_SELECTED_PRINTER_SERIAL_NUMBER.REQUEST:
      return Object.assign({}, state, action.payload, { alertNoPrintersFound: false });
    case CLEAR_RECEIPT.REQUEST:
    case RESET_RECEIPT_STATE.REQUEST:
      return INITIAL_STATE; // Clear out the receipt state.
    case GET_PRINTER_FROM_SEARCH.FAILURE:
      return Object.assign({}, state, action.payload, { alertNoPrintersFound: true });
    case GET_TAX_CUSTOMER_FROM_HISTORICAL.SUCCESS:
      return Object.assign({}, state, action.payload, { inProgress: false });
    case GET_TAX_CUSTOMER_FROM_HISTORICAL.REQUEST:
      return Object.assign({}, state, INITIAL_STATE, {
        inProgress: true
      });
    case SHOW_FISCAL_ERROR_SCREEN.REQUEST:
      return Object.assign({}, state, action.payload);
    case GET_CONFIGURED_PRINTERS.REQUEST:
    case GET_TAX_CUSTOMER.REQUEST:
    case GET_RECEIPT_TYPES.REQUEST:
    default:
      return state;
  }
};
