import {
  ITEM_ORDER_LINE_TYPE
} from "@aptos-scp/scp-component-store-selling-features";
import {
  IItemLine,
  IMerchandiseTransaction,
  IOrderReferenceLine,
  ITransaction,
  ITransactionLine,
  LineType
} from "@aptos-scp/scp-types-commerce-transaction";
import {
  AvailableActions,
  CustomerOrder,
  CustomerOrderLineItem,
  CustomerOrderLineItemCollection,
  FulfillmentGroup,
  FulfillmentGroupItemCollection,
  PersonName
} from "@aptos-scp/scp-types-orders";

import { OrderItemSelection } from "../../../actions";
import {
  UI_MODE_CUSTOMER_ORDER_CANCEL,
  UI_MODE_CUSTOMER_ORDER_PICKUP
} from "../../../reducers/uiState";
import {IConfigurationManager} from "@aptos-scp/scp-component-store-selling-core";

export enum CustomerOrderFulfillmentType {
  StorePickup = "StorePickup",
  ShipToCustomer = "ShipToCustomer"
}

export function inActionMode(uiMode: string): boolean {
  return (
    (uiMode === UI_MODE_CUSTOMER_ORDER_PICKUP) ||
    (uiMode === UI_MODE_CUSTOMER_ORDER_CANCEL)
  );
}

export function showCheckboxes(uiMode: string, enablePartialFulfillment: boolean): boolean {
  return (uiMode === UI_MODE_CUSTOMER_ORDER_CANCEL ||
      (uiMode === UI_MODE_CUSTOMER_ORDER_PICKUP && !enablePartialFulfillment));
}

export function getFufillmentGroupItems(fulfillmentGroup: FulfillmentGroup, customerOrderLineItems: CustomerOrderLineItemCollection): CustomerOrderLineItem[] {
  const fulfillmentLineNumbers: number[] = getFulfillmentGroupLineItemNumbers(fulfillmentGroup.fulfillmentGroupItems);
  return [
    ...customerOrderLineItems.filter((lineItem) =>
      fulfillmentLineNumbers.indexOf(lineItem.lineItemNumber) > -1)
  ];
}

export function getFulfillmentGroupLineItemNumbers(fulfillmentGroupLineItems: FulfillmentGroupItemCollection): number[] {
  const lineItemNumbers: number[] = fulfillmentGroupLineItems.map(l => (l.lineItemNumber));
  return lineItemNumbers;
}

export function hasCancelableItems(customerOrderLineItems: CustomerOrderLineItemCollection): boolean {
  if (!customerOrderLineItems.some(i => i.availableActions)) return false;
  const allAvailableActions: AvailableActions[] = customerOrderLineItems.map((lineItem) =>
    lineItem.availableActions);
  const cancelableItems: AvailableActions[] = allAvailableActions.filter((action) =>
    action && action.canCancel === true);
  return cancelableItems.length > 0 ? true : false;
}

export function hasReadyForPickupItems(customerOrderLineItems: CustomerOrderLineItemCollection): boolean {
  if (!customerOrderLineItems.some(i => i.availableActions)) return false;
  const allAvailableActions: AvailableActions[] = customerOrderLineItems.map((lineItem) =>
    lineItem.availableActions);
  const readyForPickup: AvailableActions[] = allAvailableActions.filter((action) =>
    action && action.isReadyForPickup === true);
  return readyForPickup.length > 0 ? true : false;
}

export function formatPersonName(personName: PersonName): string {
  if (!personName) return "";
  const firstName = personName.firstName;
  const lastName = personName.lastName;
  const middleName = personName.middleName;

  let formattedName: string = "";
  if (firstName) {
    formattedName = firstName;
  }
  if (middleName) {
    formattedName = formattedName.concat(" ", middleName);
  }
  if (lastName) {
    formattedName = formattedName.concat(" ", lastName);
  }
  return formattedName;
}

export const getDefaultOrderItemsSelected = (
  customerOrderDetails: CustomerOrder[],
  uiMode: string
): OrderItemSelection[] => {
  const result: OrderItemSelection[] = [];
  let selectable: boolean = false;
  let selected: boolean = false;

  customerOrderDetails.forEach((order: CustomerOrder) => {
    order.lineItems.forEach((orderLine: CustomerOrderLineItem) => {
      if (uiMode === UI_MODE_CUSTOMER_ORDER_PICKUP) {
        if (orderLine?.availableActions?.isReadyForPickup) {
          selectable = true;
          selected = true;
        } else {
          selectable = false;
          selected = false;
        }
      } else if (uiMode === UI_MODE_CUSTOMER_ORDER_CANCEL) {
        if (orderLine?.availableActions?.canCancel) {
          selectable = true;
          selected = false;
        } else {
          selectable = false;
          selected = false;
        }
      }

      result.push(
        {
          lineNumber: orderLine.lineItemNumber,
          quantity: orderLine.countableQuantity,
          selectable,
          selected,
          selectedQuantity: orderLine.countableQuantity
        }
      );
    });
  });

  return result;
}

export const shouldEnableDoneButton = (
    uiMode: string,
    itemSelections: OrderItemSelection[],
    enablePartialFulfillment: boolean
): boolean => {
  if (uiMode === UI_MODE_CUSTOMER_ORDER_CANCEL) {
    return itemSelections && itemSelections.some(i => i.selected);
  } else if (uiMode === UI_MODE_CUSTOMER_ORDER_PICKUP) {
    if (enablePartialFulfillment) {
      let quantity: number = 0;
      itemSelections.forEach((selection:OrderItemSelection) => selection.selectable ?
          quantity = quantity + selection.selectedQuantity : 0);
      return (quantity > 0);
    } else {
      return itemSelections && itemSelections.some(i => i.selected);
    }
  }
}

export const isPartialPickupFulfillmentEnabled = (
    configurationManager: IConfigurationManager
): boolean => {
  const omniChannelBehaviors = configurationManager &&
      configurationManager.getFunctionalBehaviorValues().omniChannelBehaviors;

  const itemPickUp = omniChannelBehaviors.itemPickUp;
  if (itemPickUp) {
    return itemPickUp.allowPickupQuantityModification ?
           itemPickUp.allowPickupQuantityModification : false;
  } else {
    return false;
  }
}

export const checkedLineItems = (
  uiMode: string,
  itemSelections: OrderItemSelection[],
  enablePartialFulfillment: boolean
): OrderItemSelection[] => {
  if (uiMode === UI_MODE_CUSTOMER_ORDER_CANCEL) {
    return itemSelections && itemSelections.filter(i => i.selected);
  } else if (uiMode === UI_MODE_CUSTOMER_ORDER_PICKUP) {
    if (!enablePartialFulfillment) {
      return itemSelections && itemSelections.filter(i => i.selected);
    } else {
      return itemSelections && itemSelections.filter(i => i.selectable && i.selectedQuantity > 0);
    }
  }
}

export const hasOrderItem = (transaction: ITransaction): boolean => {
  const orderItemLines = transaction.lines.filter((line: IItemLine) =>
      line.lineType === ITEM_ORDER_LINE_TYPE && !line.voided);
  if (orderItemLines.length > 0) {
    return true;
  }
  else {
    const orderReferenceLine = transaction.lines.find((transactionLine: ITransactionLine) =>
        transactionLine.lineType === LineType.OrderReference) as IOrderReferenceLine;
    if (orderReferenceLine) {
      if (orderReferenceLine.orderReference?.order) {
        return true;
      }
    }
  }
  return false;
}

export const getOrderReferenceId = (transaction: ITransaction): string => {
  let orderReferenceId;
  const transactionOrder = (transaction as IMerchandiseTransaction).order;
  if (transactionOrder) {
    orderReferenceId = transactionOrder.orderReferenceId;
  } else {
    const orderReferenceLine = transaction.lines.find((transactionLine: ITransactionLine) =>
        transactionLine.lineType === LineType.OrderReference) as IOrderReferenceLine;
    if (orderReferenceLine) {
      if (orderReferenceLine.orderReference?.order) {
        orderReferenceId = orderReferenceLine.orderReference.order.orderReferenceId;
      }
    }
  }
  return orderReferenceId
}
