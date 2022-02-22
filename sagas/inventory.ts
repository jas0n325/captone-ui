import { SagaIterator } from "redux-saga";
import { put, takeEvery } from "redux-saga/effects";

import { InventoryItem } from "@aptos-scp/scp-types-inventory";
import { ILogEntryMessage, ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { CollectedDataKey, INVENTORY_EVENT } from "@aptos-scp/scp-component-store-selling-features";

import { BUSINESS_OPERATION, businessOperation, GET_INVENTORY, getInventory } from "../actions";


const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.inventory");

export function* getLocalInventoryRequest(action: any): IterableIterator<{}> {
  const entryMessage: ILogEntryMessage = logger.traceEntry("getLocalInventory");
  const { deviceIdentity, uiInputs } = action.payload;

  logger.debug(() => `In getLocalInventory: Calling performBusinessOperation with `
      + `${INVENTORY_EVENT} and params: ${JSON.stringify(uiInputs)}`);
  yield put(businessOperation.request(deviceIdentity, INVENTORY_EVENT, uiInputs));

  logger.traceExit(entryMessage);
}

export function* businessOperationSuccess(action: any): IterableIterator<{}> {
  if (action.payload.eventType ===  INVENTORY_EVENT) {
    const { nonContextualData } = action.payload;

    if (nonContextualData && nonContextualData.has(CollectedDataKey.ProductInquiryInventory)) {
      const inventory: InventoryItem[] = action.payload.nonContextualData
          .get(CollectedDataKey.ProductInquiryInventory);
      yield put(getInventory.success(inventory));
    }
  }
}

export function* businessOperationFailure(action: any): IterableIterator<{}> {
  if (action.payload.eventType ===  INVENTORY_EVENT) {
    yield put(getInventory.failure(action.payload.error));
  }
}

export function* watchInventory(): SagaIterator {
  yield takeEvery(GET_INVENTORY.REQUEST, getLocalInventoryRequest);
  yield takeEvery(BUSINESS_OPERATION.SUCCESS, businessOperationSuccess);
  yield takeEvery(BUSINESS_OPERATION.FAILURE, businessOperationFailure);
}
