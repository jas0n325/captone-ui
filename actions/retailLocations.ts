import { IRetailLocation } from "@aptos-scp/scp-component-store-selling-features";

import { defineRequestType, RequestType, StandardAction } from "./actions";


export const GET_RETAIL_LOCATIONS_ACTION: RequestType = defineRequestType("GET_RETAIL_LOCATIONS");
export const GET_RETAIL_LOCATION_ACTION: RequestType = defineRequestType("GET_RETAIL_LOCATION");

export const getRetailLocationsAction = {
  request: (): StandardAction => {
    return {
      type: GET_RETAIL_LOCATIONS_ACTION.REQUEST,
      payload: {}
    };
  },
  success: (retailLocations: Array<IRetailLocation>): StandardAction => {
    return {
      type: GET_RETAIL_LOCATIONS_ACTION.SUCCESS,
      payload: {
        retailLocations
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: GET_RETAIL_LOCATIONS_ACTION.FAILURE,
      payload: {
        error
      }
    };
  }
};

export const getRetailLocationAction = {
  request: (): StandardAction => {
    return {
      type: GET_RETAIL_LOCATION_ACTION.REQUEST,
      payload: {}
    };
  },
  success: (retailLocation: IRetailLocation): StandardAction => {
    return {
      type: GET_RETAIL_LOCATION_ACTION.SUCCESS,
      payload: {
        retailLocation
      }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: GET_RETAIL_LOCATION_ACTION.FAILURE,
      payload: {
        error
      }
    };
  }
};
