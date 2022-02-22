import {
  FulfillmentGroup,
  IItemDisplayLine,
  ISubscriptionInfo,
  ITEM_RETURN_LINE_TYPE,
  ITEM_SALE_LINE_TYPE,
  Order
} from "@aptos-scp/scp-component-store-selling-features";
import { FulfillmentType, OrderType } from "@aptos-scp/scp-types-commerce-transaction";

import { isItemFulfillmentType } from "./productInquiry";

export const getSubscriptionInfoForMassUnsubscribe = (displayLines: IItemDisplayLine[]): Array<ISubscriptionInfo> => {
  const subscriptionInfo: Array<ISubscriptionInfo> = [];

  displayLines.forEach((line: IItemDisplayLine) => {
    if (line.eligibleForSubscription) {
      subscriptionInfo.push({
        lineNumber: line.lineNumber,
        subscribed: false,
        quantity: line.subscriptionQuantity,
        frequency: {
          code: line.deliveryCode,
          timeInterval: line.deliveryInterval
        },
        deliveryfrequencyDescription: line.deliveryfrequencyDescription
      });
    }
  });

  return subscriptionInfo;
};

export function isPickupFulfillmentGroup(order: Order, fulfillmentGroupId: number): boolean {
  const fulfillmentGroup: FulfillmentGroup = order &&
      Order.getFulfillmentGroupById(order, fulfillmentGroupId);
  const isSubscriptionOrder: boolean = order?.orderType === OrderType.Subscription;

  return !isSubscriptionOrder && isItemFulfillmentType(fulfillmentGroup, FulfillmentType.shipToStore);
}

export function isDeliveryFulfillmentGroup(order: Order, fulfillmentGroupId: number): boolean {
  const fulfillmentGroup: FulfillmentGroup = order &&
      Order.getFulfillmentGroupById(order, fulfillmentGroupId);
  const isSubscriptionOrder: boolean = order?.orderType === OrderType.Subscription;

  return !isSubscriptionOrder && isItemFulfillmentType(fulfillmentGroup, FulfillmentType.shipToCustomer);
}

export function getEligibleSubscriptionItems(order: Order, itemDisplayLines: IItemDisplayLine[]): IItemDisplayLine[] {
  return (!order || order.orderType === OrderType.Subscription) && itemDisplayLines.filter((line: IItemDisplayLine) =>
        line.eligibleForSubscription && line.lineType !== ITEM_RETURN_LINE_TYPE &&
        !(line.lineType === ITEM_SALE_LINE_TYPE && line.fulfillmentGroupId > 0 && !line.subscribed) &&
        !isPickupFulfillmentGroup(order, line.fulfillmentGroupId) &&
        !isDeliveryFulfillmentGroup(order, line.fulfillmentGroupId));
}
