import { IItemDisplayLine } from "@aptos-scp/scp-component-store-selling-features";

export interface TaxActionPanelProps {
  lineNumber?: number;
  isItemLevel?: boolean;
  onItemTaxOverride?: (line: IItemDisplayLine) => void;
  onItemTaxExempt?: (line: IItemDisplayLine) => void;
  onTransactionTaxExempt?: () => void;
  onTransactionTaxOverride?: () => void;
  onExit: () => void;
}
