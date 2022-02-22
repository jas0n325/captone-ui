import { IProximitySearch, IProximitySearchRequest } from "@aptos-scp/scp-component-store-selling-features";

import { defineRequestType, RequestType, StandardAction } from "./actions";


export const GET_PROXIMITY_SEARCH_ACTION: RequestType = defineRequestType("GET_PROXIMITY_SEARCH");

export const getProximitySearchAction = {
  request: (proximitySearch: IProximitySearchRequest): StandardAction => {
    return {
      type: GET_PROXIMITY_SEARCH_ACTION.REQUEST,
      payload: { proximitySearch }
    };
  },
  success: (proximitySearch: Array<IProximitySearch>): StandardAction => {
    return {
      type: GET_PROXIMITY_SEARCH_ACTION.SUCCESS,
      payload: {
        proximitySearch
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: GET_PROXIMITY_SEARCH_ACTION.FAILURE,
      payload: {
        error
      }
    };
  }
};
