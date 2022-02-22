import { DeviceIdentity, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import { OrderItemReference } from "@aptos-scp/scp-component-store-selling-features";
import { CustomerOrder, CustomerOrderLineItem } from "@aptos-scp/scp-types-orders";

import { defineRequestType, RequestType, StandardAction } from "./actions";

export const GET_ORDERS: RequestType = defineRequestType("GET_ORDERS");
export const CLEAR_ORDERS: RequestType = defineRequestType("CLEAR_ORDERS");
export const GATHER_ORDER_ITEM_SELECTIONS: RequestType = defineRequestType("GATHER_ORDER_ITEM_SELECTIONS");
export const UPDATE_ORDER_ITEM_SELECTIONS: RequestType = defineRequestType("UPDATE_ORDER_ITEM_SELECTIONS");
export const CANCEL_ITEMS: RequestType = defineRequestType("CANCEL_ITEMS");
export const PICKUP_ITEMS: RequestType = defineRequestType("PICKUP_ITEMS");
export const UPDATE_ORDER_ITEM_QUANTITY: RequestType = defineRequestType("UPDATE_ORDER_ITEM_QUANTITY");

export interface OrderItemSelection extends OrderItemReference {
  selectable: boolean;
  selected: boolean;
}

export const getOrders = {
  request: (deviceIdentity: DeviceIdentity, uiInputs: UiInput[]): StandardAction => {
    return {
      type: GET_ORDERS.REQUEST,
      payload: {
        deviceIdentity,
        uiInputs
      }
    };
  },
  success: (orderRequestId: string, orders?: CustomerOrder[]): StandardAction => {
    return {
      type: GET_ORDERS.SUCCESS,
      payload: { orders, orderRequestId }
    };
  },
  failure: (orderRequestId: string, error?: Error): StandardAction => {
    return {
      type: GET_ORDERS.FAILURE,
      payload: {
        error,
        orderRequestId
      }
    };
  }
};

export const clearOrders = {
  request: (): StandardAction => {
    return {
      type: CLEAR_ORDERS.REQUEST,
      payload: undefined
    };
  }
};

export const gatherOrderItemSelections = {
  request: (): StandardAction => ({ type: GATHER_ORDER_ITEM_SELECTIONS.REQUEST }),
  success: (initialOrderItemSelection: OrderItemSelection[]): StandardAction => ({
    type: GATHER_ORDER_ITEM_SELECTIONS.SUCCESS,
    payload: { initialOrderItemSelection }
  })
};

export const updateOrderItemSelections = {
  request: (orderLine: CustomerOrderLineItem): StandardAction => ({
    type: UPDATE_ORDER_ITEM_SELECTIONS.REQUEST,
    payload: { orderLine }
  }),
  success: (workingSelection: OrderItemSelection[]): StandardAction => ({
    type: UPDATE_ORDER_ITEM_SELECTIONS.SUCCESS,
    payload: { workingSelection }
  })
};

export const updateOrderItemQuantity = {
  request: (orderLine: CustomerOrderLineItem, newQuantity: number): StandardAction => ({
    type: UPDATE_ORDER_ITEM_QUANTITY.REQUEST,
    payload: { orderLine, newQuantity }
  }),
  success: (workingSelection: OrderItemSelection[]): StandardAction => ({
    type: UPDATE_ORDER_ITEM_QUANTITY.SUCCESS,
    payload: { workingSelection }
  })
};

export const cancelItems = {
  request: (deviceIdentity: DeviceIdentity, uiInputs: UiInput[]): StandardAction => {
    return {
      type: CANCEL_ITEMS.REQUEST,
      payload: {
        deviceIdentity,
        uiInputs
      }
    };
  },
  success: (deviceIdentity: DeviceIdentity): StandardAction => {
    return {
      type: CANCEL_ITEMS.SUCCESS,
      payload: {
        deviceIdentity
      }
    };
  },
  failure: (error?: Error): StandardAction => {
    return {
      type: CANCEL_ITEMS.FAILURE,
      payload: {
        error
      }
    };
  }
};

export const pickupItems = {
  request: (deviceIdentity: DeviceIdentity, uiInputs: UiInput[]): StandardAction => {
    return {
      type: PICKUP_ITEMS.REQUEST,
      payload: {
        deviceIdentity,
        uiInputs
      }
    };
  },
  success: (deviceIdentity: DeviceIdentity): StandardAction => {
    return {
      type: PICKUP_ITEMS.SUCCESS,
      payload: {
        deviceIdentity
      }
    };
  },
  failure: (error?: Error): StandardAction => {
    return {
      type: PICKUP_ITEMS.FAILURE,
      payload: {
        error
      }
    };
  }
};
