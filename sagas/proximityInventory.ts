import { SagaIterator } from "redux-saga";
import { put, takeEvery } from "redux-saga/effects";

import { InventoryItem } from "@aptos-scp/scp-types-inventory";
import { ILogEntryMessage, ILogger, LogManager } from "@aptos-scp/scp-component-logging";
import { CollectedDataKey, INVENTORY_EVENT } from "@aptos-scp/scp-component-store-selling-features";

import { BUSINESS_OPERATION, businessOperation, GET_PROXIMITY_INVENTORY, getProximityInventory } from "../actions";


const logger: ILogger = LogManager.getLogger("com.aptos.storeselling.ui.sagas.inventory");

export function* getLocalProximityInventoryRequest(action: any): IterableIterator<{}> {
  const entryMessage: ILogEntryMessage = logger.traceEntry("getProximityInventory");
  const { deviceIdentity, uiInputs } = action.payload;

  logger.debug(() => `In getProximityInventory: Calling performBusinessOperation with `
      + `${INVENTORY_EVENT} and params: ${JSON.stringify(uiInputs)}`);
  yield put(businessOperation.request(deviceIdentity, INVENTORY_EVENT, uiInputs));

  logger.traceExit(entryMessage);
}

export function* businessOperationSuccess(action: any): IterableIterator<{}> {
  if (action.payload.eventType === INVENTORY_EVENT) {
    const { nonContextualData } = action.payload;

    if (nonContextualData && nonContextualData.has(CollectedDataKey.ProximitySearchInventory)) {
      const proximityInventory: InventoryItem[] = action.payload.nonContextualData
          .get(CollectedDataKey.ProximitySearchInventory);
      yield put(getProximityInventory.success(proximityInventory));
    }
  }
}

export function* businessOperationFailure(action: any): IterableIterator<{}> {
  if (action.payload.eventType === INVENTORY_EVENT) {
    yield put(getProximityInventory.failure(action.payload.error));
  }
}

export function* watchProximityInventory(): SagaIterator {
  yield takeEvery(GET_PROXIMITY_INVENTORY.REQUEST, getLocalProximityInventoryRequest);
  yield takeEvery(BUSINESS_OPERATION.SUCCESS, businessOperationSuccess);
  yield takeEvery(BUSINESS_OPERATION.FAILURE, businessOperationFailure);
}
