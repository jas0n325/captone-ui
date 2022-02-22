import { IDiscountGroupInformation } from "../common/utilities/discountUtilities";

export interface BasketActionsScreenProps {
  mixedBasketAllowed: boolean;
  clearSelectedItemLines: () => void;
  onAssignSalesperson: () => void;
  onVoidTransaction: () => void;
  onCoupon: () => void;
  onEnterReturnMode: () => void;
  onFastDiscount: () => void;
  onIssueGiftCard: () => void;
  onIssueGiftCertificate: () => void;
  onItemDiscount: () => void;
  onItemTaxDetails: () => void;
  onNonMerch: () => void;
  onResumeOfSuspendedTransactions: () => void;
  onSuspendTransaction: () => void;
  onTransactionDiscount: () => void;
  onTransactionTaxDetails: () => void;
  onLottery: () => void;
  onPreConfiguredDiscounts: (transactionDiscountGroup: IDiscountGroupInformation) => void;
}
