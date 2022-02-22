import { DeviceIdentity } from "@aptos-scp/scp-component-store-selling-core";
import {
  Customer,
  ICustomerCreationResult,
  ICustomerLookup,
  ICustomerResult,
  ICustomerSearch
} from "@aptos-scp/scp-component-store-selling-features";

import { defineRequestType, RequestType, StandardAction } from "./actions";


export const SEARCH_CUSTOMER: RequestType = defineRequestType("SEARCH_CUSTOMER");
export const LOOKUP_CUSTOMER: RequestType = defineRequestType("LOOKUP_CUSTOMER");
export const SELECT_CUSTOMER: RequestType = defineRequestType("SELECT_CUSTOMER");
export const UPDATE_CUSTOMER: RequestType = defineRequestType("UPDATE_CUSTOMER");
export const CUSTOMER_CREATION_RESULT: RequestType = defineRequestType("CUSTOMER_CREATION_RESULT");
export const CLEAR_CUSTOMER: RequestType = defineRequestType("CLEAR_CUSTOMER");
export const UPDATE_CUSTOMER_CREATION_RESULT: RequestType = defineRequestType("UPDATE_CUSTOMER_CREATION_RESULT");
export const UPDATE_CUSTOMER_UPDATE_RESULT: RequestType = defineRequestType("UPDATE_CUSTOMER_UPDATE_RESULT");
export const CLEAR_CUSTOMER_CREATION_RESULT: RequestType = defineRequestType("CLEAR_CUSTOMER_CREATION_RESULT");
export const CLEAR_CUSTOMER_UPDATE_RESULT: RequestType = defineRequestType("CLEAR_CUSTOMER_UPDATE_RESULT");

export const searchCustomer = {
  request: (deviceIdentity: DeviceIdentity, params: ICustomerSearch): StandardAction => {
    return {
      type: SEARCH_CUSTOMER.REQUEST,
      payload: {
        deviceIdentity,
        params
      }
    };
  },
  success: (customers: Customer[]): StandardAction => {
    return {
      type: SEARCH_CUSTOMER.SUCCESS,
      payload: {
        customers,
        error: undefined
      }
    };
  }
};

export const lookupCustomer = {
  request: (deviceIdentity: DeviceIdentity, params: ICustomerLookup): StandardAction => {
    return {
      type: LOOKUP_CUSTOMER.REQUEST,
      payload: {
        deviceIdentity,
        params
      }
    };
  },
  success: (customer: Customer): StandardAction => {
    return {
      type: LOOKUP_CUSTOMER.SUCCESS,
      payload: {
        customer,
        error: undefined
      }
    };
  }
};

export const selectCustomer = {
  request: (selected: Customer): StandardAction => {
    return {
      type: SELECT_CUSTOMER.REQUEST,
      payload: {
        selected
      }
    };
  }
};

export const updateCustomer = {
  request: (customer: Customer, updateResult?: ICustomerResult): StandardAction => {
    return {
      type: UPDATE_CUSTOMER.REQUEST,
      payload: {
      customer,
      updateResult
    }
    };
  }
};

export const clearCustomer = {
  request: (): StandardAction => {
    return {
      type: CLEAR_CUSTOMER.REQUEST,
      payload: undefined
    };
  }
};

export const updateCustomerCreationResult = {
  request: (creationResult: ICustomerCreationResult): StandardAction => {
    return {
      type: UPDATE_CUSTOMER_CREATION_RESULT.REQUEST,
      payload: {
        creationResult
      }
    };
  }
};

export const updateCustomerUpdateResult = {
  request: (updateResult: ICustomerResult): StandardAction => {
    return {
      type: UPDATE_CUSTOMER_UPDATE_RESULT.REQUEST,
      payload: {
        updateResult
      }
    };
  }
};

export const clearCustomerCreationResult = {
  request: (): StandardAction => {
    return {
      type: CLEAR_CUSTOMER_CREATION_RESULT.REQUEST,
      payload: {
        creationResult: undefined
      }
    };
  }
};

export const clearCustomerUpdateResult = {
  request: (): StandardAction => {
    return {
      type: CLEAR_CUSTOMER_UPDATE_RESULT.REQUEST,
      payload: {
        updateResult: undefined
      }
    };
  }
};
