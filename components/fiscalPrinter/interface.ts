export interface IFiscalPrinterTypeAndDataCheck {
  id: string;
  printerType: string;
}

export interface FiscalPrinterErrorScreenProps {
  noPrinterExistsToPostVoid?: boolean;
  onContinue?: () => void;
  onCancel?: () => void;
  receiptPrinterChoiceContinue?: () => void;
  receiptPrinterChoiceCancel?: () => void;
}

export interface FiscalPrinterReceiptErrorScreenProps {
  receiptPrinterChoiceContinue?: () => void;
  receiptPrinterChoiceCancel?: () => void;
  onContinue?: () => void;
  onCancel?: () => void;
}

export interface FiscalPrinterEnterDocumentNumberScreenProps {
  receiptPrinterChoiceContinue?: () => void;
  receiptPrinterChoiceCancel?: () => void;
  onContinue?: () => void;
  onCancel?: () => void;
}
