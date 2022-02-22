import {
  IItemDisplayLine,
  PriceInquiry
} from "@aptos-scp/scp-component-store-selling-features";

export interface ProductInquiryDetailScreenProps {
  item?: PriceInquiry;
  line?: IItemDisplayLine;
  unavailableItem?: boolean;
  unavailableItemCount?: number;
  selectedRetailLocationId?: string;
  selectedInventory?: number;
}

export interface ProductProps {
  lineNumber: number;
  showLine: boolean;
  onProductInformation: (line: IItemDisplayLine) => void;
  onChangeQuantity: (line: IItemDisplayLine) => void;
  onChangePrice: (line: IItemDisplayLine) => void;
  onItemDiscount: (line: IItemDisplayLine) => void;
  onAssignSalesperson: (line: IItemDisplayLine) => void;
  onItemComments: (line: IItemDisplayLine) => void;
  onItemTaxPress: (line: IItemDisplayLine) => void;
  onReturnReasonChange: (line: IItemDisplayLine) => void;
  onItemSubscription: (line: IItemDisplayLine) => void;
  onExit: () => void;
  onAdditionalInfo: (line: IItemDisplayLine, formName: string) => void;
}
