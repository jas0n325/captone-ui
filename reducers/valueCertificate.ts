import { RequestState } from "./reducers";
import { SEARCH_VALUE_CERTIFICATE } from "../actions/valueCertificate";

export interface ValueCertificateState extends RequestState {
  error: Error
}

const INITIAL_STATE: ValueCertificateState = {
  inProgress: false,
  error: undefined
};

export default (state: ValueCertificateState = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case SEARCH_VALUE_CERTIFICATE.REQUEST:
      return Object.assign({}, state, { inProgress: true });
    case SEARCH_VALUE_CERTIFICATE.SUCCESS:
      return Object.assign({}, state, action.payload, { inProgress: false });
    case SEARCH_VALUE_CERTIFICATE.FAILURE:
      return Object.assign({}, state, action.payload, { inProgress: false });
    default:
      return state;
  }
};
