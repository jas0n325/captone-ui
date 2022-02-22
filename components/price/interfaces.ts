import { IItemDisplayLine } from "@aptos-scp/scp-component-store-selling-features";

export interface ZeroPricedScreenProps {
  itemKey: string;
  itemKeyType: string;
  line: IItemDisplayLine;
  sellSoftStoppedItem: boolean;
}

export interface PriceProps {
  line: IItemDisplayLine;
  showLine: boolean;
  onExit: () => void;
  requiresPriceEntry?: boolean;
}
