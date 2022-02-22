import { SagaIterator } from "redux-saga";
import { put, select, takeEvery } from "redux-saga/effects";
import _ = require("lodash");

import {
  CustomerOrder,
  CustomerOrderLineItem
} from "@aptos-scp/scp-types-orders";
import { ILogEntryMessage, ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { UiBusinessEvent, UiInput } from "@aptos-scp/scp-component-store-selling-core";
import {
  CollectedDataKey,
  ORDER_ITEM_CANCELLATION_EVENT,
  ORDER_ITEM_MULTI_LINE_EVENT,
  ORDER_ITEM_PICKUP_EVENT,
  SEARCH_ORDERS_EVENT,
  UiInputKey
} from "@aptos-scp/scp-component-store-selling-features";

import {
  BUSINESS_OPERATION,
  businessOperation,
  CANCEL_ITEMS,
  cancelItems,
  GATHER_ORDER_ITEM_SELECTIONS,
  gatherOrderItemSelections,
  GET_ORDERS,
  getOrders,
  OrderItemSelection,
  PICKUP_ITEMS,
  StandardAction,
  UPDATE_ORDER_ITEM_SELECTIONS,
  updateOrderItemSelections,
  pickupItems, UPDATE_ORDER_ITEM_QUANTITY, updateOrderItemQuantity
} from "../actions";
import { getDefaultOrderItemsSelected } from "../components/common/utilities";
import { OrdersState, UiState } from "../reducers";
import { getOrdersState, getUiState } from "../selectors";
import {
  UI_MODE_CUSTOMER_ORDER_CANCEL,
  UI_MODE_CUSTOMER_ORDER_PICKUP
} from "../reducers/uiState";

const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.inventory");

export function* getlocalOrdersRequest(action:any): IterableIterator<{}> {
  const entryMessage: ILogEntryMessage = logger.traceEntry("getLocalOrders");
  const { deviceIdentity, uiInputs } = action.payload;

  logger.debug(() => `In getLocalOrders: Calling performBusinessOperation with `
      + `${SEARCH_ORDERS_EVENT} and params: ${JSON.stringify(uiInputs)}`);
  yield put(businessOperation.request(deviceIdentity, SEARCH_ORDERS_EVENT, uiInputs));

  logger.traceExit(entryMessage);
}

export function* cancelItemsRequest(action:any): IterableIterator<{}> {
  const entryMessage: ILogEntryMessage = logger.traceEntry("cancelItemsRequest");
  const { deviceIdentity, uiInputs } = action.payload;

  logger.debug(() => `In cancelItemsRequest: Calling performBusinessOperation with `
      + `params: ${JSON.stringify(uiInputs)}`);
  uiInputs.push(new UiInput(UiInputKey.UI_BUSINESS_EVENT, ORDER_ITEM_CANCELLATION_EVENT));
  yield put(businessOperation.request(deviceIdentity, ORDER_ITEM_MULTI_LINE_EVENT, uiInputs));
  logger.traceExit(entryMessage);
}

export function* pickupItemsRequest(action:any): IterableIterator<{}> {
  const entryMessage: ILogEntryMessage = logger.traceEntry("pickupItemsRequest");
  const { deviceIdentity, uiInputs } = action.payload;

  logger.debug(() => `In pickupItemsRequest: Calling performBusinessOperation with `
      + `params: ${JSON.stringify(uiInputs)}`);
  uiInputs.push(new UiInput(UiInputKey.UI_BUSINESS_EVENT, ORDER_ITEM_PICKUP_EVENT));
  yield put(businessOperation.request(deviceIdentity, ORDER_ITEM_MULTI_LINE_EVENT, uiInputs));
  logger.traceExit(entryMessage);
}

export function* businessOperationSuccess(action: any): IterableIterator<{}> {
  if (action.payload.eventType === SEARCH_ORDERS_EVENT) {
    const { nonContextualData } = action.payload;

    if (nonContextualData && nonContextualData.has(CollectedDataKey.OrderInquiryCustomerOrders)) {
      const orders: CustomerOrder[] = action.payload.nonContextualData
        .get(CollectedDataKey.OrderInquiryCustomerOrders);
      const orderRequestId: string = action.payload.nonContextualData
        .get(CollectedDataKey.OrderReferenceId);
      yield put(getOrders.success(orderRequestId, orders));
    }
  }
  if (action.payload.eventType ===  ORDER_ITEM_MULTI_LINE_EVENT) {
    const { deviceIdentity, eventType, inputs } = action.payload;
    const uiBusinessEvent: UiBusinessEvent = new UiBusinessEvent(deviceIdentity, eventType, inputs);
    const eventTypeIdInput = uiBusinessEvent.findInput(UiInputKey.UI_BUSINESS_EVENT);

    if (eventTypeIdInput.inputValue === ORDER_ITEM_CANCELLATION_EVENT) {
      yield put(cancelItems.success(deviceIdentity));
    } else if (eventTypeIdInput.inputValue === ORDER_ITEM_PICKUP_EVENT) {
      yield put(pickupItems.success(deviceIdentity));
    }
  }
}

export function* businessOperationFailure(action: any): IterableIterator<{}> {
  if (action.payload.eventType ===  SEARCH_ORDERS_EVENT) {
    const { error } = action.payload;

    let orderRequestId: string;
    if (error.collectedData && error.collectedData.has(CollectedDataKey.OrderReferenceId)) {
      orderRequestId = error.collectedData.get(CollectedDataKey.OrderReferenceId);
    }
    yield put(getOrders.failure(orderRequestId, error));
  }
}

export function* watchOrders(): SagaIterator {
  yield takeEvery(GET_ORDERS.REQUEST, getlocalOrdersRequest);
  yield takeEvery(CANCEL_ITEMS.REQUEST, cancelItemsRequest);
  yield takeEvery(PICKUP_ITEMS.REQUEST, pickupItemsRequest);
  yield takeEvery(BUSINESS_OPERATION.SUCCESS, businessOperationSuccess);
  yield takeEvery(BUSINESS_OPERATION.FAILURE, businessOperationFailure);
}

function* handleGatherOrderItemSelection(action: StandardAction): IterableIterator<{}> {
  const ordersState: OrdersState = yield select(getOrdersState);
  const uiState: UiState = yield select(getUiState);
  yield put(gatherOrderItemSelections.success(getDefaultOrderItemsSelected(ordersState.orders, uiState.mode)));
}

export function* watchGatherOrderItemSelectionRequest(): SagaIterator {
  yield takeEvery(GATHER_ORDER_ITEM_SELECTIONS.REQUEST, handleGatherOrderItemSelection);
}

function* handleOrderItemSelection(action: StandardAction): IterableIterator<{}> {
  const ordersState: OrdersState = yield select(getOrdersState);
  const uiState: UiState = yield select(getUiState);

  if (uiState.mode === UI_MODE_CUSTOMER_ORDER_CANCEL ||
      uiState.mode === UI_MODE_CUSTOMER_ORDER_PICKUP) {

    const updatedSelections: OrderItemSelection[] = _.cloneDeep(ordersState.workingSelection);

    const orderLine: CustomerOrderLineItem = action.payload.orderLine;
    const selectedItem: OrderItemSelection =
        Object.values(updatedSelections)
            .find(lineNumber => lineNumber.lineNumber === orderLine.lineItemNumber);
    const index = _.findIndex(updatedSelections,
        (orderItem) => orderItem.lineNumber === selectedItem.lineNumber);

    updatedSelections[index].selected = !updatedSelections[index].selected;

    yield put(updateOrderItemSelections.success(updatedSelections));
  }
}

function* handleOrderItemQuantity(action: StandardAction): IterableIterator<{}> {
  const ordersState: OrdersState = yield select(getOrdersState);
  const updatedSelections: OrderItemSelection[] = _.cloneDeep(ordersState.workingSelection);

  const orderLine: CustomerOrderLineItem = action.payload.orderLine;
  const selectedItem: OrderItemSelection =
      Object.values(updatedSelections)
          .find(lineNumber => lineNumber.lineNumber === orderLine.lineItemNumber);
  const index = _.findIndex(updatedSelections,
      (orderItem) => orderItem.lineNumber === selectedItem.lineNumber);

  updatedSelections[index].selectedQuantity = action.payload.newQuantity;

  yield put(updateOrderItemQuantity.success(updatedSelections));
}

export function* watchUpdateOrderItemSelectionRequest(): SagaIterator {
  yield takeEvery(UPDATE_ORDER_ITEM_SELECTIONS.REQUEST, handleOrderItemSelection);
}
export function* watchUpdateOrderItemQuantityRequest(): SagaIterator {
  yield takeEvery(UPDATE_ORDER_ITEM_QUANTITY.REQUEST, handleOrderItemQuantity);
}
