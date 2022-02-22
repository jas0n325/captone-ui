import {LOAD_SEARCH_ADDRESS, LOAD_VERIFY_ADDRESS} from "../actions";
import {RequestState} from "./reducers";

export interface ISearchAddressState extends RequestState {
  totalMatches: number;
  count: number;
  results: [{
    suggestion: string;
    matched: object;
    format: string;
  }];
}

export interface IVerifyAddressState extends RequestState {
  address: {
    addressLine1: string,
    addressLine2: string,
    addressLine3: string,
    city: string,
    state: string,
    postalCode: string,
    countryName: string,
    countryCode: string
  };
}

const INITIAL_STATE_SEARCH_ADDRESS: ISearchAddressState = {
  totalMatches: 0,
  count: 0,
  results: [{
    suggestion: "",
    matched: undefined,
    format: ""
  }]
};
const INITIAL_STATE_VERIFY_ADDRESS: IVerifyAddressState = {
  address: {
    addressLine1: undefined,
    addressLine2: undefined,
    addressLine3: undefined,
    city: undefined,
    state: undefined,
    postalCode: undefined,
    countryName: undefined,
    countryCode: undefined
  }
};

export const searchAddress = (state: ISearchAddressState = INITIAL_STATE_SEARCH_ADDRESS,
                              action: any): ISearchAddressState => {
  switch (action.type) {
    case LOAD_SEARCH_ADDRESS.REQUEST:
      return Object.assign({}, state, action.payload);
    case LOAD_SEARCH_ADDRESS.SUCCESS:
      return Object.assign({}, state, action.payload);
    case LOAD_SEARCH_ADDRESS.FAILURE:
      return Object.assign({}, state, action.payload);
    default:
      return state;

  }
};
export const verifyAddress = (state: IVerifyAddressState = INITIAL_STATE_VERIFY_ADDRESS,
                              action: any): IVerifyAddressState => {
  switch (action.type) {
    case LOAD_VERIFY_ADDRESS.REQUEST:
      return Object.assign({}, state, action.payload);
    case LOAD_VERIFY_ADDRESS.SUCCESS:
      return Object.assign({}, state, action.payload);
    case LOAD_VERIFY_ADDRESS.FAILURE:
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
};
