import { ITaxAuthoritiesForExemption } from "@aptos-scp/scp-component-store-selling-features";

import { defineRequestType, RequestType, StandardAction } from "./actions";

export const SELECT_TAX_AUTHORITY_FOR_EXEMPT: RequestType = defineRequestType("SELECT_TAX_AUTHORITY_FOR_EXEMPT");
export const LOAD_TAX_AUTHORITIES_FOR_EXEMPT: RequestType = defineRequestType("LOAD_TAX_AUTHORITIES_FOR_EXEMPT");

export const loadTaxAuthoritiesForExemption = {
  request: (): StandardAction => {
    return {
      type: LOAD_TAX_AUTHORITIES_FOR_EXEMPT.REQUEST,
      payload: { }
    };
  },
  success: (validTaxAuthorities: ITaxAuthoritiesForExemption[]): StandardAction => {
    return {
      type: LOAD_TAX_AUTHORITIES_FOR_EXEMPT.SUCCESS,
      payload: { validTaxAuthorities }
    };
  },
  failure: (error: Error): StandardAction => {
    return {
      type: LOAD_TAX_AUTHORITIES_FOR_EXEMPT.FAILURE,
      payload: {
        error
      }
    };
  }
};

export const selectTaxAuthorityForExemption = {
  request: (selectedTaxAuthority: ITaxAuthoritiesForExemption): StandardAction => {
    return {
      type: SELECT_TAX_AUTHORITY_FOR_EXEMPT.REQUEST,
      payload: { selectedTaxAuthority }
    };
  }
};
