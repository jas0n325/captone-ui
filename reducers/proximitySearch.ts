import { IProximitySearch } from "@aptos-scp/scp-component-store-selling-features";
import { GET_PROXIMITY_SEARCH_ACTION } from "../actions";


import { RequestState } from "./reducers";


export interface ProximitySearchState extends RequestState {
  proximitySearch: Array<IProximitySearch>;
}

const INITIAL_STATE: ProximitySearchState = {
  proximitySearch: []
};

export default (state: ProximitySearchState = INITIAL_STATE, action: any): ProximitySearchState => {
  switch (action.type) {
    case GET_PROXIMITY_SEARCH_ACTION.REQUEST:
      return Object.assign({}, state, { inProgress: true, error: undefined });
    case GET_PROXIMITY_SEARCH_ACTION.SUCCESS:
      return Object.assign({}, state, action.payload, { inProgress: false, error: undefined });
    case GET_PROXIMITY_SEARCH_ACTION.FAILURE:
      return Object.assign({}, state, action.payload, { inProgress: false });
    default:
      return state;
  }
};
