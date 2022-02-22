import {
  IDisplayInfo,
  IItemDisplayLine,
  ITEM_FULFILLMENT_LINE_TYPE,
  ITEM_ORDER_LINE_TYPE,
  ITEM_SALE_LINE_TYPE
} from "@aptos-scp/scp-component-store-selling-features";

export const basketContainsNonReturnItems = (displayInfo: IDisplayInfo): boolean => {
  return (
      displayInfo && displayInfo.itemDisplayLines &&
      displayInfo.itemDisplayLines.some((line: IItemDisplayLine) => {
        return line.lineType === ITEM_SALE_LINE_TYPE ||
            line.lineType === ITEM_ORDER_LINE_TYPE ||
            line.lineType === ITEM_FULFILLMENT_LINE_TYPE;
      })
  );
};
