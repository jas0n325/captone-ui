import { IItemDisplayLine } from "@aptos-scp/scp-component-store-selling-features";
import {
  IItemLine,
  IMerchandiseTransaction,
  isItemLine,
  ISubline,
  ITransactionLine,
  LineType
} from "@aptos-scp/scp-types-commerce-transaction";

import { ReturnTransactionItemsQuantity, SublineDisplayLine } from "../../../actions";


export const returnableItemFilter = (line: ITransactionLine): line is IItemLine => {
  return isItemLine(line) && (line.lineType === LineType.ItemSale || line.lineType === LineType.ItemOrder) &&
      !line.voided;
};

export const getSublineDisplayLinesFromTransaction = (transaction: IMerchandiseTransaction): SublineDisplayLine[] => {
  const sublineDisplayLines: SublineDisplayLine[] = [];

  transaction.lines.filter(returnableItemFilter).forEach((itemLine: IItemLine) =>
      itemLine.sublines.forEach((subline: ISubline, index: number) =>
          sublineDisplayLines.push({ itemLine, sublineIndex: index })
  ));

  return sublineDisplayLines;
};

export const getSublineQuantityReturned = (
  transactionId: string,
  sublineDisplayLines: SublineDisplayLine[],
  itemDisplayLines: IItemDisplayLine[]
): ReturnTransactionItemsQuantity => {
  const result: ReturnTransactionItemsQuantity = {};

  sublineDisplayLines.forEach((sublineDisplayLine: SublineDisplayLine) => {
    if (!result[sublineDisplayLine.itemLine.lineNumber]) {
      result[sublineDisplayLine.itemLine.lineNumber] = {};
    }

    if (!result[sublineDisplayLine.itemLine.lineNumber][sublineDisplayLine.sublineIndex]) {
      result[sublineDisplayLine.itemLine.lineNumber][sublineDisplayLine.sublineIndex] = {
        quantity : undefined
      };
    }

    result[sublineDisplayLine.itemLine.lineNumber][sublineDisplayLine.sublineIndex].quantity = getReturnedItemCount(
      transactionId,
      itemDisplayLines,
      sublineDisplayLine
    );
  });

  return result;
};

export const getReturnedItemCount = (
  transactionId: string,
  itemDisplayLines: IItemDisplayLine[],
  sublineDisplayLine: SublineDisplayLine
): string => {
  let returnedQuantity = 0;
  const returnItemDisplayLines = itemDisplayLines && itemDisplayLines.filter((displayLine: IItemDisplayLine) => {
    return displayLine.transactionIdFromReturnTransaction === transactionId &&
           displayLine.lineNumberFromReturnTransaction === sublineDisplayLine.itemLine.lineNumber &&
           displayLine.sublineIndexFromReturnItem === sublineDisplayLine.sublineIndex;
  });
  if (returnItemDisplayLines) {
    returnItemDisplayLines.forEach((returnItemDisplayLine) => {
      returnedQuantity += returnItemDisplayLine.quantity;
    });
  }
  return returnedQuantity.toString() || "0";
};

export const shouldEnableReturnDoneButton = (
    workingReturnedQuantities: ReturnTransactionItemsQuantity
): boolean => {
  const returnedItems = workingReturnedQuantities && Object.values(workingReturnedQuantities);
  const hasReturnedItems = returnedItems?.some((line: any) => line &&
      Object.values(line).find((subLine: any) => subLine?.quantity !== "0"));
  return hasReturnedItems;
}
