import { IRetailLocation } from "@aptos-scp/scp-component-store-selling-features";

import { GET_RETAIL_LOCATION_ACTION, GET_RETAIL_LOCATIONS_ACTION } from "../actions";
import { RequestState } from "./reducers";


export interface RetailLocationsState extends RequestState {
  retailLocation: IRetailLocation;
  retailLocations: Array<IRetailLocation>;
}

const INITIAL_STATE: RetailLocationsState = {
  retailLocations: [],
  retailLocation: undefined
};

export default (state: RetailLocationsState = INITIAL_STATE, action: any): RetailLocationsState => {
  switch (action.type) {
    case GET_RETAIL_LOCATION_ACTION.REQUEST:
    case GET_RETAIL_LOCATIONS_ACTION.REQUEST:
      return Object.assign({}, state, { inProgress: true });
    case GET_RETAIL_LOCATION_ACTION.SUCCESS:
    case GET_RETAIL_LOCATIONS_ACTION.SUCCESS:
      return Object.assign({}, state, action.payload, { inProgress: false, error: undefined });
    case GET_RETAIL_LOCATION_ACTION.FAILURE:
    case GET_RETAIL_LOCATIONS_ACTION.FAILURE:
      return Object.assign({}, state, action.payload, { inProgress: false });
    default:
      return state;
  }
};
