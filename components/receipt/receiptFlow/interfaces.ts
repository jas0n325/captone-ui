import { ReceiptCategory } from "@aptos-scp/scp-component-store-selling-features";
import { IMerchandiseTransaction } from "@aptos-scp/scp-types-commerce-transaction";

export interface ReceiptCategoryChoiceProps {
  onCancel: () => void;
  onContinue: () => void;
  originalReceiptCategory: ReceiptCategory;
  transactionToReprint?: IMerchandiseTransaction;
}

export interface ReceiptEmailFormScreenProps {
  onCancel: () => void;
  onContinue: () => void;
}

export interface ReceiptPhoneNumberFormScreenProps {
  onCancel: () => void;
  onContinue: () => void;
}

export interface ReceiptPrinterChoiceProps {
  onContinue: () => void;
  onCancel: () => void;
  isTillReceiptFlow?: boolean;
  uiMode?: string;
  isFilterFiscalPrinter?: boolean;
  hideBackButton?: boolean;
}
