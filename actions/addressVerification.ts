import {defineRequestType, RequestType, StandardAction} from "./actions";


export interface SearchResponse {
  totalMatches: number;
  count: number;
  results: [{
    suggestion: string;
    matched: object;
    format: string;
  }];
}

export interface VerifyAddressResponse {
  address: {
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    city: string;
    state: string;
    postalCode: string;
    countryName: string;
    countryCode: string;
  };
}

export const LOAD_SEARCH_ADDRESS: RequestType = defineRequestType("LOAD_SEARCH_ADDRESS");
export const LOAD_VERIFY_ADDRESS: RequestType = defineRequestType("LOAD_VERIFY_ADDRESS");

export const loadSearchAddressAction = {
  request: (searchText: string, countryCode: string): StandardAction => {
    return {
      type: LOAD_SEARCH_ADDRESS.REQUEST,
      payload: {
        searchText,
        countryCode
      }
    };
  },
  success: (searchResponse: SearchResponse): StandardAction => {
    return {
      type: LOAD_SEARCH_ADDRESS.SUCCESS,
      payload: searchResponse
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: LOAD_SEARCH_ADDRESS.FAILURE,
      payload: {
        error
      }
    };
  }
};
export const loadVerifyAddressAction = {
  request: (id: string, countryCode: string): StandardAction => {
    return {
      type: LOAD_VERIFY_ADDRESS.REQUEST,
      payload: {
        id,
        countryCode
      }
    };
  },
  success: (verifyAddressResponse: VerifyAddressResponse): StandardAction => {
    return {
      type: LOAD_VERIFY_ADDRESS.SUCCESS,
      payload: verifyAddressResponse
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: LOAD_VERIFY_ADDRESS.FAILURE,
      payload: {
        error
      }
    };
  }
};
