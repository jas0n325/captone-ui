import { IConfigurationManager } from "@aptos-scp/scp-component-store-selling-core";
import { ReceiptType } from "@aptos-scp/scp-component-store-selling-features";
import { IMerchandiseTransaction, ITenderLine, ITransactionLine } from "@aptos-scp/scp-types-commerce-transaction";

import { BusinessState, DataEventState, ModalState, UiState } from "../../reducers";
import { RenderSelectOptions } from "../common/FieldValidation";
import { NavigationProp } from "../StackNavigatorParams";

export interface SalesHistoryScreenProps {
  isPostVoidMode?: boolean;
}

export interface TransactionHistoryScreenProps {
  transaction: IMerchandiseTransaction;
  isPostVoidMode?: boolean;
  suppressReprintReceipt?: boolean;
  parentScene?: string
  isCustomerHistory?: boolean;
}

export interface TransactionHistoryProps {
  checkIsTendered: (line: ITransactionLine) => line is ITenderLine;
  checkIsTenderChange: (line: ITransactionLine) => line is ITenderLine;
  checkIsTenderAdjustment: (line: ITransactionLine) => line is ITenderLine;
  onPostVoidTransaction: () => void;
  onSetReasonCode: (newReasonCode: RenderSelectOptions) => void;
  chosenReceiptType: ReceiptType;
  incomingDataEvent: DataEventState;
  isPostVoidMode?: boolean;
  reasons: RenderSelectOptions[];
  reprintReceiptAllowed: boolean;
  reprintReceiptFeatureEnabled: boolean;
  enableReprintButton:boolean;
  selectedReasonCode: RenderSelectOptions;
  showReceiptFormForPostVoid: boolean;
  transaction: IMerchandiseTransaction;
  displayRoundingAdjustment: boolean;
  displayReturnValue: boolean;
  onVoidTaxFreeForm: () => void;
  taxFreeVoidEnabled: boolean;
  uiState: UiState;
  navigation: NavigationProp;
  configManager: IConfigurationManager;
  businessState: BusinessState;
  modalState: ModalState;
  parentScene: string;
  isCustomerHistory?: boolean;
}
