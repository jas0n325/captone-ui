import { InventoryItem } from "@aptos-scp/scp-types-inventory";

import { GET_PROXIMITY_INVENTORY } from "../actions";
import { RequestState } from "./reducers";

export interface ProximityInventoryState extends RequestState {
  inventory: InventoryItem[];
}

const INITIAL_STATE: ProximityInventoryState = {
  inProgress: false,
  inventory: undefined,
  error: undefined
};

export default (state: ProximityInventoryState = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case GET_PROXIMITY_INVENTORY.REQUEST:
      return Object.assign({}, state, INITIAL_STATE, { inProgress: true });
    case GET_PROXIMITY_INVENTORY.SUCCESS:
      return Object.assign({}, state, action.payload, { inProgress: false });
    case GET_PROXIMITY_INVENTORY.FAILURE:
      return Object.assign({}, state, action.payload, { inProgress: false });
    default:
      return state;
  }
};
