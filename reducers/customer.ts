import * as _ from "lodash";

import { PosBusinessError } from "@aptos-scp/scp-component-store-selling-core";
import {
  Customer,
  ICustomerCreationResult,
  ICustomerResult,
  ICustomerSearch
} from "@aptos-scp/scp-component-store-selling-features";

import {
  BUSINESS_OPERATION,
  CLEAR_CUSTOMER,
  CLEAR_CUSTOMER_CREATION_RESULT,
  CLEAR_CUSTOMER_UPDATE_RESULT,
  LOOKUP_CUSTOMER,
  SEARCH_CUSTOMER,
  SELECT_CUSTOMER,
  UPDATE_CUSTOMER,
  UPDATE_CUSTOMER_CREATION_RESULT,
  UPDATE_CUSTOMER_UPDATE_RESULT
} from "../actions";
import { RequestState } from "./reducers";


export interface CustomerState extends RequestState {
  searchParams?: ICustomerSearch;
  customer: Customer;
  customers: Customer[];
  selected: Customer;
  error: PosBusinessError;
  creationResult?: ICustomerCreationResult;
  updateResult?: ICustomerResult;
}

const INITIAL_STATE: CustomerState = {
  inProgress: false,
  customers: [],
  customer: undefined,
  selected: undefined,
  error: undefined
};

export default (state: CustomerState = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case SEARCH_CUSTOMER.REQUEST:
      return Object.assign({}, state, INITIAL_STATE, {
        inProgress: true,
        searchParams: action.payload.params
      });
    case SELECT_CUSTOMER.REQUEST:
      return Object.assign({}, state, action.payload );
    case SEARCH_CUSTOMER.SUCCESS:
      return Object.assign({}, state, action.payload, { inProgress: false });
    case LOOKUP_CUSTOMER.REQUEST:
      return Object.assign({}, state, action.payload );
    case LOOKUP_CUSTOMER.SUCCESS:
      return Object.assign({}, state, action.payload, {inProgress: false});
    case BUSINESS_OPERATION.FAILURE:
      // FIXME: This assumes the failure is a response to the SEARCH_CUSTOMER.REQUEST (FIND_CUSTOMERS_EVENT)
      // Although the chances are very low, this failure could be for a different event.
      return (state.inProgress ? Object.assign({}, state, action.payload, { inProgress: false }) : state);
    case UPDATE_CUSTOMER.REQUEST:
      return _.merge({}, state, action.payload);
    case UPDATE_CUSTOMER.SUCCESS:
      return Object.assign({}, state, action.payload,
          { customer: undefined, searchParams: undefined, creationResult: undefined });
    case UPDATE_CUSTOMER_CREATION_RESULT.REQUEST:
      return _.merge({}, state, action.payload);
    case UPDATE_CUSTOMER_UPDATE_RESULT.REQUEST:
        return _.merge({}, state, action.payload);
    case CLEAR_CUSTOMER.REQUEST:
      return Object.assign({}, state, action.payload,
          { customer: undefined, searchParams: undefined, creationResult: undefined });
    case CLEAR_CUSTOMER_CREATION_RESULT.REQUEST:
      return Object.assign({}, state, action.payload);
    case CLEAR_CUSTOMER_UPDATE_RESULT.REQUEST:
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
};
