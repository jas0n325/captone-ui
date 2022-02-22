import { IItemDisplayLine } from "@aptos-scp/scp-component-store-selling-features";

export interface QuantityProps {
  line: IItemDisplayLine;
  showLine: boolean;
  onExit: () => void;
}
