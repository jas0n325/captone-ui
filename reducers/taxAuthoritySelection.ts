import { ITaxAuthoritiesForExemption } from "@aptos-scp/scp-component-store-selling-features";

import {
  LOAD_TAX_AUTHORITIES_FOR_EXEMPT,
  SELECT_TAX_AUTHORITY_FOR_EXEMPT,
  StandardAction
} from "../actions";
import { RequestState } from "./reducers";

export interface TaxAuthorityForExemptionState extends RequestState {
  selectedTaxAuthority?: ITaxAuthoritiesForExemption;
  validTaxAuthorities?: ITaxAuthoritiesForExemption[];
}

const INITIAL_STATE: TaxAuthorityForExemptionState = {
  selectedTaxAuthority: undefined,
  validTaxAuthorities: undefined
};

export default (state: TaxAuthorityForExemptionState = INITIAL_STATE,
                action: StandardAction): TaxAuthorityForExemptionState => {
  if (action.type) {
    switch (action.type) {
      case SELECT_TAX_AUTHORITY_FOR_EXEMPT.REQUEST:
        return Object.assign({}, state, action.payload);
      case LOAD_TAX_AUTHORITIES_FOR_EXEMPT.REQUEST:
        return Object.assign({}, state, {inProgress: true, error: undefined});
      case LOAD_TAX_AUTHORITIES_FOR_EXEMPT.SUCCESS:
        return Object.assign({}, state, action.payload, { inProgress: false, error: undefined });
      case LOAD_TAX_AUTHORITIES_FOR_EXEMPT.FAILURE:
        return Object.assign({}, state, action.payload, { inProgress: false });
      default:
        return state;
    }
  }
};
