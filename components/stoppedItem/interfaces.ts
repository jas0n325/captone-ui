import { IItemDisplayLine } from "@aptos-scp/scp-component-store-selling-features";

export interface StoppedItemProps {
  onResetFromStoppedItem: () => void;
  onSellSoftStoppedItem: (itemKey: string, itemKeyType: string) => void;
  stoppedItemStatus: string;
  stoppedItemStatusMessage: string;
  stoppedItem: IItemDisplayLine;
}
