import { InventoryItem } from "@aptos-scp/scp-types-inventory";

import { GET_INVENTORY } from "../actions";
import { RequestState } from "./reducers";

export interface InventoryState extends RequestState {
  inventory: InventoryItem[];
}

const INITIAL_STATE: InventoryState = {
  inProgress: false,
  inventory: undefined,
  error: undefined
};

export default (state: InventoryState = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case GET_INVENTORY.REQUEST:
      return Object.assign({}, state, INITIAL_STATE, { inProgress: true });
    case GET_INVENTORY.SUCCESS:
      return Object.assign({}, state, action.payload, { inProgress: false });
    case GET_INVENTORY.FAILURE:
      return Object.assign({}, state, action.payload, { inProgress: false });
    default:
      return state;
  }
};
