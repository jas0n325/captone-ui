import * as _ from "lodash";

import {
  GATHER_RETURNED_QUANTITIES,
  RECORD_ENTERED_RETURN_ITEM,
  ReturnTransactionItemsQuantity,
  RETURN_ITEM_IMAGES,
  StandardAction,
  UniqueIdToImageUrlHash,
  UPDATE_RETURN_ITEM_QUANTITY
} from "../actions";
import { RequestState } from "./reducers";


export interface ReturnState extends RequestState {
  uniqueIdToImageUrlHash: UniqueIdToImageUrlHash;
  startingReturnedQuantities: ReturnTransactionItemsQuantity;
  workingReturnedQuantities: ReturnTransactionItemsQuantity;
}

const INITIAL_STATE: ReturnState = {
  uniqueIdToImageUrlHash: {},
  startingReturnedQuantities: {},
  workingReturnedQuantities: {}
};

export default (state: ReturnState = INITIAL_STATE, action: StandardAction): ReturnState => {
  switch (action.type) {
    case GATHER_RETURNED_QUANTITIES.SUCCESS:
      return Object.assign({}, state, {
        startingReturnedQuantities: _.merge({}, action.payload.newReturnedQuantities),
        workingReturnedQuantities: action.payload.newReturnedQuantities,
        inProgress: undefined,
        succeeded: undefined,
        error: undefined
      });
    case RETURN_ITEM_IMAGES.REQUEST:
      return Object.assign(
        {},
        state,
        { inProgress: true, succeeded: undefined, error: undefined, uniqueIdToImageUrlHash: {} }
      );
    case RETURN_ITEM_IMAGES.SUCCESS:
      return Object.assign({}, state, { inProgress: false, succeeded: true, ...action.payload });
    case RETURN_ITEM_IMAGES.FAILURE:
      return Object.assign(
        {},
        state,
        { inProgress: false, succeeded: false, uniqueIdToImageUrlHash: {}, ...action.payload }
      );
    case UPDATE_RETURN_ITEM_QUANTITY.SUCCESS:
      return Object.assign({}, state, action.payload);
    case GATHER_RETURNED_QUANTITIES.REQUEST:
    case UPDATE_RETURN_ITEM_QUANTITY.REQUEST:
    case RECORD_ENTERED_RETURN_ITEM.REQUEST:
    default:
      return state;
  }
};
