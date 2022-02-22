import * as _ from "lodash";

import { CustomerOrder } from "@aptos-scp/scp-types-orders";

import {
  CANCEL_ITEMS,
  CLEAR_ORDERS,
  GATHER_ORDER_ITEM_SELECTIONS,
  GET_ORDERS,
  OrderItemSelection,
  PICKUP_ITEMS,
  UPDATE_ORDER_ITEM_QUANTITY,
  UPDATE_ORDER_ITEM_SELECTIONS
} from "../actions";
import { RequestState } from "./reducers";

export interface OrdersState extends RequestState {
  orderRequestId: string;
  orders: CustomerOrder[];
  searched: boolean;
  startingSelection: OrderItemSelection[];
  workingSelection: OrderItemSelection[];
}

const INITIAL_STATE: OrdersState = {
  inProgress: false,
  orderRequestId: undefined,
  orders: undefined,
  error: undefined,
  searched: false,
  startingSelection: [],
  workingSelection: []
};

export default (state: OrdersState = INITIAL_STATE, action: any) => {
  switch(action.type) {
    case GET_ORDERS.REQUEST:
      return Object.assign( {}, INITIAL_STATE, {inProgress: true });
    case GET_ORDERS.SUCCESS:
      return Object.assign({}, action.payload, {inProgress: false, searched: true});
    case GET_ORDERS.FAILURE:
      return Object.assign({}, action.payload, {inProgress: false, searched: true});
    case CLEAR_ORDERS.REQUEST:
      return Object.assign({}, INITIAL_STATE);
    case GATHER_ORDER_ITEM_SELECTIONS.SUCCESS:
      return Object.assign({}, state, {
        startingSelection: _.merge({}, action.payload.initialOrderItemSelection),
        workingSelection: action.payload.initialOrderItemSelection,
        inProgress: undefined,
        succeeded: undefined,
        error: undefined
      });
    case UPDATE_ORDER_ITEM_SELECTIONS.SUCCESS:
      return Object.assign({}, state, action.payload);
    case UPDATE_ORDER_ITEM_QUANTITY.SUCCESS:
      return Object.assign({}, state, action.payload);
    case UPDATE_ORDER_ITEM_QUANTITY.REQUEST:
    case UPDATE_ORDER_ITEM_SELECTIONS.REQUEST:
    case GATHER_ORDER_ITEM_SELECTIONS.REQUEST:
      return state;
    case CANCEL_ITEMS.REQUEST:
      return Object.assign( {}, INITIAL_STATE, {inProgress: true});
    case CANCEL_ITEMS.SUCCESS:
      return Object.assign({}, action.payload, {inProgress: false});
    case CANCEL_ITEMS.FAILURE:
      return Object.assign({}, action.payload, {inProgress: false, error: true});
    case PICKUP_ITEMS.REQUEST:
      return Object.assign( {}, INITIAL_STATE, {inProgress: true});
    case PICKUP_ITEMS.SUCCESS:
      return Object.assign({}, action.payload, {inProgress: false});
    case PICKUP_ITEMS.FAILURE:
      return Object.assign({}, action.payload, {inProgress: false, error: true});
    default:
      return state;
  }
};
