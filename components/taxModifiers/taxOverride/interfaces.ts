import { IItemDisplayLine } from "@aptos-scp/scp-component-store-selling-features";

export interface TaxOverrideComponentProps {
  lines?: IItemDisplayLine[];
  showLine: boolean;
  isItemLevel: boolean;
  onExit: () => void;
}
