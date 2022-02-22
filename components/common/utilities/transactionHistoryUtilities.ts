import moment from "moment";

import {IMoney, Money} from "@aptos-scp/scp-component-business-core";
import {
  IItemLine,
  IMerchandiseTransaction,
  isItemLine,
  isTenderLine,
  ITenderLine,
  ITransaction,
  ITransactionLine,
  LineType
} from "@aptos-scp/scp-types-commerce-transaction";
import { Order } from "@aptos-scp/scp-component-store-selling-features";

import I18n from "../../../../config/I18n";
import { getStoreLocale } from "../utilities";
import { printAmount } from "./itemLineUtils";
import { isDeliveryFulfillmentGroup, isPickupFulfillmentGroup } from "./subscriptionUtils";

export interface IStatusTagInfo {
  isPickup: boolean;
  isDelivery: boolean;
}

export function getItemCount(transaction: IMerchandiseTransaction): number {
  if (transaction.transactionTotalSaleQuantity) {
    return transaction.transactionTotalSaleQuantity;
  }

  let itemCount: number = 0;
  transaction.lines?.forEach((line: ITransactionLine) => {
    if (isItemLine(line) && !line.voided) {
      itemCount += Number(line.quantity.amount);
    }
  });
  return itemCount;
}

export function getDisplayableDate(dateString: string, hideMilliseconds?: boolean): string {
  const locale = getStoreLocale();
  const format = hideMilliseconds ? "dateTimeNoMS.format" : "dateTime.format";
  const dateTimeOptions: string = I18n.t(format, { locale });
  return moment(dateString).format(dateTimeOptions);
}

export function formattedAmountFromPosted(amount: IMoney): string {
  return amount && printAmount(Money.fromIMoney(amount));
}

export function getTransactionLines(transaction: ITransaction): (ITenderLine | IItemLine)[] {
  return transaction.lines && [
    ...transaction.lines.filter(isNotVoidedItemLine),
    ...transaction.lines.filter(isNotVoidedTenderLine)
  ];
}

export function getStatusTagInfo(transaction: IMerchandiseTransaction): IStatusTagInfo {
  let isPickup: boolean = false;
  let isDelivery: boolean = false;
  transaction.lines.forEach((line: IItemLine) => {
    if (line.lineType === LineType.ItemOrder) {
      if (!isPickup) {
        isPickup = isPickupFulfillmentGroup(transaction.order as Order,
            line && line.fulfillmentGroupId);
      }
      if (!isDelivery) {
        isDelivery = isDeliveryFulfillmentGroup(transaction.order as Order,
            line && line.fulfillmentGroupId);
      }
    }
  });

  return { isPickup, isDelivery };
}

function isNotVoidedItemLine(line: ITransactionLine): line is IItemLine {
  return isItemLine(line) && !line.voided;
}

function isNotVoidedTenderLine(line: ITransactionLine): line is ITenderLine {
  return isTenderLine(line) && !line.voided;
}


