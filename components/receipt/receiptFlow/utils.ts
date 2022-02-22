import { ReceiptCategory, ReceiptType } from "@aptos-scp/scp-types-commerce-transaction";

import { ITransaction } from "@aptos-scp/scp-component-store-selling-core";
import { isTaxCustomerLine, TaxCustomer, TaxCustomerLine } from "@aptos-scp/scp-component-store-selling-features";
import { IAvailableReceiptCategoryButtons } from "../../../actions";
import { extractTaxCustomerDetailsFromTaxCustomerLine } from "../../customer/CustomerUtilities";


export function standardReceiptIsAvailable(receiptCategory: ReceiptCategory,  receiptType: ReceiptType,
                                           availableReceiptCategoryButtons: IAvailableReceiptCategoryButtons): boolean {
  if (receiptCategory !== ReceiptCategory.ReprintReceipt) {
    return true;
  }

  if (availableReceiptCategoryButtons) {
    if (receiptType === ReceiptType.Email) {
      return availableReceiptCategoryButtons.emailStandardReceiptAvailable;
    }

    if (receiptType === ReceiptType.Print) {
      return availableReceiptCategoryButtons.reprintStandardReceiptAvailable;
    }

    if (receiptType === ReceiptType.Both) {
      return availableReceiptCategoryButtons.emailStandardReceiptAvailable &&
             availableReceiptCategoryButtons.reprintStandardReceiptAvailable;
    }
  }

  return true;
}

export function vatReceiptIsAvailable(receiptCategory: ReceiptCategory,  receiptType: ReceiptType,
                                      availableReceiptCategoryButtons: IAvailableReceiptCategoryButtons): boolean {
  if (receiptCategory !== ReceiptCategory.ReprintReceipt) {
    return true;
  }

  if (availableReceiptCategoryButtons) {
    if (receiptType === ReceiptType.Email) {
      return availableReceiptCategoryButtons.emailVATInvoiceAvailable;
    }

    if (receiptType === ReceiptType.Print) {
      return availableReceiptCategoryButtons.reprintVATReceiptAvailable;
    }

    if (receiptType === ReceiptType.Both) {
      return availableReceiptCategoryButtons.emailVATInvoiceAvailable &&
             availableReceiptCategoryButtons.reprintVATReceiptAvailable;
    }
  }

  return true;
}

export function fullTaxInvoiceIsAvailable(receiptCategory: ReceiptCategory,  receiptType: ReceiptType,
                                          availableReceiptCategoryButtons: IAvailableReceiptCategoryButtons): boolean {
  if (receiptCategory !== ReceiptCategory.ReprintReceipt) {
    return true;
  }

  if (availableReceiptCategoryButtons) {
    if (receiptType === ReceiptType.Email) {
      return availableReceiptCategoryButtons.emailFullTaxInvoiceAvailable;
    }

    if (receiptType === ReceiptType.Print) {
      return availableReceiptCategoryButtons.reprintFullTaxInvoiceAvailable;
    }

    if (receiptType === ReceiptType.Both) {
      return availableReceiptCategoryButtons.emailFullTaxInvoiceAvailable &&
             availableReceiptCategoryButtons.reprintFullTaxInvoiceAvailable;
    }
  }

  return true;
}

export function fullPageInvoiceIsAvailable(receiptCategory: ReceiptCategory, receiptType: ReceiptType,
  availableReceiptCategoryButtons: IAvailableReceiptCategoryButtons): boolean {
  if (receiptCategory !== ReceiptCategory.ReprintReceipt) {
    return true;
  }

  if (availableReceiptCategoryButtons) {
    if (receiptType === ReceiptType.Email) {
      return availableReceiptCategoryButtons.emailFullPageInvoiceAvailable;
    }

    if (receiptType === ReceiptType.Print) {
      return availableReceiptCategoryButtons.reprintFullPageInvoiceAvailable;
    }

    if (receiptType === ReceiptType.Both) {
      return availableReceiptCategoryButtons.emailFullPageInvoiceAvailable &&
        availableReceiptCategoryButtons.reprintFullPageInvoiceAvailable;
    }
  }

  return true;
}

export function japanRSSReceiptIsAvailable(receiptCategory: ReceiptCategory, receiptType: ReceiptType,
                                           availableReceiptCategoryButtons: IAvailableReceiptCategoryButtons): boolean {
  if (receiptCategory !== ReceiptCategory.ReprintReceipt) {
    return true;
  }

  if (availableReceiptCategoryButtons) {
    if (receiptType === ReceiptType.Email) {
      return availableReceiptCategoryButtons.emailJapanRSSReceiptAvailable;
    }

    if (receiptType === ReceiptType.Print) {
      return availableReceiptCategoryButtons.reprintJapanRSSReceiptAvailable;
    }

    if (receiptType === ReceiptType.Both) {
      return availableReceiptCategoryButtons.emailJapanRSSReceiptAvailable &&
        availableReceiptCategoryButtons.reprintJapanRSSReceiptAvailable;
    }
  }

  return true;
}

export function createFromTransaction(transaction: ITransaction): TaxCustomer {
  const taxCustomerLine: TaxCustomerLine = transaction.lines.find(isTaxCustomerLine);
  let taxCustomer: TaxCustomer = undefined;
  if (taxCustomerLine) {
    taxCustomer = extractTaxCustomerDetailsFromTaxCustomerLine(taxCustomerLine);
  }

  return taxCustomer;
}
